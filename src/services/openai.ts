
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

    // Try to extract JSON from the content
    try {
      // Look for JSON in the content - find everything between { and }
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedData = JSON.parse(jsonStr);
        
        if (Array.isArray(parsedData.points)) {
          return parsedData.points;
        } else if (Array.isArray(parsedData)) {
          return parsedData;
        }
      }
      
      // If we couldn't find a JSON object, try to find an array
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        const arrayStr = arrayMatch[0];
        const parsedArray = JSON.parse(arrayStr);
        return parsedArray;
      }
      
      throw new Error("Could not find valid points data in the response");
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
