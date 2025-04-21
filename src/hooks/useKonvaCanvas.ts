import { useRef, useState, useEffect } from 'react';
import Konva from 'konva';

interface KonvaCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

interface KonvaCanvasReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  clear: () => void;
  getImage: () => string;
  addLine: (points: number[], strokeWidth: number, color: string) => Konva.Line;
  addText: (text: string, x: number, y: number, fontSize: number, color: string) => Konva.Text;
  addImage: (imageObj: HTMLImageElement, x: number, y: number, width: number, height: number) => Konva.Image;
  addCircle: (x: number, y: number, radius: number, color: string) => Konva.Circle;
  addRect: (x: number, y: number, width: number, height: number, color: string) => Konva.Rect;
  addShape: (config: Konva.ShapeConfig) => Konva.Shape;
  createLayer: () => Konva.Layer;
  removeShape: (shape: Konva.Shape) => void;
}


export const useKonvaCanvas = (options: KonvaCanvasOptions): KonvaCanvasReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const [layer, setLayer] = useState<Konva.Layer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Konva Stage
    const newStage = new Konva.Stage({
      container: containerRef.current,
      width: options.width,
      height: options.height,
    });

    // Create a layer for drawing
    const newLayer = new Konva.Layer();
    newStage.add(newLayer);

    // Add background if specified
    if (options.backgroundColor) {
      const background = new Konva.Rect({
        x: 0,
        y: 0,
        width: options.width,
        height: options.height,
        fill: options.backgroundColor,
      });
      newLayer.add(background);
    }

    setStage(newStage);
    setLayer(newLayer);

    return () => {
      // Clean up
      newStage.destroy();
    };
  }, [options.width, options.height, options.backgroundColor]);

  const clear = () => {
    if (!layer) return;

    // Keep only the background rectangle if it exists
    const children = layer.children || [];
    const background = children[0];

    layer.destroyChildren();

    if (background && options.backgroundColor) {
      layer.add(background);
    }

    layer.draw();
  };

  const getImage = (): string => {
    if (!stage) return '';
    return stage.toDataURL();
  };

  const addLine = (points: number[], strokeWidth: number, color: string): Konva.Line => {
    if (!layer) throw new Error('Layer not initialized');

    const line = new Konva.Line({
      points,
      stroke: color,
      strokeWidth,
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.5,
      draggable: false,
    });

    layer.add(line);
    layer.draw();

    return line;
  };

  const addText = (text: string, x: number, y: number, fontSize: number, color: string): Konva.Text => {
    if (!layer) throw new Error('Layer not initialized');

    const textNode = new Konva.Text({
      x,
      y,
      text,
      fontSize,
      fill: color,
      align: 'center',
    });

    layer.add(textNode);
    layer.draw();

    return textNode;
  };

  const addImage = (imageObj: HTMLImageElement, x: number, y: number, width: number, height: number): Konva.Image => {
    if (!layer) throw new Error('Layer not initialized');

    const image = new Konva.Image({
      x,
      y,
      image: imageObj,
      width,
      height,
    });

    layer.add(image);
    layer.draw();

    return image;
  };

  const addCircle = (x: number, y: number, radius: number, color: string): Konva.Circle => {
    if (!layer) throw new Error('Layer not initialized');

    const circle = new Konva.Circle({
      x,
      y,
      radius,
      fill: color,
    });

    layer.add(circle);
    layer.draw();

    return circle;
  };

  const addRect = (x: number, y: number, width: number, height: number, color: string): Konva.Rect => {
    if (!layer) throw new Error('Layer not initialized');

    const rect = new Konva.Rect({
      x,
      y,
      width,
      height,
      fill: color,
    });

    layer.add(rect);
    layer.draw();

    return rect;
  };

  const addShape = (config: Konva.ShapeConfig): Konva.Shape => {
    if (!layer) throw new Error('Layer not initialized');

    const shape = new Konva.Shape(config);

    layer.add(shape);
    layer.draw();

    return shape;
  };

  const createLayer = (): Konva.Layer => {
    if (!stage) throw new Error('Stage not initialized');

    const newLayer = new Konva.Layer();
    stage.add(newLayer);

    return newLayer;
  };

  const removeShape = (shape: Konva.Shape): void => {
    if (!layer) throw new Error('Layer not initialized');

    shape.destroy();
    layer.draw();
  };

  return {
    containerRef,
    stage,
    layer,
    clear,
    getImage,
    addLine,
    addText,
    addImage,
    addCircle,
    addRect,
    addShape,
    createLayer,
    removeShape,
  };
};
