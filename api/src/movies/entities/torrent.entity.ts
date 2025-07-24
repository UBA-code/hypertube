import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Torrent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  magnetLink: string;

  @Column()
  seeders: number;

  @Column()
  leechers: number;

  @Column()
  size: string;

  @Column()
  quality: string;

  @ManyToOne(() => Movie, (movie) => movie.torrents)
  movie: Movie;
}
