
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="prompt">הנחיה ל-OpenAI:</Label>
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
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="כתוב כאן את ההנחיה לזיהוי הצורה בתמונה..."
        className={`min-h-[100px] text-right ${isExpanded ? 'min-h-[200px]' : ''}`}
        dir="rtl"
      />
      <p className="text-xs text-gray-500">
        דוגמה: "זהה את הצורה המרכזית בתמונה וספק רשימה של עד 100 נקודות (x, y) שמגדירות את קווי המתאר שלה. הפלט חייב להיות במבנה JSON של מערך של אובייקטים עם שדות x ו-y. הערכים צריכים להיות בטווח של 0 עד 100."
      </p>
    </div>
  );
};

export default PromptInput;
