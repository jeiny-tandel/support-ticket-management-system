import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, Comment, CommentDocument } from './schemas';
import {
  AssignTicketDto,
  CreateCommentDto,
  CreateTicketDto,
  GetTicketsQueryDto,
  UpdateTicketStatusDto,
} from './dto';
import { TicketPriority, TicketStatus, UserRole } from '../common/enums';
import { UsersService } from '../users/users.service';
import { TicketsGateway } from './tickets.gateway';

export interface AuthenticatedUserContext {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface PaginatedTicketsResult {
  items: TicketDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketSummaryResult {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly usersService: UsersService,
    private readonly ticketsGateway: TicketsGateway,
  ) {}

  async createTicket(
    createTicketDto: CreateTicketDto,
    user: AuthenticatedUserContext,
  ): Promise<TicketDocument> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    const createdTicket = new this.ticketModel({
      title: createTicketDto.title.trim(),
      description: createTicketDto.description.trim(),
      priority: createTicketDto.priority,
      status: TicketStatus.OPEN,
      createdById: new Types.ObjectId(user.id),
      assignedToId: null,
    });

    const savedTicket = await createdTicket.save();
    return savedTicket.populate('createdById', 'name email role');
  }

  async getTickets(
    query: GetTicketsQueryDto,
    user: AuthenticatedUserContext,
  ): Promise<PaginatedTicketsResult> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    const filter: {
      assignedToId?: Types.ObjectId;
      status?: TicketStatus;
      priority?: TicketPriority;
    } = {};

