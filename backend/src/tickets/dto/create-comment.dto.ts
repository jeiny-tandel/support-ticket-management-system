import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Comment message is required' })
  @MaxLength(5000, { message: 'Comment message cannot exceed 5000 characters' })
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  message: string;
}
