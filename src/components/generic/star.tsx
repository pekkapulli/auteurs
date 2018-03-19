import { select } from 'd3-selection';
import 'd3-transition';
import * as React from 'react';

interface StarProps {
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

export class Star extends React.Component<StarProps> {
  private ref?: SVGSVGElement;

  private update() {
    const { cx, cy, r, opacity } = this.props;
    select(this.ref!)
      .transition()
      .duration(2000)
      .attr('x', cx - r)
      .attr('y', cy - r)
      .attr('width', r * 2)
      .attr('height', r * 2)
      .attr('opacity', opacity);
  }

  public componentDidMount() {
    this.update();
  }

  public componentDidUpdate() {
    this.update();
  }

  public render() {
    const { fill, onMouseEnter, onMouseLeave, onClick } = this.props;
    return (
      <svg
        ref={ref => (this.ref = ref!)}
        viewBox="0 0 14 14"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        onMouseEnter={onMouseEnter ? () => onMouseEnter : undefined}
        onMouseLeave={onMouseLeave ? () => onMouseLeave : undefined}
        onMouseDown={onClick ? () => onClick : undefined}
        fill={fill}
        fillRule="evenodd"
      >
        <g transform="translate(-18, 0)">
          <path
            // tslint:disable-next-line:max-line-length
            d="M24.9730995,11.1690389 L21.4720984,13.2949466 C21.2360643,13.4382732 20.9285317,13.3631189 20.7852051,13.1270848 C20.7171073,13.0149397 20.6958176,12.8805215 20.7259276,12.7528217 L21.6659171,8.76623022 L18.5621899,6.09352187 C18.3529397,5.91333048 18.3293828,5.59762564 18.5095742,5.38837537 C18.5951872,5.28895579 18.7164476,5.22717056 18.8472018,5.21634551 L22.9291484,4.8784041 L24.5119406,1.10067185 C24.6186509,0.845980816 24.9116246,0.726018742 25.1663156,0.832729054 C25.2873252,0.883429562 25.3835579,0.979662316 25.4342584,1.10067185 L27.0170507,4.8784041 L31.0989973,5.21634551 C31.3741981,5.23912919 31.5788227,5.48069339 31.556039,5.75589426 C31.545214,5.88664848 31.4834287,6.00790882 31.3840091,6.09352187 L28.280282,8.76623022 L29.2202714,12.7528217 C29.2836446,13.0215939 29.1171359,13.2908508 28.8483638,13.354224 C28.720664,13.384334 28.5862459,13.3630443 28.4741007,13.2949466 L24.9730995,11.1690389 Z"
            id="Star"
          />
        </g>
      </svg>
    );
  }
}
