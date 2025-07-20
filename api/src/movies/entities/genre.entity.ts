import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Movie[];
}
