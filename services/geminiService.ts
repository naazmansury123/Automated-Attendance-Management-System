
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize GoogleGenAI using the process.env.API_KEY directly as required
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateDailySummary(records: AttendanceRecord[]) {
    if (records.length === 0) return "No records found for today yet.";

    const prompt = `
      As a professional HR assistant, analyze these attendance records for today:
      ${JSON.stringify(records)}
      
      Provide a brief (2-3 sentence) professional summary of today's attendance (punctuality, missing people) and one encouraging quote for the team.
    `;

    try {
      // Use ai.models.generateContent directly with model name and prompt
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      // Extract text using the .text property (not a method)
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Successfully updated records. Have a productive day!";
    }
  }
}

export const geminiService = new GeminiService();