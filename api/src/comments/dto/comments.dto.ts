import { Exclude } from 'class-transformer';
import Movie from '../../movies/entities/movie.entity';
import { ApiProperty } from '@nestjs/swagger';

export default class CommentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  userAvatar: string;

  @Exclude()
  movie: Movie;

  @ApiProperty()
  createdAt: Date;
}
