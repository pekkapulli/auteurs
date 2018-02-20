import { RGBColor } from 'd3-color';
import { ScaleLinear } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';
import { max } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { DirectorData, MovieData } from '../../types';

interface Datum {
  value: number | undefined;
  year: number;
}

export interface LineChartData {
  id: string;
  birthYears: Array<number | undefined>;
  deathYears: Array<number | undefined>;
  movieYears: number[];
  series: Datum[];
}

interface PassedProps {
  directorData: DirectorData;
  lineChartData: LineChartData;
  width: number;
  height: number;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleLinear<RGBColor, string>;
}

interface DispatchProps {}

type Props = PassedProps & DispatchProps;

const Main = styled.div`
  width: 100%;
  min-height: 100px;
  overflow: visible;
  margin: ${theme.rhythm(2)} 0;
`;

const Graph = styled.svg`
  width: 100%;
  overflow: visible !important;
`;

const DirectorNameText = styled.text`
  fill: white;
  ${theme.fontBold};
`;

const YearText = styled.text`
  fill: #888;
  ${theme.fontNormal};
`;

function sortSeries(a: Datum, b: Datum) {
  return a.year - b.year;
}

export class DirectorChart extends React.Component<Props> {
  public render() {
    const {
      directorData,
      width,
      height,
      xScale,
      yScale,
      colorScale,
      lineChartData,
    } = this.props;

    const lineGenerator = line<Datum>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.year))
      .y(d => (d.value ? yScale(d.value) : yScale(5)));

    const compareTitles = (aMovieData: MovieData, bMovieData: MovieData) => {
      if (!aMovieData.averageRating) {
        return -1;
      }
      if (!bMovieData.averageRating) {
        return 1;
      }
      return aMovieData.averageRating - bMovieData.averageRating;
    };

    // console.log(directorData.directorsInfo, ': ', lineChartData.series);
    const dataSeries = lineChartData.series.filter(d => {
      const deathYear = max(lineChartData.deathYears);
      return deathYear ? deathYear >= d.year : true;
    });
    const firstValue = dataSeries.sort((d1, d2) => d1.year - d2.year)[0].value;
    const lastValue = dataSeries.sort((d1, d2) => d2.year - d1.year)[0].value;
    lineChartData.birthYears.forEach(year => {
      if (year) {
        dataSeries.push({ value: firstValue, year });
      }
    });
    lineChartData.deathYears.forEach(year => {
      if (year) {
        dataSeries.push({ value: lastValue, year });
      }
    });

    return (
      <Main>
        <Graph width={width} height={height}>
          <g style={{ overflow: 'visible' }}>
            {Object.keys(directorData.directorsInfo).map(directorId => {
              const directorInfo = directorData.directorsInfo[directorId];
              const birthYear = directorInfo.birthYear;
              const deathYear = directorInfo.deathYear;
              return (
                <g key={directorId}>
                  {birthYear && (
                    <YearText
                      x={birthYear ? xScale(birthYear) : 0}
                      y={firstValue ? yScale(firstValue) + 20 : 30}
                    >
                      {birthYear}
                    </YearText>
                  )}
                  <DirectorNameText
                    x={birthYear ? xScale(birthYear) : 0}
                    y={firstValue ? yScale(firstValue) - 10 : 15}
                  >
                    {directorInfo.name}
                  </DirectorNameText>
                  {deathYear && (
                    <g>
                      <line
                        x1={xScale(deathYear)}
                        x2={xScale(deathYear)}
                        y1={lastValue ? yScale(lastValue) - 10 : 0}
                        y2={lastValue ? yScale(lastValue) + 10 : height}
                        stroke={'gray'}
                        strokeWidth={1}
                      />
                      <YearText
                        x={xScale(deathYear) + 5}
                        y={lastValue ? yScale(lastValue) + 5 : 15}
                      >
                        {deathYear}
                      </YearText>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
          <g>
            <path
              strokeWidth={3}
              stroke="#444"
              fill="transparent"
              d={lineGenerator(dataSeries.sort(sortSeries))!}
            />
          </g>
          <g>
            {Object.keys(directorData.movies)
              .sort((aTitleId: string, bTitleId: string) =>
                compareTitles(
                  directorData.movies[aTitleId],
                  directorData.movies[bTitleId],
                ),
              )
              .map(titleId => {
                const title = directorData.movies[titleId];
                const year = title.year;
                const rating = title.averageRating;
                return !isNaN(year) ? (
                  <circle
                    key={`title-${titleId}`}
                    cx={xScale(year)}
                    cy={rating ? yScale(rating) : yScale(3)}
                    r={rating ? 3 : 3}
                    fillOpacity="1"
                    fill={rating ? colorScale(rating) : '#555'}
                    strokeWidth={1}
                    stroke="#333"
                  />
                ) : (
                  undefined
                );
              })}
          </g>
        </Graph>
      </Main>
    );
  }
}
