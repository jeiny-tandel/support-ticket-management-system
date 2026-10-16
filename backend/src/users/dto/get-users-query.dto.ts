import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../common/enums';

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be either ADMIN or SUPPORT_AGENT',
  })
  role?: UserRole;
}
