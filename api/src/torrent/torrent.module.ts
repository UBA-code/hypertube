import { Module } from '@nestjs/common';
import { TorrentService } from './torrent.service';
import { TorrentController } from './torrent.controller';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [MoviesModule],
  providers: [TorrentService],
  controllers: [TorrentController],
})
export class TorrentModule {}
