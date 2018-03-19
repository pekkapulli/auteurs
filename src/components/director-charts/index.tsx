import { rgb, RGBColor } from 'd3-color';
import { scaleLinear } from 'd3-scale';
import { values } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { StateTree } from '../../reducers/index';
import {
  getDirectorData,
  getLineChartData,
  getYearExtent,
} from '../../selectors/index';
import { Directors, MovieData } from '../../types';
import { Circle } from '../generic/circle';
import { Star } from '../generic/star';
import { DirectorChart, LineChartData } from './director-chart';

interface PassedProps {
  width: number;
  height?: number;
  marginLeft: number;
  marginRight: number;
  showCareers: boolean;
  onlyHits: boolean;
  onlyShawshank: boolean;
}

interface StateProps {
  directorData: Directors;
  lineChartData: { [directorIds: string]: LineChartData };
  yearExtent: [number, number];
}

interface DispatchProps {}

type Props = PassedProps & DispatchProps & StateProps;

interface State {
  hoveredTitle?: string;
  hoverX: number;
  hoverY: number;
}

const Main = styled.div`
  position: absolute;
  top: 0;
  width: 100;
  overflow: visible;
`;

const Graph = styled.svg`
  width: 100%;
  overflow: visible !important;
`;

const Tooltip = styled.div`
  position: absolute;
  color: white;
  pointer-events: none;
  width: 150px;
  font-weight: 700;
`;

class DirectorChartsPlain extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hoveredTitle: undefined, hoverX: 0, hoverY: 0 };
  }

  private sortDirectorData = (a: string, b: string) => {
    const { directorData } = this.props;
    const minYearA = Math.min(
      ...Object.keys(directorData[a].movies)
        .map(titleId => directorData[a].movies[titleId].year)
        .filter(year => !isNaN(year)),
    );
    const minYearB = Math.min(
      ...Object.keys(directorData[b].movies)
        .map(titleId => directorData[b].movies[titleId].year)
        .filter(year => !isNaN(year)),
    );
    return minYearA - minYearB;
  };

  private compareTitles = (a: MovieData, b: MovieData) => {
    return !a.averageRating
      ? -1
      : !b.averageRating ? 1 : a.averageRating - b.averageRating;
  };

  private handleMouseEnter = (titleId: string, x: number, y: number) => {
    this.setState({ hoveredTitle: titleId, hoverX: x, hoverY: y });
  };

  private handleMouseLeave = () => {
    this.setState({ hoveredTitle: undefined });
  };

  public render() {
    const {
      directorData,
      width,
      yearExtent,
      lineChartData,
      marginLeft,
      marginRight,
      showCareers,
      onlyHits,
      onlyShawshank,
    } = this.props;

    const height = showCareers ? 100 : 500;
    const xScale = scaleLinear()
      .domain(yearExtent)
      .range([marginLeft, width - marginRight]);
    const yScale = scaleLinear()
      .domain([2, 10])
      .range([height, 0]);
    const colorScale = scaleLinear<RGBColor, string>()
      .domain([3, 8])
      .range([rgb('#7D0021'), rgb('#FFD27A')]);

    const shownDirectors = Object.keys(directorData)
      .filter(
        directorIds =>
          values(directorData[directorIds].directorsInfo).filter(
            value => value.birthYear,
          ).length > 0 &&
          Object.keys(directorData[directorIds].movies).length >= 3,
      )
      .sort(this.sortDirectorData);

    const neutralValue = 6.5;

    const getY = (index: number, value?: number) => {
      return (
        yScale(value ? value : neutralValue) +
        (showCareers ? (index + 1) * height : 0)
      );
    };

    const isTitleShown = (title: MovieData) => {
      return (
        (!onlyShawshank || title.id === 'tt0111161') &&
        (!onlyHits || (title.averageRating && title.averageRating >= 8.0))
      );
    };

    return (
      <Main>
        <Graph
          width={width}
          height={showCareers ? shownDirectors.length * height : height}
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="40%" stopColor="#140b00" />
              <stop offset="95%" stopColor="#1A1715" />
            </linearGradient>
            <filter id="glow" x="-5" y="-5" height="10" width="10">
              <feGaussianBlur stdDeviation={1} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {directorData ? (
            <>
              {showCareers &&
                shownDirectors.map((directorIds, index) => (
                  <DirectorChart
                    key={`director-chart-${directorIds}`}
                    xScale={xScale}
                    yScale={yScale}
                    yOffset={showCareers ? (index + 1) * height : 0}
                    colorScale={colorScale}
                    directorData={directorData[directorIds]}
                    lineChartData={lineChartData[directorIds]}
                  />
                ))}
              <g>
                {/* CIRCLES */}
                {shownDirectors.map((directorIds, index) => {
                  const directorDatum = directorData[directorIds];
                  return Object.keys(directorDatum.movies)
                    .sort((aTitleId: string, bTitleId: string) =>
                      this.compareTitles(
                        directorDatum.movies[aTitleId],
                        directorDatum.movies[bTitleId],
                      ),
                    )
                    .map(titleId => {
                      const title = directorDatum.movies[titleId];
                      const year = title.year;
                      const rating = title.averageRating;
                      const titleIsShown = isTitleShown(title);
                      if (!isNaN(title.year) && title.year < 2018) {
                        return !rating || rating < 8.0 ? (
                          <Circle
                            key={`title-${titleId}`}
                            cx={xScale(year)}
                            cy={getY(index, rating)}
                            r={2.5}
                            fill={rating ? colorScale(rating) : '#555'}
                            strokeWidth={0.5}
                            stroke="#140001"
                            opacity={titleIsShown ? 1 : 0}
                            onMouseEnter={() => {
                              this.handleMouseEnter(
                                `${title.name} – ${title.year}, ${
                                  title.averageRating
                                }`,
                                xScale(year),
                                getY(index, rating ? rating : neutralValue),
                              );
                            }}
                            onMouseLeave={() => {
                              this.handleMouseLeave();
                            }}
                          />
                        ) : (
                          <Star
                            key={`title-${titleId}`}
                            cx={xScale(year)}
                            cy={getY(index, rating)}
                            r={
                              onlyShawshank && titleId === 'tt0111161'
                                ? 10
                                : 3.5
                            }
                            fill={colorScale(rating)}
                            strokeWidth={0.5}
                            stroke="#140001"
                            opacity={titleIsShown ? 1 : 0}
                            onMouseEnter={() => {
                              this.handleMouseEnter(
                                `${title.name} – ${title.year}, ${
                                  title.averageRating
                                }`,
                                xScale(year),
                                getY(index, rating ? rating : neutralValue),
                              );
                            }}
                            onMouseLeave={() => {
                              this.handleMouseLeave();
                            }}
                          />
                        );
                      }
                      return undefined;
                    });
                })}
              </g>
            </>
          ) : (
            <div>'Loading'</div>
          )}
        </Graph>
        {this.state.hoveredTitle !== undefined && (
          <Tooltip
            style={{
              top: this.state.hoverY + 5,
              right: width - marginRight - this.state.hoverX - 75,
            }}
          >
            {this.state.hoveredTitle}
          </Tooltip>
        )}
      </Main>
    );
  }
}

export const DirectorCharts = connect<StateProps, DispatchProps, {}, StateTree>(
  state => ({
    directorData: getDirectorData(state),
    lineChartData: getLineChartData(state),
    yearExtent: getYearExtent(state),
  }),
)(DirectorChartsPlain);
