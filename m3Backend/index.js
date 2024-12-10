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

console.log(process.env.API_KEY);

// Function to initialize generative AI model
async function initializeGenerativeAI(prompt) {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key is missing in environment variables.");
    }

    const genAi = new GoogleGenerativeAI(process.env.API_KEY);
    const model = await genAi.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Your name is Tina, you are a highly trained car insurance consultant. You will ask a series of questions from the user and will make a recommendation of one or more insurance products to the user and will provide reasons for these reccomendations. The three insurance products that you can reccomend are: Mechanical Breakdown Insurance (MBI), Comprehensive Car Insurance, Third Party Car Insurance. MBI is not available to trucks and racing cars. Comprehensive Car Insurance is only available to any motor vehicles less than 10 years old.${prompt}`,
    });
    return model;
  } catch (error) {
    console.error("❌ Error initializing AI model:", error);
    throw new Error("Failed to initialize AI model.");
  }
}

// Start interview route
app.post("/api/startInterview", async (req, res) => {
  const prompt = `
  if the user responds with yes then continue to ask questions, if they respond no, respond with "Okay no worries, have a great day!".
  If the user opts in, ask one question at a time to find out which insurance policiy suits them best. Do NOT ask them which policy they want, assume they know nothing about insurance. Find out about their car and needs to find the best policy for them by asking personal questions.
`;

  try {
    const model = await initializeGenerativeAI(prompt);

    chatSession = model.startChat({
      history: [],
    });

    console.log(chatSession.history);

    // console.log("Chat session initialized:", chatSession);

    const initialResponse = `I’m Tina.  I help you to choose the right insurance policy for you.  May I ask you a few personal questions to make sure I recommend the best policy for you? Type yes and submit to get started!`; // Initial response from AI to start the interview
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
