const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Initialize chatSession as null
let chatSession = null;

// Function to initialize generative AI model
async function initializeGenerativeAI(prompt, jobTitle) {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key is missing in environment variables.");
    }

    const genAi = new GoogleGenerativeAI(process.env.API_KEY);
    const model = await genAi.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a highly skilled and experienced job interviewer specializing in the field of ${jobTitle}. ${prompt}`,
    });
    return model;
  } catch (error) {
    console.error("❌ Error initializing AI model:", error);
    throw new Error("Failed to initialize AI model.");
  }
}

// Start interview route

app.post("/api/startInterview", async (req, res) => {
  const { jobTitle, resetInterview } = req.body;
  const prompt = `
  Simulate a job interview for a ${jobTitle} position. 
  The interview begins with the candidate giving you their name:
  After each candidate response, generate one insightful follow-up question ONE AT A TIME. 
  These questions should dynamically adapt to the candidate's answers.
  * Avoid repeated questions. 
  * Questions must be contextually relevant and thought-provoking. 
  * Maintain a professional, encouraging, and conversational tone. 
  After you have asked 6 questions, provide: 
  1. A concise interview summary, highlighting strengths and areas for improvement. 
  2. A closing remark thanking the candidate. 
`;

  try {
    const model = await initializeGenerativeAI(prompt, jobTitle);

    chatSession = model.startChat({
      history: [],
    });

    console.log(chatSession.history);

    // console.log("Chat session initialized:", chatSession);

    const initialResponse = `Hi there I'm an Interview chatbot named Yapper. Today we will be conducting a mock interview for the position of ${jobTitle}. Let's get introduced by you telling me your name.`; // Initial response from AI to start the interview
    res.json({ aiResponse: initialResponse });
  } catch (error) {
    console.error("❌ Error in starting interview:", error);
    res.status(500).json({
      error: "Failed to start the interview.",
      details: error.message,
    });
  }
});

// Mock interview route
app.post("/api/interview", async (req, res) => {
  const { userResponse } = req.body;
  console.log(chatSession);
  try {
    if (!chatSession) {
      return res.status(400).json({
        error:
          "Chat session is not initialized. Please start the interview first.",
      });
    }

    if (!userResponse) {
      return res.status(400).json({
        error: "User response is empty. Please provide a valid response.",
      });
    }

    const result = (await chatSession.sendMessage(userResponse)).response;
    console.log("RESULT: ", result);
    let aiResponse = result.text();

    res.json({ aiResponse });
  } catch (error) {
    console.error("❌ Error in AI response:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get AI response.", details: error.message });
  }
});

// Root route for checking server status
app.get("/", (req, res) => {
  res.send("Connected my dudes 🔌");
});

// 404 handler for unrecognized routes
app.use((req, res) => {
  res.status(404).send("Endpoint not found");
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
