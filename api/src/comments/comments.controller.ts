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
import { ApiQuery } from '@nestjs/swagger';

@Controller('movies')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':movieImdbId/comments')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of comments per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort order for comments (ASC or DESC)',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  async getMovieComments(
    @Param('movieImdbId') imdbId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
    @Query('sortBy', new DefaultValuePipe('DESC'))
    sortBy: 'DESC' | 'ASC' = 'DESC',
  ): Promise<CommentDto> {
    if (!['DESC', 'ASC'].includes(sortBy)) {
      throw new BadRequestException(
        'Invalid sortBy value. Use "DESC" or "ASC".',
      );
    }
    return plainToInstance(
      CommentDto,
      this.commentsService.getCommentsByImdbId(imdbId, page, limit, sortBy),
    );
  }

  @Post(':movieImdbId/comments')
  async addComment(
    @Req() req: Request,
    @Param('movieImdbId') movieImdbId: string,
    @Body(ValidationPipe) payload: CreateCommentDto,
  ) {
    if (!payload.content) {
      throw new BadRequestException('Content is required');
    }
    return await this.commentsService.addComment(
      req.user['id'],
      movieImdbId,
      payload.content,
    );
  }

  @Delete('/comments/:commentId')
  async deleteComment(
    @Req() req: Request,
    @Param('commentId') commentId: number,
  ) {
    return await this.commentsService.deleteCommentById(
      req.user['id'],
      commentId,
    );
  }
}
