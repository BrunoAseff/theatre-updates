export interface Movie {
  name: string;
  coverImageUrl: string;
  description: string;
  duration: string;
  trailerLink: string;
}

export interface TheaterData {
  lastUpdated: string;
  movies: Movie[];
}

export interface GistContent {
  balneario: TheaterData;
  itajai: TheaterData;
}
