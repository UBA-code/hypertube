import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Subtitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  language: string;

  @Column()
  url: string;

  @ManyToOne(() => Movie, (movie) => movie.torrents)
  movie: Movie;
}
