import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  /**
   * Concurrency mutex ensuring that operations affecting administrator counts
   * (role demotions and admin deletions) execute sequentially to prevent race conditions.
   */
  private adminGuardMutex: Promise<void> = Promise.resolve();

  private async withAdminGuardLock<T>(operation: () => Promise<T>): Promise<T> {
    let releaseLock: () => void;
    const nextLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    const previousLock = this.adminGuardMutex;
    this.adminGuardMutex = this.adminGuardMutex.then(() => nextLock);

    await previousLock;
    try {
      return await operation();
    } finally {
      releaseLock!();
    }
  }

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { name, email, password, role } = createUserDto;
    const normalizedEmail = email.trim().toLowerCase();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    try {
      const createdUser = new this.userModel({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
      });

      return await createdUser.save();
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          `User with email "${normalizedEmail}" already exists`,
        );
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.userModel
      .findOne({ email: normalizedEmail })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: "${id}"`);
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findAll(role?: UserRole): Promise<UserDocument[]> {
    const filter = role ? { role } : {};
    return this.userModel.find(filter).exec();
  }

  async updateProfile(id: string, name: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: "${id}"`);
    }

    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Name cannot be empty');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { name: trimmed } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId?: string,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: "${id}"`);
    }

    if (
      !updateUserDto ||
      (updateUserDto.name === undefined && updateUserDto.role === undefined)
    ) {
      throw new BadRequestException(
        'At least one field (name or role) must be provided for update',
      );
    }

    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const updateFields: { name?: string; role?: UserRole } = {};

    if (updateUserDto.name !== undefined) {
      const trimmed = updateUserDto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Name cannot be empty');
      }
      updateFields.name = trimmed;
    }

    if (updateUserDto.role !== undefined) {
      if (!Object.values(UserRole).includes(updateUserDto.role)) {
        throw new BadRequestException(
          'Role must be either ADMIN or SUPPORT_AGENT',
        );
      }

      if (!requestingUserId) {
        throw new UnauthorizedException(
          'User authentication context is missing',
        );
      }

      // Prevent users from modifying their own role (prevents self-demotion and self-promotion)
      const isSelf =
        Boolean(requestingUserId) &&
        (requestingUserId === id ||
          (Types.ObjectId.isValid(requestingUserId) &&
            new Types.ObjectId(id).equals(
              new Types.ObjectId(requestingUserId),
            )));

      if (isSelf) {
        throw new BadRequestException('Users cannot modify their own role');
      }

      // If demoting an administrator, serialize via mutex to prevent concurrent demotion race conditions
      if (
        existingUser.role === UserRole.ADMIN &&
        updateUserDto.role === UserRole.SUPPORT_AGENT
      ) {
        return this.withAdminGuardLock(async () => {
          const adminCount = await this.userModel
            .countDocuments({ role: UserRole.ADMIN })
            .exec();
          if (adminCount <= 1) {
            throw new BadRequestException(
              'Cannot demote the last remaining administrator in the system',
            );
          }

          updateFields.role = updateUserDto.role;
          const updatedUser = await this.userModel
            .findByIdAndUpdate(
              id,
              { $set: updateFields },
              { new: true, runValidators: true },
            )
            .exec();

          if (!updatedUser) {
            throw new NotFoundException(`User with ID "${id}" not found`);
          }

          return updatedUser;
        });
      }

      updateFields.role = updateUserDto.role;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return updatedUser;
  }

  async deleteUser(
    id: string,
    requestingUserId?: string,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: "${id}"`);
    }

    if (!requestingUserId) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    // Prevent Admin from deleting their own account
    const isSelf =
      requestingUserId === id ||
      (Types.ObjectId.isValid(requestingUserId) &&
        new Types.ObjectId(id).equals(new Types.ObjectId(requestingUserId)));

    if (isSelf) {
      throw new BadRequestException(
        'Administrators cannot delete their own account',
      );
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const executeDeletion = async (): Promise<UserDocument> => {
      // Prevent deleting the last remaining admin
      if (user.role === UserRole.ADMIN) {
        const adminCount = await this.userModel
          .countDocuments({ role: UserRole.ADMIN })
          .exec();
        if (adminCount <= 1) {
          throw new BadRequestException(
            'Cannot delete the last remaining administrator in the system',
          );
        }
      }

      // Step 1: Identify active ticket assignments for this user
      const assignedTickets = await this.ticketModel
        .find({ assignedToId: new Types.ObjectId(id) }, { _id: 1 })
        .exec();
      const assignedTicketIds = assignedTickets.map((t) => t._id);

      // Step 2: Clear active ticket assignments so tickets return cleanly to the unassigned queue
      if (assignedTicketIds.length > 0) {
        await this.ticketModel
          .updateMany(
            { _id: { $in: assignedTicketIds } },
            { $set: { assignedToId: null } },
          )
          .exec();
      }

      // Step 3: Permanently delete user document with compensating rollback on failure
      try {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
          throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return deletedUser;
      } catch (deleteError) {
        // Compensating transaction: Restore ticket assignments if user deletion failed
        if (assignedTicketIds.length > 0) {
          try {
            await this.ticketModel
              .updateMany(
                { _id: { $in: assignedTicketIds } },
                { $set: { assignedToId: new Types.ObjectId(id) } },
              )
              .exec();
          } catch (compensationError) {
            // Keep original error while logging compensation failure
            console.error(
              'Failed to compensate ticket assignments after user deletion failure:',
              compensationError,
            );
          }
        }
        throw deleteError;
      }
    };

    // If deleting an admin, serialize via mutex to prevent concurrent last-admin deletion race conditions
    if (user.role === UserRole.ADMIN) {
      return this.withAdminGuardLock(executeDeletion);
    }

    return executeDeletion();
  }
}
