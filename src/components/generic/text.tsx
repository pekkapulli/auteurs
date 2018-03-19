import { select } from 'd3-selection';
import * as React from 'react';

interface TextProps {
  x: number;
  y: number;
  fontSize: number;
  textAnchor: string;
  fill: string;
}

export class Text extends React.Component<TextProps> {
  private ref?: SVGTextElement;

  private update() {
    const { x, y } = this.props;
    select(this.ref!)
      .transition()
      .attr('x', x)
      .attr('y', y);
  }

  public componentDidMount() {
    this.update();
  }

  public componentDidUpdate() {
    this.update();
  }

  public render() {
    const { textAnchor, fontSize, fill } = this.props;
    return (
      <text
        ref={ref => (this.ref = ref!)}
        textAnchor={textAnchor}
        fontSize={fontSize}
        fill={fill}
      >
        {this.props.children}
      </text>
    );
  }
}
