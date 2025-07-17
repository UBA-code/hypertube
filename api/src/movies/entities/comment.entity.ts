import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Movie from './movie.entity';

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

  @ManyToOne(() => Movie, (movie) => movie.comments)
  movie: Movie;

  @Column()
  createdAt: Date;
}
