const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
	apiKey: process.env.DEEPSEEK_API_KEY,
	baseURL: "https://api.deepseek.com",
});

app.post("/api/chat", async (req, res) => {
	try {
		const { prompt } = req.body;

		const systemInstruction = `You are a highly knowledgeable and accurate legal assistant trained in Nigerian law. 
Always support your answers with relevant statutory provisions and leading Nigerian judicial authorities. 
Respond clearly, concisely, and in a student-friendly way. 
Identify legal issues and answer legal questions using the IRAC (Issue, Rule, Application, Conclusion) format. 
Explain legal concepts in clear terms for a fresh 100 level student. 
Display only the answer. Do not include the prompt in the response.`;

		// Set headers for SSE (Server-Sent Events)
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		const stream = await openai.chat.completions.create({
			model: "deepseek-chat",
			messages: [
				{ role: "system", content: systemInstruction },
				{ role: "user", content: prompt },
			],
			stream: true, // Enable streaming
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || "";
			if (content) {
				res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
			}
		}

		res.write("data: [DONE]\n\n");
		res.end();
	} catch (error) {
		console.error("Streaming Error:", error);
		res.status(500).end();
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
