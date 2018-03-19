import { select } from 'd3-selection';
import 'd3-transition';
import * as React from 'react';

interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  strokeWidth: number;
  stroke: string;
  opacity: number;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: (id: string) => void;
  onClick?: (id: string) => void;
}

export class Circle extends React.Component<CircleProps> {
  private ref?: SVGCircleElement;

  private update() {
    const { cx, cy, opacity } = this.props;
    select(this.ref!)
      .transition()
      .duration(2000)
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('opacity', opacity);
  }

  public componentDidMount() {
    this.update();
  }

  public componentDidUpdate() {
    this.update();
  }

  public render() {
    const {
      r,
      fill,
      onMouseEnter,
      onMouseLeave,
      onClick,
      strokeWidth,
      stroke,
    } = this.props;
    return (
      <circle
        ref={ref => (this.ref = ref!)}
        r={r}
        fill={fill}
        onMouseEnter={onMouseEnter ? () => onMouseEnter : undefined}
        onMouseLeave={onMouseLeave ? () => onMouseLeave : undefined}
        onMouseDown={onClick ? () => onClick : undefined}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
    );
  }
}
