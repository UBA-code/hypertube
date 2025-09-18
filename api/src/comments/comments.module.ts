import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Comment from './entities/comment.entity';
import { MoviesModule } from 'src/movies/movies.module';
import { UsersModule } from 'src/users/users.module';
import { RestCommentsController } from './restComment.controller';

@Module({
  exports: [CommentsService],
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => MoviesModule),
    UsersModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController, RestCommentsController],
})
export class CommentsModule {}
