import { sum } from 'd3-array';
import { ScalePower } from 'd3-scale';
import * as React from 'react';

import { theme } from '../theme';

interface Props {
  radius: ScalePower<number, number>;
  label: string;
  x: number;
  y: number;
  width: number;
  valueFormatter: (value: number) => string;
  numberOfCircles: 2 | 3;
}

const circleRatios = {
  2: [1 / 8, 3 / 5],
  3: [1 / 10, 1 / 3, 4 / 5],
};

export default function CircleLegend({
  radius,
  x,
  y,
  valueFormatter,
  numberOfCircles,
}: Props) {
  const circleDomain = radius.domain();
  const domainValues = circleRatios[numberOfCircles].map(
    ratio => circleDomain[0] + ratio * (circleDomain[1] - circleDomain[0]),
  );
  const circleRadii = domainValues.map(radius);
  const largestCircleRadius = circleRadii[circleRadii.length - 1];
  const spacing = 30;
  const circlePositions = circleRadii.map(
    (r, i) => r + (i && i * spacing + 2 * sum(circleRadii.slice(0, i))),
  );

  const dataMissingPosition =
    circlePositions[circlePositions.length - 1] +
    largestCircleRadius +
    spacing +
    20;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {circlePositions.map((circleY, i) => (
        <g key={i} transform={`translate(${0},${circleY})`}>
          <circle
            r={circleRadii[i]}
            cx={largestCircleRadius}
            cy={0}
            fill={theme.colors.grey(0).toString()}
            stroke={theme.colors.grey(2).toString()}
            strokeWidth={1}
            strokeDasharray={'4,2'}
          />
          <text
            fill={theme.colors.grey(8).toString()}
            fontSize={10}
            y={circleRadii[i] + 15}
            x={largestCircleRadius}
            textAnchor="middle"
          >
            {valueFormatter(domainValues[i])}
          </text>
        </g>
      ))}
      <g transform={`translate(${0},${dataMissingPosition})`}>
        <text
          x={largestCircleRadius}
          fill={theme.colors.grey(1).toString()}
          textAnchor="middle"
        >
          ×
        </text>
        <text
          fill={theme.colors.grey(8).toString()}
          fontSize={10}
          y={15}
          x={largestCircleRadius}
          textAnchor="middle"
        >
          Data
        </text>
        <text
          fill={theme.colors.grey(8).toString()}
          fontSize={10}
          y={27}
          x={largestCircleRadius}
          textAnchor="middle"
        >
          puuttuu
        </text>
      </g>
    </g>
  );
}
