const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROJECT_TYPES = ["Residential House", "Apartment", "Villa", "Renovation", "Commercial"];

const getProjectSuggestions = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please describe your project idea first."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt.trim(),
            config: {
                systemInstruction:
                    "You are a construction project assistant for Sankalp, a construction management " +
                    "platform in India. Given a customer's plain-language description of what they want " +
                    "to build, pick the closest matching project type from the fixed list, estimate a " +
                    "realistic budget in Indian Rupees as a plain integer (no currency symbols or commas, " +
                    "based on typical Indian construction costs), and write a clear, polished 2-3 sentence " +
                    "project description suitable for a contractor to read.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        projectType: { type: "string", enum: PROJECT_TYPES },
                        estimatedBudget: { type: "integer" },
                        description: { type: "string" }
                    },
                    required: ["projectType", "estimatedBudget", "description"]
                }
            }
        });

        const suggestion = JSON.parse(response.text);

        res.json({
            success: true,
            suggestion
        });

    } catch (error) {
        console.error("AI project suggestion error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate suggestions. Please fill in the form manually."
        });
    }
};

module.exports = {
    getProjectSuggestions
};
