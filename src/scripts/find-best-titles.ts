// tslint:disable:no-console
import * as fs from 'fs';
import { Dictionary, groupBy, mapValues } from 'lodash';
import * as Papa from 'papaparse';
import { MovieData } from '../types';

interface Rating {
  tconst: string;
  averageRating: number;
  numVotes: number;
}

interface Crew {
  tconst: string;
  directors: string;
  writers?: string;
}

// TODO: What's a neat way of doing this without copying?
interface PartialDirectorsData {
  [directorIds: string]: PartialDirectorData;
}

interface PartialDirectorData {
  directorIds: string;
  directorsInfo?: {
    [id: string]: {
      name?: string;
      birthYear?: string;
      deathYear?: string;
    };
  };
  movies: Dictionary<Partial<MovieData>>;
}

function toRating(title: any): Rating {
  return {
    tconst: title.tconst,
    averageRating: +title.averageRating,
    numVotes: +title.numVotes,
  };
}

function toCrew(rowString: any): Crew {
  return {
    tconst: rowString.tconst,
    directors: rowString.directors,
    writers: rowString.writers !== '\\N' ? rowString.writers : undefined,
  };
}

function isGoodEnough(averageRating?: number, numVotes?: number) {
  if (averageRating && numVotes) {
    return numVotes >= 25000 && averageRating >= 8.0;
  }
  return false;
}

function loadData(variableName: string, fileName: string) {
  console.log(`Parsing ${variableName}`);
  data[variableName] = Papa.parse(
    fs.createReadStream(`data/${fileName}`) as any,
    {
      header: true,
      dynamicTyping: true,
      complete: result => {
        data[variableName] = result;

        count++;
        if (count >= Object.keys(variableNames).length) {
          handleData();
        }
      },
    },
  );
}

function getDirectors(ratings: Dictionary<Rating>, crew: Dictionary<Crew>) {
  const directors: PartialDirectorsData = {};
  Object.keys(ratings).forEach(titleId => {
    const crewData = crew[titleId];
    if (crewData) {
      const directorsForTitle = crewData.directors;
      const sortedDirectorsForTitle =
        directorsForTitle !== '\\N'
          ? directorsForTitle
              .split(',')
              .sort()
              .join(',')
          : undefined;

      if (
        sortedDirectorsForTitle !== undefined &&
        !directors[sortedDirectorsForTitle]
      ) {
        const titlesForDirector = groupBy(
          data.crew.data
            .filter(title => title.directors === sortedDirectorsForTitle)
            .map(title => {
              const ratingsRow = data.ratings.data.find(
                rating => title.tconst === rating.tconst,
              );
              return {
                id: title.tconst!,
                directorIds: sortedDirectorsForTitle,
                averageRating: ratingsRow
                  ? +ratingsRow.averageRating
                  : undefined,
                numVotes: ratingsRow ? +ratingsRow.numVotes : undefined,
              } as Partial<MovieData>;
            }),
          title => title.id,
        );
        console.log(
          `${
            Object.keys(titlesForDirector).length
          } titles for ${sortedDirectorsForTitle}`,
        );
        directors[sortedDirectorsForTitle] = {
          directorIds: sortedDirectorsForTitle,
          movies: mapValues(titlesForDirector, titles => titles[0]),
        };
      }
    }
  });
  return directors;
}

function handleData() {
  console.log('Done reading!');
  console.log(data.ratings.meta.fields, data.crew.meta.fields);

  console.log('Filtering rating data');
  const best: Dictionary<Rating> = mapValues(
    groupBy(
      data.ratings.data.filter(title => {
        const numVotes = title.numVotes;
        const averageRating = title.averageRating;
        if (averageRating && numVotes) {
          return isGoodEnough(title.averageRating, title.numVotes);
        }
        return false;
      }),
      title => title.tconst,
    ),
    (title: any[]) => toRating(title[0]),
  );
  console.log(Object.keys(best).length, 'titles for best');

  fs.writeFileSync('data/best.json', JSON.stringify(best));
  console.log('Filtering crew data');
  const crew: Dictionary<Crew> = mapValues(
    groupBy(
      data.crew.data.filter(
        title => (title.tconst ? best[title.tconst] !== undefined : false),
      ),
      title => title.tconst,
    ),
    (title: any[]) => toCrew(title[0]),
  );
  console.log(Object.keys(crew).length, 'titles for crew');

  console.log('Generating director data');
  const directors = getDirectors(best, crew);
  fs.writeFileSync('data/directors-partial.json', JSON.stringify(directors));
}

// Run

let count = 0;
const data: { [dataName: string]: Papa.ParseResult } = {};

interface Variables {
  [variableName: string]: string;
}
const variableNames: Variables = {
  ratings: 'title.ratings.tsv',
  crew: 'title.crew.tsv',
};

Object.keys(variableNames).forEach(variableName => {
  loadData(variableName, variableNames[variableName]);
});
