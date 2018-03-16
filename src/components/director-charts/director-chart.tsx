import { RGBColor } from 'd3-color';
import { ScaleLinear } from 'd3-scale';
import { area, curveMonotoneX, line } from 'd3-shape';
import { max } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { DirectorData, MovieData } from '../../types';

interface Datum {
  value: number | undefined;
  minValue: number | undefined;
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

interface State {
  hoveredTitle?: string;
  hoverX: number;
  hoverY: number;
}

const Main = styled.div`
  width: 100%;
  min-height: 100px;
  overflow: visible;
  margin: ${theme.rhythm(2)} 0;
  position: relative;
`;

const Graph = styled.svg`
  width: 100%;
  overflow: visible !important;
`;

const DirectorNameText = styled.text`
  fill: #fffff2;
  ${theme.fontBold};
`;

const YearText = styled.text`
  fill: #7e7e79;
  ${theme.fontNormal};
`;

const Tooltip = styled.div`
  position: absolute;
  color: white;
  pointer-events: none;
`;

function sortSeries(a: Datum, b: Datum) {
  return a.year - b.year;
}

export class DirectorChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hoveredTitle: undefined, hoverX: 0, hoverY: 0 };
  }

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
    const { hoveredTitle, hoverX, hoverY } = this.state;

    const lineGenerator = line<Datum>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.year))
      .y(d => (d.value ? yScale(d.value) : yScale(5)));

    const areaGenerator = area<Datum>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.year))
      .y0(d => (d.minValue ? yScale(d.minValue) : 0))
      .y1(d => (d.value ? yScale(d.value) : 0));

    const compareTitles = (aMovieData: MovieData, bMovieData: MovieData) => {
      if (!aMovieData.averageRating) {
        return -1;
      }
      if (!bMovieData.averageRating) {
        return 1;
      }
      return aMovieData.averageRating - bMovieData.averageRating;
    };

    const neutralValue = 6.5;

    const dataSeries = lineChartData.series.filter(d => {
      const deathYear = max(lineChartData.deathYears);
      return deathYear ? deathYear >= d.year : true;
    });

    const lastValue = dataSeries.sort((d1, d2) => d2.year - d1.year)[0].value;

    dataSeries.push({
      value: neutralValue,
      minValue: neutralValue,
      year: lineChartData.movieYears.sort()[0] - 1,
    });
    lineChartData.birthYears.forEach(year => {
      if (year) {
        dataSeries.push({
          value: neutralValue,
          minValue: neutralValue,
          year,
        });
      }
    });
    lineChartData.deathYears.forEach(year => {
      if (year) {
        dataSeries.push({
          value: lastValue ? lastValue : neutralValue,
          minValue: lastValue ? lastValue : neutralValue,
          year,
        });
      }
    });
    const sortedSeries = dataSeries.sort(sortSeries);

    const handleMouseEnter = (_titleId: string, _x: number, _y: number) => {
      // this.setState({ hoveredTitle: titleId, hoverX: x, hoverY: y });
    };

    const handleMouseLeave = () => {
      // this.setState({ hoveredTitle: undefined });
    };

    return (
      <Main>
        <Graph width={width} height={height}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="40%" stopColor="#100F0F" />
              <stop offset="95%" stopColor="#171716" />
            </linearGradient>
            <filter id="glow" x="-5" y="-5" height="10" width="10">
              <feGaussianBlur stdDeviation={1} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g>
            <path
              stroke="transparent"
              fill="url(#grad)"
              d={areaGenerator(sortedSeries) as string}
            />
          </g>
          <g>
            <path
              strokeWidth={1}
              stroke="#4D4B47"
              fill="transparent"
              d={lineGenerator(sortedSeries)!}
            />
          </g>
          <g style={{ overflow: 'visible' }}>
            {Object.keys(directorData.directorsInfo).map(directorId => {
              const directorInfo = directorData.directorsInfo[directorId];
              const birthYear = directorInfo.birthYear;
              const deathYear = directorInfo.deathYear;
              return (
                <g key={directorId}>
                  {birthYear && (
                    <g>
                      <line
                        x1={xScale(birthYear)}
                        x2={xScale(birthYear)}
                        y1={yScale(neutralValue) - 10}
                        y2={yScale(neutralValue) + 10}
                        stroke="#4D4B47"
                        strokeWidth={1}
                      />
                      <YearText
                        x={xScale(birthYear) + 5}
                        y={yScale(neutralValue) + 20}
                      >
                        {birthYear}
                      </YearText>
                    </g>
                  )}
                  <DirectorNameText
                    x={birthYear ? xScale(birthYear) + 5 : 0}
                    y={yScale(neutralValue) - 10}
                    cursor="pointer"
                    onClick={() =>
                      window.open(
                        `http://www.imdb.com/name/${directorId}/`,
                        '_blank',
                      )
                    }
                  >
                    {directorInfo.name}
                  </DirectorNameText>
                  {deathYear && (
                    <g>
                      <line
                        x1={xScale(deathYear)}
                        x2={xScale(deathYear)}
                        y1={yScale(lastValue ? lastValue : neutralValue) - 10}
                        y2={yScale(lastValue ? lastValue : neutralValue) + 10}
                        stroke="#4D4B47"
                        strokeWidth={1}
                      />
                      <YearText
                        x={xScale(deathYear) - 5}
                        y={yScale(lastValue ? lastValue : neutralValue) + 20}
                        textAnchor="end"
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
                    style={{ overflow: 'visible' }}
                    key={`title-${titleId}`}
                    cx={xScale(year)}
                    cy={rating ? yScale(rating) : yScale(neutralValue)}
                    r={2.5}
                    fillOpacity="1"
                    fill={rating ? colorScale(rating) : '#555'}
                    strokeWidth={0.5}
                    stroke="#140001"
                    onMouseEnter={() => {
                      handleMouseEnter(
                        `${title.name} – ${title.year}, ${title.averageRating}`,
                        xScale(year),
                        rating ? yScale(rating) : yScale(neutralValue),
                      );
                    }}
                    onMouseLeave={() => {
                      handleMouseLeave();
                    }}
                  />
                ) : (
                  undefined
                );
              })}
          </g>
        </Graph>
        {hoveredTitle !== undefined && (
          <Tooltip
            style={{
              top: hoverY - 25,
              left: hoverX,
            }}
          >
            {hoveredTitle}
          </Tooltip>
        )}
      </Main>
    );
  }
}
