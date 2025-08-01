import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import MoviesSearchResponse, { MovieDto } from './types/moviesSearchResponse';
import { Request, Response } from 'express';

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
  @ApiResponse({
    status: 200,
    description: 'Returns a list of popular movies',
    type: MoviesSearchResponse,
  })
  async getPopularMovies(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('sortBy')
    sort: 'title' | 'year' | 'rating' | 'like_count' = 'like_count',
    @Query('genre') genre: string,
  ): Promise<MoviesSearchResponse> {
    const user = req['user'];
    return await this.moviesService.search(user['id'], '', page, sort, genre);
  }

  @Get(':imdbId')
  @ApiOperation({ summary: 'Get movie details by imdbId or tmdbId' })
  @ApiParam({
    name: 'imdbId or tmdbId',
    required: true,
    description: 'IMDB ID or TMDB ID of the movie',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns movie details',
    type: MoviesSearchResponse,
  })
  async getMovieDetails(
    @Req() req: Request,
    @Param('imdbId') imdbId: string,
  ): Promise<MovieDto> {
    return await this.moviesService.getMovieDetailsByImdbId(
      req['user']['id'],
      imdbId,
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

  @Post('favorite/:imdbId')
  async changeFavoriteStatus(
    @Req() req: Request,
    @Param('imdbId') imdbId: string,
    @Body('setTo', ParseBoolPipe) setTo: boolean,
  ) {
    const user = req['user'];
    if (!imdbId) {
      throw new BadRequestException('Movie ID is required');
    }
    await this.moviesService.changeFavoriteStatus(user['id'], imdbId, setTo);
    if (setTo)
      return {
        message: 'Movie is added to favorites',
      };
    else
      return {
        message: 'Movie is removed from favorites',
      };
  }

  @Get('/library/favorites')
  async getFavoritesMovies(@Req() req: Request) {
    return await this.moviesService.getFavoritesMovies(req['user']['id']);
  }

  @Get('subtitles/:imdbId/:language')
  async testSub(
    @Param('imdbId') imdbId: string,
    @Param('language') language: string,
    @Res() res: Response,
  ) {
    return await this.moviesService.getSubtitles(imdbId, language, res);
  }

  @Get('subtitles/:imdbId')
  async getAvailableSubtitles(@Param('imdbId') imdbId: string) {
    return await this.moviesService.getAllAvailableSubtitles(imdbId);
  }
}
