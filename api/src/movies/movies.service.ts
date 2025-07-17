import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Movie from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
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
}
