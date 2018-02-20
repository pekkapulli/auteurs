import { rgb, RGBColor } from 'd3-color';
import { interpolateHcl } from 'd3-interpolate';
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
import { Directors } from '../../types';
import { DirectorChart, LineChartData } from './director-chart';

interface PassedProps {
  width: number;
  height?: number;
}

interface StateProps {
  directorData: Directors;
  lineChartData: { [directorIds: string]: LineChartData };
  yearExtent: [number, number];
}

interface DispatchProps {}

type Props = PassedProps & DispatchProps & StateProps;

const Main = styled.div`
  width: 100;
  overflow: visible;
`;

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
`;

class DirectorChartsPlain extends React.Component<Props> {
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

  public render() {
    const { directorData, width, yearExtent, lineChartData } = this.props;
    const height = 100;
    const xScale = scaleLinear()
      .domain(yearExtent)
      .range([0, width]);
    const yScale = scaleLinear()
      .domain([3, 10])
      .range([height, 0]);
    const colorScale = scaleLinear<RGBColor, string>()
      .domain([0, 10])
      .interpolate(interpolateHcl)
      .range([rgb('#237A70'), rgb('#FFCA5A')]);

    return (
      <Main>
        {directorData ? (
          Object.keys(directorData)
            .filter(
              directorIds =>
                values(directorData[directorIds].directorsInfo).filter(
                  value => value.birthYear,
                ).length > 0 &&
                Object.keys(directorData[directorIds].movies).length >= 3,
            )
            .sort(this.sortDirectorData)
            .map(directorIds => (
              <ChartContainer key={directorIds}>
                <DirectorChart
                  width={width}
                  height={100}
                  xScale={xScale}
                  yScale={yScale}
                  colorScale={colorScale}
                  directorData={directorData[directorIds]}
                  lineChartData={lineChartData[directorIds]}
                />
              </ChartContainer>
            ))
        ) : (
          <div>'Loading'</div>
        )};
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
