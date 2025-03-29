
export interface Point {
  x: number;
  y: number;
}

export async function analyzeImageWithOpenAI(
  imageBase64: string,
  prompt: string,
  apiKey: string
): Promise<Point[]> {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const requestBody = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // משופר: ניסיון לחלץ JSON מהתוכן
    try {
      // חיפוש מחרוזת JSON בתוכן
      console.log("Raw content from OpenAI:", content);
      
      // נסה להסיר את כל מה שלא שייך ל-JSON
      let jsonString = content;
      
      // חפש תחילת מערך
      const arrayStartIndex = content.indexOf('[');
      // חפש תחילת אובייקט
      const objectStartIndex = content.indexOf('{');
      
      if (arrayStartIndex !== -1 && (objectStartIndex === -1 || arrayStartIndex < objectStartIndex)) {
        // המערך מתחיל לפני האובייקט או שאין אובייקט
        const arrayEndIndex = content.lastIndexOf(']') + 1;
        if (arrayEndIndex > arrayStartIndex) {
          jsonString = content.substring(arrayStartIndex, arrayEndIndex);
        }
      } else if (objectStartIndex !== -1) {
        // האובייקט מתחיל לפני המערך או שאין מערך
        const objectEndIndex = content.lastIndexOf('}') + 1;
        if (objectEndIndex > objectStartIndex) {
          jsonString = content.substring(objectStartIndex, objectEndIndex);
        }
      }
      
      console.log("Extracted JSON string:", jsonString);
      
      let points: Point[] = [];
      const parsedData = JSON.parse(jsonString);
      
      // טיפול באפשרויות שונות של מבנה הנתונים
      if (Array.isArray(parsedData)) {
        // מערך ישיר של נקודות
        points = parsedData.filter(point => 
          typeof point === 'object' && 
          point !== null && 
          'x' in point && 
          'y' in point &&
          typeof point.x === 'number' &&
          typeof point.y === 'number'
        );
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        // אובייקט עם מפתח של "points" או שדה אחר שמכיל מערך
        for (const key in parsedData) {
          if (Array.isArray(parsedData[key])) {
            const potentialPoints = parsedData[key].filter(point => 
              typeof point === 'object' && 
              point !== null && 
              'x' in point && 
              'y' in point &&
              typeof point.x === 'number' &&
              typeof point.y === 'number'
            );
            
            if (potentialPoints.length > 0) {
              points = potentialPoints;
              break;
            }
          }
        }
      }
      
      if (points.length === 0) {
        throw new Error("Could not find valid points data in the response");
      }
      
      console.log("Found points:", points);
      return points;
      
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw content:", content);
      throw new Error("Could not parse the points data from OpenAI response");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
