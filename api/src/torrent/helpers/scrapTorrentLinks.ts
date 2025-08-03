import axios from 'axios';
import * as cheerio from 'cheerio';
import Torrent from 'src/movies/entities/torrent.entity';
import { TorrentDto } from 'src/movies/types/moviesSearchResponse';

export async function scrapTorrentLinks(
  movieName: string,
  year: number,
): Promise<Torrent[]> {
  const torrentQualities: string[] = [
    '144p',
    '240p',
    '360p',
    '480p',
    '576p',
    '720p',
    '900p',
    '1080p',
    '1440p',
    '1600p',
    '2160p', // 4K
    '4320p', // 8K
  ];

  try {
    const res = await axios.get(
      `https://thehiddenbay.com/search/${movieName} ${year}`,
    );

    const $ = cheerio.load(res.data);

    const torrents: TorrentDto[] = $('table#searchResult tbody tr')
      .map(
        (_, element): TorrentDto => ({
          magnetLink: $(element).find('a[href^="magnet:"]').attr('href'),
          seeders: parseInt($(element).find('td:nth-child(3)').text()),
          leechers: parseInt($(element).find('td:nth-child(4)').text()),
          size: $(element).find('td:nth-child(2) .detDesc').text(),
          quality:
            torrentQualities.find((quality) =>
              $(element).find('.detName a').text().includes(quality),
            ) || null,
        }),
      )
      .get()
      .filter(
        (torrent, i, arr) =>
          torrent.quality &&
          arr.findIndex((t) => t.quality === torrent.quality) === i,
      );

    return torrents.map((torrent) => {
      const newTorrent = new Torrent();
      newTorrent.seeders = torrent.seeders;
      newTorrent.leechers = torrent.leechers;
      newTorrent.size = torrent.size
        .match(/Size.+\,/gi)[0]
        .replace('Size ', '')
        .replace(',', '');
      newTorrent.quality = torrent.quality;
      newTorrent.magnetLink = torrent.magnetLink;
      return newTorrent;
    });
  } catch (error) {
    console.error(`Error scraping torrent links: ${error}`);
    return [];
  }
}
