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

  async search(
    userId: number,
    query: string,
    page: number,
    limit: number,
    sort: 'title' | 'year' | 'rating' | 'seeds' | 'genre',
    genre?: string,
  ): Promise<MoviesSearchResponse> {
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
              limit,
              page,
              sort_by: sort,
            },
          },
        )
      ).data;

      let movies: SearchMovie[] = searchResult.data.movie_count
        ? searchResult.data.movies.map((movie) => {
            return {
              id: movie.id,
              imdb_id: movie.imdb_code,
              title: movie.title,
              year: movie.year,
              imdbRating: movie.rating,
              genres: movie.genres,
              duration: movie.runtime,
              coverImage: movie.medium_cover_image,
              isWatched: user.watchedMovies.some(
                (watchedMovie) => watchedMovie.imdbId === movie.imdb_code,
              ),
            };
          })
        : [];

      if (sort === 'genre' && genre && genre.length) {
        movies = movies.filter((mov) => mov.genres.includes(genre));
      }

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
        console.log(`movie rated: ${searchedMovie.rating}`);

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
