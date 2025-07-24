import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Movie from './movie.entity';

@Entity()
export default class Producer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.producers, { cascade: ['insert'] })
  movies: Movie[];
}
