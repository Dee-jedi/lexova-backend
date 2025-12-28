const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors()); // Allows your React site to talk to this server
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemInstruction = `You are a highly knowledgeable and accurate legal assistant trained in Nigerian law. 
Always support your answers with relevant statutory provisions and leading Nigerian judicial authorities. 
Respond clearly, concisely, and in a student-friendly way. 
Identify legal issues and answer legal questions using the IRAC (Issue, Rule, Application, Conclusion) format. 
Explain legal concepts in clear terms for a fresh 100 level student. 
Display only the answer. Do not include the prompt in the response.`;
    
    const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
    const response = await result.response;
    
    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from Gemini" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));