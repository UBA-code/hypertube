import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import CommentDto from './dto/comments.dto';
import { plainToInstance } from 'class-transformer';
import CreateCommentDto from './dto/createComment.dto';

@Controller('movies')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':movieImdbId/comments')
  async getMovieComments(
    @Param('movieImdbId') imdbId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<CommentDto> {
    return plainToInstance(
      CommentDto,
      this.commentsService.getCommentsByImdbId(imdbId, page, limit),
    );
  }

  @Post(':movieImdbId/comments')
  async addComment(
    @Req() req: Request,
    @Body(ValidationPipe) payload: CreateCommentDto,
  ) {
    if (!payload.content) {
      throw new BadRequestException('Content is required');
    }
    return this.commentsService.addComment(
      req.user['id'],
      payload.movieImdbId,
      payload.content,
    );
  }

  @Delete('/comments/:commentId')
  async deleteComment(
    @Req() req: Request,
    @Param('commentId') commentId: number,
  ) {
    return this.commentsService.deleteCommentById(req.user['id'], commentId);
  }
}
