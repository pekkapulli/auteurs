import { select } from 'd3-selection';
import * as React from 'react';

interface PathProps {
  stroke: string;
  opacity: number;
  d: string;
  strokeWidth: number;
}

export class Path extends React.Component<PathProps> {
  private ref?: SVGPathElement;

  private update() {
    const { stroke, opacity, d } = this.props;
    select(this.ref!)
      .transition()
      .attr('d', d)
      .attr('stroke', stroke)
      .attr('opacity', opacity);
  }

  public componentDidMount() {
    this.update();
  }

  public componentDidUpdate() {
    this.update();
  }

  public render() {
    const { strokeWidth } = this.props;
    return (
      <path
        ref={ref => (this.ref = ref!)}
        strokeWidth={strokeWidth}
        fill="none"
      />
    );
  }
}
