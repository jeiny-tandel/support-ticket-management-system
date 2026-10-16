import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Ticket } from './ticket.schema';

export type CommentDocument = HydratedDocument<Comment>;

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
export class Comment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Ticket.name,
    required: true,
  })
  ticketId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  authorId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    maxlength: 5000,
  })
  message: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ ticketId: 1, createdAt: 1 });
