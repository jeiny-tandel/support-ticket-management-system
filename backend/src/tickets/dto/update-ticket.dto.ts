import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketPriority } from '../../common/enums';

export class UpdateTicketDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Priority must be one of LOW, MEDIUM, HIGH',
  })
  priority?: TicketPriority;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    value === '' ? null : value,
  )
  @IsDateString(
    {},
    { message: 'Due date must be a valid ISO 8601 date string' },
  )
  dueDate?: string | null;
}
