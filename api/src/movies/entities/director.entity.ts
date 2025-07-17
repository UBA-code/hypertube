import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Director {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Movie, (movie) => movie.director)
  movies: Movie[];
}