    // Role-based visibility scoping
    if (user.role === UserRole.SUPPORT_AGENT) {
      filter.assignedToId = new Types.ObjectId(user.id);
    } else if (user.role === UserRole.ADMIN) {
      // Admins can view all tickets across the workspace
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    // Optional query filters
    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .populate('createdById', 'name email role')
        .populate('assignedToId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.ticketModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getSummary(
    user: AuthenticatedUserContext,
  ): Promise<TicketSummaryResult> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    const matchFilter: {
      assignedToId?: Types.ObjectId;
    } = {};

    // Role-based visibility scoping
    if (user.role === UserRole.SUPPORT_AGENT) {
      matchFilter.assignedToId = new Types.ObjectId(user.id);
    } else if (user.role === UserRole.ADMIN) {
      // Admins see organization-wide statistics across all tickets
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    interface StatusCountAggregation {
      _id: TicketStatus;
      count: number;
    }

    const aggregationResults = await this.ticketModel
      .aggregate<StatusCountAggregation>([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const summary: TicketSummaryResult = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };

    for (const item of aggregationResults) {
      const count = Number(item.count) || 0;
      summary.total += count;

      switch (item._id) {
        case TicketStatus.OPEN:
          summary.open = count;
          break;
        case TicketStatus.IN_PROGRESS:
          summary.inProgress = count;
          break;
        case TicketStatus.RESOLVED:
          summary.resolved = count;
          break;
        case TicketStatus.CLOSED:
          summary.closed = count;
          break;
      }
    }

    return summary;
  }

  async assignTicket(
    id: string,
    assignTicketDto: AssignTicketDto,
  ): Promise<TicketDocument> {
    // 1. Validate the ticket ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    // 2. Find the ticket and return 404 Not Found if it does not exist
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    // Capture the previous assignee ID before updating
    const previousAssigneeId = ticket.assignedToId
      ? ticket.assignedToId.toString()
      : null;

    // 3. Validate the assignee ID
    const { assignedToId } = assignTicketDto;
    if (!Types.ObjectId.isValid(assignedToId)) {
      throw new BadRequestException(`Invalid assignee ID: "${assignedToId}"`);
    }

    // 4 & 5. Find the user using existing Users service; 404 if user does not exist
    const assignee = await this.usersService.findById(assignedToId);
    if (!assignee) {
      throw new NotFoundException(`User with ID "${assignedToId}" not found`);
    }

    // 6. Verify that the user has the SUPPORT_AGENT role; reject Admins and any other roles
    if (assignee.role !== UserRole.SUPPORT_AGENT) {
      throw new BadRequestException(
        `Cannot assign ticket to user with role "${assignee.role}". Tickets can only be assigned to users with the SUPPORT_AGENT role.`,
      );
    }

    // 7. Update only the ticket's assignedToId using findByIdAndUpdate
    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        { assignedToId: new Types.ObjectId(assignedToId) },
        { new: true, runValidators: true },
      )
      .populate('createdById', 'name email role')
      .populate('assignedToId', 'name email role')
      .exec();

    if (!updatedTicket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    // Revoke previous assignee's ticket room access if reassigned to a different agent
    if (previousAssigneeId && previousAssigneeId !== assignedToId) {
      await this.ticketsGateway.revokeUserTicketRoomAccess(
        id,
        previousAssigneeId,
      );
    }

    // 8. Return the updated ticket
    return updatedTicket;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateTicketStatusDto,
    user: AuthenticatedUserContext,
  ): Promise<TicketDocument> {
    // 1. Validate user authentication context
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    // 2. Validate ticket ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    // 3. Ensure ticket exists
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    // 4. Role-specific validation and atomic update
    if (user.role === UserRole.SUPPORT_AGENT) {
      // Support Agents can update only tickets assigned to them
      if (!ticket.assignedToId || ticket.assignedToId.toString() !== user.id) {
        throw new ForbiddenException(
          'You can only update status for tickets assigned to you',
        );
      }

      // Support Agents cannot update or reopen a closed ticket
      if (ticket.status === TicketStatus.CLOSED) {
        throw new BadRequestException(
          'Closed tickets cannot be updated by support agents',
        );
      }

      // Atomic update enforcing ownership and non-closed status to guard against race conditions
      const updatedTicket = await this.ticketModel
        .findOneAndUpdate(
          {
            _id: id,
            assignedToId: new Types.ObjectId(user.id),
            status: { $ne: TicketStatus.CLOSED },
          },
          { status: updateStatusDto.status },
          { new: true, runValidators: true },
        )
        .populate('createdById', 'name email role')
        .populate('assignedToId', 'name email role')
        .exec();

      if (!updatedTicket) {
        throw new BadRequestException(
          'Ticket could not be updated or was closed concurrently',
        );
      }

      return updatedTicket;
    }

    if (user.role === UserRole.ADMIN) {
      // Admins can update any ticket to any valid status, including reopening closed tickets
      const updatedTicket = await this.ticketModel
        .findByIdAndUpdate(
          id,
          { status: updateStatusDto.status },
          { new: true, runValidators: true },
        )
        .populate('createdById', 'name email role')
        .populate('assignedToId', 'name email role')
        .exec();

      if (!updatedTicket) {
        throw new NotFoundException(`Ticket with ID "${id}" not found`);
      }

      return updatedTicket;
    }

    throw new ForbiddenException('Access denied for user role');
  }

  async createComment(
    ticketId: string,
    createCommentDto: CreateCommentDto,
    user: AuthenticatedUserContext,
  ): Promise<CommentDocument> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    if (!Types.ObjectId.isValid(ticketId)) {
      throw new BadRequestException(`Invalid ticket ID: "${ticketId}"`);
    }

    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

    // Role-based authorization for commenting on tickets
    if (user.role === UserRole.SUPPORT_AGENT) {
      if (!ticket.assignedToId || ticket.assignedToId.toString() !== user.id) {
        throw new ForbiddenException(
          'You can only add comments to tickets assigned to you',
        );
      }
    } else if (user.role === UserRole.ADMIN) {
      // Admins are authorized to comment on any ticket
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    const newComment = new this.commentModel({
      ticketId: new Types.ObjectId(ticketId),
      authorId: new Types.ObjectId(user.id),
      message: createCommentDto.message,
    });

    const savedComment = await newComment.save();
    await savedComment.populate('authorId', 'name email role');

    // Safe author summary for real-time broadcast
    const populatedAuthor = savedComment.authorId as unknown as {
      _id?: Types.ObjectId;
      name?: string;
      email?: string;
      role?: string;
    };

    const authorSummary = {
      _id: populatedAuthor?._id?.toString() || user.id,
      name: populatedAuthor?.name || user.name,
      email: populatedAuthor?.email || user.email,
      role: populatedAuthor?.role || user.role,
    };

    // Real-time Socket.IO broadcast to the authorized ticket room AFTER database persistence
    await this.ticketsGateway.emitCommentCreated(ticketId, {
      _id: savedComment._id.toString(),
      ticketId,
      message: savedComment.message,
      authorId: authorSummary,
      createdAt: savedComment.createdAt || new Date(),
      updatedAt: savedComment.updatedAt || new Date(),
    });

    return savedComment;
  }

  async getComments(
    ticketId: string,
    user: AuthenticatedUserContext,
  ): Promise<CommentDocument[]> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException(
        'Invalid user ID in authentication context',
      );
    }

    if (!Types.ObjectId.isValid(ticketId)) {
      throw new BadRequestException(`Invalid ticket ID: "${ticketId}"`);
    }

    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

    // Enforce the same role-based ticket access restrictions
    if (user.role === UserRole.SUPPORT_AGENT) {
      if (!ticket.assignedToId || ticket.assignedToId.toString() !== user.id) {
        throw new ForbiddenException(
          'You can only access comments on tickets assigned to you',
        );
      }
    } else if (user.role === UserRole.ADMIN) {
      // Admins are authorized to view comments on any ticket
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    return this.commentModel
      .find({ ticketId: new Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 })
      .populate('authorId', 'name email role')
      .exec();
  }

  getTicketModel(): Model<TicketDocument> {
    return this.ticketModel;
  }
}
