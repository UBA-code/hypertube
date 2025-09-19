import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import CommentDto from './dto/comments.dto';
import CreateCommentDto, {
  RestFullCreateCommentDto,
} from './dto/createComment.dto';
import { Request } from 'express';

@Controller('comments')
export class RestCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getLatestComments() {
    return await this.commentsService.getLatestComments();
  }

  @Post()
  async addComment(
    @Req() req: Request,
    @Body(ValidationPipe) payload: RestFullCreateCommentDto,
  ) {
    return await this.commentsService.addComment(
      req.user['id'],
      payload.movie_id,
      payload.content,
    );
  }

  @Get(':id')
  async getUserComments(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<CommentDto[]> {
    return this.commentsService.getCommentsByUserId(userId);
  }

  @Patch(':id')
  async updateCommentContent(
    @Param('id', ParseIntPipe) commentId: number,
    @Body(ValidationPipe) payload: CreateCommentDto,
    @Req() req: Request,
  ) {
    return await this.commentsService.updateCommentContent(
      req.user['id'],
      commentId,
      payload.content,
    );
  }

  @Delete(':id')
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    return await this.commentsService.deleteCommentById(
      req.user['id'],
      commentId,
    );
  }
}
