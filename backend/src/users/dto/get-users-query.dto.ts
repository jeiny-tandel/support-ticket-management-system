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
import { UserRole } from '../../common/enums';

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be either ADMIN or SUPPORT_AGENT',
  })
  role?: UserRole;

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @MaxLength(100, { message: 'Search query cannot exceed 100 characters' })
  search?: string;

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
