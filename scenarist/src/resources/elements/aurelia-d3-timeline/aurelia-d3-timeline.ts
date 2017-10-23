import { autoinject, bindable } from 'aurelia-framework';
import d3 from 'utils/d3-combined';
import { Selection } from 'd3-selection';
import { event as currentEvent } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';

export interface IKeyframe {
  label: string;
  className: string;
  times: {
    start: Date;
  }[];
}

export interface IKeyframeFormat {
  /**
   * Keyframe start time
   *
   * @type {Date}
   * @memberof IKeyframeFormat
   */
  start: Date;
  /**
   * Keyframe labels
   *
   * @type {string[]}
   * @memberof IKeyframeFormat
   */
  label: string[];
}

@autoinject
export class AureliaD3TimelineCustomElement {
  public title = 'Timeline';
  @bindable public width: string;
  @bindable public height: string;
  @bindable public startTime: string;
  @bindable public endTime: string;
  @bindable public keyframes: IKeyframe[];
  @bindable public currentTime: Date;

  private isInitialized = false;
  private svg: Selection<SVGElement, IKeyframeFormat[], HTMLDivElement, IKeyframe[]>;
  private tl: Selection<SVGElement, IKeyframeFormat[], HTMLDivElement, IKeyframe[]>;
  private x: d3.ScaleTime<Date, number>;
  private xZoomed: d3.ScaleTime<any, number>;
  private gX: any;
  private xAxis: d3.Axis<Date>;
  private line: Selection<any, any, any, any>;
  private curTimeline: Selection<any, any, any, any>;
  private curTimeLabel: Selection<any, any, any, any>;
  private tooltip: Selection<HTMLDivElement, any, HTMLBodyElement, any>;
  private toTime: (x: number) => string;

  constructor(private el: Element) { }

  public attached() {
    this.drawBase();
    this.draw();
  }

  public keyframesChanged(newKeyframes: IKeyframe[], oldKeyframes: IKeyframe[]) {
    this.draw();
  }

  private initialize() {
    const margin = { top: 10, bottom: 10, left: 20, right: 20 };
    const width = +this.width - margin.left - margin.right;
    const height = +this.height - margin.top - margin.bottom;
    const timelinePos = height - 10;
    return { margin, width, height, timelinePos };
  }

