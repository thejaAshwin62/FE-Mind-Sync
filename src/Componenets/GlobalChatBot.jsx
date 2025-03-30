import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "../Context/ChatContext";
import customFetch from "../utils/customFetch";
import { createNewChat, getChatResponse } from "../utils/geminiService";
import { motion } from "framer-motion";
import { Send, Clock } from "lucide-react";

const GlobalChatBot = () => {
  const { user } = useUser();
  const { aiName, userName } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [chatInstance, setChatInstance] = useState(null);
  const [theme, setTheme] = useState("light");

  // Theme detection
  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);

    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "light";
      setTheme(updatedTheme);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Initialize chat instance when component mounts
  useEffect(() => {
    setChatInstance(createNewChat());
  }, []);

  // Load messages from database
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await customFetch.get(`/global-chat/${user.id}`);

        if (response.data.length > 0) {
          setMessages(response.data);
        } else {
          // Add welcome message if no messages exist
          const welcomeMessage = {
            id: Date.now().toString(),
            content: `👋 Hi ${userName}! I'm your ${aiName} AI Assistant powered by Google's Gemini.

I can help you with:

🔍 General Knowledge

💡 Problem Solving

📚 Research & Learning

💻 Coding & Technical Help

🎨 Creative Ideas

Feel free to ask me anything! I'm here to assist you.`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            displayTime: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            userId: user?.id,
            userName: userName,
          };

          setMessages([welcomeMessage]);

          await customFetch.post(`/global-chat/${user.id}`, {
            message: welcomeMessage,
          });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    if (user?.id) {
      loadMessages();
    }
  }, [user?.id, userName, aiName]);

  // Format date for message display
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    const dayName = messageDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today · ${dayName}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday · ${dayName}`;
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = message.timestamp
        ? new Date(message.timestamp).toDateString()
        : new Date().toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatInstance) return;

    const currentDate = new Date();
    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: currentDate.toISOString(),
      displayTime: currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      userId: user?.id,
      userName: userName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Save user message to database
      await customFetch.post(`/global-chat/${user.id}`, {
        message: userMessage,
      });

      // Get Gemini response using the chat service
      const { text: botResponse, chatInstance: updatedChat } =
        await getChatResponse(inputMessage, chatInstance);

      // Update chat instance if needed
      if (updatedChat) {
        setChatInstance(updatedChat);
      }

      const botMessage = {
        id: Date.now().toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userId: "bot",
        userName: aiName,
      };

      // Save bot message to database
      await customFetch.post(`/global-chat/${user.id}`, {
        message: botMessage,
      });

      // Update local state
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        id: Date.now().toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userId: "bot",
        userName: aiName,
      };

      setMessages((prev) => [...prev, errorMessage]);

      await customFetch.post(`/global-chat/${user.id}`, {
        message: errorMessage,
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Handle chat clearing
  const handleClearGlobalChat = async () => {
    try {
      await customFetch.delete(`/global-chat/${user.id}`);
      setMessages([]); // Clear messages locally

      // Create new chat instance
      const newChatInstance = createNewChat();
      setChatInstance(newChatInstance);

      // Add welcome message after clearing
      const welcomeMessage = {
        id: Date.now().toString(),
        content: `👋 Hi ${userName}! I'm your ${aiName} AI Assistant powered by Google's Gemini.

I can help you with:

🔍 General Knowledge

💡 Problem Solving

📚 Research & Learning

💻 Coding & Technical Help

🎨 Creative Ideas

Feel free to ask me anything! I'm here to assist you.`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userId: user?.id,
        userName: userName,
      };

      setMessages([welcomeMessage]);

      await customFetch.post(`/global-chat/${user.id}`, {
        message: welcomeMessage,
      });
    } catch (error) {
      console.error("Error clearing global chat:", error);
    }
  };

  // Make handleClearGlobalChat available to parent component
  useEffect(() => {
    if (window) {
      window.handleClearGlobalChat = handleClearGlobalChat;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-full">
      {/* Messages Container */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-6 ${
          theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
      >
        {groupMessagesByDate(messages).map(
          ({ date, messages: dateMessages }, groupIndex) => (
            <div key={date} className="space-y-4">
              <div className="sticky top-0 z-10 flex items-center justify-center py-2">
                <div
                  className={`backdrop-blur-sm px-4 py-1.5 rounded-full ${
                    theme === "light"
                      ? "bg-primary-50 border border-primary-100"
                      : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-primary-800" : "text-gray-200"
                    }`}
                  >
                    {formatDate(date)}
                  </span>
                </div>
              </div>

              {dateMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`chat ${
                    message.sender === "user" ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar placeholder">
                    <div
                      className={`w-10 rounded-full ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : theme === "light"
                          ? "bg-primary-600 text-white"
                          : "bg-primary-800 text-white"
                      }`}
                    >
                      <span>
                        {message.sender === "user" ? userName[0] : aiName[0]}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`chat-header mb-1 ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    {message.sender === "user" ? userName : aiName}
                    {message.displayTime && (
                      <time
                        className={`text-xs opacity-50 ml-2 flex items-center gap-1 ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        <Clock size={10} />
                        {message.displayTime}
                      </time>
                    )}
                  </div>
                  <div
                    className={`chat-bubble ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : theme === "light"
                        ? "bg-white text-gray-800 border border-gray-200"
                        : "bg-gray-800 text-gray-200 border border-gray-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar placeholder">
              <div
                className={`w-10 rounded-full ${
                  theme === "light"
                    ? "bg-primary-600 text-white"
                    : "bg-primary-800 text-white"
                }`}
              >
                <span>{aiName[0]}</span>
              </div>
            </div>
            <div
              className={`chat-bubble ${
                theme === "light"
                  ? "bg-white text-gray-800 border border-gray-200"
                  : "bg-gray-800 text-gray-200 border border-gray-700"
              }`}
            >
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div
        className={`p-4 border-t ${
          theme === "light"
            ? "bg-white border-gray-200"
            : "bg-gray-800 border-gray-700"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className={`flex-1 px-4 py-3 rounded-xl border ${
              theme === "light"
                ? "bg-white border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-gray-800 placeholder-gray-400"
                : "bg-gray-700 border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-700 text-gray-100 placeholder-gray-500"
            } focus:outline-none transition-all`}
          />

          <button
            type="submit"
            className={`px-4 py-2 rounded-xl transition-colors ${
              !inputMessage.trim() || isTyping
                ? theme === "light"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
                : theme === "light"
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-primary-700 hover:bg-primary-600 text-white"
            }`}
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalChatBot;
