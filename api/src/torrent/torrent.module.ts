import { Module } from '@nestjs/common';
import { TorrentService } from './torrent.service';
import { TorrentController } from './torrent.controller';
import { MoviesModule } from 'src/movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Torrent from 'src/movies/entities/torrent.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MoviesModule, TypeOrmModule.forFeature([Torrent]), UsersModule],
  providers: [TorrentService],
  controllers: [TorrentController],
})
export class TorrentModule {}