  private drawBase() {
    if (!this.startTime || !this.endTime) { return; }
    const startTime = Date.parse(this.startTime);
    const endTime = Date.parse(this.endTime);
    const { margin, width, height, timelinePos } = this.initialize();

    d3.select(this.el).select('svg').remove();
    this.svg = d3
      .select(this.el)
      .append('svg')
      .attr('width', +this.width || 900)
      .attr('height', +this.height || 70) as Selection<SVGAElement, IKeyframeFormat[], HTMLDivElement, IKeyframe[]>;

    const extraRange = Math.round((endTime - startTime) / 40);
    this.x = d3.scaleTime()
      .domain([startTime - extraRange, endTime + extraRange])
      .range([0, width]);
    this.xZoomed = this.x;

    this.svg.append('clipPath')
      .attr('id', 'rect-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width)
      .attr('height', height)
      .attr('clip-path', 'url(#ellipse-clip)')
      .attr('fill', 'SteelBlue');

    this.tl = this.svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('clip-path', 'url(#rect-clip)') as Selection<SVGElement, any, HTMLDivElement, any>;

    this.line = this.tl
      .append('line')
      .attr('class', 'timeline')
      .attr('x1', 0)
      .attr('y1', timelinePos)
      .attr('x2', width)
      .attr('y2', timelinePos);

    // Define the div for the tooltip
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    this.xAxis = d3.axisBottom(this.x)
      .ticks(width / 100)
      .tickFormat(this.multiTimeFormat);

    this.gX = this.tl.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0, ${height - 10})`)
      .call(this.xAxis);

    const formatCurTime = d3.timeFormat('%a %H:%M:%S');
    this.toTime = (x: number): string => formatCurTime(this.xZoomed.invert(x));
    const drag = d3.drag()
      // .on('dragstart', null)
      .on('drag', () => {
        const dx = currentEvent.dx; // this will give the delta x moved by drag
        const xNew = +this.curTimeline.attr('x1') + dx;
        this.currentTime = this.xZoomed.invert(xNew);
        this.curTimeline
          .attr('x1', xNew)
          .attr('x2', xNew);
        this.curTimeLabel
          .attr('x', xNew + 10)
          .text(() => this.toTime(xNew));
      });

    this.curTimeline = this.tl
      .append('line')
      .attr('class', 'active-time')
      .attr('x1', Math.round(width / 2))
      .attr('y1', timelinePos - 30)
      .attr('x2', Math.round(width / 2))
      .attr('y2', timelinePos)
      .call(drag);

    const xStart = Math.round(width / 2) + 10;
    this.curTimeLabel = this.tl
      .append('text')
      .attr('x', xStart)
      .attr('y', timelinePos - 18)
      .text(() => this.toTime(xStart));
    this.currentTime = this.xZoomed.invert(xStart);

    this.isInitialized = true;
  }

  private draw() {
    if (!this.isInitialized) { return; }
    // if (!this.keyframes || this.keyframes.length === 0) { return; }
    const data = this.keyframes;
    const convert = (d: {
      label: string;
      className: string;
      times: Array<{
        start: Date;
      }>;
    }): { [key: number]: { labels: string[] } } => d.times.reduce((p, c) => {
      const t = c.start.valueOf();
      if (p.hasOwnProperty(t)) {
        // p[t].labels.push(d.label);
      } else {
        p[t] = { labels: [d.label] };
      }
      return p;
    }, {});
    const grouped: { [key: number]: { labels: string[] } } = !data ? null : data.reduce((p, c) => {
      const conv = convert(c);
      for (const key in conv) {
        if (!conv.hasOwnProperty(key)) { continue; }
        if (p.hasOwnProperty(key)) {
          p[key].labels.push(...conv[key].labels);
        } else {
          p[key] = { labels: conv[key].labels };
        }
      }
      return p;
    }, {});
    const dc: IKeyframeFormat[] = [];
    for (const key in grouped) {
      if (!grouped.hasOwnProperty(key)) { continue; }
      dc.push({ start: new Date(+key), label: grouped[key].labels });
    }

    const { margin, width, height, timelinePos } = this.initialize();

    const formatTime = d3.timeFormat('%H:%M:%S');
    d3.select('#markers').remove();
    const markers = this.tl
      .append('g')
      .attr('id', 'markers')
      .selectAll('circle')
      .data(dc)
      .enter();
    const circles = markers
      .append('circle')
      .attr('class', 'circle')
      .attr('r', 10)
      .attr('cx', d => this.xZoomed(d.start))
      .attr('cy', timelinePos);
    markers
      .append('text')
      .attr('x', d => this.xZoomed(d.start))
      .attr('y', timelinePos + 5) // 5 == half font height
      .attr('text-anchor', 'middle')
      .text(d => d.label.length < 10 ? d.label.length : '*');
    circles
      .on('mouseover', d => {
        this.tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        this.tooltip.html(formatTime(d.start) + '<br/>' + d.label)
          .style('left', (currentEvent.pageX) + 'px')
          .style('top', (currentEvent.pageY - 50) + 'px');
      })
      .on('mouseout', d => {
        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    const zoomed = () => {
      // view.attr('transform', currentEvent.transform);
      this.xZoomed = currentEvent.transform.rescaleX(this.x);
      this.gX.call(this.xAxis.scale(this.xZoomed));
      // markers.attr('transform', `translate(${currentEvent.transform.x}, 0) scale(${currentEvent.transform.k}, 1)`);
      this.svg
        .selectAll('circle')
        .attr('cx', (d: IKeyframeFormat) => this.xZoomed(d.start));

      this.svg
        .select('#markers')
        .selectAll('text')
        .attr('x', (d: IKeyframeFormat) => this.xZoomed(d.start));

      // Update the position of the curTimeLine, such that, in principle, the display time remains the same when zooming.
      const xNew = Math.max(margin.left, Math.min(width, this.xZoomed(this.currentTime)));
      this.currentTime = this.xZoomed.invert(xNew);
      this.curTimeline
        .attr('x1', xNew)
        .attr('x2', xNew);
      this.curTimeLabel
        .attr('x', xNew + 10)
        .text(() => this.toTime(xNew));
    };
    const zoom = d3.zoom()
      .on('zoom', zoomed) as ZoomBehavior<SVGElement, any>;

    this.svg.call(zoom);
  }

  private multiTimeFormat(date: Date) {
    // Establish the desired formatting options using locale.format():
    // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
    const formatMillisecond = d3.timeFormat('.%L');
    const formatSecond = d3.timeFormat(':%S');
    const formatMinute = d3.timeFormat('%H:%M');
    const formatHour = d3.timeFormat('%H:%M');
    const formatDay = d3.timeFormat('%a %d');
    const formatWeek = d3.timeFormat('%b %d');
    const formatMonth = d3.timeFormat('%B');
    const formatYear = d3.timeFormat('%Y');

    // Define filter conditions
    return (d3.timeSecond(date) < date ? formatMillisecond
      : d3.timeMinute(date) < date ? formatSecond
        : d3.timeHour(date) < date ? formatMinute
          : d3.timeDay(date) < date ? formatHour
            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
              : d3.timeYear(date) < date ? formatMonth
                : formatYear)(date);
  }

}
