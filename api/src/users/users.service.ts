import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { FindOneOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { UserPublicDataDto } from './dto/public-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailsService } from 'src/mails/mails.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailsService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async create(
    user: UserDto,
    file: Express.Multer.File,
  ): Promise<{ accessToken: string; user: User }> {
    const emailSearch = await this.usersRepository.findOneBy({
      email: user.email,
      authType: 'local',
    });
    if (emailSearch)
      throw new ConflictException('User with this email already exists');
    if (
      await this.usersRepository.findOneBy({
        userName: user.userName,
        authType: 'local',
      })
    )
      throw new ConflictException('User with this username already exists');

    const newUser = this.usersRepository.create(user);

    if (file) newUser.profilePicture = file.filename;
    newUser.password = await this.hashPassword(user.password);
    newUser.authType = 'local';
    newUser.verified = false;
    await this.usersRepository.save(newUser);

    const accessToken = await this.jwtService.signAsync({
      sub: newUser.id,
      username: newUser.userName,
    });

    await this.authService.sendVerificationMail(
      user.email,
      newUser,
      'verification',
    );

    return {
      accessToken,
      user: newUser,
    };
  }

  async createUser(): Promise<User> {
    const user = this.usersRepository.create();
    return user;
  }

  async findAll(): Promise<UserPublicDataDto[]> {
    return await this.usersRepository.find();
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return user;
  }

  async findOneBy(query: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOneBy(query);

    return user;
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.usersRepository.findOne(query);

    return user;
  }

  async findManyBy(query: object): Promise<User[]> {
    return await this.usersRepository.findBy(query);
  }

  async findByUserName(userName: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ userName });
    return user;
  }

  async findByUserNameHint(username: string): Promise<User[]> {
    return await this.usersRepository.findBy({
      userName: Like(`%${username}%`),
    });
  }

  async findOneOrCreateByUsername(userName: string, user: User): Promise<User> {
    const userFound = await this.usersRepository.findOneBy({
      userName,
      authType: user.authType,
    });
    if (userFound) {
      this.logger.debug(`User ${userName} found in database`);
      return userFound;
    }
    this.logger.debug(`User ${userName} not found, creating new user`);
    return await this.usersRepository.save(user);
  }

  async findOneOrCreateByEmail(email: string, user: User): Promise<User> {
    const userFound = await this.usersRepository.findOneBy({
      email,
      authType: user.authType,
    });
    if (userFound && userFound.authType === user.authType) {
      return userFound;
    }
    return await this.usersRepository.save(user);
  }

  async idIsFound(id: number): Promise<boolean> {
    const user = await this.usersRepository.count({ where: { id } });
    return !!user;
  }

  async deleteById(id: number): Promise<UserPublicDataDto> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException();

    return await this.usersRepository.remove(user);
  }

  async update(
    id: number,
    user: UpdateUserDto,
    file: Express.Multer.File,
  ): Promise<UserPublicDataDto> {
    const newUser = await this.usersRepository.findOneBy({ id });
    const { email, ...rest } = user;

    if (!newUser) throw new NotFoundException();
    Object.assign(newUser, rest);
    if (file) {
      const apiUrl = process.env.API_URL.split('/');
      const baseUrl = apiUrl.slice(0, apiUrl.length - 1).join('/');
      newUser.profilePicture = baseUrl + '/uploads/' + file.filename;
    }
    if (email && email !== newUser.email) {
      await this.authService.sendVerificationMail(
        user.email,
        newUser,
        'change',
      );
    }
    return await this.usersRepository.save(newUser);
  }

  async saveUser(user: User) {
    return await this.usersRepository.save(user);
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<string> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const avatarUrl = file.filename;
    user.profilePicture = avatarUrl;
    await this.usersRepository.save(user);
    return 'Avatar updated successfully';
  }

  async isFavoriteMovie(userId: number, movieId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteMovies'],
    });

    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    return user.favoriteMovies.some((movie) => movie.imdbId === movieId);
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);

    return hash;
  }
}
