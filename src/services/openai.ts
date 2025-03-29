
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

    console.log("Raw content from OpenAI:", content);
    
    // שיפור מנגנון החילוץ של JSON מתשובת OpenAI
    return extractPointsFromContent(content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

/**
 * פונקציה משופרת לחילוץ נקודות מתוכן טקסטואלי
 */
function extractPointsFromContent(content: string): Point[] {
  console.log("Attempting to extract points from content");
  
  try {
    // ניסיון 1: חיפוש מבנה JSON תקין בתוכן המלא
    try {
      const parsedContent = JSON.parse(content);
      
      // אם זה מערך ישירות
      if (Array.isArray(parsedContent)) {
        const validPoints = validatePoints(parsedContent);
        if (validPoints.length > 0) {
          console.log(`Found ${validPoints.length} points directly in array`);
          return validPoints;
        }
      }
      
      // אם זה אובייקט עם מפתח points או מפתח אחר שמכיל מערך
      if (typeof parsedContent === 'object' && parsedContent !== null) {
        // חיפוש מפתח שמכיל מערך של נקודות
        for (const key in parsedContent) {
          if (Array.isArray(parsedContent[key])) {
            const validPoints = validatePoints(parsedContent[key]);
            if (validPoints.length > 0) {
              console.log(`Found ${validPoints.length} points in key "${key}"`);
              return validPoints;
            }
          }
        }
      }
    } catch (e) {
      console.log("Initial JSON parsing failed, trying regex extraction");
    }
    
    // ניסיון 2: חילוץ JSON באמצעות regex
    const jsonMatches = findJSONInText(content);
    
    for (const jsonStr of jsonMatches) {
      try {
        const parsedJson = JSON.parse(jsonStr);
        
        // בדיקה אם זה מערך ישירות
        if (Array.isArray(parsedJson)) {
          const validPoints = validatePoints(parsedJson);
          if (validPoints.length > 0) {
            console.log(`Found ${validPoints.length} points in extracted JSON array`);
            return validPoints;
          }
        }
        
        // בדיקה אם זה אובייקט עם מפתח שמכיל מערך
        if (typeof parsedJson === 'object' && parsedJson !== null) {
          for (const key in parsedJson) {
            if (Array.isArray(parsedJson[key])) {
              const validPoints = validatePoints(parsedJson[key]);
              if (validPoints.length > 0) {
                console.log(`Found ${validPoints.length} points in extracted JSON key "${key}"`);
                return validPoints;
              }
            }
          }
        }
      } catch (e) {
        console.log(`Failed to parse extracted JSON: ${jsonStr.substring(0, 50)}...`);
      }
    }
    
    // ניסיון 3: חילוץ נקודות בודדות מהטקסט
    const pointsFromText = extractPointsFromText(content);
    if (pointsFromText.length > 0) {
      console.log(`Extracted ${pointsFromText.length} individual points from text`);
      return pointsFromText;
    }
    
    // אם הגענו לכאן, לא מצאנו נקודות תקינות
    throw new Error("Could not find valid points data in the response");
  } catch (error) {
    console.error("Error parsing points from OpenAI response:", error);
    console.log("Raw content:", content);
    throw new Error("Could not parse the points data from OpenAI response");
  }
}

/**
 * חיפוש JSON בטקסט באמצעות regular expressions
 */
function findJSONInText(text: string): string[] {
  const results: string[] = [];
  
  // חיפוש מבנים של מערכים JSON
  try {
    const arrayMatches = text.match(/\[(\s*{[^{}]*}(\s*,\s*{[^{}]*})*\s*)\]/g) || [];
    results.push(...arrayMatches);
  } catch (e) {
    console.log("Error finding array matches:", e);
  }
  
  // חיפוש מבנים של אובייקטים JSON
  try {
    const objectMatches = text.match(/\{([^{}]|(\{[^{}]*\}))*\}/g) || [];
    results.push(...objectMatches);
  } catch (e) {
    console.log("Error finding object matches:", e);
  }
  
  return results;
}

/**
 * חילוץ נקודות בודדות מטקסט
 */
function extractPointsFromText(text: string): Point[] {
  const points: Point[] = [];
  
  // חיפוש של דפוסים כמו {x: 10, y: 20} או {"x": 10, "y": 20}
  const pointRegex = /{[\s]*["']?x["']?[\s]*:[\s]*(\d+)[\s]*,[\s]*["']?y["']?[\s]*:[\s]*(\d+)[\s]*}/g;
  let match;
  
  while ((match = pointRegex.exec(text)) !== null) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y });
    }
  }
  
  // חיפוש של דפוסים כמו (10, 20) או x: 10, y: 20 או x=10, y=20
  const coordRegex = /(?:[({\s]|^)(?:x\s*[=:]\s*|)(\d+)(?:\s*,\s*|\s+)(?:y\s*[=:]\s*|)(\d+)(?:[)}\s]|$)/g;
  while ((match = coordRegex.exec(text)) !== null) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    
    if (!isNaN(x) && !isNaN(y) && x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      // וידוא שהנקודות בטווח 0-100 כדי להימנע מקואורדינטות אקראיות
      points.push({ x, y });
    }
  }
  
  return points;
}

/**
 * בדיקת תקינות של מערך נקודות
 */
function validatePoints(points: any[]): Point[] {
  return points.filter(point => 
    typeof point === 'object' && 
    point !== null && 
    'x' in point && 
    'y' in point &&
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    point.x >= 0 &&
    point.x <= 100 &&
    point.y >= 0 &&
    point.y <= 100
  );
}
