import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import MoviesSearchResponse from './types/moviesSearchResponse';
import { Request } from 'express';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for movies' })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search query, if query is not specified, it will return most liked movies',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
    type: Number,
    default: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['title', 'year', 'rating', 'seeds', 'genre'],
    default: 'title',
  })
  async search(
    @Req() req: Request,
    @Query('q') query: string,
    @Query('page') page: number,
    @Query('limit') limit: number = 10,
    @Query('sortBy')
    sort: 'title' | 'year' | 'rating' | 'seeds' | 'genre' = 'title',
  ): Promise<MoviesSearchResponse> {
    const user = req['user'];
    return await this.moviesService.search(
      user['id'],
      query,
      page,
      limit,
      sort,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
    type: Number,
    default: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['title', 'year', 'rating', 'seeds'],
    default: 'title',
  })
  async getPopularMovies(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sort: 'title' | 'year' | 'rating' | 'seeds' | 'genre',
    @Query('genre') genre: string,
  ): Promise<MoviesSearchResponse> {
    const user = req['user'];
    if (!sort || sort.length === 0) {
      sort = 'rating';
    }
    return await this.moviesService.search(
      user['id'],
      '',
      page,
      limit,
      sort,
      genre,
    );
  }

  @Post('watched')
  async markAsWatched(@Req() req: Request, @Body('imdbId') imdbId: string) {
    const user = req['user'];
    await this.moviesService.markAsWatched(user['id'], imdbId);
    return {
      message: 'Movie is marked as watched',
    };
  }
}
