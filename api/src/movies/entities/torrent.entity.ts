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

  @Column({ nullable: true })
  path: string;

  @Column({
    enum: ['completed', 'downloading', 'not_started'],
    default: 'not_started',
  })
  downloadStatus: 'completed' | 'downloading' | 'not_started';

  @ManyToOne(() => Movie, (movie) => movie.torrents)
  movie: Movie;
}
