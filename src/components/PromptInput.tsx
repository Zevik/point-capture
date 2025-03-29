
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Lightbulb } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // מספר פרומפטים לדוגמה שניתן להשתמש בהם
  const samplePrompts = [
    `זהה את הצורה המרכזית בתמונה וספק רשימה של נקודות (x, y) שמגדירות את קווי המתאר שלה. הפלט חייב להיות במבנה JSON של מערך של אובייקטים עם שדות x ו-y בדיוק. לדוגמה: {"points": [{"x": 10, "y": 20}, {"x": 30, "y": 40}]}. הערכים צריכים להיות בטווח של 0 עד 100.`,
    `אנא זהה את הצורה המרכזית בתמונה וחזור רשימת נקודות בפורמט JSON בלבד. הפורמט המדויק צריך להיות {"points": [{"x": 10, "y": 20}, {"x": 30, "y": 40}]}. הנקודות צריכות להיות ממוספרות בין 0 ל-100 כאשר (0,0) הוא הפינה השמאלית העליונה. אנא כלול 20-100 נקודות שמתארות את קו המתאר של הצורה.`
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="prompt">הנחיה ל-OpenAI:</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const promptIndex = Math.floor(Math.random() * samplePrompts.length);
              setPrompt(samplePrompts[promptIndex]);
            }}
            className="text-xs flex items-center gap-1"
            title="הצע פרומפט לדוגמה"
          >
            <Lightbulb className="h-3 w-3" />
            הצע פרומפט
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-xs flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                הקטן <ArrowUp className="h-3 w-3" />
              </>
            ) : (
              <>
                הרחב <ArrowDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="כתוב כאן את ההנחיה לזיהוי הצורה בתמונה..."
        className={`min-h-[100px] text-right ${isExpanded ? 'min-h-[200px]' : ''}`}
        dir="rtl"
      />
      <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-md">
        <p className="font-medium">טיפים לפרומפט מוצלח:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>בקש במפורש פלט JSON עם מערך בשם 'points' המכיל אובייקטים עם שדות 'x' ו-'y'.</li>
          <li>ציין שערכי הקואורדינטות צריכים להיות בטווח 0-100.</li>
          <li>הגדר כמה נקודות בערך אתה מצפה לקבל (20-100 נקודות הן כמות טובה).</li>
          <li>אם אתה לא מקבל תגובה טובה, נסה להשתמש בכפתור "הצע פרומפט".</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptInput;
