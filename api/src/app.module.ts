import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MoviesModule } from './movies/movies.module';
import RevokedToken from './revoked-tokens/revoked-tokens.entity';
import Movie from './movies/entities/movie.entity';
import Genre from './movies/entities/genre.entity';
import Actor from './movies/entities/actor.entity';
import Director from './movies/entities/director.entity';
import Comment from './movies/entities/comment.entity';
import Torrent from './movies/entities/torrent.entity';
import Subtitle from './movies/entities/subtitles.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USER,
      database: process.env.DB_NAME,
      entities: [
        User,
        RevokedToken,
        Movie,
        Genre,
        Director,
        Actor,
        Comment,
        Torrent,
        Subtitle,
      ],
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
