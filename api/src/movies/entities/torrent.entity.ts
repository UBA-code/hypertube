import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Torrent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  magnetLink: string;

  @Column()
  seed: number;

  @Column()
  leech: number;

  @Column()
  size: number;

  @Column()
  quality: string;

  @ManyToOne(() => Movie, (movie) => movie.torrents)
  movie: Movie;
}
