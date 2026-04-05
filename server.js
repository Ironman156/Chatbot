require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Health check route
app.get("/", (req, res) => {
  res.send("Chatbot API is running 🚀");
});

// MAIN CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `
You are a professional business chatbot.

Rules:
- Speak in Hindi + English mix (Hinglish)
- Be natural, like a human
- Help users with product queries
- Try to convert user into a customer
- Keep responses short and clear
- If user asks price → ask which product
- If user shows interest → ask name & phone number
            `
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const botReply =
      response?.data?.choices?.[0]?.message?.content ||
      "Sorry, thoda issue aa gaya. Please try again.";

    res.json({
      success: true,
      reply: botReply
    });

  } catch (error) {
    console.error("ERROR:", error?.response?.data || error.message);

    res.status(500).json({
      success: false,
      reply:
        "Server busy hai abhi. Please thodi der baad try karein 🙏"
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
