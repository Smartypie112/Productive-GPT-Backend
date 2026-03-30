const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Single health check + main route
app.post('/', async (req, res) => {
  const { message, todos } = req.body; // todos = ["task1", "task2", ...]

  if (!message) return res.status(400).json({ error: 'Message is required' });

  // 7-pillars prompt including user's to-do list
  const prompt = `
You are a productivity coach.
User message: "${message}"
Current to-do list:
${todos && todos.length > 0 ? todos.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'No tasks yet'}
Provide actionable suggestions based on the following pillars:
1. Goal: Focus on improving productivity and habits
2. Role: Act as a friendly, expert productivity coach
3. Context: Assume the user works from home and has distractions
4. Constraints: Keep answers concise, clear, and practical
5. Format: Use bullet points or numbered lists
6. Examples: "Pomodoro Technique- A structured plan for the user to improve focus and productivity
- Suggestions to add tasks, remove tasks, or reorder tasks in the to-do list
- Prioritized actions
- Encouraging guidance"
7. Tone: Encouraging and supportive

`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Health check GET
app.get('/', (req, res) => {
  res.send('✅ ProductiveGPT Backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ProductiveGPT Backend running on port ${PORT}`);
});