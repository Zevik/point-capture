
import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ImageUpload from '@/components/ImageUpload';
import PromptInput from '@/components/PromptInput';
import PointsDisplay from '@/components/PointsDisplay';
import { analyzeImageWithOpenAI, Point } from '@/services/openai';

const Index = () => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>(
    'זהה את הצורה המרכזית בתמונה וספק רשימה של עד 100 נקודות (קואורדינטות x, y) שמגדירות את קווי המתאר שלה. הפלט צריך להיות במבנה JSON של מערך של אובייקטים עם שדות "x" ו-"y". הנקודות צריכות להיות מנורמלות לטווח של 0 עד 100 עבור שני הצירים.'
  );
  const [points, setPoints] = useState<Point[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleImageUpload = (file: File, base64: string) => {
    setImageFile(file);
    setImageBase64(base64);
    setPoints(null);
  };

  const handleAnalyzeImage = async () => {
    if (!imageBase64) {
      toast({
        title: "שגיאה",
        description: "יש להעלות תמונה תחילה",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "שגיאה",
        description: "יש להזין מפתח API של OpenAI",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setPoints(null);

    try {
      const pointsData = await analyzeImageWithOpenAI(imageBase64, prompt, apiKey);
      setPoints(pointsData);
      toast({
        title: "הצליח!",
        description: `זוהו ${pointsData.length} נקודות בתמונה`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "שגיאה בניתוח התמונה",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">מחלץ נקודות מתמונה</h1>
        <p className="text-muted-foreground">
          העלה תמונה וקבל את הקואורדינטות של הצורה המרכזית בה
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>העלאת תמונה והגדרות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onImageUpload={handleImageUpload} />

            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium">
                מפתח API של OpenAI
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="text-right"
              />
            </div>

            <PromptInput prompt={prompt} setPrompt={setPrompt} />

            <Button 
              onClick={handleAnalyzeImage} 
              disabled={!imageBase64 || !apiKey || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "מנתח..." : "נתח תמונה"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <PointsDisplay points={points} isLoading={isAnalyzing} />
        </div>
      </div>
    </Container>
  );
};

export default Index;
