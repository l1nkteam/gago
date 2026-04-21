
/**
 * Local AI Service
 * This service communicates with the server-side Node.js proxy (server.js),
 * which in turn communicates with the local Ollama instance on your CentOS server.
 */

const callLocalAI = async (prompt: string, system: string = '', jsonMode: boolean = false) => {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction: system, jsonMode })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }
    
    const result = await response.json();
    if (result.success) {
      return result.text;
    } else {
      console.warn("AI Warning:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Local AI Request Failed:", error);
    return null;
  }
};

export const generateLeadPitch = async (leadName: string, niche: string, agencyName: string) => {
  const system = "You are a professional sales copywriter. Your goal is to write high-converting cold outreach.";
  const prompt = `Write a short, professional, and personalized cold email for ${leadName} in the ${niche} niche on behalf of ${agencyName}. Focus on offering a value audit.`;
  return await callLocalAI(prompt, system);
};

export const generateWeeklySocialBatch = async (clientName: string, website: string, strategy: string, platforms: string[]) => {
  const system = "You are a social media manager. You must return only a valid JSON array of objects.";
  const prompt = `Generate a 7-day social media content calendar for ${clientName} (${website}). 
  Strategy: ${strategy}. Platforms: ${platforms.join(', ')}. 
  Format as JSON array: [{"id": "1", "platform": "...", "content": "...", "scheduledTime": "YYYY-MM-DD"}].`;
  
  const text = await callLocalAI(prompt, system, true);
  try {
    // Attempt to extract JSON if LLM added markdown backticks
    const cleanJson = text?.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson || '[]');
  } catch (e) {
    console.error("JSON Parse Error from AI:", e);
    return [];
  }
};

export const generateSocialPost = async (topic: string, platform: string) => {
  const prompt = `Create an engaging and viral ${platform} post about: ${topic}. Include 3 relevant hashtags and a call to action.`;
  return await callLocalAI(prompt);
};

export const searchLeadsAI = async (niche: string, country: string) => {
  const system = "Act as a professional lead generation specialist. Return ONLY a JSON array.";
  const prompt = `Create a list of 5 realistic business leads for ${niche} in ${country}. 
  Return as a JSON array of objects with: id, name, email, phone, website, niche, country.`;
  
  const text = await callLocalAI(prompt, system, true);
  try {
    const cleanJson = text?.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson || '[]');
  } catch (e) {
    return [];
  }
};

export const performDeepAudit = async (leadName: string, niche: string, website: string) => {
  const system = "You are a senior SEO and Marketing Auditor.";
  const prompt = `Analyze the website ${website} for ${leadName} in the ${niche} industry. 
  Provide a detailed audit report highlighting: SEO gaps, UI/UX improvements, and 3 specific growth strategies.`;
  
  const report = await callLocalAI(prompt, system);
  return {
    report: report || "Local AI is currently analyzing data. Please try again in a moment.",
    sources: [] 
  };
};
