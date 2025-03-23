"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "../Context/ChatContext";
import customFetch from "../utils/customFetch";
import GlobalChatBot from "../Componenets/GlobalChatBot";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePlus,
  BotMessageSquare,
  BrainCircuit,
  Send,
  Mic,
  MicOff,
  Search,
  Calendar,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

const ChatBot = () => {
  const { user } = useUser();
  const {
    chats,
    currentChatId,
    createNewChat,
    addMessageToChat,
    deleteChat,
    clearAllChats,
    setCurrentChatId,
    isLoading,
    updateChatTitle,
    aiName,
    userName,
  } = useChat();

  const [theme, setTheme] = useState("light");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const initializationRef = useRef(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatType, setChatType] = useState("personal"); // 'personal' or 'global'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const menuRef = useRef(null);

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

  // Sample suggestions based on common queries
  const querySuggestions = [
    "What did I do today at ",
    "Where was I yesterday at ",
    "What happened on ",
    "What was I doing at ",
    "Tell me about my activities on ",
    "What were my tasks at ",
  ];

  // Handle input change with suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Generate suggestions
    if (value.trim()) {
      const filtered = querySuggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        .map((suggestion) => {
          // If suggestion is a time-based query, add current time
          if (suggestion.endsWith("at ")) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return suggestion + timeStr;
          }
          // If suggestion asks for a date, add today's date
          if (suggestion.endsWith("on ")) {
            const today = new Date();
            const dateStr = today.toLocaleDateString();
            return suggestion + dateStr;
          }
          return suggestion;
        });
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current chat messages
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    // Only run initialization once and when chats are loaded
    if (!initializationRef.current && !isLoading) {
      if (chats.length === 0) {
        // Only create new chat if there are no existing chats
        createNewChat();
      } else if (!currentChatId) {
        // If there are chats but none selected, select the most recent one
        setCurrentChatId(chats[chats.length - 1].id);
      }
      initializationRef.current = true;
    }
  }, [chats, currentChatId, createNewChat, setCurrentChatId, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;

    const userQuery = inputMessage;
    const currentDate = new Date().toISOString();

    // Create and immediately display user message
    const userMessage = {
      id: Date.now(),
      content: userQuery,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: currentDate, // Add date field
    };

    // Add user message to chat immediately
    await addMessageToChat(currentChatId, userMessage);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Save user query to the database
      await customFetch.post("/user-queries", {
        userId: user.id,
        query: userQuery,
        chatId: currentChatId,
      });

      // Fetch response from server
      const response = await customFetch.post("/search", {
        query: userQuery,
      });

      let botResponse;
      if (response.data.error) {
        botResponse = response.data.message;
      } else if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        botResponse = `On ${result.Date} at ${result.Time}, ${result.Feedback}`;
      } else if (response.data.message) {
        botResponse = response.data.message;
      } else {
        botResponse =
          "I couldn't find any memories matching your query. Try asking about a specific time and date, like 'what did I do today morning?' or 'what happened yesterday at 2 PM?'";
      }

      const botMessage = {
        id: Date.now(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: currentDate, // Add date field
        userQuery: userQuery,
      };

      // Add bot message to chat
      await addMessageToChat(currentChatId, botMessage);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        id: Date.now(),
        content:
          "I'm having trouble connecting to the server. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        userQuery: userQuery,
      };
      await addMessageToChat(currentChatId, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = message.date
        ? new Date(message.date).toDateString()
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

  // Group chats by time period
  const groupChatsByDate = (chats) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);

      if (chatDate.toDateString() === today.toDateString()) {
        groups.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat);
      } else if (chat >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  // Group the chats
  const groupedChats = groupChatsByDate(chats);

  // Handle chat type changes
  const handleChatTypeChange = (type) => {
    setChatType(type);
    setIsDropdownOpen(false);
    if (type === "global") {
      setIsSidebarOpen(false); // Close sidebar when switching to global chat
    }
  };

  // Handle global chat clearing
  const handleClearGlobalChat = () => {
    // Call the function from GlobalChatBot component
    if (window.handleClearGlobalChat) {
      window.handleClearGlobalChat();
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div
      className={`h-[calc(100vh-64px)] flex flex-col md:flex-row ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      }`}
    >
      {/* Sidebar Toggle Button for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed top-[14px] left-3 z-[1000] ${
          theme === "light"
            ? "bg-primary-950 hover:bg-primary-800"
            : "bg-gray-700 hover:bg-gray-600"
        } text-white p-2 rounded-md shadow-lg transition-all`}
        aria-label="Toggle Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || (!isSidebarOpen && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed md:static inset-y-0 left-0 transform md:translate-x-0 transition-transform duration-300 ease-in-out w-72 flex flex-col z-[999] h-full overflow-hidden ${
              theme === "light"
                ? "bg-white border-r border-gray-200"
                : "bg-gray-800 border-r border-gray-700"
            }`}
          >
            {/* Header Section */}
            <div className="flex-shrink-0 mt-16 md:mt-0">
              {/* Chat Type Toggle */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative w-full">
                  <button
                    className={`w-full py-3 px-4 rounded-xl flex justify-between items-center ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                    }`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="flex items-center gap-2">
                      {chatType === "personal" ? (
                        <>
                          <BotMessageSquare
                            size={18}
                            className={
                              theme === "light"
                                ? "text-primary-600"
                                : "text-primary-400"
                            }
                          />
                          <span>{aiName} Chat</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit
                            size={18}
                            className={
                              theme === "light"
                                ? "text-indigo-600"
                                : "text-indigo-400"
                            }
                          />
                          <span>Global Chat</span>
                        </>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute left-0 right-0 mt-2 rounded-xl shadow-lg overflow-hidden z-50 ${
                          theme === "light"
                            ? "bg-white border border-gray-200"
                            : "bg-gray-700 border border-gray-600"
                        }`}
                      >
                        <div className="py-1">
                          <button
                            className={`w-full px-4 py-3 text-left flex items-center gap-2 ${
                              chatType === "personal"
                                ? theme === "light"
                                  ? "bg-primary-50 text-primary-700"
                                  : "bg-gray-600 text-white"
                                : theme === "light"
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-200 hover:bg-gray-600"
                            }`}
                            onClick={() => handleChatTypeChange("personal")}
                          >
                            <BotMessageSquare size={18} />
                            <span>{aiName} Chat</span>
                          </button>
                          <button
                            className={`w-full px-4 py-3 text-left flex items-center gap-2 ${
                              chatType === "global"
                                ? theme === "light"
                                  ? "bg-primary-50 text-primary-700"
                                  : "bg-gray-600 text-white"
                                : theme === "light"
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-200 hover:bg-gray-600"
                            }`}
                            onClick={() => handleChatTypeChange("global")}
                          >
                            <BrainCircuit size={18} />
                            <span>Global Chat</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* New Chat Button - Only in personal mode */}
              {chatType === "personal" && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={createNewChat}
                    className={`w-full px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${
                      theme === "light"
                        ? "bg-primary-600 hover:bg-primary-700 text-white"
                        : "bg-primary-700 hover:bg-primary-600 text-white"
                    }`}
                  >
                    <BadgePlus size={18} />
                    <span>New Chat</span>
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {chatType === "personal" && (
                <div className="h-full">
                  {/* Today's Chats */}
                  {groupedChats.today.length > 0 && (
                    <div className="mt-2">
                      <div
                        className={`px-4 py-2 text-xs font-semibold sticky top-0 z-10 flex items-center gap-2 ${
                          theme === "light"
                            ? "text-gray-500 bg-white/90 backdrop-blur-sm"
                            : "text-gray-400 bg-gray-800/90 backdrop-blur-sm"
                        }`}
                      >
                        <Calendar size={14} />
                        <span>Today</span>
                      </div>
                      {groupedChats.today.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={chat.id === currentChatId}
                          onSelect={() => handleChatSelect(chat.id)}
                          onEdit={(title) => updateChatTitle(chat.id, title)}
                          onDelete={() => deleteChat(chat.id)}
                          theme={theme}
                          showMenu={showMenu}
                          setShowMenu={setShowMenu}
                          editingChatId={editingChatId}
                          setEditingChatId={setEditingChatId}
                          editingTitle={editingTitle}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Yesterday's Chats */}
                  {groupedChats.yesterday.length > 0 && (
                    <div className="mt-2">
                      <div
                        className={`px-4 py-2 text-xs font-semibold sticky top-0 z-10 flex items-center gap-2 ${
                          theme === "light"
                            ? "text-gray-500 bg-white/90 backdrop-blur-sm"
                            : "text-gray-400 bg-gray-800/90 backdrop-blur-sm"
                        }`}
                      >
                        <Calendar size={14} />
                        <span>Yesterday</span>
                      </div>
                      {groupedChats.yesterday.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={chat.id === currentChatId}
                          onSelect={() => handleChatSelect(chat.id)}
                          onEdit={(title) => updateChatTitle(chat.id, title)}
                          onDelete={() => deleteChat(chat.id)}
                          theme={theme}
                          showMenu={showMenu}
                          setShowMenu={setShowMenu}
                          editingChatId={editingChatId}
                          setEditingChatId={setEditingChatId}
                          editingTitle={editingTitle}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Last 7 Days */}
                  {groupedChats.lastWeek.length > 0 && (
                    <div className="mt-2">
                      <div
                        className={`px-4 py-2 text-xs font-semibold sticky top-0 z-10 flex items-center gap-2 ${
                          theme === "light"
                            ? "text-gray-500 bg-white/90 backdrop-blur-sm"
                            : "text-gray-400 bg-gray-800/90 backdrop-blur-sm"
                        }`}
                      >
                        <Calendar size={14} />
                        <span>Last 7 Days</span>
                      </div>
                      {groupedChats.lastWeek.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={chat.id === currentChatId}
                          onSelect={() => handleChatSelect(chat.id)}
                          onEdit={(title) => updateChatTitle(chat.id, title)}
                          onDelete={() => deleteChat(chat.id)}
                          theme={theme}
                          showMenu={showMenu}
                          setShowMenu={setShowMenu}
                          editingChatId={editingChatId}
                          setEditingChatId={setEditingChatId}
                          editingTitle={editingTitle}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Older */}
                  {groupedChats.older.length > 0 && (
                    <div className="mt-2">
                      <div
                        className={`px-4 py-2 text-xs font-semibold sticky top-0 z-10 flex items-center gap-2 ${
                          theme === "light"
                            ? "text-gray-500 bg-white/90 backdrop-blur-sm"
                            : "text-gray-400 bg-gray-800/90 backdrop-blur-sm"
                        }`}
                      >
                        <Calendar size={14} />
                        <span>Older</span>
                      </div>
                      {groupedChats.older.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={chat.id === currentChatId}
                          onSelect={() => handleChatSelect(chat.id)}
                          onEdit={(title) => updateChatTitle(chat.id, title)}
                          onDelete={() => deleteChat(chat.id)}
                          theme={theme}
                          showMenu={showMenu}
                          setShowMenu={setShowMenu}
                          editingChatId={editingChatId}
                          setEditingChatId={setEditingChatId}
                          editingTitle={editingTitle}
                          setEditingTitle={setEditingTitle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
              {chatType === "personal" ? (
                <button
                  onClick={clearAllChats}
                  className={`w-full px-4 py-2 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                    theme === "light"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-red-400 hover:bg-gray-700"
                  }`}
                >
                  <Trash2 size={16} />
                  <span>Clear All Chats</span>
                </button>
              ) : (
                <button
                  onClick={handleClearGlobalChat}
                  className={`w-full px-4 py-2 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                    theme === "light"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-red-400 hover:bg-gray-700"
                  }`}
                >
                  <Trash2 size={16} />
                  <span>Clear Global Chat</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {chatType === "personal" ? (
          // Personal Chat Content
          <div className="flex-1 flex flex-col h-full">
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
                            theme === "light"
                              ? "text-primary-800"
                              : "text-gray-200"
                          }`}
                        >
                          {formatDate(date)}
                        </span>
                      </div>
                    </div>

                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
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
                              {message.sender === "user"
                                ? userName[0]
                                : aiName[0]}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`chat-header mb-1 ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {message.sender === "user" ? userName : aiName}
                          {message.timestamp && (
                            <time
                              className={`text-xs opacity-50 ml-2 ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-300"
                              }`}
                            >
                              {message.timestamp}
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
                          {message.sender === "bot" && message.userQuery && (
                            <div
                              className={`text-sm mb-2 ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              <div className="font-medium bg-blue-500 text-white px-2 py-1 rounded-md">
                                You asked: {message.userQuery}
                              </div>
                            </div>
                          )}
                          {message.content}
                        </div>
                      </div>
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
              className={`p-4 border-t mt-auto relative ${
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Ask about your memories..."
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === "light"
                        ? "bg-white border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-gray-800 placeholder-gray-400"
                        : "bg-gray-700 border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-700 text-gray-100 placeholder-gray-500"
                    } focus:outline-none transition-all`}
                  />
                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute bottom-full left-0 w-full rounded-xl shadow-lg mb-2 max-h-48 overflow-y-auto z-50 ${
                          theme === "light"
                            ? "bg-white border border-gray-200"
                            : "bg-gray-700 border border-gray-600"
                        }`}
                      >
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`px-4 py-3 cursor-pointer flex items-center gap-2 ${
                              theme === "light"
                                ? "hover:bg-gray-100 text-gray-700"
                                : "hover:bg-gray-600 text-gray-200"
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Search
                              size={14}
                              className={
                                theme === "light"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }
                            />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl ${
                    isListening
                      ? "bg-red-500 text-white"
                      : theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  } transition-colors`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className={`p-3 rounded-xl ${
                    !inputMessage.trim() || isTyping
                      ? theme === "light"
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-700 text-gray-500"
                      : theme === "light"
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-primary-700 hover:bg-primary-600 text-white"
                  } transition-colors`}
                >
                  {isTyping ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
              {/* Add a message when browser doesn't support speech recognition */}
              {!("webkitSpeechRecognition" in window) && (
                <p
                  className={`text-xs mt-2 text-center ${
                    theme === "light" ? "text-red-500" : "text-red-400"
                  }`}
                >
                  Speech recognition is not supported in your browser. Please
                  use Chrome for this feature.
                </p>
              )}
            </div>
          </div>
        ) : (
          // Global Chat Content
          <GlobalChatBot />
        )}
      </div>
    </div>
  );
};

// Chat Item Component for sidebar
const ChatItem = ({
  chat,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  theme,
  showMenu,
  setShowMenu,
  editingChatId,
  setEditingChatId,
  editingTitle,
  setEditingTitle,
}) => {
  const handleEditSave = async () => {
    if (editingTitle.trim()) {
      await onEdit(editingTitle.trim());
      setEditingChatId(null);
    }
  };

  return (
    <div
      className={`p-3 cursor-pointer flex justify-between items-center ${
        isActive ? (theme === "light" ? "bg-gray-100" : "bg-gray-700") : ""
      } ${
        theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"
      } transition-colors`}
    >
      {editingChatId === chat.id ? (
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEditSave();
            if (e.key === "Escape") setEditingChatId(null);
          }}
          className={`flex-1 mr-2 px-3 py-2 rounded-lg border ${
            theme === "light"
              ? "border-gray-200 focus:border-primary-500 bg-white text-gray-800"
              : "border-gray-600 focus:border-primary-500 bg-gray-700 text-gray-200"
          } focus:outline-none focus:ring-2 ${
            theme === "light"
              ? "focus:ring-primary-200"
              : "focus:ring-primary-700"
          }`}
          autoFocus
        />
      ) : (
        <span
          className={`truncate flex-1 pr-2 ${
            theme === "light" ? "text-gray-700" : "text-gray-200"
          }`}
          onClick={() => onSelect(chat.id)}
        >
          {chat.title}
        </span>
      )}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(showMenu === chat.id ? null : chat.id);
          }}
          className={`p-2 rounded-lg ${
            theme === "light"
              ? "text-gray-500 hover:bg-gray-200"
              : "text-gray-400 hover:bg-gray-600"
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <AnimatePresence>
          {showMenu === chat.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 overflow-hidden ${
                theme === "light"
                  ? "bg-white ring-1 ring-black ring-opacity-5"
                  : "bg-gray-700 ring-1 ring-gray-600"
              }`}
              style={{ top: "auto", right: "1rem" }}
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChatId(chat.id);
                    setEditingTitle(chat.title);
                    setShowMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    theme === "light"
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-200 hover:bg-gray-600"
                  }`}
                >
                  <Edit size={14} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    theme === "light"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-red-400 hover:bg-red-900/20"
                  }`}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatBot;
