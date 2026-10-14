import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/axios';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import type { TicketComment } from '../types';

export interface RoomJoinResponse {
  success: boolean;
  room?: string;
  message?: string;
}

export interface RoomLeaveResponse {
  success: boolean;
  room?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentJoinedTicketId: string | null = null;

  /**
   * Initializes or returns the authenticated singleton socket connection.
   */
  public connect(): Socket | null {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      if (this.socket) {
        this.disconnect();
      }
      return null;
    }

    // If socket exists, update token in auth payload and ensure connection
    if (this.socket) {
      this.socket.auth = {
        token: `Bearer ${token}`,
      };
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    // Create a new socket instance
    this.socket = io(API_BASE_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      // Re-join current room automatically if socket reconnected after disconnection
      if (this.currentJoinedTicketId && this.socket) {
        this.socket.emit(
          'ticket:join',
          { ticketId: this.currentJoinedTicketId },
          (response: RoomJoinResponse) => {
            if (!response?.success && response?.message) {
              console.warn(
                `Re-join room notice (${this.currentJoinedTicketId}):`,
                response.message,
              );
            }
          },
        );
      }
    });

    this.socket.on('connect_error', (error) => {
      // Do not log tokens or sensitive data
      console.warn('Socket connection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Returns current active socket instance if any.
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Requests joining a ticket room with server-side authorization check.
   */
  public async joinTicketRoom(ticketId: string): Promise<RoomJoinResponse> {
    const socket = this.connect();
    if (!socket) {
      return {
        success: false,
        message: 'No active socket connection',
      };
    }

    this.currentJoinedTicketId = ticketId;

    // Ensure socket connection has established before emitting join request
    if (!socket.connected) {
      await new Promise<void>((resolve) => {
        const onConnect = () => {
          socket.off('connect', onConnect);
          resolve();
        };
        socket.on('connect', onConnect);
        // Fallback timer in case already connecting
        setTimeout(() => {
          socket.off('connect', onConnect);
          resolve();
        }, 3000);
      });
    }

    return new Promise<RoomJoinResponse>((resolve) => {
      socket.emit(
        'ticket:join',
        { ticketId },
        (response: RoomJoinResponse) => {
          resolve(
            response || {
              success: false,
              message: 'No response from server',
            },
          );
        },
      );
    });
  }

  /**
   * Leaves a ticket room.
   */
  public async leaveTicketRoom(ticketId: string): Promise<RoomLeaveResponse> {
    if (this.currentJoinedTicketId === ticketId) {
      this.currentJoinedTicketId = null;
    }

    if (!this.socket || !this.socket.connected) {
      return { success: true };
    }

    return new Promise<RoomLeaveResponse>((resolve) => {
      this.socket?.emit(
        'ticket:leave',
        { ticketId },
        (response: RoomLeaveResponse) => {
          resolve(response || { success: true });
        },
      );
    });
  }

  /**
   * Registers a listener for 'comment:created' events.
   * Returns an unsubscribe function to remove only this listener.
   */
  public onCommentCreated(
    callback: (comment: TicketComment) => void,
  ): () => void {
    const socket = this.connect();
    if (!socket) {
      return () => {};
    }

    socket.on('comment:created', callback);

    return () => {
      socket.off('comment:created', callback);
    };
  }

  /**
   * Disconnects the socket and clears state (used on logout).
   */
  public disconnect(): void {
    if (this.socket) {
      if (this.currentJoinedTicketId) {
        this.socket.emit('ticket:leave', {
          ticketId: this.currentJoinedTicketId,
        });
        this.currentJoinedTicketId = null;
      }
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
