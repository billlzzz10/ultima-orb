import { ToolBase } from "../core/tools/ToolBase";
import { Notice } from "obsidian";

export interface DrawingElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'arrow' | 'polygon' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  points?: { x: number; y: number }[];
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  selected?: boolean;
}

export interface DrawingCanvas {
  id: string;
  name: string;
  elements: DrawingElement[];
  background: string;
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingResult {
  success: boolean;
  canvas?: DrawingCanvas;
  elements?: DrawingElement[];
  error?: string;
  exportData?: string;
}

export class ExcalidrawFeaturesTool extends ToolBase {
  private canvases: Map<string, DrawingCanvas> = new Map();
  private currentCanvas: DrawingCanvas | null = null;
  private selectedElements: Set<string> = new Set();

  constructor() {
    super({
      id: "excalidraw-features",
      name: "Excalidraw Features",
      description: "Drawing and diagramming tool with Excalidraw-like features",
      category: "Visualization",
      icon: "pencil",
      version: "1.0.0",
      author: "Ultima-Orb",
      tags: ["drawing", "diagrams", "visualization", "canvas"]
    });
  }

  async execute(params: any): Promise<DrawingResult> {
    try {
      const { action, ...data } = params;

      switch (action) {
        case 'create_canvas':
          return await this.createCanvas(data);
        case 'add_element':
          return await this.addElement(data);
        case 'update_element':
          return await this.updateElement(data);
        case 'delete_element':
          return await this.deleteElement(data);
        case 'select_elements':
          return await this.selectElements(data);
        case 'export_canvas':
          return await this.exportCanvas(data);
        case 'import_canvas':
          return await this.importCanvas(data);
        case 'save_canvas':
          return await this.saveCanvas(data);
        case 'load_canvas':
          return await this.loadCanvas(data);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async createCanvas(data: { name: string; width?: number; height?: number }): Promise<DrawingResult> {
    const canvas: DrawingCanvas = {
      id: this.generateId(),
      name: data.name || 'Untitled Canvas',
      elements: [],
      background: '#ffffff',
      width: data.width || 1920,
      height: data.height || 1080,
      zoom: 1,
      panX: 0,
      panY: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.canvases.set(canvas.id, canvas);
    this.currentCanvas = canvas;

    new Notice(`Canvas "${canvas.name}" created successfully`);
    
    return {
      success: true,
      canvas
    };
  }

  private async addElement(data: { 
    type: DrawingElement['type']; 
    x: number; 
    y: number; 
    width?: number; 
    height?: number; 
    text?: string; 
    color?: string; 
    strokeWidth?: number; 
    fillColor?: string; 
    points?: { x: number; y: number }[] 
  }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    const element: DrawingElement = {
      id: this.generateId(),
      type: data.type,
      x: data.x,
      y: data.y,
      color: data.color || '#000000',
      strokeWidth: data.strokeWidth || 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      selected: false
    };

    if (data.width) element.width = data.width;
    if (data.height) element.height = data.height;
    if (data.text) element.text = data.text;
    if (data.fillColor) element.fillColor = data.fillColor;
    if (data.points) element.points = data.points;

    this.currentCanvas.elements.push(element);
    this.currentCanvas.updatedAt = new Date();

    new Notice(`Added ${element.type} to canvas`);
    
    return {
      success: true,
      elements: [element]
    };
  }

  private async updateElement(data: { id: string; updates: Partial<DrawingElement> }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    const element = this.currentCanvas.elements.find(el => el.id === data.id);
    if (!element) {
      throw new Error(`Element with id ${data.id} not found`);
    }

    Object.assign(element, data.updates);
    this.currentCanvas.updatedAt = new Date();

    return {
      success: true,
      elements: [element]
    };
  }

  private async deleteElement(data: { id: string }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    const index = this.currentCanvas.elements.findIndex(el => el.id === data.id);
    if (index === -1) {
      throw new Error(`Element with id ${data.id} not found`);
    }

    const deletedElement = this.currentCanvas.elements.splice(index, 1)[0];
    this.currentCanvas.updatedAt = new Date();
    this.selectedElements.delete(data.id);

    if (deletedElement) {
      new Notice(`Deleted ${deletedElement.type}`);
    }
    
    return {
      success: true,
      elements: deletedElement ? [deletedElement] : []
    };
  }

  private async selectElements(data: { ids: string[] }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    // Clear previous selection
    this.currentCanvas.elements.forEach(el => el.selected = false);
    this.selectedElements.clear();

    // Select new elements
    data.ids.forEach(id => {
      const element = this.currentCanvas!.elements.find(el => el.id === id);
      if (element) {
        element.selected = true;
        this.selectedElements.add(id);
      }
    });

    return {
      success: true,
      elements: this.currentCanvas.elements.filter(el => el.selected)
    };
  }

  private async exportCanvas(data: { format?: 'json' | 'svg' | 'png' }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    const format = data.format || 'json';
    
    switch (format) {
      case 'json':
        return {
          success: true,
          exportData: JSON.stringify(this.currentCanvas, null, 2)
        };
      case 'svg':
        return {
          success: true,
          exportData: this.generateSVG(this.currentCanvas)
        };
      case 'png':
        return {
          success: true,
          exportData: await this.generatePNG(this.currentCanvas)
        };
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async importCanvas(data: { content: string; format?: 'json' | 'svg' }): Promise<DrawingResult> {
    const format = data.format || 'json';
    
    try {
      let canvas: DrawingCanvas;
      
      switch (format) {
        case 'json':
          canvas = JSON.parse(data.content);
          break;
        case 'svg':
          canvas = this.parseSVG(data.content);
          break;
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }

      canvas.id = this.generateId();
      canvas.updatedAt = new Date();
      
      this.canvases.set(canvas.id, canvas);
      this.currentCanvas = canvas;

      new Notice(`Canvas "${canvas.name}" imported successfully`);
      
      return {
        success: true,
        canvas
      };
    } catch (error) {
      throw new Error(`Failed to import canvas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async saveCanvas(data: { name?: string }): Promise<DrawingResult> {
    if (!this.currentCanvas) {
      throw new Error("No active canvas");
    }

    if (data.name) {
      this.currentCanvas.name = data.name;
    }

    this.currentCanvas.updatedAt = new Date();
    this.canvases.set(this.currentCanvas.id, this.currentCanvas);

    new Notice(`Canvas "${this.currentCanvas.name}" saved successfully`);
    
    return {
      success: true,
      canvas: this.currentCanvas
    };
  }

  private async loadCanvas(data: { id: string }): Promise<DrawingResult> {
    const canvas = this.canvases.get(data.id);
    if (!canvas) {
      throw new Error(`Canvas with id ${data.id} not found`);
    }

    this.currentCanvas = canvas;
    
    return {
      success: true,
      canvas
    };
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateSVG(canvas: DrawingCanvas): string {
    let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${canvas.background}"/>`;
    
    canvas.elements.forEach(element => {
      switch (element.type) {
        case 'rectangle':
          svg += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fillColor || 'none'}" stroke="${element.color}" stroke-width="${element.strokeWidth}"/>`;
          break;
        case 'circle':
          svg += `<circle cx="${element.x}" cy="${element.y}" r="${element.width || 50}" fill="${element.fillColor || 'none'}" stroke="${element.color}" stroke-width="${element.strokeWidth}"/>`;
          break;
        case 'line':
          if (element.points && element.points.length >= 2) {
            const points = element.points.map(p => `${p.x},${p.y}`).join(' ');
            svg += `<polyline points="${points}" fill="none" stroke="${element.color}" stroke-width="${element.strokeWidth}"/>`;
          }
          break;
        case 'text':
          svg += `<text x="${element.x}" y="${element.y}" fill="${element.color}" font-size="16">${element.text || ''}</text>`;
          break;
        case 'arrow':
          if (element.points && element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            if (start && end) {
              svg += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${element.color}" stroke-width="${element.strokeWidth}" marker-end="url(#arrowhead)"/>`;
            }
          }
          break;
      }
    });
    
    svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${canvas.elements[0]?.color || '#000000'}"/></marker></defs>`;
    svg += '</svg>';
    
    return svg;
  }

  private async generatePNG(canvas: DrawingCanvas): Promise<string> {
    // This would require canvas API or external library
    // For now, return SVG as base64
    const svg = this.generateSVG(canvas);
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private parseSVG(svgContent: string): DrawingCanvas {
    // Basic SVG parsing - would need more sophisticated implementation
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) {
      throw new Error('Invalid SVG content');
    }

    const canvas: DrawingCanvas = {
      id: this.generateId(),
      name: 'Imported Canvas',
      elements: [],
      background: '#ffffff',
      width: parseInt(svg.getAttribute('width') || '1920'),
      height: parseInt(svg.getAttribute('height') || '1080'),
      zoom: 1,
      panX: 0,
      panY: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Parse SVG elements (simplified)
    const rects = svg.querySelectorAll('rect');
    rects.forEach(rect => {
      const element: DrawingElement = {
        id: this.generateId(),
        type: 'rectangle',
        x: parseFloat(rect.getAttribute('x') || '0'),
        y: parseFloat(rect.getAttribute('y') || '0'),
        width: parseFloat(rect.getAttribute('width') || '100'),
        height: parseFloat(rect.getAttribute('height') || '100'),
        color: rect.getAttribute('stroke') || '#000000',
        strokeWidth: parseFloat(rect.getAttribute('stroke-width') || '2'),
        rotation: 0,
        opacity: 1,
        locked: false,
        selected: false
      };
      const fillColor = rect.getAttribute('fill');
      if (fillColor) {
        element.fillColor = fillColor;
      }
      canvas.elements.push(element);
    });

    return canvas;
  }

  // Canvas management
  getCanvases(): DrawingCanvas[] {
    return Array.from(this.canvases.values());
  }

  getCurrentCanvas(): DrawingCanvas | null {
    return this.currentCanvas;
  }

  getSelectedElements(): DrawingElement[] {
    if (!this.currentCanvas) return [];
    return this.currentCanvas.elements.filter(el => el.selected);
  }

  // Drawing tools
  getDrawingTools() {
    return {
      // Shape tools
      rectangle: (x: number, y: number, width: number, height: number, color?: string) => {
        const options: any = { type: 'rectangle', x, y, width, height };
        if (color) options.color = color;
        return this.addElement(options);
      },
      
      circle: (x: number, y: number, radius: number, color?: string) => {
        const options: any = { type: 'circle', x, y, width: radius };
        if (color) options.color = color;
        return this.addElement(options);
      },
      
      line: (points: { x: number; y: number }[], color?: string) => {
        const originX = points && points.length > 0 ? points[0].x : 0;
        const originY = points && points.length > 0 ? points[0].y : 0;
        const options: any = { type: 'line', x: originX, y: originY, points };
        if (color) options.color = color;
        return this.addElement(options);
      },
      
      arrow: (start: { x: number; y: number }, end: { x: number; y: number }, color?: string) => {
        const options: any = { type: 'arrow', x: 0, y: 0, points: [start, end] };
        if (color) options.color = color;
        return this.addElement(options);
      },
      
      text: (x: number, y: number, text: string, color?: string) => {
        const options: any = { type: 'text', x, y, text };
        if (color) options.color = color;
        return this.addElement(options);
      },
      
      // Selection tools
      selectAll: () => {
        if (!this.currentCanvas) return;
        const ids = this.currentCanvas.elements.map(el => el.id);
        this.selectElements({ ids });
      },
      
      deselectAll: () => {
        this.selectElements({ ids: [] });
      },
      
      // Transform tools
      moveElements: (ids: string[], dx: number, dy: number) => {
        ids.forEach(id => {
          this.updateElement({ id, updates: { x: dx, y: dy } });
        });
      },
      
      resizeElement: (id: string, width: number, height: number) => {
        this.updateElement({ id, updates: { width, height } });
      },
      
      rotateElement: (id: string, rotation: number) => {
        this.updateElement({ id, updates: { rotation } });
      },
      
      // Style tools
      changeColor: (ids: string[], color: string) => {
        ids.forEach(id => {
          this.updateElement({ id, updates: { color } });
        });
      },
      
      changeStrokeWidth: (ids: string[], strokeWidth: number) => {
        ids.forEach(id => {
          this.updateElement({ id, updates: { strokeWidth } });
        });
      },
      
      changeFillColor: (ids: string[], fillColor: string) => {
        ids.forEach(id => {
          this.updateElement({ id, updates: { fillColor } });
        });
      }
    };
  }
}
