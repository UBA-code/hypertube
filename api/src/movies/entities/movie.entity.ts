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
  year: string;

  @Column({ nullable: true })
  imdbRating: number;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column()
  duration: number;

  @Column()
  synopsis: string;

  @Column()
  coverImage: string;

  @ManyToOne(() => Director, (director) => director.movies)
  director: Director;

  @ManyToMany(() => Actor, (actor) => actor.movies)
  @JoinTable()
  actors: Actor[];

  @OneToMany(() => Torrent, (torrent) => torrent.movie)
  torrents: Torrent[];

  @OneToMany(() => Subtitle, (subtitle) => subtitle.movie)
  subtitles: Subtitle[];

  @OneToMany(() => Comment, (comment) => comment.movie)
  comments: Comment[];

  @Column()
  downloadStatus: 'not_started' | 'downloading' | 'completed';

  @Column()
  streamUrl: string;

  @Column()
  lastWatched: Date;

  @ManyToMany(() => User, (user) => user.watchedMovies)
  usersWatched: User[];
}
