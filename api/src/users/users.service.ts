import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilesService } from 'src/files/files.service';
import { File } from '@nest-lab/fastify-multer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  async create(user: UserDto, file: File): Promise<UserResponseDto> {
    if (await this.usersRepository.findOneBy({ userName: user.userName }))
      throw new ConflictException();

    const newUser = this.usersRepository.create(user);
    console.log({ ...file });

    if (file && file.buffer)
      newUser.avatar = await this.filesService.saveAvatar(file);
    await this.usersRepository.save(newUser);
    return plainToInstance(UserResponseDto, newUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return plainToInstance(UserResponseDto, await this.usersRepository.find());
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return plainToInstance(UserResponseDto, user);
  }

  async deleteById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return plainToInstance(
      UserResponseDto,
      await this.usersRepository.remove(user),
    );
  }

  async update(
    id: number,
    user: UpdateUserDto,
    file: File,
  ): Promise<UserResponseDto> {
    const newUser = await this.usersRepository.findOneBy({ id });
    if (!newUser) throw new NotFoundException();
    Object.assign(newUser, user);
    if (file && file.buffer)
      newUser.avatar = await this.filesService.saveAvatar(file);
    return plainToInstance(
      UserResponseDto,
      await this.usersRepository.save(newUser),
    );
  }

  async updateAvatar(id: number, file: File): Promise<string> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const avatarUrl = await this.filesService.saveAvatar(file);
    user.avatar = avatarUrl;
    await this.usersRepository.save(user);
    return 'Avatar updated successfully';
  }
}
