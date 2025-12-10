import { GoogleGenAI } from "@google/genai";

export const cleanMedicalNotes = async (rawText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API KEY found for Gemini");
    return rawText;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful medical assistant. 
      Analyze the following unstructured notes from an elderly patient or their caregiver:
      "${rawText}"
      
      Output a clean, professional summary in Spanish suitable for emergency personnel. 
      Use bullet points if necessary. Keep it concise. Do not add any conversational text, just the cleaned information.`,
    });

    return response.text || rawText;
  } catch (error) {
    console.error("Gemini Error:", error);
    return rawText;
  }
};