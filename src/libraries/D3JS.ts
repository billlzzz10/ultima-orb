import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export interface D3Data {
  id: string;
  value: number;
  label: string;
  category?: string;
  color?: string;
  children?: D3Data[];
}

export interface D3Config {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: string[];
  animation: boolean;
  duration: number;
}

export interface D3Chart {
  id: string;
  type: string;
  element: HTMLElement;
  data: D3Data[];
  config: D3Config;
  svg: any;
  update: (data: D3Data[]) => void;
  destroy: () => void;
}

export class D3JSManager {
  private app: App;
  private featureManager: FeatureManager;
  private charts: Map<string, D3Chart> = new Map();
  private d3: any;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.loadD3JS();
  }

  private async loadD3JS(): Promise<void> {
    try {
      // Load D3.js from CDN
      if (typeof window !== "undefined" && !(window as any).d3) {
        const script = document.createElement("script");
        script.src = "https://d3js.org/d3.v7.min.js";
        script.onload = () => {
          this.d3 = (window as any).d3;
          new Notice("D3.js loaded successfully");
        };
        script.onerror = () => {
          new Notice("Failed to load D3.js");
        };
        document.head.appendChild(script);
      } else {
        this.d3 = (window as any).d3;
      }
    } catch (error) {
      new Notice(`Failed to load D3.js: ${error}`);
    }
  }

  private getDefaultConfig(): D3Config {
    return {
      width: 800,
      height: 600,
      margin: { top: 20, right: 20, bottom: 30, left: 40 },
      colors: [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ],
      animation: true,
      duration: 750,
    };
  }

  createBarChart(
    containerId: string,
    data: D3Data[],
    config?: Partial<D3Config>
  ): D3Chart {
    if (!this.d3) {
      throw new Error("D3.js not loaded");
    }

    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear container
    container.innerHTML = "";

    // Create SVG
    const svg = this.d3
      .select(container)
      .append("svg")
      .attr("width", fullConfig.width)
      .attr("height", fullConfig.height);

    const chartWidth =
      fullConfig.width - fullConfig.margin.left - fullConfig.margin.right;
    const chartHeight =
      fullConfig.height - fullConfig.margin.top - fullConfig.margin.bottom;

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${fullConfig.margin.left},${fullConfig.margin.top})`
      );

    // Scales
    const xScale = this.d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = this.d3
      .scaleLinear()
      .domain([0, this.d3.max(data, (d: D3Data) => d.value)])
      .range([chartHeight, 0]);

    // Axes
    const xAxis = this.d3.axisBottom(xScale);
    const yAxis = this.d3.axisLeft(yScale);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    chart.append("g").call(yAxis);

    // Bars
    const bars = chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d: D3Data) => xScale(d.label))
      .attr("y", (d: D3Data) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d: D3Data) => chartHeight - yScale(d.value))
      .attr(
        "fill",
        (d: D3Data, i: number) =>
          d.color || fullConfig.colors[i % fullConfig.colors.length]
      );

    // Labels
    chart
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d: D3Data) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d: D3Data) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d: D3Data) => d.value);

    const chartObj: D3Chart = {
      id: containerId,
      type: "bar",
      element: container,
      data: data,
      config: fullConfig,
      svg: svg,
      update: (newData: D3Data[]) => this.updateBarChart(chartObj, newData),
      destroy: () => this.destroyChart(containerId),
    };

    this.charts.set(containerId, chartObj);
    return chartObj;
  }

  createLineChart(
    containerId: string,
    data: D3Data[],
    config?: Partial<D3Config>
  ): D3Chart {
    if (!this.d3) {
      throw new Error("D3.js not loaded");
    }

    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear container
    container.innerHTML = "";

    // Create SVG
    const svg = this.d3
      .select(container)
      .append("svg")
      .attr("width", fullConfig.width)
      .attr("height", fullConfig.height);

    const chartWidth =
      fullConfig.width - fullConfig.margin.left - fullConfig.margin.right;
    const chartHeight =
      fullConfig.height - fullConfig.margin.top - fullConfig.margin.bottom;

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${fullConfig.margin.left},${fullConfig.margin.top})`
      );

    // Scales
    const xScale = this.d3
      .scalePoint()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth]);

    const yScale = this.d3
      .scaleLinear()
      .domain([0, this.d3.max(data, (d: D3Data) => d.value)])
      .range([chartHeight, 0]);

    // Line generator
    const line = this.d3
      .line()
      .x((d: D3Data) => xScale(d.label))
      .y((d: D3Data) => yScale(d.value))
      .curve(this.d3.curveMonotoneX);

    // Axes
    const xAxis = this.d3.axisBottom(xScale);
    const yAxis = this.d3.axisLeft(yScale);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    chart.append("g").call(yAxis);

    // Line path
    chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", fullConfig.colors[0])
      .attr("stroke-width", 2)
      .attr("d", line);

    // Data points
    chart
      .selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d: D3Data) => xScale(d.label))
      .attr("cy", (d: D3Data) => yScale(d.value))
      .attr("r", 4)
      .attr("fill", fullConfig.colors[0]);

    const chartObj: D3Chart = {
      id: containerId,
      type: "line",
      element: container,
      data: data,
      config: fullConfig,
      svg: svg,
      update: (newData: D3Data[]) => this.updateLineChart(chartObj, newData),
      destroy: () => this.destroyChart(containerId),
    };

    this.charts.set(containerId, chartObj);
    return chartObj;
  }

  createPieChart(
    containerId: string,
    data: D3Data[],
    config?: Partial<D3Config>
  ): D3Chart {
    if (!this.d3) {
      throw new Error("D3.js not loaded");
    }

    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear container
    container.innerHTML = "";

    // Create SVG
    const svg = this.d3
      .select(container)
      .append("svg")
      .attr("width", fullConfig.width)
      .attr("height", fullConfig.height);

    const radius = Math.min(fullConfig.width, fullConfig.height) / 2 - 40;

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${fullConfig.width / 2},${fullConfig.height / 2})`
      );

    // Pie generator
    const pie = this.d3.pie().value((d: D3Data) => d.value);

    const arc = this.d3.arc().innerRadius(0).outerRadius(radius);

    // Create pie slices
    const slices = chart
      .selectAll(".slice")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "slice");

    slices
      .append("path")
      .attr("d", arc)
      .attr(
        "fill",
        (d: any, i: number) =>
          d.data.color || fullConfig.colors[i % fullConfig.colors.length]
      );

    // Add labels
    slices
      .append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.label);

    const chartObj: D3Chart = {
      id: containerId,
      type: "pie",
      element: container,
      data: data,
      config: fullConfig,
      svg: svg,
      update: (newData: D3Data[]) => this.updatePieChart(chartObj, newData),
      destroy: () => this.destroyChart(containerId),
    };

    this.charts.set(containerId, chartObj);
    return chartObj;
  }

  createTreeMap(
    containerId: string,
    data: D3Data[],
    config?: Partial<D3Config>
  ): D3Chart {
    if (!this.d3) {
      throw new Error("D3.js not loaded");
    }

    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear container
    container.innerHTML = "";

    // Create SVG
    const svg = this.d3
      .select(container)
      .append("svg")
      .attr("width", fullConfig.width)
      .attr("height", fullConfig.height);

    const chartWidth =
      fullConfig.width - fullConfig.margin.left - fullConfig.margin.right;
    const chartHeight =
      fullConfig.height - fullConfig.margin.top - fullConfig.margin.bottom;

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${fullConfig.margin.left},${fullConfig.margin.top})`
      );

    // Hierarchical data
    const root = this.d3
      .stratify()
      .id((d: D3Data) => d.id)
      .parentId((d: D3Data) => d.category)(data);

    // Treemap layout
    const treemap = this.d3
      .treemap()
      .size([chartWidth, chartHeight])
      .padding(1);

    treemap(root);

    // Create rectangles
    const nodes = chart
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr(
        "fill",
        (d: any, i: number) =>
          d.data.color || fullConfig.colors[i % fullConfig.colors.length]
      );

    // Add labels
    nodes
      .append("text")
      .attr("x", 3)
      .attr("y", 15)
      .text((d: any) => d.data.label);

    const chartObj: D3Chart = {
      id: containerId,
      type: "treemap",
      element: container,
      data: data,
      config: fullConfig,
      svg: svg,
      update: (newData: D3Data[]) => this.updateTreeMap(chartObj, newData),
      destroy: () => this.destroyChart(containerId),
    };

    this.charts.set(containerId, chartObj);
    return chartObj;
  }

  private updateBarChart(chart: D3Chart, newData: D3Data[]): void {
    if (!this.d3) return;

    const chartGroup = chart.svg.select("g");
    const chartWidth =
      chart.config.width - chart.config.margin.left - chart.config.margin.right;
    const chartHeight =
      chart.config.height -
      chart.config.margin.top -
      chart.config.margin.bottom;

    // Update scales
    const xScale = this.d3
      .scaleBand()
      .domain(newData.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = this.d3
      .scaleLinear()
      .domain([0, this.d3.max(newData, (d: D3Data) => d.value)])
      .range([chartHeight, 0]);

    // Update bars
    const bars = chartGroup.selectAll(".bar").data(newData);

    bars.exit().remove();

    const newBars = bars.enter().append("rect").attr("class", "bar");

    bars
      .merge(newBars)
      .attr("x", (d: D3Data) => xScale(d.label))
      .attr("y", (d: D3Data) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d: D3Data) => chartHeight - yScale(d.value))
      .attr(
        "fill",
        (d: D3Data, i: number) =>
          d.color || chart.config.colors[i % chart.config.colors.length]
      );

    chart.data = newData;
  }

  private updateLineChart(chart: D3Chart, newData: D3Data[]): void {
    if (!this.d3) return;

    const chartGroup = chart.svg.select("g");
    const chartWidth =
      chart.config.width - chart.config.margin.left - chart.config.margin.right;
    const chartHeight =
      chart.config.height -
      chart.config.margin.top -
      chart.config.margin.bottom;

    // Update scales
    const xScale = this.d3
      .scalePoint()
      .domain(newData.map((d) => d.label))
      .range([0, chartWidth]);

    const yScale = this.d3
      .scaleLinear()
      .domain([0, this.d3.max(newData, (d: D3Data) => d.value)])
      .range([chartHeight, 0]);

    // Update line
    const line = this.d3
      .line()
      .x((d: D3Data) => xScale(d.label))
      .y((d: D3Data) => yScale(d.value))
      .curve(this.d3.curveMonotoneX);

    chartGroup.select("path").datum(newData).attr("d", line);

    // Update points
    const points = chartGroup.selectAll(".point").data(newData);

    points.exit().remove();

    const newPoints = points.enter().append("circle").attr("class", "point");

    points
      .merge(newPoints)
      .attr("cx", (d: D3Data) => xScale(d.label))
      .attr("cy", (d: D3Data) => yScale(d.value))
      .attr("r", 4)
      .attr("fill", chart.config.colors[0]);

    chart.data = newData;
  }

  private updatePieChart(chart: D3Chart, newData: D3Data[]): void {
    if (!this.d3) return;

    const chartGroup = chart.svg.select("g");
    const radius = Math.min(chart.config.width, chart.config.height) / 2 - 40;

    // Update pie generator
    const pie = this.d3.pie().value((d: D3Data) => d.value);

    const arc = this.d3.arc().innerRadius(0).outerRadius(radius);

    // Update slices
    const slices = chartGroup.selectAll(".slice").data(pie(newData));

    slices.exit().remove();

    const newSlices = slices.enter().append("g").attr("class", "slice");

    newSlices.append("path");
    newSlices.append("text");

    slices
      .merge(newSlices)
      .select("path")
      .attr("d", arc)
      .attr(
        "fill",
        (d: any, i: number) =>
          d.data.color || chart.config.colors[i % chart.config.colors.length]
      );

    slices
      .merge(newSlices)
      .select("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.label);

    chart.data = newData;
  }

  private updateTreeMap(chart: D3Chart, newData: D3Data[]): void {
    if (!this.d3) return;

    const chartGroup = chart.svg.select("g");
    const chartWidth =
      chart.config.width - chart.config.margin.left - chart.config.margin.right;
    const chartHeight =
      chart.config.height -
      chart.config.margin.top -
      chart.config.margin.bottom;

    // Update hierarchical data
    const root = this.d3
      .stratify()
      .id((d: D3Data) => d.id)
      .parentId((d: D3Data) => d.category)(newData);

    // Update treemap layout
    const treemap = this.d3
      .treemap()
      .size([chartWidth, chartHeight])
      .padding(1);

    treemap(root);

    // Update nodes
    const nodes = chartGroup.selectAll(".node").data(root.descendants());

    nodes.exit().remove();

    const newNode = nodes.enter().append("g").attr("class", "node");

    newNode.append("rect");
    newNode.append("text");

    nodes
      .merge(newNode)
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    nodes
      .merge(newNode)
      .select("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr(
        "fill",
        (d: any, i: number) =>
          d.data.color || chart.config.colors[i % chart.config.colors.length]
      );

    nodes
      .merge(newNode)
      .select("text")
      .attr("x", 3)
      .attr("y", 15)
      .text((d: any) => d.data.label);

    chart.data = newData;
  }

  destroyChart(containerId: string): void {
    const chart = this.charts.get(containerId);
    if (chart) {
      chart.element.innerHTML = "";
      this.charts.delete(containerId);
    }
  }

  getChart(containerId: string): D3Chart | undefined {
    return this.charts.get(containerId);
  }

  getAllCharts(): Map<string, D3Chart> {
    return this.charts;
  }

  // Utility methods
  generateRandomData(
    count: number,
    categories: string[] = ["A", "B", "C", "D", "E"]
  ): D3Data[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 100,
      label: `Item ${i + 1}`,
      category: categories[i % categories.length],
      color:
        this.getDefaultConfig().colors[
          i % this.getDefaultConfig().colors.length
        ],
    }));
  }

  generateTimeSeriesData(days: number): D3Data[] {
    const data: D3Data[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      data.push({
        id: `day-${i}`,
        value: Math.random() * 100,
        label: date.toLocaleDateString(),
        category: "time-series",
      });
    }

    return data;
  }

  exportChartData(containerId: string): string {
    const chart = this.charts.get(containerId);
    if (!chart) {
      throw new Error(`Chart ${containerId} not found`);
    }
    return JSON.stringify(chart.data, null, 2);
  }

  importChartData(exportData: string): D3Data[] {
    return JSON.parse(exportData);
  }

  animateChart(containerId: string, animationDuration: number = 1000): void {
    const chart = this.charts.get(containerId);
    if (!chart || !this.d3) return;

    // Add animation to chart elements
    chart.svg
      .selectAll("*")
      .transition()
      .duration(animationDuration)
      .ease(this.d3.easeLinear);
  }

  resizeChart(containerId: string, width: number, height: number): void {
    const chart = this.charts.get(containerId);
    if (!chart) return;

    chart.config.width = width;
    chart.config.height = height;

    chart.svg.attr("width", width).attr("height", height);

    // Re-render chart
    chart.update(chart.data);
  }
}
