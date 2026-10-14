import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AssignTicketDto {
  @IsString({ message: 'Assignee ID must be a string' })
  @IsNotEmpty({ message: 'Assignee ID is required' })
  @IsMongoId({ message: 'Assignee ID must be a valid MongoDB ObjectId' })
  assignedToId: string;
}
