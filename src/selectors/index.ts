import { values } from 'lodash';
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
          const min = Math.min(
            Math.min(
              ...values(dataForDirectors.directorsInfo)
                .map(
                  info =>
                    info.birthYear !== undefined
                      ? parseInt(info.birthYear, 10)
                      : -1,
                )
                .filter(d => !isNaN(d) && d !== -1),
            ),
            Math.min(
              ...values(dataForDirectors.movies)
                .map(title => (title.year ? title.year : -1))
                .filter(d => !isNaN(d) && d !== -1),
            ),
          );
          result[0] = min !== -1 ? Math.min(result[0], min) : result[0];

          const max = Math.max(
            Math.max(
              ...values(dataForDirectors.directorsInfo)
                .map(
                  info =>
                    info.deathYear !== undefined
                      ? parseInt(info.deathYear, 10)
                      : -1,
                )
                .filter(d => !isNaN(d) && d !== -1),
              Math.max(
                ...values(dataForDirectors.movies)
                  .map(title => (title.year ? title.year : -1))
                  .filter(d => !isNaN(d) && d !== -1),
              ),
            ),
          );
          result[1] = max !== -1 ? Math.max(result[1], max) : result[1];
          return result;
        },
        [Infinity, -Infinity],
      );
    }
    return [0, 100] as [number, number];
  },
);

// export const getRatingExtent = createSelector(
//   getDirectorData,
//   (directorData) => {
//     return [0, 10];
//   },
// );

// function toLineChartData(
//   id: string,
//   label: string,
//   periods: Period[],
//   data: { [period: string]: PeriodData },
// ) {
//   return {
//     id,
//     label: id === FINLAND_ID ? 'Suomi' : label,
//     color:
//       id === FINLAND_ID
//         ? colors.blue.toString()
//         : schemeCategory10[stringToNumberHash(id) % schemeCategory10.length],
//     series: periods.map(({ id: periodId, start, end }) => {
//       return {
//         value: data[periodId] && data[periodId].value,
//         interpolated: data[periodId] && data[periodId].interpolated,
//         start,
//         end,
//       };
//     }),
//   };
// }

// export const getPercentageLineChartData = createSelector(
//   getPercentageHistoryForHoveredAndSelectedMunicipalities,
//   getMunicipalities,
//   getPeriods,
//   (selectedAndHoveredData, municipalities, periods) =>
//     selectedAndHoveredData
//       ? selectedAndHoveredData.map(({ id, data }) =>
//           toLineChartData(id, municipalities[id], periods, data),
//         )
//       : undefined,
// );
