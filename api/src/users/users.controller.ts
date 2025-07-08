import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/response-user.dto';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersServive: UsersService) {}

  @ApiOperation({ summary: 'create new user' })
  @ApiResponse({
    status: 201,
    description: 'Return created user',
    type: UserResponseDto,
  })
  @Post()
  //optional file upload
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(@Body() user: UserDto, @UploadedFile() file?: File) {
    return await this.usersServive.create(user, file);
  }

  @ApiOperation({ summary: 'get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return array of users',
    type: UserResponseDto,
  })
  @Get()
  async getUsers() {
    return await this.usersServive.findAll();
  }

  @ApiOperation({ summary: 'get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return user',
    type: UserResponseDto,
  })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersServive.findById(id);
  }

  @ApiOperation({ summary: 'delete user by id' })
  @ApiResponse({
    status: 200,
    description: 'Return deleted user',
    type: UserResponseDto,
  })
  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersServive.deleteById(id);
  }

  @ApiOperation({ summary: 'update user by id' })
  @ApiResponse({
    status: 200,
    description: 'return updated user',
    type: UserResponseDto,
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: File,
  ) {
    return await this.usersServive.update(id, updateUserDto, file);
  }

  @ApiOperation({
    summary:
      'update user avatar by id, expect a file with `avatar` as key (supported formats: jpg, jpeg, png)',
  })
  @ApiResponse({
    status: 200,
    description: 'return a string if the avatar was updated successfully',
  })
  @Put(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @UploadedFile() file: File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersServive.updateAvatar(id, file);
  }
}
