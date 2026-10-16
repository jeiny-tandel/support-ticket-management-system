import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums';
import {
  TicketsService,
  PaginatedTicketsResult,
  AuthenticatedUserContext,
  TicketSummaryResult,
} from './tickets.service';
import {
  AssignTicketDto,
  CreateCommentDto,
  CreateTicketDto,
  DeleteTicketDto,
  GetTicketsQueryDto,
  UpdateTicketStatusDto,
  UpdateTicketDto,
} from './dto';
import { TicketDocument, CommentDocument } from './schemas';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Permissions(Permission.MANAGE_TICKETS)
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketDocument> {
    return this.ticketsService.createTicket(createTicketDto, req.user);
  }

  @Get()
  @Permissions(Permission.VIEW_ASSIGNED_TICKETS)
  @HttpCode(HttpStatus.OK)
  async getTickets(
    @Query() query: GetTicketsQueryDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<PaginatedTicketsResult> {
    return this.ticketsService.getTickets(query, req.user);
  }

  @Get('summary')
  @Permissions(Permission.VIEW_DASHBOARD)
  @HttpCode(HttpStatus.OK)
  async getSummary(
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketSummaryResult> {
    return this.ticketsService.getSummary(req.user);
  }

  @Get('deleted')
  @Permissions(Permission.MANAGE_TICKETS)
  @HttpCode(HttpStatus.OK)
  async getDeletedTickets(
    @Query() query: GetTicketsQueryDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<PaginatedTicketsResult> {
    return this.ticketsService.getDeletedTickets(query, req.user);
  }

  @Get(':id')
  @Permissions(Permission.VIEW_ASSIGNED_TICKETS)
  @HttpCode(HttpStatus.OK)
  async getTicketById(
    @Param('id') id: string,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketDocument> {
    return this.ticketsService.getTicketById(id, req.user);
  }

  @Patch(':id/assign')
  @Permissions(Permission.MANAGE_TICKETS)
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Param('id') id: string,
    @Body() assignTicketDto: AssignTicketDto,
  ): Promise<TicketDocument> {
    return this.ticketsService.assignTicket(id, assignTicketDto);
  }

  @Patch(':id/status')
  @Permissions(Permission.UPDATE_TICKET_STATUS)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketDocument> {
    return this.ticketsService.updateStatus(
      id,
      updateTicketStatusDto,
      req.user,
    );
  }

  @Patch(':id')
  @Permissions(Permission.MANAGE_TICKETS)
  @HttpCode(HttpStatus.OK)
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketDocument> {
    return this.ticketsService.updateTicket(id, updateTicketDto, req.user);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_TICKETS)
  @HttpCode(HttpStatus.OK)
  async deleteTicket(
    @Param('id') id: string,
    @Body() deleteTicketDto: DeleteTicketDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<TicketDocument> {
    return this.ticketsService.deleteTicket(id, deleteTicketDto, req.user);
  }

  @Post(':id/comments')
  @Permissions(Permission.VIEW_ASSIGNED_TICKETS)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<CommentDocument> {
    return this.ticketsService.createComment(id, createCommentDto, req.user);
  }

  @Get(':id/comments')
  @Permissions(Permission.VIEW_ASSIGNED_TICKETS)
  @HttpCode(HttpStatus.OK)
  async getComments(
    @Param('id') id: string,
    @Request()
    req: {
      user: AuthenticatedUserContext;
    },
  ): Promise<CommentDocument[]> {
    return this.ticketsService.getComments(id, req.user);
  }
}
