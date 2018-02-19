import { RGBColor } from 'd3-color';
import { ScaleLinear } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';
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

    return (
      <Main>
        <Graph width={width} height={height}>
          <g style={{ overflow: 'visible' }}>
            {Object.keys(directorData.directorsInfo).map(directorId => {
              const directorInfo = directorData.directorsInfo[directorId];
              const birthYear =
                directorInfo.birthYear !== undefined
                  ? directorInfo.birthYear
                  : undefined;
              const deathYear =
                directorInfo.deathYear !== undefined
                  ? directorInfo.deathYear
                  : undefined;
              return (
                <g key={directorId}>
                  {birthYear && (
                    <line
                      x1={xScale(birthYear)}
                      x2={xScale(birthYear)}
                      y1={0}
                      y2={height}
                      stroke={'gray'}
                      strokeWidth={1}
                    />
                  )}
                  <DirectorNameText
                    x={(birthYear ? xScale(birthYear) : 0) + 10}
                    y={15}
                  >
                    {`${directorInfo.name} ${birthYear}-${deathYear}`}
                  </DirectorNameText>
                  {deathYear && (
                    <line
                      x1={xScale(deathYear)}
                      x2={xScale(deathYear)}
                      y1={0}
                      y2={height}
                      stroke={'gray'}
                      strokeWidth={1}
                    />
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
              d={lineGenerator(lineChartData.series.sort(sortSeries))!}
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
