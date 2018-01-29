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

// export const getXExtent = createSelector(
//   getDirectorData,
//   getXAxisType,
//   (data, xAxisType) => {

//     return [
//       Math.min(...extents.map(d => d![0])),
//       Math.max(...extents.map(d => d![1])),
//     ];
//   },
// );

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
