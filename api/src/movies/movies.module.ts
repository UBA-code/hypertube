import { forwardRef, Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import Movie from './entities/movie.entity';
import Genre from './entities/genre.entity';
import { RestMoviesController } from './restMovies.controller';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  exports: [MoviesService],
  imports: [
    TypeOrmModule.forFeature([Movie, Genre]),
    UsersModule,
    forwardRef(() => CommentsModule),
  ],
  providers: [MoviesService],
  controllers: [MoviesController, RestMoviesController],
})
export class MoviesModule {}
