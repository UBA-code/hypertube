import { BadRequestException, Injectable } from '@nestjs/common';
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
  MovieDto,
  TorrentDto,
} from './types/moviesSearchResponse';
import Genre from './entities/genre.entity';
import { tmdbGenres } from './constants/tmdbGenres';
import { TmdbSearchResponse } from './types/TmdbSearchResponse';
import { TMDBMovieDetails } from './types/tmdbMovieDetails';
import { plainToInstance } from 'class-transformer';

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

  async findMovieByImdbId(imdbId: string): Promise<Movie> {
    return await this.movieRepository.findOneBy({ imdbId });
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
              page,
              sort_by: sort,
            },
          },
        )
      ).data;

      const movies = searchResult.data.movie_count
        ? searchResult.data.movies.map((movie): MovieDto => {
            return {
              imdbId: movie.imdb_code,
              title: movie.title,
              year: movie.year,
              imdbRating: movie.rating,
              genres: movie.genres,
              duration: movie.runtime,
              coverImage: movie.medium_cover_image,
              isWatched: user.watchedMovies.some(
                (watchedMovie) => watchedMovie.imdbId === movie.imdb_code,
              ),
              synopsis: movie.synopsis,
              cast: {
                actors: [],
                directors: [],
                producers: [],
              },
              torrents: [],
              subtitles: [],
              comments: [],
              downloadStatus: 'not_started',
              streamUrl: '',
              lastWatched: null,
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

      const movies = searchResult.results.map((movie): MovieDto => {
        return {
          imdbId: movie.id.toString(),
          title: movie.title,
          coverImage: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          year: movie.release_date
            ? parseInt(movie.release_date.split('-')[0])
            : 0,
          imdbRating: movie.vote_average,
          genres: movie.genre_ids.map((id) => tmdbGenres[id] || 'Unknown'),
          duration: 0,
          synopsis: movie.overview,
          isWatched: user.watchedMovies.some(
            (watchedMovie) => watchedMovie.imdbId === movie.id.toString(),
          ),
          cast: {
            actors: [],
            directors: [],
            producers: [],
          },
          torrents: [],
          subtitles: [],
          comments: [],
          downloadStatus: 'not_started',
          streamUrl: '',
          lastWatched: null,
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
          (movie.year === parseInt(filterByYear) || !filterByYear) &&
          (Math.floor(movie.imdbRating) === Math.floor(filterByRating) ||
            !filterByRating),
      ); // filter by genre and year and rating if provided

    if (sort == 'title' || (query && query.length > 0)) {
      mergedMovies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort == 'rating' || !query || query.length === 0) {
      // popular movies should be sorted by rating
      mergedMovies.sort((a, b) => b.imdbRating - a.imdbRating);
    } else if (sort == 'year') {
      mergedMovies.sort((a, b) => b.year - a.year);
    }

    return {
      movies: mergedMovies, //# merge the two results, keeping only unique movies
      totalResults: mergedMovies.length,
    };
  }

  async getMovieByImdbId(userId: number, imdbId: string): Promise<MovieDto> {
    return {
      ...plainToInstance(MovieDto, await this.getMovieDetails(userId, imdbId)),
      isFavorite: await this.usersService.isFavoriteMovie(userId, imdbId),
    };
  }

  async getMovieDetails(userId: number, imdbId: string): Promise<Movie> {
    let searchResult: MovieDto;
    if (imdbId[0] === 't') {
      try {
        searchResult = await this.getYtsMovieDetails(userId, imdbId);
      } catch {
        try {
          searchResult = await this.getTmdbMovieDetails(userId, imdbId); //! try TMDB if YTS fails
        } catch {
          throw new BadRequestException(
            'Movie not found on either YTS or TMDB',
          );
        }
      }
    } else {
      try {
        searchResult = await this.getTmdbMovieDetails(userId, imdbId);
        if (!searchResult.imdbId)
          throw new BadRequestException('Movie not found on TMDB');
      } catch {
        throw new BadRequestException('Movie not found on TMDB');
      }
    }
    if (!(await this.movieRepository.findOneBy({ imdbId }))) {
      return await this.saveMovie(searchResult);
    }
    return await this.movieRepository.findOneBy({ imdbId });
  }

  async getTmdbMovieDetails(
    userId: number,
    imdbId: string,
    withTorrents: boolean = false,
  ): Promise<MovieDto> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });
    try {
      const tmdbSearchResult = (
        await axios.get<TMDBMovieDetails>(
          `https://api.themoviedb.org/3/movie/${imdbId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              append_to_response: 'credits',
            },
          },
        )
      ).data;
      return {
        imdbId: tmdbSearchResult.imdb_id,
        title: tmdbSearchResult.title,
        coverImage: `https://image.tmdb.org/t/p/w500${tmdbSearchResult.poster_path}`,
        year: parseInt(tmdbSearchResult.release_date.split('-')[0]),
        genres: tmdbSearchResult.genres.map((g) => g.name),
        synopsis: tmdbSearchResult.overview,
        duration: tmdbSearchResult.runtime,
        imdbRating: tmdbSearchResult.vote_average,
        isWatched: user.watchedMovies.some(
          (watchedMovie) => watchedMovie.imdbId === tmdbSearchResult.imdb_id,
        ),
        cast: {
          actors: tmdbSearchResult.credits.cast
            .filter((cast) => cast.known_for_department === 'Acting')
            .map((cast) => cast.name),
          producers: tmdbSearchResult.credits.crew
            .filter((crew) => crew.known_for_department === 'Production')
            .map((crew) => crew.name),
          directors: tmdbSearchResult.credits.crew
            .filter((crew) => crew.known_for_department === 'Directing')
            .map((crew) => crew.name),
        },
        torrents: withTorrents ? [] : [], // TMDB does not provide torrent info
        subtitles: [],
        comments: [],
        downloadStatus: 'not_started',
        streamUrl: '',
        lastWatched: null,
      };
    } catch (error) {
      console.error('Error fetching TMDB movie details:', error);
      throw new Error('Movie not found on TMDB');
    }
  }

  async getYtsMovieDetails(userId: number, imdbId: string): Promise<MovieDto> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });
    try {
      const ytsSearchResult: YtsDetailedMovie = (
        await axios.get('https://yts.mx/api/v2/movie_details.json', {
          params: {
            imdb_id: imdbId,
            with_cast: true,
          },
        })
      ).data.data.movie;

      return {
        imdbId: ytsSearchResult.imdb_code,
        title: ytsSearchResult.title,
        coverImage: ytsSearchResult.medium_cover_image,
        genres: ytsSearchResult.genres,
        isWatched: user.watchedMovies.some(
          (watchedMovie) => watchedMovie.imdbId === ytsSearchResult.imdb_code,
        ),
        synopsis: ytsSearchResult.description_full,
        imdbRating: ytsSearchResult.rating,
        year: ytsSearchResult.year,
        duration: ytsSearchResult.runtime,
        streamUrl: '',
        cast: {
          actors: ytsSearchResult.cast.map((actor) => actor.name),
          directors: [],
          producers: [],
        },
        torrents: ytsSearchResult.torrents.map(
          (torrent): TorrentDto => ({
            magnetLink: torrent.url,
            quality: torrent.quality,
            size: torrent.size,
            seeders: torrent.seeds,
            leechers: torrent.peers,
          }),
        ),
        downloadStatus: 'not_started',
        lastWatched: null,
        subtitles: [],
        comments: [],
      };
    } catch (error) {
      console.error('Error fetching YTS movie details:', error);
      throw new Error('Movie not found on YTS');
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

  async saveMovie(movie: MovieDto): Promise<Movie> {
    const newMovie = this.movieRepository.create({
      title: movie.title,
      year: movie.year,
      imdbRating: movie.imdbRating,
      imdbId: movie.imdbId,
      genres: movie.genres.map((name) => ({ name })),
      duration: movie.duration,
      synopsis: movie.synopsis,
      coverImage: movie.coverImage,
      directors: movie.cast.directors.map((name) => ({ name })),
      producers: movie.cast.producers.map((name) => ({ name })),
      actors: movie.cast.actors.map((name) => ({ name })),
      torrents: movie.torrents.map((torrent) => ({
        magnetLink: torrent.magnetLink,
        quality: torrent.quality,
        size: torrent.size,
        seeders: torrent.seeders,
        leechers: torrent.leechers,
      })),
      subtitles: [],
      comments: [],
      downloadStatus: 'not_started',
      streamUrl: '',
      lastWatched: null,
      usersWatched: [],
    });
    return await this.movieRepository.save(newMovie);
  }

  async changeFavoriteStatus(userId: number, imdbId: string, setTo: boolean) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['favoriteMovies'],
    });
    let movie = await this.movieRepository.findOneBy({ imdbId });

    if (!movie) {
      movie = await this.getMovieDetails(userId, imdbId);
    }

    if (setTo && user.favoriteMovies.some((m) => movie.imdbId === m.imdbId)) {
      throw new BadRequestException('movie already in favorite');
    }

    if (setTo) {
      user.favoriteMovies.push(movie);
    } else {
      user.favoriteMovies = user.favoriteMovies.filter(
        (m) => m.imdbId !== imdbId,
      );
    }

    await this.usersService.saveUser(user);
  }

  async getFavoritesMovies(userId: number) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['favoriteMovies'],
    });

    return user.favoriteMovies;
  }
}
