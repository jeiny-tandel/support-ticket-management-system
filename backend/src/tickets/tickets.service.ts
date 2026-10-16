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
  DeleteTicketDto,
  GetTicketsQueryDto,
  UpdateTicketStatusDto,
  UpdateTicketDto,
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

export interface TicketPrioritySummary {
  low: number;
  medium: number;
  high: number;
}

export interface DeadlineMetrics {
  overdue: number;
  dueToday: number;
  dueSoon: number;
}

export interface UrgentTicketItem {
  _id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  dueDate: Date | string;
  assignedToId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt?: Date | string;
}

export interface TicketSummaryResult {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unassigned: number;
  priorities: TicketPrioritySummary;
  deadlines: DeadlineMetrics;
  urgentTickets: UrgentTicketItem[];
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

    let parsedDueDate: Date | null = null;
    if (createTicketDto.dueDate) {
      const dueDate = new Date(createTicketDto.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new BadRequestException('Due date must be a valid date');
      }
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (dueDate.getTime() < startOfToday.getTime()) {
        throw new BadRequestException(
          'Due date for a new ticket cannot be in the past',
        );
      }
      parsedDueDate = dueDate;
    }

    const createdTicket = new this.ticketModel({
      title: createTicketDto.title.trim(),
      description: createTicketDto.description.trim(),
      priority: createTicketDto.priority,
      status: TicketStatus.OPEN,
      createdById: new Types.ObjectId(user.id),
      assignedToId: null,
      dueDate: parsedDueDate,
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

    const filter: Record<string, any> = {
      isDeleted: { $ne: true },
    };

    if (user.role === UserRole.SUPPORT_AGENT) {
      filter.assignedToId = new Types.ObjectId(user.id);
    } else if (user.role === UserRole.ADMIN) {
      // Admins can view all tickets across the workspace
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const search = query.search?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orConditions: Record<string, any>[] = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
      if (Types.ObjectId.isValid(search) && search.length === 24) {
        orConditions.push({ _id: new Types.ObjectId(search) });
      }
      filter.$or = orConditions;
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
      isDeleted: { $ne: boolean };
    } = {
      isDeleted: { $ne: true },
    };

    if (user.role === UserRole.SUPPORT_AGENT) {
      matchFilter.assignedToId = new Types.ObjectId(user.id);
    } else if (user.role === UserRole.ADMIN) {
      // Admins see organization-wide statistics across all tickets
    } else {
      throw new ForbiddenException('Access denied for user role');
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const fortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const activeDeadlineFilter = {
      status: { $nin: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
      dueDate: { $ne: null },
    };

    interface FacetAggregationResult {
      statusCounts: Array<{ _id: TicketStatus; count: number }>;
      priorityCounts: Array<{ _id: TicketPriority; count: number }>;
      unassignedCount: Array<{ count: number }>;
      overdueCount: Array<{ count: number }>;
      dueTodayCount: Array<{ count: number }>;
      dueSoonCount: Array<{ count: number }>;
    }

    const [[facetResult], urgentTickets] = await Promise.all([
      this.ticketModel
        .aggregate<FacetAggregationResult>([
          { $match: matchFilter },
          {
            $facet: {
              statusCounts: [
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                  },
                },
              ],
              priorityCounts: [
                {
                  $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                  },
                },
              ],
              unassignedCount: [
                {
                  $match: {
                    $or: [
                      { assignedToId: null },
                      { assignedToId: { $exists: false } },
                    ],
                  },
                },
                {
                  $count: 'count',
                },
              ],
              overdueCount: [
                {
                  $match: {
                    ...activeDeadlineFilter,
                    dueDate: { $ne: null, $lt: now },
                  },
                },
                { $count: 'count' },
              ],
              dueTodayCount: [
                {
                  $match: {
                    ...activeDeadlineFilter,
                    dueDate: {
                      $ne: null,
                      $gte: startOfToday,
                      $lte: endOfToday,
                    },
                  },
                },
                { $count: 'count' },
              ],
              dueSoonCount: [
                {
                  $match: {
                    ...activeDeadlineFilter,
                    dueDate: {
                      $ne: null,
                      $gt: endOfToday,
                      $lte: fortyEightHours,
                    },
                  },
                },
                { $count: 'count' },
              ],
            },
          },
        ])
        .exec(),
      this.ticketModel
        .find({
          ...matchFilter,
          status: { $nin: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
          dueDate: { $ne: null },
        })
        .select('title status priority dueDate assignedToId createdAt')
        .populate('assignedToId', 'name email role')
        .sort({ dueDate: 1 })
        .limit(5)
        .exec(),
    ]);

    const summary: TicketSummaryResult = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      unassigned: 0,
      priorities: {
        low: 0,
        medium: 0,
        high: 0,
      },
      deadlines: {
        overdue: 0,
        dueToday: 0,
        dueSoon: 0,
      },
      urgentTickets: urgentTickets.map((t) => {
        const assignee = t.assignedToId as unknown as {
          _id?: { toString(): string } | string;
          name?: string;
          email?: string;
          role?: string;
        } | null;

        return {
          _id: t._id.toString(),
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate as Date,
          assignedToId: assignee
            ? {
                _id: assignee._id ? assignee._id.toString() : '',
                name: assignee.name || '',
                email: assignee.email || '',
                role: assignee.role || '',
              }
            : null,
          createdAt: t.createdAt,
        };
      }),
    };

    if (facetResult) {
      if (facetResult.statusCounts) {
        for (const item of facetResult.statusCounts) {
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
      }

      if (facetResult.priorityCounts) {
        for (const item of facetResult.priorityCounts) {
          const count = Number(item.count) || 0;

          switch (item._id) {
            case TicketPriority.LOW:
              summary.priorities.low = count;
              break;
            case TicketPriority.MEDIUM:
              summary.priorities.medium = count;
              break;
            case TicketPriority.HIGH:
              summary.priorities.high = count;
              break;
          }
        }
      }

      if (
        facetResult.unassignedCount &&
        facetResult.unassignedCount.length > 0
      ) {
        summary.unassigned = Number(facetResult.unassignedCount[0].count) || 0;
      }

      if (facetResult.overdueCount && facetResult.overdueCount.length > 0) {
        summary.deadlines.overdue =
          Number(facetResult.overdueCount[0].count) || 0;
      }

      if (facetResult.dueTodayCount && facetResult.dueTodayCount.length > 0) {
        summary.deadlines.dueToday =
          Number(facetResult.dueTodayCount[0].count) || 0;
      }

      if (facetResult.dueSoonCount && facetResult.dueSoonCount.length > 0) {
        summary.deadlines.dueSoon =
          Number(facetResult.dueSoonCount[0].count) || 0;
      }
    }

    return summary;
  }

  async assignTicket(
    id: string,
    assignTicketDto: AssignTicketDto,
  ): Promise<TicketDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    const ticket = await this.ticketModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    const previousAssigneeId = ticket.assignedToId
      ? ticket.assignedToId.toString()
      : null;

    const { assignedToId } = assignTicketDto;
    if (!Types.ObjectId.isValid(assignedToId)) {
      throw new BadRequestException(`Invalid assignee ID: "${assignedToId}"`);
    }

    const assignee = await this.usersService.findById(assignedToId);
    if (!assignee) {
      throw new NotFoundException(`User with ID "${assignedToId}" not found`);
    }

    if (assignee.role !== UserRole.SUPPORT_AGENT) {
      throw new BadRequestException(
        `Cannot assign ticket to user with role "${assignee.role}". Tickets can only be assigned to users with the SUPPORT_AGENT role.`,
      );
    }

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

    return updatedTicket;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateTicketStatusDto,
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

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    const ticket = await this.ticketModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    if (user.role === UserRole.SUPPORT_AGENT) {
      if (!ticket.assignedToId || ticket.assignedToId.toString() !== user.id) {
        throw new ForbiddenException(
          'You can only update status for tickets assigned to you',
        );
      }

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
            isDeleted: { $ne: true },
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
      const updatedTicket = await this.ticketModel
        .findOneAndUpdate(
          { _id: id, isDeleted: { $ne: true } },
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

  async updateTicket(
    id: string,
    updateTicketDto: UpdateTicketDto,
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

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators have permission to edit ticket details',
      );
    }

    if (
      !updateTicketDto ||
      (updateTicketDto.title === undefined &&
        updateTicketDto.description === undefined &&
        updateTicketDto.priority === undefined &&
        updateTicketDto.dueDate === undefined)
    ) {
      throw new BadRequestException(
        'At least one field (title, description, priority, or dueDate) must be provided for update',
      );
    }

    const existingTicket = await this.ticketModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .exec();
    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    const updateFields: {
      title?: string;
      description?: string;
      priority?: TicketPriority;
      dueDate?: Date | null;
    } = {};

    if (updateTicketDto.title !== undefined) {
      const trimmed = updateTicketDto.title.trim();
      if (!trimmed) {
        throw new BadRequestException('Title cannot be empty');
      }
      updateFields.title = trimmed;
    }

    if (updateTicketDto.description !== undefined) {
      const trimmed = updateTicketDto.description.trim();
      if (!trimmed) {
        throw new BadRequestException('Description cannot be empty');
      }
      updateFields.description = trimmed;
    }

    if (updateTicketDto.priority !== undefined) {
      updateFields.priority = updateTicketDto.priority;
    }

    if (updateTicketDto.dueDate !== undefined) {
      if (updateTicketDto.dueDate === null) {
        updateFields.dueDate = null;
      } else {
        const newDueDate = new Date(updateTicketDto.dueDate);
        if (isNaN(newDueDate.getTime())) {
          throw new BadRequestException('Due date must be a valid date');
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const isExistingDate =
          existingTicket.dueDate &&
          new Date(existingTicket.dueDate).getTime() === newDueDate.getTime();
        const isActiveTicket =
          existingTicket.status === TicketStatus.OPEN ||
          existingTicket.status === TicketStatus.IN_PROGRESS;

        if (
          !isExistingDate &&
          isActiveTicket &&
          newDueDate.getTime() < startOfToday.getTime()
        ) {
          throw new BadRequestException(
            'Newly assigned due date cannot be in the past',
          );
        }

        updateFields.dueDate = newDueDate;
      }
    }

    const updatedTicket = await this.ticketModel
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        { $set: updateFields },
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

    const ticket = await this.ticketModel
      .findOne({ _id: ticketId, isDeleted: { $ne: true } })
      .exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

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

    // Non-admins cannot access comments for soft-deleted tickets
    if (ticket.isDeleted && user.role !== UserRole.ADMIN) {
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

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

  async getTicketById(
    id: string,
    user: AuthenticatedUserContext,
  ): Promise<TicketDocument> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    const ticket = await this.ticketModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('createdById', 'name email role')
      .populate('assignedToId', 'name email role')
      .exec();

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    if (user.role === UserRole.SUPPORT_AGENT) {
      const assigneeObj = ticket.assignedToId as unknown as {
        _id?: Types.ObjectId;
      } | null;
      const assigneeId =
        assigneeObj?._id?.toString() || ticket.assignedToId?.toString();
      if (assigneeId !== user.id) {
        throw new ForbiddenException('Access denied for this ticket');
      }
    }

    return ticket;
  }

  async deleteTicket(
    id: string,
    deleteTicketDto: DeleteTicketDto,
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

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators have permission to delete tickets',
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ticket ID: "${id}"`);
    }

    const trimmedReason = deleteTicketDto?.reason?.trim();
    if (!trimmedReason) {
      throw new BadRequestException('Deletion reason is required');
    }

    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    if (ticket.isDeleted) {
      throw new BadRequestException('Ticket is already deleted');
    }

    const deletedTicket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            deletionReason: trimmedReason,
            deletedById: new Types.ObjectId(user.id),
            deletedAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      )
      .populate('createdById', 'name email role')
      .populate('assignedToId', 'name email role')
      .populate('deletedById', 'name email role')
      .exec();

    if (!deletedTicket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    await this.ticketsGateway.handleTicketDeleted(id);

    return deletedTicket;
  }

  async getDeletedTickets(
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

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can view deleted tickets',
      );
    }

    const filter: Record<string, any> = {
      isDeleted: true,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const search = query.search?.trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orConditions: Record<string, any>[] = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
      if (Types.ObjectId.isValid(search) && search.length === 24) {
        orConditions.push({ _id: new Types.ObjectId(search) });
      }
      filter.$or = orConditions;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .populate('createdById', 'name email role')
        .populate('assignedToId', 'name email role')
        .populate('deletedById', 'name email role')
        .sort({ deletedAt: -1, createdAt: -1 })
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

  getTicketModel(): Model<TicketDocument> {
    return this.ticketModel;
  }
}
