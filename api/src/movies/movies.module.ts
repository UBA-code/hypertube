import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import Movie from './entities/movie.entity';

@Module({
  exports: [MoviesService],
  imports: [TypeOrmModule.forFeature([Movie]), UsersModule],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
