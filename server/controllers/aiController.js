import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Generate a post idea using Gemini AI
// @route   POST /api/ai/generate-idea
// @access  Private
export const generateIdea = async (req, res, next) => {
    try {
        const { topic } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                message: 'LLM API key is missing from environment variables' 
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert blog post assistant. Generate a catchy, engaging blog post title and a brief starting outline/content (2-3 short paragraphs) about the following topic: "${topic || 'latest technology trends'}". Do not use markdown formatting like asterisks, just plain text.`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Try to split title and content loosely
        const lines = responseText.split('\n').filter(line => line.trim() !== '');
        const title = lines[0].replace(/^Title: /i, '').trim();
        const content = lines.slice(1).join('\n\n').trim();

        res.status(200).json({
            success: true,
            data: {
                title,
                content
            }
        });
    } catch (error) {
        console.error('LLM API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate content from AI'
        });
    }
};
