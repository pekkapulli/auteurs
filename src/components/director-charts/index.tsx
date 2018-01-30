import { rgb, RGBColor } from 'd3-color';
import { interpolateHcl } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { StateTree } from '../../reducers/index';
import { getDirectorData, getYearExtent } from '../../selectors/index';
import { Directors } from '../../types';
import { DirectorChart } from './director-chart';

interface PassedProps {
  width: number;
  height?: number;
}

interface StateProps {
  directorData: Directors;
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
    const { directorData, width, yearExtent } = this.props;
    const height = 100;
    const xScale = scaleLinear()
      .domain(yearExtent)
      .range([0, width]);
    const yScale = scaleLinear()
      .domain([0, 10])
      .range([height, 0]);
    const colorScale = scaleLinear<RGBColor, string>()
      .domain([0, 10])
      .interpolate(interpolateHcl)
      .range([rgb('#007AFF'), rgb('#FFF500')]);

    return (
      <Main>
        {directorData ? (
          Object.keys(directorData)
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
    yearExtent: getYearExtent(state),
  }),
)(DirectorChartsPlain);
