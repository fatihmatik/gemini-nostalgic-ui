import geminiLogo from "./assets/gemini-logo.png";
import React, { useState } from "react";
import Markdown from "https://esm.sh/react-markdown@9";
import remarkGfm from "remark-gfm";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);

async function fetchData(msg, modelType, temperature, setMessages, setError) {
  try {
    const model = genAI.getGenerativeModel({ model: modelType });

    const result = await model.generateContent(msg, {
      temperature: temperature,
    });
    const response = await result.response;
    const text = await response.text();

    const newMessage = {
      sender: "bot",
      text: text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setError(null); // Clear any previous errors
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Failed to fetch data from the API. Please try again later.");
  }
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [modelType, setModelType] = useState("gemini-1.5-pro");
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState(null);

  const handleTemperatureChange = (e) => {
    const value = parseFloat(e.target.value);
    const maxTemp = modelType === "gemini-1.5-pro" ? 2 : 1;
    if (value <= maxTemp) {
      setTemperature(value);
    } else {
      setTemperature(maxTemp);
    }
  };

  const handleClick = () => {
    const newMessage = {
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);
    fetchData(prompt, modelType, temperature, setMessages, setError);
    setPrompt("");
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4 bg-gradient-to-r from-teal-200 to-teal-500">
      <div className="w-full max-w-4xl bg-white border-4 border-blue-400 p-4 flex flex-col shadow-lg rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row justify-between items-end space-x-4 w-full md:w-[57%]">
            <h1 className="text-3xl font-bold text-blue-400">{modelType}</h1>
            <img src={geminiLogo} alt="gemini-logo" className="w-48 h-auto" />
          </div>
          <div className="flex flex-col space-y-4 w-full md:w-auto">
            <div>
              <label
                htmlFor="modelType"
                className="block text-lg font-bold text-blue-300 mb-2"
              >
                Select Model Type:
              </label>
              <select
                id="modelType"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="bg-gray-200 border-2 border-blue-400 text-black p-2 rounded-lg shadow-inner w-full"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="temperature"
                className="block text-lg font-bold text-blue-300 mb-2"
              >
                Set Temperature:
              </label>
              <input
                type="number"
                id="temperature"
                value={temperature}
                onChange={handleTemperatureChange}
                className="bg-gray-200 border-2 border-blue-400 text-black p-2 rounded-lg shadow-inner w-full"
                step="0.1"
                min="0"
                max={modelType === "gemini-1.5-pro" ? "2" : "1"}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 mb-4 border-2 border-blue-400 p-2 bg-gray-200 h-96 md:h-[512px] overflow-y-auto">
          {error && (
            <div className="text-red-500 text-center mb-4 font-bold">
              {error}
            </div>
          )}
          {messages.length === 0 && !error ? (
            <div className="text-center text-gray-800">
              <p className="text-lg font-bold">
                Welcome to the {modelType} Chat!
              </p>
              <p>Type a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 border-2 border-blue-400 ${
                  message.sender === "user"
                    ? "bg-blue-200 self-end"
                    : "bg-gray-300 self-start"
                }`}
              >
                {message.sender === "user" ? (
                  <p>{message.text}</p>
                ) : (
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </Markdown>
                )}
                <span className="text-xs text-gray-600">
                  {message.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="bg-gray-200 border-2 border-blue-400 text-black flex-grow p-2 rounded-lg shadow-inner"
            placeholder="Enter your prompt"
          ></textarea>
          <button
            className="bg-blue-400 border-2 border-blue-500 text-black py-2 px-8 rounded-lg shadow-lg font-bold"
            onClick={handleClick}
          >
            Send
          </button>
        </div>
      </div>
      <div className="bg-white text-blue-600 py-2 px-4 mt-4 rounded-lg border-2 border-blue-400">
        <p>Fatih Tezcan &copy; {parseInt(new Date().getFullYear() - 30)}.</p>
        <p>This site uses the Google Gemini API</p>
      </div>
    </div>
  );
}

export default App;
