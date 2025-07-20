import { User } from 'src/users/users.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Genre from './genre.entity';
import Director from './director.entity';
import Actor from './actor.entity';
import Comment from './comment.entity';
import Torrent from './torrent.entity';
import Subtitle from './subtitles.entity';

@Entity()
export default class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  imdbRating: number;

  @Column()
  imdbId: string;

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: ['insert'] })
  @JoinTable()
  genres: Genre[];

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  synopsis: string;

  @Column({ nullable: true })
  coverImage: string;

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: ['insert'],
  })
  director: Director;

  @ManyToMany(() => Actor, (actor) => actor.movies, { cascade: ['insert'] })
  @JoinTable()
  actors: Actor[];

  @OneToMany(() => Torrent, (torrent) => torrent.movie, { cascade: ['insert'] })
  torrents: Torrent[];

  @OneToMany(() => Subtitle, (subtitle) => subtitle.movie, {
    cascade: ['insert'],
  })
  subtitles: Subtitle[];

  @OneToMany(() => Comment, (comment) => comment.movie, { cascade: ['insert'] })
  comments: Comment[];

  @Column({ nullable: true })
  downloadStatus: 'not_started' | 'downloading' | 'completed';

  @Column({ nullable: true })
  streamUrl: string;

  @Column({ nullable: true })
  lastWatched: Date;

  @ManyToMany(() => User, (user) => user.watchedMovies)
  usersWatched: User[];
}
