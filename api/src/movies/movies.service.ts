import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Movie from './entities/movie.entity';
import { FindOneOptions, Like, Repository } from 'typeorm';
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
import { Response } from 'express';
import { scrapAndSaveSubtitles } from './helpers/scrapSubtitles';
import * as fs from 'fs';
import { join } from 'path';
import SubtitleDto from './dto/subtitles.dto';
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

  async save(movie: Movie): Promise<Movie> {
    return await this.movieRepository.save(movie);
  }

  async findAllMovies(): Promise<Movie[]> {
    return await this.movieRepository.find();
  }

  async findMovieById(id: number): Promise<Movie> {
    return await this.movieRepository.findOneBy({ id });
  }

  async findMovieBy(options: FindOneOptions<Movie>): Promise<Movie> {
    return await this.movieRepository.findOne(options);
  }

  async findMovieByImdbId(
    imdbId: string,
    relations?: string[],
  ): Promise<Movie> {
    return await this.movieRepository.findOne({
      where: { imdbId },
      relations,
    });
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
    sort: 'title' | 'year' | 'rating' | 'seeds' | 'genre' | 'like_count',
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
              isWatched: user?.watchedMovies.some(
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
          isWatched: user?.watchedMovies.some(
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
    sort: 'title' | 'year' | 'rating' | 'like_count',
    filterByYear?: string,
    filterByGenre?: string,
    filterByRating?: number,
  ): Promise<MoviesSearchResponse> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['favoriteMovies', 'watchedMovies'],
    });
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
      )
      .map((movie) => {
        movie.isFavorite = user?.favoriteMovies.some(
          (favMovie) =>
            favMovie.title === movie.title && favMovie.year === movie.year,
        );
        movie.isWatched = user?.watchedMovies.some(
          (watchedMovie) => watchedMovie.imdbId === movie.imdbId,
        );
        return movie;
      });

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

  async getTopMovies() {
    return await this.search(null, '', 1, 'like_count', '');
  }

  async getMovieDetailsByImdbId(
    userId: number,
    imdbId: string,
  ): Promise<MovieDto> {
    if (!imdbId || imdbId.length === 0) {
      throw new BadRequestException('Movie ID is required');
    }
    const movieDto = this.convertToMovieDto(
      await this.saveAndReturnMovie(userId, imdbId),
    );
    movieDto.isFavorite = await this.isFavoriteMovie(userId, movieDto.imdbId);
    movieDto.isWatched = await this.isWatchedMovie(userId, movieDto.imdbId);
    movieDto.comments = undefined; // comments are fetched separately
    return movieDto;
  }

  async saveAndReturnMovie(userId: number, imdbId: string): Promise<Movie> {
    let searchResult: MovieDto;
    const movie = await this.movieRepository.findOne({
      where: { imdbId },
      relations: [
        'genres',
        'actors',
        'directors',
        'producers',
        'torrents',
        'comments',
        'subtitles',
      ],
    });

    if (movie) {
      return movie;
    }

    if (imdbId[0] === 't') {
      try {
        searchResult = await this.getYtsMovieDetails(userId, imdbId);
      } catch {
        try {
          searchResult = await this.getTmdbMovieDetails(userId, imdbId); //! try TMDB if YTS fails
        } catch {
          throw new NotFoundException('Movie not found on either YTS or TMDB');
        }
      }
    } else {
      try {
        searchResult = await this.getTmdbMovieDetails(userId, imdbId);
        if (!searchResult.imdbId)
          throw new NotFoundException('Movie not found on either TMDB or OMDB');
      } catch {
        throw new NotFoundException('Movie not found on either TMDB or OMDB');
      }
    }

    const exist = await this.movieRepository.findOne({
      where: { imdbId: searchResult.imdbId },
      relations: ['genres', 'actors', 'directors', 'producers', 'torrents'],
    });

    if (exist) {
      return exist;
    }

    return await this.saveMovie(searchResult);
  }

  async getTmdbMovieDetails(
    userId: number,
    movieId: string,
    withTorrents: boolean = false,
  ): Promise<MovieDto> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });
    try {
      const tmdbSearchResult = (
        await axios.get<TMDBMovieDetails>(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
              append_to_response: 'credits',
            },
          },
        )
      ).data;
      if (!tmdbSearchResult.imdb_id) {
        const OmdbSearchResult = (
          await axios.get(`https://www.omdbapi.com/`, {
            params: {
              apikey: process.env.OMDB_API_KEY,
              t: tmdbSearchResult.title,
              y: tmdbSearchResult.release_date.split('-')[0],
            },
          })
        ).data;
        if (OmdbSearchResult.Response === 'False') {
          throw new NotFoundException('Movie not found on either TMDB or OMDB');
        } else {
          tmdbSearchResult.imdb_id = OmdbSearchResult.imdbID;
        }
      }
      return {
        imdbId: tmdbSearchResult.imdb_id,
        title: tmdbSearchResult.title,
        coverImage: `https://image.tmdb.org/t/p/w500${tmdbSearchResult.poster_path}`,
        year: parseInt(tmdbSearchResult.release_date.split('-')[0]),
        genres: tmdbSearchResult?.genres?.map((g) => g.name),
        synopsis: tmdbSearchResult.overview,
        duration: tmdbSearchResult.runtime,
        imdbRating: tmdbSearchResult.vote_average,
        isWatched: user.watchedMovies.some(
          (watchedMovie) => watchedMovie.imdbId === tmdbSearchResult.imdb_id,
        ),
        cast: {
          actors: tmdbSearchResult?.credits?.cast
            ?.filter((cast) => cast.known_for_department === 'Acting')
            .map((cast) => cast.name),
          producers: tmdbSearchResult?.credits?.crew
            ?.filter((crew) => crew.known_for_department === 'Production')
            .map((crew) => crew.name),
          directors: tmdbSearchResult?.credits?.crew
            ?.filter((crew) => crew.known_for_department === 'Directing')
            .map((crew) => crew.name),
        },
        torrents: withTorrents ? [] : [], // TMDB does not provide torrent info
        subtitles: [],
        comments: [],
        streamUrl: '',
        lastWatched: null,
      };
    } catch (error) {
      console.error('Error fetching TMDB movie details:', error);
      throw new NotFoundException('Movie not found on either TMDB or OMDB');
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
          actors: ytsSearchResult?.cast?.map((actor) => actor.name),
          directors: [],
          producers: [],
        },
        torrents: ytsSearchResult?.torrents?.map(
          (torrent): TorrentDto => ({
            magnetLink: torrent.url,
            quality: torrent.quality,
            size: torrent.size,
            seeders: torrent.seeds,
            leechers: torrent.peers,
          }),
        ),
        lastWatched: null,
        subtitles: [],
        comments: [],
      };
    } catch (error) {
      console.error('Error fetching YTS movie details:', error);
      throw new NotFoundException('Movie not found on YTS');
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
      directors: movie?.cast?.directors?.map((name) => ({ name })),
      producers: movie?.cast?.producers?.map((name) => ({ name })),
      actors: movie?.cast?.actors?.map((name) => ({ name })),
      torrents: movie?.torrents?.map((torrent) => ({
        magnetLink: torrent.magnetLink,
        quality: torrent.quality,
        size: torrent.size,
        seeders: torrent.seeders,
        leechers: torrent.leechers,
      })),
      subtitles: [],
      comments: [],
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
      movie = await this.saveAndReturnMovie(userId, imdbId);
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

  convertToMovieDto(movie: Movie): MovieDto {
    return {
      imdbId: movie.imdbId,
      title: movie.title,
      year: movie.year,
      imdbRating: movie.imdbRating,
      genres: movie?.genres?.map((genre) => genre.name),
      duration: movie.duration,
      coverImage: movie.coverImage,
      isWatched: false, // This will be set later based on user data
      synopsis: movie.synopsis,
      cast: {
        actors: movie?.actors?.map((actor) => actor.name),
        directors: movie?.directors?.map((director) => director.name),
        producers: movie?.producers?.map((producer) => producer.name),
      },
      torrents: movie?.torrents?.map((torrent) => ({
        magnetLink: torrent.magnetLink,
        quality: torrent.quality,
        size: torrent.size,
        seeders: torrent.seeders,
        leechers: torrent.leechers,
      })),
      subtitles: movie.subtitles,
      comments: movie.comments,
      commentsCount: movie.comments ? movie.comments.length : 0,
      isFavorite: false, // This will be set later based on user data
    };
  }

  async isFavoriteMovie(userId: number, movieId: string): Promise<boolean> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['favoriteMovies'],
    });

    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    return user.favoriteMovies.some((movie) => movie.imdbId === movieId);
  }

  async isWatchedMovie(userId: number, imdbId: string): Promise<boolean> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });

    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    return user.watchedMovies.some((movie) => movie.imdbId === imdbId);
  }

  async getFavoritesMovies(userId: number) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['favoriteMovies'],
    });

    return user.favoriteMovies;
  }

  async getSubtitles(imdbId: string, language: string, res: Response) {
    const movie = await this.movieRepository.findOne({
      where: { imdbId },
      relations: ['subtitles'],
    });
    if (!movie) {
      throw new NotFoundException('Movie not found with the provided IMDB ID');
    } else if (movie.subtitles && movie.subtitles.length > 0) {
      const sub = movie.subtitles.find(
        (sub) => sub.language.toLowerCase() === language.toLowerCase(),
      );
      if (!sub) {
        throw new NotFoundException(
          `No subtitles found for language: ${language}`,
        );
      }
      const filePath = sub.url;
      const fileStream = fs.createReadStream(join(process.cwd(), filePath));
      res.setHeader('Content-Type', 'text/vtt');

      return fileStream.pipe(res);
    } else if (movie.subtitles && movie.subtitles.length === 0) {
      const subs = await scrapAndSaveSubtitles(imdbId);
      movie.subtitles = subs;
      await this.movieRepository.save(movie);
      return subs;
    }
  }

  async getAllAvailableSubtitles(imdbId: string): Promise<SubtitleDto[]> {
    const movie = await this.movieRepository.findOne({
      where: { imdbId },
      relations: ['subtitles'],
    });
    if (!movie) {
      throw new NotFoundException('Movie not found with the provided IMDB ID');
    }
    if (!movie.subtitles || movie.subtitles.length === 0) {
      movie.subtitles = await scrapAndSaveSubtitles(imdbId);
      await this.movieRepository.save(movie);
    }
    return plainToInstance(SubtitleDto, movie.subtitles);
  }

  async getWatchedMovies(userId: number): Promise<Movie[]> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['watchedMovies'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user.watchedMovies;
  }
}
