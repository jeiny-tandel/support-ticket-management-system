import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../../common/enums';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus, {
    message: 'Status must be one of OPEN, IN_PROGRESS, RESOLVED, CLOSED',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: TicketStatus;
}
