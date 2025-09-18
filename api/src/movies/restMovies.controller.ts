import { Controller, Get, Param } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CommentsService } from 'src/comments/comments.service';
import { Inject, forwardRef } from '@nestjs/common';

@Controller('movie')
export class RestMoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.commentsService.getCommentsByImdbId(id, 1, 10);
  }
}
