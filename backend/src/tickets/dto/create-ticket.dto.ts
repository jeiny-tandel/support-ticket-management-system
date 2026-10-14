import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketPriority } from '../../common/enums';

export class CreateTicketDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  description: string;

  @IsEnum(TicketPriority, {
    message: 'Priority must be one of LOW, MEDIUM, HIGH',
  })
  @IsNotEmpty({ message: 'Priority is required' })
  priority: TicketPriority;
}
