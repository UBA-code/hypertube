import Movie from 'src/movies/entities/movie.entity';
import RevokedToken from 'src/revoked-tokens/revoked-tokens.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png' })
  profilePicture: string;

  @Column()
  email: string;

  @Column()
  userName: string;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column()
  password: string;

  @Column({ default: 'english' })
  preferredLanguage: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  @ManyToMany(() => Movie, (movie) => movie.usersWatched, {
    cascade: ['insert'],
  })
  @JoinTable()
  watchedMovies: Movie[];

  @Column({
    enum: ['local', '42', 'google', 'github', 'gitlab'],
    default: 'local',
  })
  authType: 'local' | '42' | 'google' | 'github' | 'gitlab';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Movie, (movie) => movie.usersLiked, {
    cascade: ['insert'],
  })
  @JoinTable()
  favoriteMovies: Movie[];

  @OneToMany(() => RevokedToken, (token) => token.user, { cascade: true })
  revokedTokens: RevokedToken[];
}
