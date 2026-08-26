import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const getPackagingAdvice = async (
  prompt: string,
  contextData: string
): Promise<string> => {
  try {
    const fullPrompt = `
      You are a Senior Packaging Engineer, Industrial Print Estimator, and Corrugated Box Specialist.
      
      === Current Box Master BOM & Specifications ===
      ${contextData}
      
      === Client / User Question ===
      ${prompt}
      
      Instructions:
      1. Provide a direct, professional, and practical answer in Thai (ภาษาไทย).
      2. Analyze the Master BOM components (Paper GSM/price, Printing plates/labor, Coating/Finishing options, Converting/Gluing, Quantity economies of scale).
      3. If the user asks about cost reduction (ลดต้นทุน), suggest specific, actionable trade-offs (e.g. switching GSM, choosing water-based vs lamination, adjusting run volume to absorb fixed plate costs, or opting for self-folding vs glue).
      4. If the user asks about structural strength or material suitability (ความแข็งแรง/การใช้งาน), give expert recommendations based on box dimensions and product type.
      5. Keep explanations clear, formatted with concise bullet points where appropriate.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text || "ขออภัย ไม่สามารถประมวลผลคำแนะนำได้ในขณะนี้";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Assistant กรุณาลองใหม่อีกครั้ง";
  }
};
