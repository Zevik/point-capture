
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
          className="text-xs"
        >
          {isExpanded ? "הסתר" : "הרחב"}
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
    </div>
  );
};

export default PromptInput;
