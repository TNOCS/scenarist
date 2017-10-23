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

@autoinject
export class AureliaD3TimelineCustomElement {
  public title = 'Timeline';
  @bindable public width: string;
  @bindable public height: string;
  @bindable public startTime: string;
  @bindable public endTime: string;
  @bindable public keyframes: IKeyframe[];

  private isInitialized = false;
  private svg: any;
  private tl: any;
  private x: any;
  private xZoomed: any;
  private gX: any;
  private xAxis: any;
  private line: any;
  private tooltip: any;

  constructor(private el: Element) { }

  // public created() {
  //   console.log('created');
  // }

  public attached() {
    this.drawBase();
    this.draw();
  }

  public keyframesChanged(newKeyframes: IKeyframe[], oldKeyframes: IKeyframe[]) {
    this.draw();
  }

  private initialize() {
    const margin = { top: 20, bottom: 20, left: 20, right: 20 };
    const width = +this.width - margin.left - margin.right;
    const height = +this.height - margin.top - margin.bottom;
    const timelinePos = height - 20;
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
      .attr('width', +this.width)
      .attr('height', +this.height);

    const extraRange = Math.round((endTime - startTime) / 40);
    this.x = d3.scaleTime()
      .domain([startTime - extraRange, endTime + extraRange])
      .range([0, width]);
    this.xZoomed = this.x;

    this.svg.append('clipPath')
      .attr('id', 'rect-clip')
      .append('rect')
      .attr('x', 0)
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
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

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
    const dc: Array<{ start: Date, label: string[] }> = [];
    for (const key in grouped) {
      if (!grouped.hasOwnProperty(key)) { continue; }
      dc.push({ start: new Date(+key), label: grouped[key].labels });
    }

    const earliest = (times: Array<{ start: Date }>) => times.reduce((p, c) => p.start < c.start ? p : c).start;
    const latest = (times: Array<{ start: Date, end?: Date }>) => {
      const t = times.reduce((p, c) => (p.end || p.start) > (c.end || c.start) ? p : c);
      return t.end || t.start;
    };
    const startTime = this.startTime
      ? Date.parse(this.startTime)
      : data.reduce((p, c) => {
        const t = earliest(c.times);
        return p < t ? p : t;
      }, earliest(data[0].times)).valueOf();
    const endTime = this.endTime
      ? Date.parse(this.endTime)
      : data.reduce((p, c) => {
        const t = latest(c.times);
        return p < t ? p : t;
      }, latest(data[0].times)).valueOf();

    const { margin, width, height, timelinePos } = this.initialize();

    const resetted = () => {
      this.svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    };

    // d3.select(this.el).select('svg').remove();
    // const svg = d3
    //   .select(this.el)
    //   .append('svg')
    //   .attr('width', +this.width)
    //   .attr('height', +this.height);

    // const extraRange = Math.round((endTime - startTime) / 40);
    // const x = d3.scaleTime()
    //   .domain([startTime - extraRange, endTime + extraRange])
    //   .range([0, width]);

    // svg.append('clipPath')
    //   .attr('id', 'rect-clip')
    //   .append('rect')
    //   .attr('x', 0)
    //   .attr('y', margin.top)
    //   .attr('width', width)
    //   .attr('height', height)
    //   .attr('clip-path', 'url(#ellipse-clip)')
    //   .attr('fill', 'SteelBlue');

    // const tl = svg
    //   .append('g')
    //   .attr('transform', `translate(${margin.left}, ${margin.top})`)
    //   .attr('clip-path', 'url(#rect-clip)') as Selection<SVGElement, any, HTMLDivElement, any>;

    // const line = tl
    //   .append('line')
    //   .attr('class', 'timeline')
    //   .attr('x1', 0)
    //   .attr('y1', timelinePos)
    //   .attr('x2', width)
    //   .attr('y2', timelinePos);

    // // Define the div for the tooltip
    // const tooltip = d3.select('body')
    //   .append('div')
    //   .attr('class', 'tooltip')
    //   .style('opacity', 0);

    const formatTime = d3.timeFormat('%H:%M:%S');
    d3.selectAll('circle').remove();
    const markers = this.tl
      .append('g')
      .selectAll('circle')
      .data(dc)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('r', 10)
      .attr('cx', d => this.xZoomed(d.start))
      .attr('cy', timelinePos)
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

    const drag = d3.drag()
      // .on('dragstart', null)
      .on('drag', (d) => {
        const dx = currentEvent.dx; // this will give the delta x moved by drag
        const x1New = +curTimeline.attr('x1') + dx;
        const x2New = +curTimeline.attr('x2') + dx;
        curTimeline
          .attr('x1', x1New)
          .attr('x2', x2New);
      });
    // .on('dragend', null);

    const curTimeline = this.tl
      .append('line')
      .attr('class', 'active-time')
      .attr('x1', Math.round(width / 2))
      .attr('y1', timelinePos - 30)
      .attr('x2', Math.round(width / 2))
      .attr('y2', timelinePos + 10)
      .call(drag);

    // this.xAxis = d3.axisBottom(this.x)
    //   .ticks(width / 100)
    //   .tickFormat(this.multiTimeFormat);

    // // const view = svg.append('rect')
    // //   .attr('class', 'view')
    // //   .attr('x', 0.5)
    // //   .attr('y', 0.5)
    // //   .attr('width', width - 1)
    // //   .attr('height', height - 1);

    // const gX = this.tl.append('g')
    //   .attr('class', 'axis axis-x')
    //   .attr('transform', `translate(0, ${height})`)
    //   .call(this.xAxis);

    // d3.select('button')
    //   .on('click', resetted);

    const zoomed = () => {
      // view.attr('transform', currentEvent.transform);
      this.xZoomed = currentEvent.transform.rescaleX(this.x);
      this.gX.call(this.xAxis.scale(this.xZoomed));
      // markers.attr('transform', `translate(${currentEvent.transform.x}, 0) scale(${currentEvent.transform.k}, 1)`);
      this.svg
        .selectAll('circle')
        .attr('cx', d => this.xZoomed(d.start));
    };
    const zoom = d3.zoom()
      // .scaleExtent([1, 40])
      // .translateExtent([[-100, -100], [width + 90, height + 100]])
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
