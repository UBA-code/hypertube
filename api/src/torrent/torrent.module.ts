import { Module } from '@nestjs/common';
import { TorrentService } from './torrent.service';
import { TorrentController } from './torrent.controller';
import { MoviesModule } from 'src/movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Torrent from 'src/movies/entities/torrent.entity';

@Module({
  imports: [MoviesModule, TypeOrmModule.forFeature([Torrent])],
  providers: [TorrentService],
  controllers: [TorrentController],
})
export class TorrentModule {}
