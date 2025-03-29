
import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Save } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import PromptInput from '@/components/PromptInput';
import PointsDisplay from '@/components/PointsDisplay';
import { analyzeImageWithOpenAI, Point } from '@/services/openai';

const API_KEY_STORAGE_KEY = 'openai_api_key';

const Index = () => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyStored, setIsApiKeyStored] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(
    'זהה את הצורה המרכזית בתמונה וספק רשימה של נקודות (קואורדינטות x, y) שמגדירות את קווי המתאר שלה. הפלט צריך להיות במבנה JSON של מערך של אובייקטים כאשר כל אובייקט מכיל שדות "x" ו-"y". לדוגמה: {"points":[{"x":10,"y":20},{"x":30,"y":40}]}. הנקודות צריכות להיות מנורמלות לטווח של 0 עד 100 עבור שני הצירים כאשר (0,0) הוא הפינה השמאלית העליונה ו-(100,100) היא הפינה הימנית התחתונה של התמונה.'
  );
  const [points, setPoints] = useState<Point[] | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // בדיקה אם יש מפתח API שמור בלוקל סטורג'
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeyStored(true);
    }
  }, []);

  const handleImageUpload = (file: File, base64: string) => {
    setImageFile(file);
    setImageBase64(base64);
    setPoints(null);
    setRawContent(null);
    setErrorMessage(null);
  };

  const handleApiKeySave = () => {
    if (!apiKey) {
      toast({
        title: "שגיאה",
        description: "יש להזין מפתח API תחילה",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    setIsApiKeyStored(true);
    
    toast({
      title: "בוצע בהצלחה",
      description: "מפתח ה-API נשמר בהצלחה",
    });
  };

  const handleToggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const handleEditApiKey = () => {
    setIsApiKeyStored(false);
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
    setRawContent(null);
    setErrorMessage(null);

    try {
      const result = await analyzeImageWithOpenAI(imageBase64, prompt, apiKey);
      
      // שמירת התוכן המקורי להצגה
      setRawContent(result.rawContent);
      
      if (result.points.length === 0) {
        setErrorMessage("לא זוהו נקודות בתמונה. נסה שוב עם פרומפט אחר.");
        toast({
          title: "אין נקודות",
          description: "לא זוהו נקודות בתמונה. נסה שוב עם פרומפט אחר.",
          variant: "destructive",
        });
      } else {
        setPoints(result.points);
        toast({
          title: "הצליח!",
          description: `זוהו ${result.points.length} נקודות בתמונה`,
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMsg = (error as Error).message;
      setErrorMessage(errorMsg);
      toast({
        title: "שגיאה בניתוח התמונה",
        description: errorMsg,
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
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>העלאת תמונה והגדרות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onImageUpload={handleImageUpload} />

            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium">
                מפתח API של OpenAI
              </label>
              
              {isApiKeyStored ? (
                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="text-right flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleApiKeyVisibility}
                    type="button"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" onClick={handleEditApiKey}>
                    ערוך
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="text-right flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleApiKeyVisibility}
                    type="button"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleApiKeySave}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    שמור
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">המפתח נשמר רק בדפדפן שלך ולא נשלח לשרת</p>
            </div>

            <PromptInput prompt={prompt} setPrompt={setPrompt} />

            <Button 
              onClick={handleAnalyzeImage} 
              disabled={!imageBase64 || !apiKey || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "מנתח..." : "נתח תמונה"}
            </Button>
            
            {errorMessage && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <strong>שגיאה בניתוח התמונה:</strong> {errorMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <PointsDisplay 
            points={points} 
            rawContent={rawContent}
            isLoading={isAnalyzing} 
          />
        </div>
      </div>
    </Container>
  );
};

export default Index;
