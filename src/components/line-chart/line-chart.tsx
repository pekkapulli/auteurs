import * as classNames from 'classnames';
import { bisectRight, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { format } from 'd3-format';
import { scaleLinear, ScaleLinear, scaleTime, ScaleTime } from 'd3-scale';
import { event as d3Event, select, Selection } from 'd3-selection';
import { curveMonotoneX, line, Line } from 'd3-shape';
import { transition, Transition } from 'd3-transition';
// tslint:disable-next-line:no-duplicate-imports
import 'd3-transition';
import clamp = require('lodash/clamp');
import flatMap = require('lodash/flatMap');
import * as React from 'react';

const styles = require('./line-chart.scss');

export interface Datum {
  value?: number;
  interpolated?: boolean;
  start: Date;
  end: Date;
}

export interface Data {
  id: string;
  label: string;
  color: string;
  series: Datum[];
}

export interface PassedProps {
  data: Data | Data[];
  width: number;
  height: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  className?: string;
  maxY?: number;
  minY?: number;
  yAxisLabel?: string;
  yAxisFormat?: (n: number) => string;
  dataLabelFormat?: (n: number) => string;
  selectedTimeIndex?: number;
  selectedDataSeries?: string[];
  onChangeIndex?: (index: number) => void;
  onClick?: () => void;
  onHoverEnterSeries?: (id: string) => void;
  onHoverLeaveSeries?: (id: string) => void;
  hideYAxis?: boolean;
  hideLineLabels?: boolean;
}

interface DefaultProps {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  dataLabelFormat: (n: number) => string;
  yAxisFormat: (n: number) => string;
}

type Props = PassedProps;
type PropsWithDefaults = Props & DefaultProps;

function toMidpoint(start: Date, end: Date): Date {
  return new Date((end.getTime() + start.getTime()) / 2);
}

interface DataPoint {
  id: string;
  datum: Datum;
  color: string;
}

class LineChart extends React.Component<Props> {
  public static defaultProps: DefaultProps = {
    marginTop: 30,
    marginRight: 30,
    marginBottom: 30,
    marginLeft: 50,
    dataLabelFormat: format('d'),
    yAxisFormat: format('d'),
  };

  private svgRef: SVGSVGElement | null;
  private overlayRef: SVGRectElement | null;
  private xScale?: ScaleTime<number, number>;
  private yScale?: ScaleLinear<number, number>;
  private lineGenerator?: Line<Datum>;

  public componentDidMount() {
    this.generateScales();
    this.redrawChart(true);
    select(this.overlayRef!).call(
      drag<SVGRectElement, {}>()
        .on('drag', this.dragged)
        .on('start', this.dragged)
        // D3 tests for touch devices with `return "ontouchstart" in this`.
        // However, since our drag handler has bound `this` to this React class,
        // the test will always fail. That's why we need to define the test
        // function ourselves.
        .touchable(() => !!('ontouchstart' in window)),
    );
  }

  public componentDidUpdate() {
    this.generateScales();
    this.redrawChart();
  }

  private getData() {
    const { data } = this.props;
    return Array.isArray(data) ? data : [data];
  }

  // If this.props.data is not an array, it is considered selected
  private getSelectedSerieIDs() {
    const { selectedDataSeries, data } = this.props;
    return Array.isArray(data) ? selectedDataSeries : [data.id];
  }

  private generateScales() {
    const {
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      maxY,
      minY,
      width,
      height,
    } = this.props as PropsWithDefaults;
    const seriesData = flatMap(this.getData(), d => d.series);
    const dataValueExtent = extent(seriesData, d => d.value) as [
      number,
      number
    ];

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    this.xScale = scaleTime<number, number>()
      .domain(extent(flatMap(seriesData.map(d => [d.start, d.end]))) as [
        Date,
        Date
      ])
      .range([0, chartWidth]);
    this.yScale = scaleLinear()
      .domain([
        minY != null ? Math.min(dataValueExtent[0], minY) : dataValueExtent[0],
        maxY != null ? Math.max(dataValueExtent[1], maxY) : dataValueExtent[1],
      ])
      .range([chartHeight, 0]);
    this.lineGenerator = line<Datum>()
      .curve(curveMonotoneX)
      .x(d => this.xScale!(toMidpoint(d.start, d.end)))
      .y(d => (d.value != null ? this.yScale!(d.value) : 0))
      .defined(d => d.value != null);
  }

  // We need to have a selectedTimeIndex and if the this.props.data is an array,
  // also a selectedDataSeries
  private getSelectedDataPoints(): DataPoint[] | undefined {
    const { selectedTimeIndex } = this.props;

    if (selectedTimeIndex == null) {
      return undefined;
    }

    const data = this.getData();
    const selectedSeries = this.getSelectedSerieIDs();

    return (
      selectedSeries &&
      data
        .filter(d => selectedSeries.indexOf(d.id) > -1)
        .map(({ id, color, series }) => ({
          id,
          color,
          datum: series[selectedTimeIndex],
        }))
    );
  }

  private findClosestIndex(date: Date) {
    // TODO: make this more efficient?
    // NOTE: This assumes the time index is the same for all series shown
    const dataSeries = this.getData()[0].series;
    const dataDates = dataSeries.map(d => toMidpoint(d.start, d.end));
    // All earlier times are to the left of this index. It should never be 0.
    const indexOnRight = bisectRight(dataDates, date);

    if (indexOnRight < 1) {
      return 0;
    }

    if (indexOnRight >= dataSeries.length) {
      return dataSeries.length - 1;
    }

    const dateOnLeft = dataDates[indexOnRight - 1];
    const dateOnRight = dataDates[indexOnRight];
    if (
      date.getTime() - dateOnLeft.getTime() >
      dateOnRight.getTime() - date.getTime()
    ) {
      return indexOnRight;
    }

    return indexOnRight - 1;
  }

  private dragged = () => {
    const { onChangeIndex, marginLeft, width, marginRight } = this
      .props as PropsWithDefaults;

    if (onChangeIndex) {
      // The touch area is larger than the chart area, so we need to clamp it
      const chartWidth = width - marginLeft - marginRight;
      const xPosition = clamp(d3Event.x - marginLeft, 0, chartWidth);
      const draggedTime = this.xScale!.invert(xPosition);
      onChangeIndex(this.findClosestIndex(draggedTime));
    }
  };

  private dataLabel = (
    sel:
      | Selection<SVGGElement, DataPoint, any, any>
      | Transition<SVGGElement, DataPoint, any, any>,
  ) => {
    const { dataLabelFormat } = this.props as PropsWithDefaults;
    sel
      .attr(
        'transform',
        ({ datum }) =>
          `translate(${this.xScale!(toMidpoint(datum.start, datum.end))},${
            datum.value != null ? this.yScale!(datum.value) : 0
          })`,
      )
      .attr('fill', d => d.color)
      .attr('visibility', d => (d.datum.value != null ? 'visible' : 'hidden'));
    (sel as any) // TODO: fix typings
      .select('text')
      .text(
        (d: DataPoint) =>
          d.datum.value != null ? dataLabelFormat(d.datum.value) : '',
      );
  };

  private linePath = (
    sel:
      | Selection<SVGPathElement, Data, any, any>
      | Transition<SVGPathElement, Data, any, any>,
  ) => {
    const selectedSeries = this.getSelectedSerieIDs();
    sel
      .style(
        'opacity',
        d => (selectedSeries && selectedSeries.indexOf(d.id) > -1 ? 1 : 0.1),
      )
      .style(
        'stroke',
        d =>
          selectedSeries && selectedSeries.indexOf(d.id) > -1
            ? d.color
            : 'black',
      )
      .attr('d', d => this.lineGenerator!(d.series));
  };

  private selectedTimeIndicator = (
    sel:
      | Selection<SVGGElement, any, any, any>
      | Transition<SVGGElement, any, any, any>,
    x: number,
    label: string,
  ) => {
    sel.attr('transform', `translate(${x},0)`);
    // TODO: fix typings
    const textSelection = (sel as any).select('text').text(label);
    sel.on('end', () => {
      const width = textSelection.node().getComputedTextLength() + 20;
      (sel as any)
        .select('rect')
        .attr('width', width)
        .attr('transform', `translate(-${width / 2}, 0)`);
    });
  };

  private redrawChart(initialDraw = false) {
    const {
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
      width,
      height,
      selectedTimeIndex,
      yAxisFormat,
      hideYAxis,
    } = this.props as PropsWithDefaults;

    const data = this.getData();
    const selectedDataPoints = this.getSelectedDataPoints();

    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;
    const g = select<SVGElement, undefined>(this.svgRef!).select<SVGGElement>(
      'g#main-group',
    );
    const xScale = this.xScale!;
    const yScale = this.yScale!;

    // TODO: fix typing
    const t: any = transition<undefined>('linechart').duration(
      initialDraw ? 0 : 100,
    );

    g
      .select<SVGGElement>('g#x-axis')
      .transition(t)
      .call(axisBottom(xScale).ticks(Math.round(chartWidth / 50)));
    if (!hideYAxis) {
      g
        .select('g#y-axis')
        .transition(t)
        .call(axisLeft(yScale)
          .ticks(Math.round(chartHeight / 30))
          .tickFormat(yAxisFormat as any) as any);
    }

    // LINE GROUP
    const linesUpdateSelection = g
      .selectAll<SVGPathElement, Data>(`path.${styles.line}`)
      .data(data, d => d.id);

    // New lines
    linesUpdateSelection
      .enter()
      .append<SVGPathElement>('path')
      .attr('class', styles.line)
      .call(this.linePath);

    // Old lines
    linesUpdateSelection.transition(t).call(this.linePath);

    linesUpdateSelection.exit().remove();

    // Draw selected time line and (optionally) labels
    if (selectedTimeIndex != null) {
      const dataPoint =
        selectedDataPoints && selectedDataPoints.length
          ? selectedDataPoints[0].datum
          : data[0].series[selectedTimeIndex];

      const { start, end } = dataPoint;
      const midpoint = toMidpoint(start, end);
      const label =
        start.getMonth() === end.getMonth()
          ? `${midpoint.getMonth() + 1}/${midpoint.getFullYear()}`
          : midpoint.getFullYear().toString();
      const x = xScale(midpoint);
      // prettier-ignore
      g
        .select<SVGGElement>('g#selected-time-indicator')
        .transition(t)
          .call(
            this.selectedTimeIndicator,
            x,
            label,
        );
    }

    const labelsGroup = g
      .selectAll<SVGGElement, DataPoint>(`g.${styles['selected-label']}`)
      .data(selectedDataPoints || [], d => d.id);

    // prettier-ignore
    const newLabelsGroup = labelsGroup
      .enter()
        .append<SVGGElement>('g')
        .attr('class', styles['selected-label']);
    newLabelsGroup
      .append('text')
      .attr('x', 5)
      .attr('dy', 0);
    newLabelsGroup
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 4)
      .attr('stroke', 'white')
      .attr('strokeWidth', 1);
    newLabelsGroup.call(this.dataLabel);
    labelsGroup.transition(t).call(this.dataLabel);
    labelsGroup.exit().remove();
  }

  private handleHoverEnterSeries = (id: string) => () => {
    const { onHoverEnterSeries } = this.props;

    if (onHoverEnterSeries) {
      onHoverEnterSeries(id);
    }
  };

  private handleHoverLeaveSeries = (id: string) => () => {
    const { onHoverLeaveSeries } = this.props;

    if (onHoverLeaveSeries) {
      onHoverLeaveSeries(id);
    }
  };

  public render() {
    const {
      width,
      height,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      yAxisLabel,
      hideYAxis,
      className,
      onClick,
      onChangeIndex,
      onHoverEnterSeries,
      hideLineLabels,
    } = this.props as PropsWithDefaults;

    const selectedSeries = this.getSelectedSerieIDs();
    const data = this.getData();

    // The data points always have a start and end date. We draw the line to the
    // midpoint of these two dates. This means we have a
    // 0.5 * (end date - start date) gap at the right edge of the graph where
    // no lines are drawn. We want to figure out the width of this graph below.
    let xOffsetForLabels = 0;
    if (data.length && this.xScale) {
      const { series } = data[0];
      const lastValue = series[series.length - 1];
      xOffsetForLabels =
        (this.xScale(lastValue.end) - this.xScale(lastValue.start)) / 2;
    }

    const chartHeight = height - marginTop - marginBottom;
    const chartWidth = width - marginLeft - marginRight;

    return (
      <svg
        width={width}
        height={height}
        className={className}
        ref={ref => (this.svgRef = ref)}
        onClick={onClick}
        style={{ overflow: 'visible' }}
      >
        <g id="main-group" transform={`translate(${marginLeft},${marginTop})`}>
          <g
            id="x-axis"
            className={styles['x-axis']}
            transform={`translate(0,${chartHeight})`}
          />
          {!hideYAxis && (
            <g id="y-axis" className={styles['y-axis']}>
              {yAxisLabel && (
                <text
                  transform="rotate(-90)"
                  y="6"
                  dy="0.55em"
                  className={styles['y-axis-label']}
                >
                  {yAxisLabel}
                </text>
              )}
            </g>
          )}
          <g id="selected-time-indicator">
            <line
              x1={0}
              x2={0}
              y1={-8}
              y2={chartHeight}
              className={styles['selected-time-line']}
            />
            <rect
              className={styles['selected-time-rect']}
              height={20}
              rx={10}
              ry={10}
              y={-30}
              fill="rgb(0, 84, 168)"
            />
            <text
              className={styles['selected-time-label']}
              textAnchor="middle"
              y={-16}
              x={0}
              fill="white"
            />
          </g>
        </g>
        <rect
          id="overlay"
          ref={ref => (this.overlayRef = ref)}
          className={styles.overlay}
          width={width}
          height={chartHeight + 30}
          style={{ cursor: onChangeIndex ? 'ew-resize' : 'auto' }}
          x={0}
          y={marginTop - 30}
        />
        {!hideLineLabels && (
          <g
            transform={`translate(${marginLeft +
              chartWidth -
              xOffsetForLabels -
              2},${marginTop})`}
          >
            {data.map((d, i) => {
              const isLineSelected =
                selectedSeries && selectedSeries.indexOf(d.id) > -1;
              return (
                <text
                  className={classNames(
                    styles['line-label'],
                    onHoverEnterSeries && styles.hoverable,
                  )}
                  onMouseEnter={this.handleHoverEnterSeries(d.id)}
                  onMouseLeave={this.handleHoverLeaveSeries(d.id)}
                  textAnchor="end"
                  key={`label-${d.id}`}
                  fill={isLineSelected ? d.color : 'black'}
                  opacity={isLineSelected ? 1.0 : 0.1}
                  y={i * 12}
                >
                  {d.label}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    );
  }
}

export default LineChart;
