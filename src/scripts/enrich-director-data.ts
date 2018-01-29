// tslint:disable:no-console
import * as fs from 'fs';
import { Dictionary, merge } from 'lodash';
import * as Papa from 'papaparse';
import { MovieData } from '../types';

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

function isGoodEnough(averageRating?: number, numVotes?: number) {
  if (averageRating && numVotes) {
    return numVotes >= 25000 && averageRating >= 8.0;
  }
  return false;
}

function addNameData() {
  const directorData: PartialDirectorsData = JSON.parse(
    fs.readFileSync('data/directors-partial.json', 'utf8'),
  );
  const directorIdsDictionary = Object.keys(directorData).reduce<
    Dictionary<string[]>
  >((result, directorIds) => {
    directorIds.split(',').forEach(directorId => {
      if (result[directorId]) {
        result[directorId].push(directorIds);
      } else {
        result[directorId] = [directorIds];
      }
    });
    return result;
  }, {});
  const directorDataPatch: {
    [id: string]: { name: string; birthYear: string };
  } = JSON.parse(fs.readFileSync('data/patch-director-data.json', 'utf8'));

  console.log('Adding name data');

  let count = 0;
  Papa.parse(fs.createReadStream(`data/name.basics.tsv`) as any, {
    header: true,
    dynamicTyping: true,
    delimiter: '\t',
    fastMode: false,
    error: error => {
      console.log(error);
    },
    step: result => {
      count++;
      if (count % 100000 === 0) {
        console.log(count);
      }
      const parsedNameData = result.data[0];
      parsedNameData.nconst.split(',').forEach((directorId: string) => {
        if (directorIdsDictionary[directorId]) {
          // console.log(
          //   `${parsedNameData.primaryName}: ${parsedNameData.birthYear} - ${
          //     parsedNameData.deathYear
          //   }`,
          // );
          directorIdsDictionary[directorId].forEach(directorIds => {
            if (!directorData[directorIds].directorsInfo) {
              directorData[directorIds].directorsInfo = {};
            }
            directorData[directorIds].directorsInfo![directorId] = {};
            directorData[directorIds].directorsInfo![directorId].name =
              parsedNameData.primaryName;
            directorData[directorIds].directorsInfo![directorId].birthYear =
              parsedNameData.birthYear !== '\\N'
                ? parsedNameData.birthYear
                : directorDataPatch[directorId] &&
                  directorDataPatch[directorId].birthYear !== ''
                  ? directorDataPatch[directorId].birthYear
                  : undefined;
            directorData[directorIds].directorsInfo![directorId].deathYear =
              parsedNameData.deathYear !== '\\N'
                ? parsedNameData.deathYear
                : undefined;
          });
        }
      });
    },
    complete: () => {
      console.log('Name data: done!');
      fs.writeFileSync(
        'data/directors-name-data.json',
        JSON.stringify(directorData),
      );
      addMovieData();
    },
  });
}

function addMovieData() {
  const directorData: PartialDirectorsData = JSON.parse(
    fs.readFileSync('data/directors-name-data.json', 'utf8'),
  );
  const flatMovieDictionary: Dictionary<Partial<MovieData>> = merge(
    {},
    ...Object.keys(directorData).map(director => directorData[director].movies),
  );
  console.log('Adding movie data');
  let count = 0;
  Papa.parse(fs.createReadStream(`data/title.basics.tsv`) as any, {
    header: true,
    dynamicTyping: true,
    delimiter: '\t',
    fastMode: false,
    error: error => {
      console.log(error);
    },
    step: result => {
      count++;
      if (count % 100000 === 0) {
        console.log(count);
      }
      const parsedTitleData = result.data[0];
      const titleInFlatMovieDictionary =
        flatMovieDictionary[parsedTitleData.tconst];
      if (
        titleInFlatMovieDictionary &&
        titleInFlatMovieDictionary.directorIds
      ) {
        if (parsedTitleData.titleType !== 'movie') {
          delete directorData[titleInFlatMovieDictionary.directorIds!].movies[
            parsedTitleData.tconst
          ];
        } else {
          const titleInDirectorData =
            directorData[titleInFlatMovieDictionary.directorIds!].movies[
              parsedTitleData.tconst
            ];
          titleInDirectorData.name = parsedTitleData.primaryTitle;
          titleInDirectorData.year = parsedTitleData.startYear;
          titleInDirectorData.genres =
            parsedTitleData.genres && parsedTitleData.genres.split(',');
        }
      }
    },
    complete: () => {
      console.log('Movie data: done!');
      fs.writeFileSync(
        'data/directors-name-and-title-data.json',
        JSON.stringify(directorData),
      );
      cleanAndStoreData();
    },
  });
}

function cleanAndStoreData() {
  const directorData: PartialDirectorsData = JSON.parse(
    fs.readFileSync('data/directors-name-and-title-data.json', 'utf8'),
  );
  const prevLength = Object.keys(directorData).length;
  console.log('Cleaning director data');
  // delete directors with no great movies
  Object.keys(directorData).forEach(directorIds => {
    if (
      Object.keys(directorData[directorIds].movies)
        .map(movie =>
          isGoodEnough(
            directorData[directorIds].movies[movie].averageRating,
            directorData[directorIds].movies[movie].numVotes,
          ),
        )
        .find(d => d) === undefined
    ) {
      delete directorData[directorIds];
    }
  });

  // missing birth years
  const missingDirectorData: {
    [id: string]: {
      name?: string;
      birthYear?: string;
      deathYear?: string;
    };
  } = {};
  Object.keys(directorData).forEach(directorIds => {
    Object.keys(directorData[directorIds].directorsInfo!).forEach(
      directorId => {
        const directorInfo = directorData[directorIds].directorsInfo![
          directorId
        ];
        if (
          !directorInfo.birthYear &&
          !Object.keys(missingDirectorData).find(id => id === directorId)
        ) {
          missingDirectorData[directorId] = directorData[
            directorIds
          ].directorsInfo![directorId];
        }
      },
    );
  });
  fs.writeFileSync(
    'data/missing-director-data.json',
    JSON.stringify(missingDirectorData),
  );

  const currLength = Object.keys(directorData).length;
  console.log(
    `Cleaned ${prevLength -
      currLength}/${prevLength}, ${currLength} directors left`,
  );
  console.log('Writing director data');
  fs.writeFileSync('data/directors.json', JSON.stringify(directorData));
}

// Run

function run() {
  addNameData();
}

run();
