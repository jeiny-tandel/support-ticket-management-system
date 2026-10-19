import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersService, PaginatedUsersResult } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDocument> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Permissions(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<PaginatedUsersResult> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Permissions(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user?: { id: string } },
  ): Promise<UserDocument> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }
    return this.usersService.updateUser(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
    @Request() req: { user?: { id: string } },
  ): Promise<UserDocument> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User authentication context is missing');
    }
    return this.usersService.deleteUser(id, req.user.id);
  }
}
