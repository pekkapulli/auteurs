import { RGBColor } from 'd3-color';
import { ScaleLinear } from 'd3-scale';
import { area, curveMonotoneX, line } from 'd3-shape';
import { max } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { DirectorData } from '../../types';

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
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleLinear<RGBColor, string>;
  yOffset: number;
}

interface DispatchProps {}

type Props = PassedProps & DispatchProps;

const DirectorNameText = styled.text`
  fill: #fffff2;
  ${theme.fontBold};
`;

const YearText = styled.text`
  fill: #7e7e79;
  ${theme.fontNormal};
`;

function sortSeries(a: Datum, b: Datum) {
  return a.year - b.year;
}

export class DirectorChart extends React.Component<Props> {
  public render() {
    const { directorData, xScale, yScale, lineChartData } = this.props;

    const getY = (value: number) => {
      const { yOffset } = this.props;
      return yScale(value) + yOffset;
    };

    const lineGenerator = line<Datum>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.year))
      .y(d => (d.value ? getY(d.value) : getY(5)));

    const areaGenerator = area<Datum>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.year))
      .y0(d => (d.minValue ? getY(d.minValue) : 0))
      .y1(d => (d.value ? getY(d.value) : 0));

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

    if (lineChartData.deathYears[0] !== undefined) {
      lineChartData.deathYears.forEach(year => {
        if (year) {
          dataSeries.push({
            value: lastValue ? lastValue : neutralValue,
            minValue: lastValue ? lastValue : neutralValue,
            year,
          });
        }
      });
    } else {
      dataSeries.push({
        value: lastValue ? lastValue : neutralValue,
        minValue: lastValue ? lastValue : neutralValue,
        year: 2025,
      });
    }
    const sortedSeries = dataSeries.sort(sortSeries);

    return (
      <g>
        <path
          stroke="transparent"
          fill="url(#grad)"
          d={areaGenerator(sortedSeries) as string}
        />
        <path
          strokeWidth={1}
          stroke="#4D4B47"
          fill="transparent"
          d={lineGenerator(sortedSeries)!}
        />
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
                      y1={getY(neutralValue) - 10}
                      y2={getY(neutralValue) + 10}
                      stroke="#4D4B47"
                      strokeWidth={1}
                    />
                    <YearText
                      x={xScale(birthYear) + 5}
                      y={getY(neutralValue) + 20}
                    >
                      {birthYear}
                    </YearText>
                  </g>
                )}
                <DirectorNameText
                  x={birthYear ? xScale(birthYear) + 5 : 0}
                  y={getY(neutralValue) - 10}
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
                      y1={getY(lastValue ? lastValue : neutralValue) - 10}
                      y2={getY(lastValue ? lastValue : neutralValue) + 10}
                      stroke="#4D4B47"
                      strokeWidth={1}
                    />
                    <YearText
                      x={xScale(deathYear) - 5}
                      y={getY(lastValue ? lastValue : neutralValue) + 20}
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
      </g>
    );
  }
}
