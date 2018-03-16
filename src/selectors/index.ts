import { mapValues, max, min, uniq, values } from 'lodash';
import { createSelector } from 'reselect';
import { StateTree } from '../reducers';

export function getAllData(state: StateTree) {
  return state.data;
}

export function getSelections(state: StateTree) {
  return state.selections;
}

export function getDirectorData(state: StateTree) {
  return getAllData(state).directorData;
}

export function getXAxisType(state: StateTree) {
  return getSelections(state).xAxisType;
}

export const getDirectors = createSelector(
  getDirectorData,
  directorData => directorData && Object.keys(directorData),
);

export const getYearExtent = createSelector(
  getDirectorData,
  getXAxisType,
  (data, xAxisType) => {
    if (xAxisType === 'year') {
      return values(data).reduce<[number, number]>(
        (result, dataForDirectors) => {
          const minYear = Math.min(
            Math.min(
              ...values(dataForDirectors.directorsInfo)
                .map(
                  info => (info.birthYear !== undefined ? info.birthYear : -1),
                )
                .filter(d => !isNaN(d) && d !== -1),
            ),
            Math.min(
              ...values(dataForDirectors.movies)
                .map(title => (title.year ? title.year : -1))
                .filter(d => !isNaN(d) && d !== -1),
            ),
          );
          result[0] = minYear !== -1 ? Math.min(result[0], minYear) : result[0];

          const maxValue = Math.max(
            Math.max(
              ...values(dataForDirectors.directorsInfo)
                .map(
                  info => (info.deathYear !== undefined ? info.deathYear : -1),
                )
                .filter(d => !isNaN(d) && d !== -1),
              Math.max(
                ...values(dataForDirectors.movies)
                  .map(title => (title.year ? title.year : -1))
                  .filter(d => !isNaN(d) && d !== -1),
              ),
            ),
          );
          result[1] =
            maxValue !== -1 ? Math.max(result[1], maxValue) : result[1];
          return result;
        },
        [Infinity, -Infinity],
      );
    }
    return [0, 100] as [number, number];
  },
);

export const getLineChartData = createSelector(
  getDirectorData,
  directors =>
    directors &&
    mapValues(directors, directorData => {
      const movieYears = uniq(
        values(directorData.movies)
          .filter(title => title.averageRating !== undefined)
          .map(title => title.year),
      ).filter(d => !isNaN(d));
      return {
        id: directorData.directorIds,
        birthYears: values(directorData.directorsInfo).map(
          info => info.birthYear,
        ),
        deathYears: values(directorData.directorsInfo).map(
          info => info.deathYear,
        ),
        movieYears,
        series: movieYears.map(year => (
          {
            value: max(
              values(directorData.movies)
                .filter(title => title.year === year)
                .map(title => title.averageRating),
            ),
            minValue: min(
              values(directorData.movies)
                .filter(title => title.year === year)
                .map(title => title.averageRating),
            ),
            year,
          }
        )),
      };
    }),
);
