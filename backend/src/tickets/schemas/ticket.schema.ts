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

  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isDeleted: boolean;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  deletionReason?: string | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    default: null,
  })
  deletedById?: Types.ObjectId | null;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt?: Date | null;

  @Prop({
    type: Date,
    default: null,
  })
  dueDate?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ assignedToId: 1, createdAt: -1 });
TicketSchema.index({ createdById: 1, createdAt: -1 });
TicketSchema.index({ isDeleted: 1, createdAt: -1 });
TicketSchema.index({ isDeleted: 1, deletedAt: -1 });
