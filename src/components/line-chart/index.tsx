import * as React from 'react';

const Dimensions = require('react-dimensions');

import LineChart, { PassedProps } from './line-chart';

// From https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

interface DimensionsProps {
  containerHeight: number;
  containerWidth: number;
}

class ResponsiveLineChart extends React.Component<
  PassedProps & DimensionsProps
> {
  public render() {
    const { containerWidth, containerHeight, ...rest } = this.props;
    return <LineChart width={containerWidth} {...rest} />;
  }
}

type Props = Omit<PassedProps, 'width'> & { width?: number };

export default Dimensions()(ResponsiveLineChart) as React.ComponentClass<Props>;
export { Data, Datum } from './line-chart';
