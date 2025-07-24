import { PrimaryGeneratedColumn, Column, Entity, ManyToMany } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Director {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.directors)
  movies: Movie[];
}
