import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPublicDataDto } from './dto/public-user.dto';
import { FileValidationPipe } from 'src/pipes/FileValidationPipe';
import { UploadInterceptor } from 'src/interceptors/upload-interceptor';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersServive: UsersService) {}

  // @ApiOperation({ summary: 'create new user' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Return created user',
  //   type: UserPublicDataDto,
  // })
  // @Post()
  // @UseInterceptors(FileInterceptor('avatar'))
  // async createUser(@Body() user: UserDto, @UploadedFile() file?: File) {
  //   return await this.usersServive.create(user, file);
  // }

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
    return await this.usersServive.findById(id);
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

  @ApiOperation({ summary: 'update user by id' })
  @ApiResponse({
    status: 200,
    description: 'return updated user',
    type: UserPublicDataDto,
  })
  @UseInterceptors(UploadInterceptor('avatar'))
  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
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
  @UseInterceptors(UploadInterceptor('avatar'))
  async updateUserAvatar(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersServive.updateAvatar(id, file);
  }
}
