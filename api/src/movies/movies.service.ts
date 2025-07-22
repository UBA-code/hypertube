import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Movie from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import {
  YtsDetailedMovie,
  YtsListMoviesResponse,
} from './types/ytsResponseInterfaces';
import axios from 'axios';
import MoviesSearchResponse, {
  SearchMovie,
} from './types/moviesSearchResponse';
import Genre from './entities/genre.entity';
import { TmdbSearchResponse } from './types/TmdbSearchResponse';
import { tmdbGenres } from './constants/tmdbGenres';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    private usersService: UsersService,
  ) {}

  async createMovie(movieData: Partial<Movie>): Promise<Movie> {
    const movie = this.movieRepository.create(movieData);
    return await this.movieRepository.save(movie);
  }

  async findAllMovies(): Promise<Movie[]> {
    return await this.movieRepository.find();
  }

  async findMovieById(id: number): Promise<Movie> {
    return await this.movieRepository.findOneBy({ id });
  }

  async findMoviesByTitle(title: string): Promise<Movie[]> {
    return await this.movieRepository.find({
      where: { title },
    });
  }

  async findMoviesByHint(hint: string): Promise<Movie[]> {
    return await this.movieRepository.find({
      where: { title: Like(`%${hint}%`) },
    });
  }

  async updateMovie(id: number, movieData: Partial<Movie>): Promise<Movie> {
    await this.movieRepository.update(id, movieData);
    return await this.findMovieById(id);
  }

  async deleteMovie(id: number): Promise<void> {
    await this.movieRepository.delete({ id });
  }

  async getYtsSearchResult(
    userId: number,
    query: string,
    page: number,
    sort: 'title' | 'year' | 'rating' | 'seeds' | 'genre',
  ) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });

    try {
      const searchResult = (
        await axios.get<YtsListMoviesResponse>(
          'https://yts.mx/api/v2/list_movies.json',
          {
            params: {
              query_term: query,
              page,
              sort_by: sort,
            },
          },
        )
      ).data;

      const movies: SearchMovie[] = searchResult.data.movie_count
        ? searchResult.data.movies.map((movie): SearchMovie => {
            return {
              source: 'yts',
              imdb_id: movie.imdb_code,
              title: movie.title,
              year: movie.year.toString(),
              imdbRating: movie.rating,
              genres: movie.genres,
              duration: movie.runtime.toString(),
              coverImage: movie.medium_cover_image,
              isWatched: user.watchedMovies.some(
                (watchedMovie) => watchedMovie.imdbId === movie.imdb_code,
              ),
            };
          })
        : [];

      return {
        movies,
        totalResults: searchResult.data.movie_count,
      };
    } catch (error) {
      console.error(error);
      return {
        movies: [],
        totalResults: 0,
      };
    }
  }

  async getTmdbPopularSearchResult(
    userId: number,
    query: string = '',
    page: number = 1,
    year?: string,
  ): Promise<MoviesSearchResponse> {
    try {
      const searchResult = (
        await axios.get<TmdbSearchResponse>(
          query && query.length > 0
            ? `https://api.themoviedb.org/3/search/movie`
            : `https://api.themoviedb.org/3/movie/popular`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              query,
              page,
              year,
            },
          },
        )
      ).data;

      const user = await this.usersService.findOne({
        where: { id: userId },
        relations: ['watchedMovies'],
      });

      const movies = searchResult.results.map((movie): SearchMovie => {
        return {
          source: 'tmdb',
          imdb_id: movie.id.toString(),
          title: movie.title,
          coverImage: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          year: movie.release_date ? movie.release_date.split('-')[0] : '',
          imdbRating: movie.vote_average,
          genres: movie.genre_ids.map((id) => tmdbGenres[id] || 'Unknown'),
          duration: '',
          isWatched: user.watchedMovies.some(
            (watchedMovie) => watchedMovie.imdbId === movie.id.toString(),
          ),
        };
      });

      return {
        movies,
        totalResults: searchResult.total_results,
      };
    } catch (error) {
      console.error('Error fetching TMDB popular movies:', error);
      return {
        movies: [],
        totalResults: 0,
      };
    }
  }

  async search(
    userId: number,
    query: string,
    page: number,
    sort: 'title' | 'year' | 'rating',
    filterByYear?: string,
    filterByGenre?: string,
    filterByRating?: number,
  ): Promise<MoviesSearchResponse> {
    const ytsSearchResult = await this.getYtsSearchResult(
      userId,
      query,
      page,
      sort,
    );
    const tmdbSearchResult = await this.getTmdbPopularSearchResult(
      userId,
      query,
      page,
      filterByGenre,
    );

    const mergedMovies = ytsSearchResult.movies
      .concat(
        tmdbSearchResult.movies.filter((tmdbMovie) => {
          return !ytsSearchResult.movies.some(
            (ytsMovie) =>
              ytsMovie.title === tmdbMovie.title &&
              ytsMovie.year === tmdbMovie.year,
          );
        }),
      )
      .filter(
        (movie) =>
          movie.genres.some(
            (g) =>
              !filterByGenre || g.toLowerCase() === filterByGenre.toLowerCase(),
          ) &&
          (movie.year === filterByYear || !filterByYear) &&
          (Math.floor(movie.imdbRating) === Math.floor(filterByRating) ||
            !filterByRating),
      ); // filter by genre and year and rating if provided

    if (sort == 'title' || (query && query.length > 0)) {
      mergedMovies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort == 'rating' || !query || query.length === 0) {
      // popular movies should be sorted by rating
      mergedMovies.sort((a, b) => b.imdbRating - a.imdbRating);
    } else if (sort == 'year') {
      mergedMovies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }

    return {
      movies: mergedMovies, //# merge the two results, keeping only unique movies
      totalResults: mergedMovies.length,
    };
  }

  async markAsWatched(userId: number, imdbId: string) {
    try {
      const user = await this.usersService.findOne({
        where: { id: userId },
        relations: ['watchedMovies'],
      });
      let movie = await this.movieRepository.findOne({
        where: { imdbId },
      });

      if (!movie) {
        const searchedMovie: YtsDetailedMovie = (
          await axios.get('https://yts.mx/api/v2/movie_details.json', {
            params: {
              imdb_id: imdbId,
              with_case: true,
            },
          })
        ).data.data.movie;
        movie = new Movie();

        movie.title = searchedMovie.title;
        movie.year = searchedMovie.year;
        movie.imdbRating = 1;
        movie.imdbId = searchedMovie.imdb_code;
        movie.genres = await Promise.all(
          searchedMovie.genres.map(async (genre) => {
            let existingGenre: Genre = await this.genreRepository.findOneBy({
              name: genre,
            });
            if (!existingGenre) {
              existingGenre = new Genre();
              existingGenre.name = genre;
            }

            return existingGenre;
          }),
        );
        movie.duration = searchedMovie.runtime;
        movie.synopsis = searchedMovie.description_full;
        movie.coverImage = searchedMovie.medium_cover_image;
      }

      if (!user.watchedMovies.some((m) => m.imdbId === movie.imdbId)) {
        user.watchedMovies.push(movie);
        await this.usersService.saveUser(user);
        console.log('new movie has been aded to the db');
      }
      return user;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }
}
