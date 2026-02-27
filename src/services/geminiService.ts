import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface FoodItem {
  name: string;
  weight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysis {
  items: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const analyzeFoodImage = async (base64Image: string, description?: string): Promise<FoodAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `Você é um nutricionista especialista em análise visual de alimentos. 
              Analise a imagem da refeição e forneça uma estimativa detalhada dos macronutrientes.
              Descrição adicional do usuário: "${description || 'Nenhuma descrição fornecida'}".
              Identifique cada item no prato, estime seu peso em gramas e calcule calorias, proteínas, carboidratos e gorduras.
              Retorne estritamente um objeto JSON seguindo o esquema fornecido.`,
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weight: { type: Type.NUMBER, description: "Peso estimado em gramas" },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                },
                required: ["name", "weight", "calories", "protein", "carbs", "fat"],
              },
            },
            totals: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
          },
          required: ["items", "totals"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro analyzeFoodImage:", error);
    throw error;
  }
};

export const estimateBodyType = async (age: number, height: number, weight: number, bf: number, gender: string): Promise<{ bodyType: string, influence: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o biotipo físico deste usuário:
      - Idade: ${age} anos
      - Altura: ${height} cm
      - Peso: ${weight} kg
      - Percentual de Gordura (BF): ${bf}%
      - Gênero: ${gender === 'M' ? 'Masculino' : 'Feminino'}

      Determine se o biotipo predominante é Ectomorfo, Mesomorfo ou Endomorfo. 
      Explique brevemente como esse biotipo influencia o metabolismo e quais devem ser as prioridades na dieta e treino para atingir objetivos de forma eficiente.
      Retorne em formato JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bodyType: { type: Type.STRING, description: "Ectomorfo, Mesomorfo ou Endomorfo" },
            influence: { type: Type.STRING, description: "Explicação de como o biotipo influencia metas e dieta" }
          },
          required: ["bodyType", "influence"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro estimateBodyType:", error);
    return { bodyType: "Indeterminado", influence: "Não foi possível analisar o biotipo no momento." };
  }
};

export const analyzeMealImpact = async (totals: any, goal: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise o impacto desta refeição (${totals.calories}kcal, ${totals.protein}g prot, ${totals.carbs}g carb, ${totals.fat}g gord) no objetivo de "${goal}". 
    Seja breve, direto e motivador. Máximo 3 linhas. Não use asteriscos.`,
  });

  return response.text || "Análise indisponível no momento.";
};

export const generateNutraInsights = async (diaryEntries: any[]): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Com base nas últimas refeições do usuário: ${JSON.stringify(diaryEntries.slice(0, 10))}, 
    identifique 3 padrões ou insights nutricionais importantes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["success", "warning", "info"] },
              },
              required: ["title", "description", "type"],
            },
          },
        },
        required: ["insights"],
      },
    },
  });

  const data = JSON.parse(response.text || '{"insights": []}');
  return data.insights;
};

export const getDietStrategy = async (profile: any, recentDiary: any[]): Promise<{ strategy: string, explanation: string, bodyType: string, bodyTypeInfluence: string, recommendedFoods: string[], recommendedTargets: { calories: number, protein: number, carbs: number, fat: number } }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Com base no perfil do usuário: ${JSON.stringify(profile)} 
    e nos registros alimentares dos últimos 7 dias: ${JSON.stringify(recentDiary)}, 
    defina a melhor estratégia dietética atual (Bulking, Bulking Leve, Cutting ou Manutenção).
    Explique o porquê de forma técnica e direta.
    Determine o biotipo do usuário (Ectomorfo, Mesomorfo ou Endomorfo) com base nos dados.
    Sugira 5 alimentos específicos e direcionados para esta fase, explicando brevemente o benefício de cada um.
    Além disso, recomende as metas diárias ideais (calorias, proteínas, carboidratos e gorduras) para este usuário.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy: { type: Type.STRING, description: "Bulking, Bulking Leve, Cutting ou Manutenção" },
          explanation: { type: Type.STRING },
          bodyType: { type: Type.STRING, description: "Ectomorfo, Mesomorfo ou Endomorfo" },
          bodyTypeInfluence: { type: Type.STRING, description: "Como o biotipo influencia metas e dieta" },
          recommendedFoods: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          recommendedTargets: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["calories", "protein", "carbs", "fat"]
          }
        },
        required: ["strategy", "explanation", "bodyType", "bodyTypeInfluence", "recommendedFoods", "recommendedTargets"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getMealSuggestions = async (remainingMacros: any, goal: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `O usuário ainda precisa consumir: ${remainingMacros.calories}kcal, ${remainingMacros.protein}g prot, ${remainingMacros.carbs}g carb, ${remainingMacros.fat}g gord. 
    Seu objetivo é "${goal}". 
    Sugira 2 opções de refeições rápidas e saudáveis para bater essas metas. Seja breve. Não use asteriscos.`,
  });

  return response.text || "Sugestão indisponível.";
};
