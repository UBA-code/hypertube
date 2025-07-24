import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Movie from '../../movies/entities/movie.entity';

@Entity()
export default class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  username: string;

  @Column()
  userId: number;

  @ManyToOne(() => Movie, (movie) => movie.comments, { cascade: ['insert'] })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
