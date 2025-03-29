
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="prompt">הנחיה ל-OpenAI:</Label>
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="כתוב כאן את ההנחיה לזיהוי הצורה בתמונה..."
        className="min-h-[100px] text-right"
        dir="rtl"
      />
    </div>
  );
};

export default PromptInput;
