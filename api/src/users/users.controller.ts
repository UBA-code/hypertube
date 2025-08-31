import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPublicDataDto } from './dto/public-user.dto';
import { FileValidationPipe } from 'src/pipes/FileValidationPipe';
import { UploadInterceptor } from 'src/interceptors/upload-interceptor';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersServive: UsersService) {}

  @ApiOperation({ summary: 'get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return array of users',
    type: UserPublicDataDto,
  })
  @Get()
  async getUsers() {
    return await this.usersServive.findAll();
  }

  @ApiOperation({ summary: 'get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return user',
    type: UserPublicDataDto,
  })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersServive.findById(id);
    return plainToInstance(UserPublicDataDto, user);
  }

  @ApiOperation({ summary: 'delete user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return deleted user',
    type: UserPublicDataDto,
  })
  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersServive.deleteById(id);
  }

  @ApiOperation({
    summary: 'get users that contain or match the given username',
  })
  @ApiResponse({
    status: 200,
    description: 'Return users',
    type: UserPublicDataDto,
    isArray: true,
  })
  @Get('username/:username')
  async getUsersByUsername(@Param('username') username: string) {
    return plainToInstance(
      UserPublicDataDto,
      await this.usersServive.findByUserNameHint(username),
    );
  }

  @ApiOperation({ summary: 'update user by id' })
  @ApiResponse({
    status: 200,
    description: 'return updated user',
    type: UserPublicDataDto,
  })
  @UseInterceptors(UploadInterceptor('profilePicture'))
  @Put()
  async updateUserById(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const id = req.user['id'];

    return plainToInstance(
      UserPublicDataDto,
      await this.usersServive.update(id, updateUserDto, file),
    );
  }

  @ApiOperation({
    summary:
      'update user profilePicture by id, expect a file with `profilePicture` as key (supported formats: jpg, jpeg, png)',
  })
  @ApiResponse({
    status: 200,
    description:
      'return a string if the profilePicture was updated successfully',
  })
  @Put(':id/profilePicture')
  @UseInterceptors(UploadInterceptor('profilePicture'))
  async updateUserAvatar(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersServive.updateAvatar(id, file);
  }
}
