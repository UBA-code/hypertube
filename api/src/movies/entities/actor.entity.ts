import { PrimaryGeneratedColumn, Column, Entity, ManyToMany } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Actor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.actors, { cascade: ['insert'] })
  movies: Movie[];
}
