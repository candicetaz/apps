import { useEffect, useRef } from 'react';
import { Eraser } from 'lucide-react';

interface FreehandCanvasProps {
  /** Freezes the drawing and hides Clear once the answer is revealed, so
   * the student's attempt stays as-is instead of being editable. */
  readOnly?: boolean;
}

/**
 * A plain freehand scratch-pad — no stroke validation, no grading, no
 * character guide (that would give away the answer before it's revealed).
 * Somewhere to write the word out by hand while thinking, on every card,
 * whether it's a single word or a whole sentence.
 */
export function FreehandCanvas({ readOnly = false }: FreehandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function strokeColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-dark').trim() || '#4353c7';
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (readOnly) return;
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (readOnly || !drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;
    const point = getPoint(e);
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  return (
    <div className="write-canvas-wrap">
      <canvas
        ref={canvasRef}
        className={`write-canvas ${readOnly ? 'write-canvas-readonly' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {!readOnly && (
        <button type="button" className="btn btn-ghost write-canvas-clear" onClick={clearCanvas}>
          <Eraser size={16} aria-hidden="true" /> Clear
        </button>
      )}
    </div>
  );
}
