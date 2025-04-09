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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);

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

  // Add translation function
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}&key=7af0189b27df62438c8a`);
      const data = await response.json();
      return data.responseData.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Add a function to split text into chunks
  const splitTextIntoChunks = (text, maxLength = 500) => {
    const chunks = [];
    let currentChunk = '';
    
    // Split by sentences first
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };

  // Update the speakText function to handle speech toggling and switching
  const speakText = async (text, messageId) => {
    if ('speechSynthesis' in window) {
      // If clicking the same message that's currently speaking, toggle speech
      if (currentSpeakingId === messageId && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        return;
      }

      // If a different message is speaking, stop it first
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }

      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
      
      // Split text into chunks
      const textChunks = splitTextIntoChunks(text);
      
      // Translate each chunk
      const translatedChunks = [];
      for (const chunk of textChunks) {
        let translatedText = chunk;
        if (!selectedLanguage.startsWith('en')) {
          try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${selectedLanguage.split('-')[0]}&key=7af0189b27df62438c8a`);
            if (response.status === 429) {
              console.warn('Translation API rate limit reached, using original text');
              translatedText = chunk;
            } else {
              const data = await response.json();
              if (data.responseData && data.responseData.translatedText) {
                translatedText = data.responseData.translatedText;
              } else {
                console.warn('Translation failed, using original text:', chunk);
                translatedText = chunk;
              }
            }
          } catch (error) {
            console.error('Translation error:', error);
            // Use original text if translation fails
            translatedText = chunk;
          }
        }
        translatedChunks.push(translatedText);
      }

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a voice matching the selected language
      let selectedVoice = null;
      if (selectedLanguage.startsWith('en')) {
        // For English, try to find a matching voice
        const matchingVoices = voices.filter(voice => voice.lang.startsWith(selectedLanguage));
        if (matchingVoices.length > 0) {
          selectedVoice = matchingVoices[0];
        }
      } else {
        // For other languages, try to find a matching voice
        const matchingVoices = voices.filter(voice => voice.lang.startsWith(selectedLanguage));
        if (matchingVoices.length > 0) {
          selectedVoice = matchingVoices[0];
        } else {
          // If no matching voice found, use the first available voice
          selectedVoice = voices[0];
        }
      }
      
      // Apply saved settings
      const savedRate = localStorage.getItem('speechRate');
      const savedPitch = localStorage.getItem('speechPitch');

      // Create and speak each chunk
      let currentChunkIndex = 0;
      
      const speakNextChunk = () => {
        if (currentChunkIndex >= translatedChunks.length) {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(translatedChunks[currentChunkIndex]);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = savedRate ? parseFloat(savedRate) : 1;
        utterance.pitch = savedPitch ? parseFloat(savedPitch) : 1;
        utterance.lang = selectedLanguage;

        utterance.onend = () => {
          currentChunkIndex++;
          if (currentSpeakingId === messageId) { // Only continue if this is still the current message
            speakNextChunk();
          }
        };

        utterance.onerror = () => {
          currentChunkIndex++;
          if (currentSpeakingId === messageId) { // Only continue if this is still the current message
            speakNextChunk();
          }
        };

        if (currentChunkIndex === 0) {
          setIsSpeaking(true);
          setCurrentSpeakingId(messageId);
        }

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    }
  };

  // Update the message bubble to show speaking state
  const renderMessageBubble = (message) => {
    const isCurrentMessageSpeaking = currentSpeakingId === message.id;
    
    return (
      <div
        className={`chat-bubble relative ${
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
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <div className="font-medium bg-blue-500 text-white px-2 py-1 rounded-md">
              You asked: {message.userQuery}
            </div>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">{message.content}</div>
          {message.sender === "bot" && (
            <button
              onClick={() => speakText(message.content, message.id)}
              className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-200 ${
                isCurrentMessageSpeaking
                  ? theme === "light"
                    ? "bg-primary-100 text-primary-600"
                    : "bg-primary-900 text-primary-400"
                  : theme === "light"
                  ? "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  : "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              }`}
              title={isCurrentMessageSpeaking ? "Stop reading" : "Read aloud"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isCurrentMessageSpeaking ? 
                    "M6 18L18 6M6 6l12 12" : // Stop icon
                    "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" // Play icon
                  }
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Update the handleSubmit function to translate bot responses
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
      date: currentDate,
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
        botResponse = "I couldn't find any memories matching your query. Try asking about a specific time and date, like 'what did I do today morning?' or 'what happened yesterday at 2 PM?'";
      }

      // Get the selected language
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
      
      // Translate the response if not in English
      let translatedResponse = botResponse;
      if (!selectedLanguage.startsWith('en')) {
        try {
          const translationResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(botResponse)}&langpair=en|${selectedLanguage.split('-')[0]}&key=7af0189b27df62438c8a`);
          const translationData = await translationResponse.json();
          if (translationData.responseData && translationData.responseData.translatedText) {
            translatedResponse = translationData.responseData.translatedText;
          }
        } catch (error) {
          console.error('Translation error:', error);
        }
      }

      const botMessage = {
        id: Date.now(),
        content: translatedResponse,
        originalContent: botResponse, // Store original English text
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: currentDate,
        userQuery: userQuery,
      };

      // Add bot message to chat
      await addMessageToChat(currentChatId, botMessage);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        id: Date.now(),
        content: "I'm having trouble connecting to the server. Please check your connection and try again.",
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

  // Add this useEffect to initialize voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const voiceSelect = document.getElementById('voice-select');
      if (voiceSelect) {
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        // Add voices to select element
        voices.forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.name;
          option.textContent = `${voice.name} (${voice.lang})`;
          voiceSelect.appendChild(option);
        });

        // Set selected voice from localStorage if available
        const savedVoice = localStorage.getItem('selectedVoice');
        if (savedVoice) {
          voiceSelect.value = savedVoice;
        }
      }
    };

    // Load voices when they become available
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial load

    // Listen for voice settings changes
    const handleVoiceSettingsChange = (event) => {
      const { voice, rate, pitch, language } = event.detail;
      if (voice) localStorage.setItem('selectedVoice', voice);
      if (rate) localStorage.setItem('speechRate', rate);
      if (pitch) localStorage.setItem('speechPitch', pitch);
      if (language) localStorage.setItem('selectedLanguage', language);
    };

    window.addEventListener('voiceSettingsChanged', handleVoiceSettingsChange);

    return () => {
      window.removeEventListener('voiceSettingsChanged', handleVoiceSettingsChange);
    };
  }, []);

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

      {/* Desktop Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 ${isSidebarOpen ? 'left-[288px]' : 'left-0'} z-[1000] items-center justify-center w-6 h-24 ${
          theme === "light"
            ? "bg-primary-950 hover:bg-primary-800"
            : "bg-gray-700 hover:bg-gray-600"
        } text-white rounded-r-lg shadow-lg transition-all duration-300`}
        aria-label="Toggle Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
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
            className={`fixed md:relative inset-y-0 left-0 transform md:translate-x-0 transition-transform duration-300 ease-in-out w-72 flex flex-col z-[999] h-full overflow-hidden ${
              theme === "light"
                ? "bg-white border-r border-gray-200"
                : "bg-gray-800 border-r border-gray-700"
            } ${!isSidebarOpen && 'md:hidden'}`}
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
                        {renderMessageBubble(message)}
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
