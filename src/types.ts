export interface Directors {
  [id: string]: DirectorData;
}

export interface DirectorData {
  directorIds: string;
  directorsInfo: {
    [id: string]: {
      name: string;
      birthYear?: string;
      deathYear?: string;
    };
  };
  movies: { [tconst: string]: MovieData };
}

export interface MovieData {
  id: string;
  name: string;
  year: number;
  directorIds: string;
  averageRating?: number;
  numVotes?: number;
  genres?: string[];
}

export type XAxisType = 'year' | 'age' | 'index';

export function isXAxisType(val: any): val is XAxisType {
  const xAxisTypes: XAxisType[] = ['year', 'age', 'index'];
  return typeof val === 'string' && xAxisTypes.indexOf(val as XAxisType) > -1;
}
