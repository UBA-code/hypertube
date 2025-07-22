import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
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
    name: 'query',
    required: true,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['title', 'year', 'rating'],
    default: 'title',
  })
  @ApiQuery({
    name: 'filterByGenre',
    required: false,
    description: 'Filter by genre',
    type: String,
  })
  @ApiQuery({
    name: 'filterByYear',
    required: false,
    description: 'Filter by year',
    type: String,
  })
  @ApiQuery({
    name: 'filterByRating',
    required: false,
    description: 'Filter by rating',
    type: Number,
  })
  async search(
    @Req() req: Request,
    @Query('query') query: string,
    @Query('page') page?: number,
    @Query('sortBy')
    sort: 'title' | 'year' | 'rating' = 'title',
    @Query('filterByGenre') filterByGenre: string = null,
    @Query('filterByYear') filterByYear: string = null,
    @Query('filterByRating') filterByRating?: number,
  ): Promise<MoviesSearchResponse> {
    const user = req['user'];
    if (!query || query.length === 0) {
      throw new BadRequestException(
        'Search query is required when searching for movies',
      );
    }
    return await this.moviesService.search(
      user['id'],
      query,
      page,
      sort,
      filterByYear,
      filterByGenre,
      filterByRating,
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
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['title', 'year', 'rating'],
    default: 'title',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Filter by genre',
    type: String,
  })
  async getPopularMovies(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('sortBy') sort: 'title' | 'year' | 'rating' = 'rating',
    @Query('genre') genre: string,
  ): Promise<MoviesSearchResponse> {
    const user = req['user'];
    if (!sort || sort.length === 0) {
      sort = 'rating';
    }
    return await this.moviesService.search(user['id'], '', page, sort, genre);
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
