
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Point {
  x: number;
  y: number;
}

interface PointsDisplayProps {
  points: Point[] | null;
  isLoading: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!points || points.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the shape
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeStyle = 'rgb(59, 130, 246)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = (point.x / 100) * canvas.width;
      const y = (point.y / 100) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Close the path
    if (points.length > 2) {
      const firstPoint = points[0];
      const x = (firstPoint.x / 100) * canvas.width;
      const y = (firstPoint.y / 100) * canvas.height;
      ctx.lineTo(x, y);
    }
    
    ctx.fill();
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = 'rgb(59, 130, 246)';
    points.forEach(point => {
      const x = (point.x / 100) * canvas.width;
      const y = (point.y / 100) * canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען תוצאות...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!points) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>תוצאות הניתוח</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="json">
          <TabsList className="mb-4">
            <TabsTrigger value="visual">תצוגה חזותית</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="pt-2">
            <div className="canvas-container bg-white">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={400}
                className="w-full h-auto"
              ></canvas>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              סה"כ {points.length} נקודות
            </p>
          </TabsContent>
          
          <TabsContent value="json" className="pt-2">
            <div className="points-json">
              <pre>{JSON.stringify({ points }, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;
