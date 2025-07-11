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
import { UserPublicDataDto } from './dto/public-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilesService } from 'src/files/files.service';
import { File } from '@nest-lab/fastify-multer';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private filesService: FilesService,
    private jwtService: JwtService,
  ) {}

  async create(
    user: UserDto,
    file: File,
  ): Promise<{ accessToken: string; user: User }> {
    if (await this.usersRepository.findOneBy({ email: user.email }))
      throw new ConflictException('User with this email already exists');
    if (await this.usersRepository.findOneBy({ userName: user.userName }))
      throw new ConflictException('User with this username already exists');

    const newUser = this.usersRepository.create(user);

    if (file && file.buffer)
      newUser.avatar = await this.filesService.saveAvatar(file);
    newUser.password = await this.hashPassword(user.password);
    await this.usersRepository.save(newUser);

    const accessToken = await this.jwtService.signAsync({
      sub: newUser.id,
      username: newUser.userName,
    });

    return {
      accessToken,
      user: newUser,
    };
  }

  async findAll(): Promise<UserPublicDataDto[]> {
    return plainToInstance(
      UserPublicDataDto,
      await this.usersRepository.find(),
    );
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  async findByUserName(userName: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ userName });
    return user;
  }

  async deleteById(id: number): Promise<UserPublicDataDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return plainToInstance(
      UserPublicDataDto,
      await this.usersRepository.remove(user),
    );
  }

  async update(
    id: number,
    user: UpdateUserDto,
    file: File,
  ): Promise<UserPublicDataDto> {
    const newUser = await this.usersRepository.findOneBy({ id });
    if (!newUser) throw new NotFoundException();
    Object.assign(newUser, user);
    if (file && file.buffer)
      newUser.avatar = await this.filesService.saveAvatar(file);
    return plainToInstance(
      UserPublicDataDto,
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

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);

    return hash;
  }
}
