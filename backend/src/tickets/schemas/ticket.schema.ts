import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { TicketPriority, TicketStatus } from '../../common/enums';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (_doc, ret: Record<string, any>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Ticket {
  @Prop({
    required: true,
    trim: true,
    maxlength: 150,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 5000,
  })
  description: string;

  @Prop({
    required: true,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Prop({
    required: true,
    enum: TicketPriority,
  })
  priority: TicketPriority;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdById: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  assignedToId?: Types.ObjectId | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Indexes supporting key query patterns
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ assignedToId: 1, createdAt: -1 });
TicketSchema.index({ createdById: 1, createdAt: -1 });
