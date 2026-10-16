import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketPriority, TicketStatus } from '../../common/enums';

export class GetTicketsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Search query cannot exceed 100 characters' })
  search?: string;

  @IsOptional()
  @IsEnum(TicketStatus, {
    message: 'Status must be one of OPEN, IN_PROGRESS, RESOLVED, CLOSED',
  })
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'Priority must be one of LOW, MEDIUM, HIGH',
  })
  priority?: TicketPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be a positive integer' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be a positive integer' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 10;
}
