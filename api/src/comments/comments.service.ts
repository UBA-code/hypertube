import Comment from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoviesService } from 'src/movies/movies.service';
import { UsersService } from 'src/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private moviesService: MoviesService,
    private usersService: UsersService,
  ) {}

  async getCommentsByImdbId(
    imdbId: string,
    page: number,
    limit: number,
    sortBy: 'DESC' | 'ASC' = 'DESC',
  ) {
    return await this.commentRepository.find({
      where: {
        movie: { imdbId: imdbId },
      },
      relations: ['movie'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: sortBy,
      },
    });
  }

  async addComment(userId: number, movieImdbId: string, content: string) {
    const comment = this.commentRepository.create();
    const movie = await this.moviesService.findMovieBy({
      where: { imdbId: movieImdbId },
    });
    const user = await this.usersService.findOneBy({ id: userId });

    if (!movie) {
      throw new NotFoundException('Movie not found in the database');
    }
    comment.content = content;
    comment.movie = movie;
    comment.username = user.userName;
    comment.userAvatar = user.profilePicture;
    comment.userId = userId;

    await this.commentRepository.save(comment);
    return 'Comment added successfully';
  }

  async deleteCommentById(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, userId: userId },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you do not have permission to delete it',
      );
    }

    await this.commentRepository.remove(comment);
    return 'Comment deleted successfully';
  }
}
