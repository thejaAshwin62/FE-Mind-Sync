import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "../Context/ChatContext";
import LoadingScreen from "../Componenets/LoadingScreen";
import useLoadingDelay from "../hooks/useLoadingDelay";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "../ui/background-gradient";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";
import { SparklesCore } from "../ui/sparkles";
import { CardContainer, CardBody, CardItem } from "../ui/3d-card";
import customFetch from "../utils/customFetch";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  const { aiName, setAiName, userName, setUserName } = useChat();
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempAIName, setTempAIName] = useState(aiName);
  const [tempUserName, setTempUserName] = useState(userName);
  const isLoading = useLoadingDelay();
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [captures, setCaptures] = useState([]);
  const [objects, setObjects] = useState([]);
  const [faceRecords, setFaceRecords] = useState([]);
  const [isLoadingFaces, setIsLoadingFaces] = useState(true);
  const [theme, setTheme] = useState("light");

  // Add voice management functions
  const updateVoicesForLanguage = (selectedLanguage) => {
    const voices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect && voices.length > 0) {
      // Filter voices for the selected language
      const languageVoices = voices.filter(voice => voice.lang.startsWith(selectedLanguage));
      const otherVoices = voices.filter(voice => !voice.lang.startsWith(selectedLanguage));
      
      // Create HTML for options
      let optionsHTML = '<option value="">Select a voice...</option>';
      
      if (languageVoices.length > 0) {
        optionsHTML += '<optgroup label="Matching Language Voices">';
        languageVoices.forEach(voice => {
          optionsHTML += '<option value="' + voice.name + '">' + 
            voice.name + ' (' + voice.lang + ')</option>';
        });
        optionsHTML += '</optgroup>';
      }
      
      if (otherVoices.length > 0) {
        optionsHTML += '<optgroup label="Other Available Voices">';
        otherVoices.forEach(voice => {
          optionsHTML += '<option value="' + voice.name + '">' + 
            voice.name + ' (' + voice.lang + ')</option>';
        });
        optionsHTML += '</optgroup>';
      }
      
      voiceSelect.innerHTML = optionsHTML;
      
      // Try to select the best matching voice
      const savedVoice = localStorage.getItem('selectedVoice');
      if (savedVoice && voices.some(v => v.name === savedVoice)) {
        voiceSelect.value = savedVoice;
      } else if (languageVoices.length > 0) {
        // If no saved voice, select the first matching language voice
        voiceSelect.value = languageVoices[0].name;
        localStorage.setItem('selectedVoice', languageVoices[0].name);
      }
    }
  };

  const initializeVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
      updateVoicesForLanguage(selectedLanguage);
    }
  };

  // Initialize voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Force voice load
      window.speechSynthesis.getVoices();
      
      // Set up event listener for when voices are loaded
      window.speechSynthesis.onvoiceschanged = () => {
        initializeVoices();
      };
      
      // Try initial load
      initializeVoices();
      
      // Retry after delays to ensure voices are loaded
      const retryTimers = [
        setTimeout(initializeVoices, 100),
        setTimeout(initializeVoices, 500),
        setTimeout(initializeVoices, 1000)
      ];

      // Cleanup timers on unmount
      return () => {
        retryTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, []);

  useEffect(() => {
    // Get theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    localStorage.setItem("theme", initialTheme);

    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "light";
      setTheme(updatedTheme);
      document.documentElement.classList.toggle(
        "dark",
        updatedTheme === "dark"
      );
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const captureResponse = await customFetch.get("/stats/overall");
        const responseObjects = await customFetch.get("/stats/objects");
        const facesResponse = await customFetch.get("/stats/faces");
        const captureData = captureResponse.data.data;
        const objectsData = responseObjects.data.data;
        const faceData = facesResponse.data.data.faceRecords;
        setCaptures(captureData);
        setObjects(objectsData);
        setFaceRecords(faceData);
        setIsLoadingFaces(false);
      } catch (error) {
        console.error(error);
        // Set default values in case of error
        setIsLoadingFaces(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleAINameSave = async () => {
    if (tempAIName.trim()) {
      setIsSavingAI(true);
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAiName(tempAIName.trim());
        setIsEditingAI(false);
      } finally {
        setIsSavingAI(false);
      }
    }
  };

  const handleUserNameSave = async () => {
    if (tempUserName.trim()) {
      setIsSavingUser(true);
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUserName(tempUserName.trim());
        setIsEditingUser(false);
      } finally {
        setIsSavingUser(false);
      }
    }
  };

  // Generate random colors for face avatars
  const getRandomColor = (name) => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-emerald-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];

    // Use the name to deterministically select a color
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Sample testimonials for the moving cards
  const testimonials = [
    {
      name: "Today at Coffee Shop",
      text: "Captured 24 images while working on your project. Asked about nearby lunch options.",
    },
    {
      name: "Yesterday at Park",
      text: "Recorded 45 images during your morning walk. Identified 3 different bird species.",
    },
    {
      name: "Last Week at Office",
      text: "Documented 120 images during meetings. Helped you remember key discussion points.",
    },
    {
      name: "Two Weeks Ago",
      text: "Captured 200+ images during your vacation. Created a visual diary of your trip.",
    },
  ];

  // Update the language selection handler
  const handleLanguageChange = async (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('selectedLanguage', selectedLang);
    
    // Force voice reload for the new language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(voice => voice.lang.startsWith(selectedLang));
    
    // If we have matching voices, select the first one by default
    if (matchingVoices.length > 0) {
      localStorage.setItem('selectedVoice', matchingVoices[0].name);
    }
    
    // Update the voice selection dropdown
    updateVoicesForLanguage(selectedLang);
    
    // Notify other components about the language change
    window.dispatchEvent(new CustomEvent('voiceSettingsChanged', {
      detail: { 
        language: selectedLang,
        voice: matchingVoices.length > 0 ? matchingVoices[0].name : null
      }
    }));

    // Test the new language settings
    const testMessage = getTestMessageForLanguage(selectedLang);
    const utterance = new SpeechSynthesisUtterance(testMessage);
    
    // Apply the new language settings
    utterance.lang = selectedLang;
    if (matchingVoices.length > 0) {
      utterance.voice = matchingVoices[0];
    }
    
    // Apply saved rate and pitch
    utterance.rate = parseFloat(localStorage.getItem('speechRate')) || 1;
    utterance.pitch = parseFloat(localStorage.getItem('speechPitch')) || 1;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Speak the test message
    window.speechSynthesis.speak(utterance);
  };

  // Add function to get test message for each language
  const getTestMessageForLanguage = (lang) => {
    switch(lang) {
      case 'ta-IN':
        return "வணக்கம், இது ஒரு சோதனை செய்தி.";
      case 'hi-IN':
        return "नमस्ते, यह एक परीक्षण संदेश है।";
      case 'te-IN':
        return "నమస్కారం, ఇది ఒక పరీక్ష సందేశం.";
      case 'kn-IN':
        return "ನಮಸ್ಕಾರ, ಇದು ಪರೀಕ್ಷಾ ಸಂದೇಶ.";
      case 'ml-IN':
        return "നമസ്കാരം, ഇത് ഒരു പരീക്ഷണ സന്ദേശമാണ്.";
      case 'mr-IN':
        return "नमस्कार, हे एक चाचणी संदेश आहे.";
      case 'gu-IN':
        return "નમસ્તે, આ એક પરીક્ષણ સંદેશ છે.";
      case 'bn-IN':
        return "নমস্কার, এটি একটি পরীক্ষার বার্তা।";
      case 'pa-IN':
        return "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਇਹ ਇੱਕ ਟੈਸਟ ਸੁਨੇਹਾ ਹੈ।";
      default:
        return "Hello, this is a test message.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-2 sm:p-4 md:p-10 pt-2 md:pt-4 relative transition-colors duration-300">
      {/* Subtle sparkles background */}

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-100 dark:border-slate-700 transition-colors duration-300"
        >
          {/* Header with user info */}

          <div className="absolute inset-0 z-0 opacity-30">
            <SparklesCore
              id="sparkles"
              background="transparent"
              minSize={1.5}
              maxSize={5}
              particleDensity={15}
              particleColor={theme === "light" ? "#3b82f6" : "#60a5fa"}
              particleSpeed={0.5}
            />
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src={user?.imageUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-4 border-white/30"
                />
                <a
                  href="https://myaccount.google.com/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors shadow-lg"
                  title="Change Profile Picture"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                </a>
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome to your Dashboard!
                </motion.h1>
                <motion.p
                  className="text-blue-100 text-sm sm:text-base break-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user?.emailAddresses[0].emailAddress}
                </motion.p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personalization Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1"
              >
                <BackgroundGradient className="rounded-xl p-[1px]">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl h-full transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Personalization
                    </h3>

                    {/* User Name Setting */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Display Name
                      </label>
                      <AnimatePresence mode="wait">
                        {isEditingUser ? (
                          <motion.div
                            key="editing-user"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              value={tempUserName}
                              onChange={(e) => setTempUserName(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 transition-colors duration-300"
                              disabled={isSavingUser}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUserNameSave}
                                className="px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 flex-1 sm:flex-none min-w-[80px] transition-colors duration-300"
                                disabled={isSavingUser}
                              >
                                {isSavingUser ? (
                                  <span className="flex justify-center items-center">
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingUser(false);
                                  setTempUserName(userName);
                                }}
                                className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 flex-1 sm:flex-none transition-colors duration-300"
                                disabled={isSavingUser}
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="display-user"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors duration-300"
                          >
                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                              {userName}
                            </span>
                            <button
                              onClick={() => setIsEditingUser(true)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AI Assistant Name Setting */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI Assistant Name
                      </label>
                      <AnimatePresence mode="wait">
                        {isEditingAI ? (
                          <motion.div
                            key="editing-ai"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              value={tempAIName}
                              onChange={(e) => setTempAIName(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 transition-colors duration-300"
                              disabled={isSavingAI}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleAINameSave}
                                className="px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 flex-1 sm:flex-none min-w-[80px] transition-colors duration-300"
                                disabled={isSavingAI}
                              >
                                {isSavingAI ? (
                                  <span className="flex justify-center items-center">
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  </span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingAI(false);
                                  setTempAIName(aiName);
                                }}
                                className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 flex-1 sm:flex-none transition-colors duration-300"
                                disabled={isSavingAI}
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="display-ai"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors duration-300"
                          >
                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                              {aiName}
                            </span>
                            <button
                              onClick={() => setIsEditingAI(true)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </BackgroundGradient>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              Total Captures
                            </h3>
                            <p className="text-3xl font-bold">
                              {captures.total || 0}
                            </p>
                          </div>
                          <div className="bg-white/10 dark:bg-slate-700/50 p-2 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-white/20 dark:bg-slate-700/50 h-2 rounded-full">
                            <div
                              className="bg-white dark:bg-blue-400 h-2 rounded-full"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                          <p className="text-xs mt-1 text-blue-100 dark:text-blue-300">
                            75% more than last month
                          </p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white dark:bg-slate-800 p-4 shadow-xl border dark:border-slate-700 transition-colors duration-300">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Capture Breakdown
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-700 dark:text-gray-300">
                            Today:{" "}
                            <span className="font-medium">
                              {captures.today || 0}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            This Week:{" "}
                            <span className="font-medium">
                              {captures.thisWeek || 0}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            This Month:{" "}
                            <span className="font-medium">
                              {captures.thisMonth || 0}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            Last Month:{" "}
                            <span className="font-medium">
                              {captures.lastMonth || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="bg-gradient-to-br from-purple-600 to-pink-700 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              Insights Generated
                            </h3>
                            <p className="text-3xl font-bold">
                              {objects.totalObjectsCount || 0}
                            </p>
                          </div>
                          <div className="bg-white/10 dark:bg-slate-700/50 p-2 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-white/20 dark:bg-slate-700/50 h-2 rounded-full">
                            <div
                              className="bg-white dark:bg-purple-400 h-2 rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                          <p className="text-xs mt-1 text-purple-100 dark:text-purple-300">
                            60% of captures analyzed
                          </p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white dark:bg-slate-800 p-4 shadow-xl border dark:border-slate-700 transition-colors duration-300">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Top Insights Categories
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>Average Per Image</span>
                            <span className="font-medium">
                              {objects?.averagePerImage?.toFixed(2) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-700 dark:text-gray-300">
                            <span>Unique Objects</span>
                            <span className="font-medium">
                              {objects?.totalUniqueObjects || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </motion.div>
            </div>

            {/* Speech Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 relative z-10"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v3.586l2.707-2.707a1 1 0 111.414 1.414L11.414 9H15a1 1 0 110 2h-3.586l3.293 3.293a1 1 0 01-1.414 1.414L10 12.414V16a1 1 0 11-2 0v-3.586l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 11H3a1 1 0 110-2h3.586L3.293 5.707a1 1 0 011.414-1.414L8 7.586V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Speech Settings
              </h3>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language Selection - Moved to top for better UX */}
                    <div className="relative z-20">
                      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speech Language
                      </label>
                      <select
                        id="language-select"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 cursor-pointer"
                        defaultValue={localStorage.getItem('selectedLanguage') || 'en-US'}
                        onChange={handleLanguageChange}
                      >
                        <optgroup label="Indian Languages">
                          <option value="hi-IN">Hindi</option>
                          <option value="ta-IN">Tamil</option>
                          <option value="te-IN">Telugu</option>
                          <option value="kn-IN">Kannada</option>
                          <option value="ml-IN">Malayalam</option>
                          <option value="mr-IN">Marathi</option>
                          <option value="gu-IN">Gujarati</option>
                          <option value="bn-IN">Bengali</option>
                          <option value="pa-IN">Punjabi</option>
                        </optgroup>
                        <optgroup label="English Variants">
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="en-IN">English (India)</option>
                        </optgroup>
                        <optgroup label="Other Languages">
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                          <option value="de-DE">German</option>
                          <option value="it-IT">Italian</option>
                          <option value="ja-JP">Japanese</option>
                          <option value="ko-KR">Korean</option>
                          <option value="zh-CN">Chinese (Simplified)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Voice Selection */}
                    <div className="relative z-20">
                      <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Selection
                      </label>
                      <select
                        id="voice-select"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 cursor-pointer"
                        defaultValue={localStorage.getItem('selectedVoice') || ''}
                        onChange={(e) => {
                          localStorage.setItem('selectedVoice', e.target.value);
                          window.dispatchEvent(new CustomEvent('voiceSettingsChanged', {
                            detail: { voice: e.target.value }
                          }));
                        }}
                      >
                        <option value="">Loading voices...</option>
                      </select>
                    </div>

                    {/* Speech Rate */}
                    <div className="relative z-20">
                      <label htmlFor="speech-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speech Rate
                      </label>
                      <input
                        id="speech-rate"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        defaultValue={localStorage.getItem('speechRate') || '1'}
                        className="w-full cursor-pointer"
                        onChange={(e) => {
                          localStorage.setItem('speechRate', e.target.value);
                          window.dispatchEvent(new CustomEvent('voiceSettingsChanged', {
                            detail: { rate: e.target.value }
                          }));
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>Slower</span>
                        <span>Normal</span>
                        <span>Faster</span>
                      </div>
                    </div>

                    {/* Speech Pitch */}
                    <div className="relative z-20">
                      <label htmlFor="speech-pitch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speech Pitch
                      </label>
                      <input
                        id="speech-pitch"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        defaultValue={localStorage.getItem('speechPitch') || '1'}
                        className="w-full cursor-pointer"
                        onChange={(e) => {
                          localStorage.setItem('speechPitch', e.target.value);
                          window.dispatchEvent(new CustomEvent('voiceSettingsChanged', {
                            detail: { pitch: e.target.value }
                          }));
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>Lower</span>
                        <span>Normal</span>
                        <span>Higher</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Speech */}
                  <div className="mt-6 relative z-20">
                    <button
                      onClick={() => {
                        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
                        
                        // Create test message based on selected language
                        let testMessage = "This is a test message to check the speech settings.";
                        switch(selectedLanguage) {
                          case 'ta-IN':
                            testMessage = "வணக்கம், இது ஒரு சோதனை செய்தி.";
                            break;
                          case 'hi-IN':
                            testMessage = "नमस्ते, यह एक परीक्षण संदेश है।";
                            break;
                          case 'te-IN':
                            testMessage = "నమస్కారం, ఇది ఒక పరీక్ష సందేశం.";
                            break;
                          case 'kn-IN':
                            testMessage = "ನಮಸ್ಕಾರ, ಇದು ಪರೀಕ್ಷಾ ಸಂದೇಶ.";
                            break;
                          case 'ml-IN':
                            testMessage = "നമസ്കാരം, ഇത് ഒരു പരീക്ഷണ സന്ദേശമാണ്.";
                            break;
                          // Add more languages as needed
                        }

                        const testUtterance = new SpeechSynthesisUtterance(testMessage);
                        
                        // Get available voices
                        const voices = speechSynthesis.getVoices();
                        const savedVoice = localStorage.getItem('selectedVoice');
                        
                        // First try to find the saved voice
                        if (savedVoice && voices.length > 0) {
                          const voice = voices.find(v => v.name === savedVoice);
                          if (voice) testUtterance.voice = voice;
                        }
                        
                        // If no saved voice or it's not available, try to find a voice for the selected language
                        if (!testUtterance.voice) {
                          const languageVoices = voices.filter(v => v.lang.startsWith(selectedLanguage));
                          if (languageVoices.length > 0) {
                            testUtterance.voice = languageVoices[0];
                          }
                        }

                        // Apply other settings
                        testUtterance.rate = parseFloat(localStorage.getItem('speechRate')) || 1;
                        testUtterance.pitch = parseFloat(localStorage.getItem('speechPitch')) || 1;
                        testUtterance.lang = selectedLanguage;

                        // Cancel any ongoing speech
                        speechSynthesis.cancel();

                        // Speak the test message
                        speechSynthesis.speak(testUtterance);
                      }}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 cursor-pointer"
                    >
                      Test Speech Settings
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recognized Faces Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Recognized Faces
              </h3>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative"
                style={{ isolation: 'isolate' }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Faces in Your Memories
                    </h3>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full transition-colors duration-300">
                    {faceRecords.length || 0} Faces
                  </span>
                </div>

                {isLoadingFaces ? (
                  <div className="p-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400 mb-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">
                        Loading faces...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {faceRecords.map((face, index) => (
                        <motion.div
                          key={face.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          className="relative"
                        >
                          <CardContainer className="w-full">
                            <CardBody className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 p-4">
                              <CardItem translateZ={20} className="w-full">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRandomColor(
                                      face.name
                                    )} flex items-center justify-center text-white text-2xl font-bold mb-3`}
                                  >
                                    {getInitials(face.name)}
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {face.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Recognition Score: {face.score + 90}
                                  </p>

                                  <div className="mt-4 w-full">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      <span>Recognition Confidence</span>
                                      <span>100%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
                                      <div
                                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-colors duration-300"
                                        style={{ width: "90%" }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </CardItem>

                              <CardItem
                                translateZ={50}
                                className="absolute bottom-4 right-4"
                              >
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </CardItem>
                            </CardBody>
                          </CardContainer>
                        </motion.div>
                      ))}
                    </div>

                    {faceRecords.length === 0 && (
                      <div className="text-center py-8">
                        <div className="bg-blue-50 dark:bg-blue-900/30 inline-block p-3 rounded-full mb-4 transition-colors duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-500 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                          No faces recognized yet
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          As you use your camera, it will learn to recognize
                          faces in your surroundings.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-t border-gray-100 dark:border-gray-600 transition-colors duration-300 relative">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Faces are automatically detected and recognized in your
                      captures
                    </p>
                    <Link 
                      to="/get-started/face-register" 
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer relative"
                      role="button"
                      aria-label="Manage Faces"
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 50 }}
                    >
                      <span className="flex items-center">
                        Manage Faces
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
