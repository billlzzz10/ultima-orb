import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    title?: {
      display?: boolean;
      text?: string;
    };
    legend?: {
      display?: boolean;
      position?: "top" | "bottom" | "left" | "right";
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

export interface ChartConfig {
  type:
    | "line"
    | "bar"
    | "pie"
    | "doughnut"
    | "radar"
    | "polarArea"
    | "bubble"
    | "scatter";
  data: ChartData;
  options?: ChartOptions;
}

export class ChartJSManager {
  private app: App;
  private featureManager: FeatureManager;
  private charts: Map<string, any> = new Map();

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.loadChartJS();
  }

  private async loadChartJS(): Promise<void> {
    try {
      // Load Chart.js from CDN
      if (!(window as any).Chart) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
          new Notice("Chart.js loaded successfully");
        };
        script.onerror = () => {
          new Notice("Error loading Chart.js");
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error("Error loading Chart.js:", error);
    }
  }

  createChart(canvasId: string, config: ChartConfig): any {
    try {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error(`Canvas element with id '${canvasId}' not found`);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get 2D context from canvas");
      }

      const Chart = (window as any).Chart;
      if (!Chart) {
        throw new Error("Chart.js not loaded");
      }

      const chart = new Chart(ctx, config);
      this.charts.set(canvasId, chart);

      new Notice(`Chart '${canvasId}' created successfully`);
      return chart;
    } catch (error) {
      console.error("Error creating chart:", error);
      new Notice("Error creating chart");
      throw error;
    }
  }

  updateChart(canvasId: string, newData: ChartData): void {
    try {
      const chart = this.charts.get(canvasId);
      if (!chart) {
        throw new Error(`Chart '${canvasId}' not found`);
      }

      chart.data = newData;
      chart.update();

      new Notice(`Chart '${canvasId}' updated successfully`);
    } catch (error) {
      console.error("Error updating chart:", error);
      new Notice("Error updating chart");
    }
  }

  destroyChart(canvasId: string): void {
    try {
      const chart = this.charts.get(canvasId);
      if (chart) {
        chart.destroy();
        this.charts.delete(canvasId);
        new Notice(`Chart '${canvasId}' destroyed successfully`);
      }
    } catch (error) {
      console.error("Error destroying chart:", error);
      new Notice("Error destroying chart");
    }
  }

  getChart(canvasId: string): any {
    return this.charts.get(canvasId);
  }

  getAllCharts(): Map<string, any> {
    return new Map(this.charts);
  }

  // Predefined chart configurations
  createLineChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "line",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Line Chart",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "X Axis",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Y Axis",
            },
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createBarChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "bar",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Bar Chart",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Categories",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Values",
            },
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createPieChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "pie",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Pie Chart",
          },
          legend: {
            display: true,
            position: "right",
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createDoughnutChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "doughnut",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Doughnut Chart",
          },
          legend: {
            display: true,
            position: "right",
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createRadarChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "radar",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Radar Chart",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          r: {
            display: true,
            title: {
              display: true,
              text: "Values",
            },
          } as any,
        } as any,
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createPolarAreaChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "polarArea",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Polar Area Chart",
          },
          legend: {
            display: true,
            position: "right",
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createBubbleChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "bubble",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Bubble Chart",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "X Axis",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Y Axis",
            },
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  createScatterChart(
    canvasId: string,
    data: ChartData,
    options?: ChartOptions
  ): any {
    const config: ChartConfig = {
      type: "scatter",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Scatter Chart",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "X Axis",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Y Axis",
            },
          },
        },
        ...options,
      },
    };

    return this.createChart(canvasId, config);
  }

  // Utility methods for data generation
  generateRandomData(labels: string[], datasets: number): ChartData {
    const colors = [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
    ];

    const min = 10;
    const max = 100;
    const datasetsArray: any[] = [];

    for (let i = 0; i < datasets; i++) {
      const data = labels.map(
        () => Math.floor(Math.random() * (max - min + 1)) + min
      );
      datasetsArray.push({
        label: `Dataset ${i + 1}`,
        data,
        backgroundColor: colors[i % colors.length],
        borderColor: colors[i % colors.length].replace("0.8", "1"),
        borderWidth: 2,
        fill: false,
      });
    }

    return {
      labels,
      datasets: datasetsArray,
    };
  }

  generateTimeSeriesData(days: number, datasets: number): ChartData {
    const labels: string[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
    }

    return this.generateRandomData(labels, datasets);
  }

  generateCategoricalData(categories: string[], datasets: number): ChartData {
    return this.generateRandomData(categories, datasets);
  }

  // Export and import chart data
  exportChartData(canvasId: string): string {
    try {
      const chart = this.charts.get(canvasId);
      if (!chart) {
        throw new Error(`Chart '${canvasId}' not found`);
      }

      const exportData = {
        canvasId,
        data: chart.data,
        options: chart.options,
        type: chart.config.type,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting chart data:", error);
      throw error;
    }
  }

  importChartData(exportData: string): any {
    try {
      const data = JSON.parse(exportData);
      const { canvasId, type, data: chartData, options } = data;

      const config: ChartConfig = {
        type: type as any,
        data: chartData,
        options,
      };

      return this.createChart(canvasId, config);
    } catch (error) {
      console.error("Error importing chart data:", error);
      throw error;
    }
  }

  // Chart animation and interaction methods
  animateChart(canvasId: string, animationDuration: number = 1000): void {
    try {
      const chart = this.charts.get(canvasId);
      if (chart) {
        chart.options.animation = {
          duration: animationDuration,
        };
        chart.update();
      }
    } catch (error) {
      console.error("Error animating chart:", error);
    }
  }

  toggleChartVisibility(canvasId: string): void {
    try {
      const chart = this.charts.get(canvasId);
      if (chart) {
        chart.options.plugins.legend.display =
          !chart.options.plugins.legend.display;
        chart.update();
      }
    } catch (error) {
      console.error("Error toggling chart visibility:", error);
    }
  }

  resizeChart(canvasId: string, width: number, height: number): void {
    try {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (canvas) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const chart = this.charts.get(canvasId);
        if (chart) {
          chart.resize();
        }
      }
    } catch (error) {
      console.error("Error resizing chart:", error);
    }
  }
}
