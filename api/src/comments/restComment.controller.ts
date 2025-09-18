import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import CommentDto from './dto/comments.dto';

@Controller('comments')
export class RestCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async getUserComments(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<CommentDto[]> {
    return this.commentsService.getCommentsByUserId(userId);
  }
}
