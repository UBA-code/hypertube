import { Exclude } from 'class-transformer';
import Movie from '../../movies/entities/movie.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/users.entity';

export default class CommentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  user: User;

  @Exclude()
  movie: Movie;

  @ApiProperty()
  createdAt: Date;
}
