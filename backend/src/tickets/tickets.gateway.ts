import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums';
import { JwtPayload } from '../common/strategies/jwt.strategy';

export interface AuthenticatedSocketUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: AuthenticatedSocketUser;
  };
}

export interface SafeAuthorSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CommentCreatedEventPayload {
  _id: string;
  ticketId: string;
  message: string;
  authorId: SafeAuthorSummary;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})
export class TicketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TicketsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    // Authenticate handshake so socket.data.user is populated before events are processed.
    server.use((socket: Socket, next: (err?: Error) => void) => {
      void (async () => {
        try {
          const token = this.extractToken(socket);
          if (!token) {
            this.logger.warn(
              `Socket connection rejected: missing token (${socket.id})`,
            );
            return next(new Error('Authentication error: Missing token'));
          }

          const secret = this.configService.getOrThrow<string>('JWT_SECRET');
          const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
            secret,
          });

          if (
            !payload ||
            !payload.sub ||
            !Types.ObjectId.isValid(payload.sub)
          ) {
            this.logger.warn(
              `Socket connection rejected: invalid payload (${socket.id})`,
            );
            return next(new Error('Authentication error: Invalid payload'));
          }

          const user = await this.usersService.findById(payload.sub);
          if (!user) {
            this.logger.warn(
              `Socket connection rejected: user not found (${socket.id})`,
            );
            return next(new Error('Authentication error: User not found'));
          }

          (socket as AuthenticatedSocket).data.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };

          next();
        } catch (err: unknown) {
          const errorMsg =
            err && typeof err === 'object' && 'message' in err
              ? String(err.message)
              : 'Authentication error';
          this.logger.warn(
            `Socket connection rejected: ${errorMsg} (${socket.id})`,
          );
          next(new Error(`Authentication error: ${errorMsg}`));
        }
      })();
    });
  }

  handleConnection(client: AuthenticatedSocket): void {
    const user = client.data.user;
    if (user) {
      this.logger.log(
        `Socket authenticated: ${user.name} (${user.role}) - ${client.id}`,
      );
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Socket disconnected: ${user.name} (${client.id})`);
    }
  }

  @SubscribeMessage('ticket:join')
  async handleJoinTicketRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ): Promise<{ success: boolean; message?: string; room?: string }> {
    const user = client.data.user;
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized socket connection',
      };
    }

    const ticketId = data?.ticketId;
    if (!ticketId || !Types.ObjectId.isValid(ticketId)) {
      return {
        success: false,
        message: 'Invalid ticket ID',
      };
    }

    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket || ticket.isDeleted) {
      return {
        success: false,
        message: `Ticket with ID "${ticketId}" not found`,
      };
    }

    if (user.role === UserRole.ADMIN) {
      // Admins may join any ticket room
    } else if (user.role === UserRole.SUPPORT_AGENT) {
      if (!ticket.assignedToId || ticket.assignedToId.toString() !== user.id) {
        return {
          success: false,
          message: 'You can only join rooms for tickets assigned to you',
        };
      }
    } else {
      return {
        success: false,
        message: 'Access denied for user role',
      };
    }

    const roomName = `ticket:${ticketId}`;
    await client.join(roomName);

    this.logger.log(
      `User ${user.name} (${user.role}) joined socket room ${roomName}`,
    );

    return {
      success: true,
      room: roomName,
    };
  }

  @SubscribeMessage('ticket:leave')
  async handleLeaveTicketRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ): Promise<{ success: boolean; room?: string }> {
    const ticketId = data?.ticketId;
    if (ticketId) {
      const roomName = `ticket:${ticketId}`;
      await client.leave(roomName);
      return {
        success: true,
        room: roomName,
      };
    }
    return {
      success: false,
    };
  }

  async revokeUserTicketRoomAccess(
    ticketId: string,
    userId: string,
  ): Promise<void> {
    if (!this.server) {
      return;
    }

    const roomName = `ticket:${ticketId}`;
    try {
      const sockets = await this.server.in(roomName).fetchSockets();
      for (const socket of sockets) {
        const socketData = socket.data as
          { user?: AuthenticatedSocketUser } | undefined;
        const socketUser = socketData?.user;

        if (
          socketUser &&
          socketUser.role === UserRole.SUPPORT_AGENT &&
          socketUser.id === userId
        ) {
          socket.leave(roomName);
          this.logger.log(
            `Revoked room access for user ${socketUser.name} (${socketUser.id}) from room ${roomName}`,
          );
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Unknown error';
      this.logger.error(
        `Failed to revoke room access for user ${userId} in room ${roomName}: ${errorMsg}`,
      );
    }
  }

  async handleTicketDeleted(ticketId: string): Promise<void> {
    if (!this.server) {
      return;
    }

    const roomName = `ticket:${ticketId}`;
    try {
      this.server.to(roomName).emit('ticket:deleted', { ticketId });
      const sockets = await this.server.in(roomName).fetchSockets();
      for (const socket of sockets) {
        socket.leave(roomName);
      }
      this.logger.log(
        `Notified and evicted all sockets from deleted ticket room ${roomName}`,
      );
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Unknown error';
      this.logger.error(
        `Failed to evict sockets for deleted ticket ${ticketId}: ${errorMsg}`,
      );
    }
  }

  async emitCommentCreated(
    ticketId: string,
    payload: CommentCreatedEventPayload,
  ): Promise<void> {
    if (!this.server) {
      return;
    }

    const roomName = `ticket:${ticketId}`;

    try {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId, isDeleted: { $ne: true } })
        .select('assignedToId isDeleted')
        .lean()
        .exec();

      if (!ticket) {
        this.logger.warn(
          `Skipping comment broadcast: ticket ${ticketId} is missing or deleted`,
        );
        return;
      }

      const assignedTo = ticket.assignedToId as
        Types.ObjectId | string | undefined;
      const currentAssignedToId = assignedTo ? assignedTo.toString() : null;

      const sockets = await this.server.in(roomName).fetchSockets();

      // Evict unauthorized or stale sockets before broadcasting to maintain room access control
      for (const socket of sockets) {
        const socketData = socket.data as
          { user?: AuthenticatedSocketUser } | undefined;
        const socketUser = socketData?.user;

        if (!socketUser) {
          socket.leave(roomName);
          continue;
        }

        if (socketUser.role === UserRole.ADMIN) {
          continue;
        }

        if (socketUser.role === UserRole.SUPPORT_AGENT) {
          if (!currentAssignedToId || socketUser.id !== currentAssignedToId) {
            socket.leave(roomName);
            this.logger.warn(
              `Evicted unauthorized/stale agent ${socketUser.name} (${socketUser.id}) from room ${roomName} prior to comment broadcast`,
            );
          }
        } else {
          socket.leave(roomName);
        }
      }

      this.server.to(roomName).emit('comment:created', payload);
      this.logger.log(
        `Broadcasted comment:created event to room ${roomName} for comment ${payload._id}`,
      );
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Unknown error';
      this.logger.error(
        `Failed to broadcast comment:created in room ${roomName}: ${errorMsg}`,
      );
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const authToken = auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.startsWith('Bearer ')
        ? authToken.slice(7).trim()
        : authToken.trim();
    }

    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.trim()) {
      const [type, token] = authHeader.split(' ');
      if (type?.toLowerCase() === 'bearer' && token) {
        return token.trim();
      }
      return authHeader.trim();
    }

    const query = client.handshake.query as Record<string, unknown> | undefined;
    const queryToken = query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.trim();
    }

    return null;
  }
}
