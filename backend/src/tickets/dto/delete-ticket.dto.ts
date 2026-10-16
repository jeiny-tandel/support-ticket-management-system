import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteTicketDto {
  @IsString({ message: 'Deletion reason must be a string' })
  @IsNotEmpty({ message: 'Deletion reason is required' })
  @MaxLength(1000, { message: 'Deletion reason cannot exceed 1000 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  reason: string;
}
