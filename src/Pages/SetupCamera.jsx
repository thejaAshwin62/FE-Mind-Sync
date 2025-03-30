import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "../ui/background-gradient";
import { SparklesCore } from "../ui/sparkles";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";
import { TypewriterEffect } from "../ui/typewriter-effect";
import customFetch from "../utils/customFetch";

const SetupCamera = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', 'error'
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [theme, setTheme] = useState("light");
  const [scanningNetworks, setScanningNetworks] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const formRef = useRef(null);

  // Mock available networks
  const mockNetworks = [
    { ssid: "Home-WiFi", strength: 90, secured: true },
    { ssid: "Office-Network", strength: 75, secured: true },
    { ssid: "Guest-Network", strength: 60, secured: false },
    { ssid: "Neighbor-WiFi", strength: 40, secured: true },
    { ssid: "Public-Hotspot", strength: 30, secured: false },
  ];

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

  const handleScanNetworks = () => {
    setScanningNetworks(true);

    // Simulate network scanning with a delay
    setTimeout(() => {
      setAvailableNetworks(mockNetworks);
      setScanningNetworks(false);
    }, 2000);
  };

  const handleSelectNetwork = (network) => {
    setSsid(network.ssid);
    // Scroll to password field
    setTimeout(() => {
      const passwordInput = document.getElementById("password");
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 100);
  };

  const handleWifiCredentialsCheck = async () => {
    try {
      const response = await customFetch.post("/stats/update-wifi", {
        ssid: ssid,
        password: password,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating wifi credentials:", error);
      throw error;
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!ssid || !password) {
      alert("Please enter both SSID and password");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus(null);

    try {
      // Post WiFi credentials to backend
      const result = await handleWifiCredentialsCheck();
      console.log("Wifi credentials update response:", result);

      if (result.success) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setConnectionStatus("success");
        setCurrentStep(2);

        // Scroll to the next step
        setTimeout(() => {
          const nextStepElement = document.getElementById("step2");
          if (nextStepElement) {
            nextStepElement.scrollIntoView({ behavior: "smooth" });
          }
        }, 1000);
      } else {
        setConnectionStatus("error");
      }
    } catch (error) {
      console.error("Failed to update WiFi credentials:", error);
      setConnectionStatus("error");
    } finally {
      setIsConnecting(false);
    }
  };

  const resetForm = () => {
    setSsid("");
    setPassword("");
    setConnectionStatus(null);
    setCurrentStep(1);

    // Scroll back to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  // Words for typewriter effect
  const words = [
    { text: "Connect" },
    { text: "Your" },
    { text: "Camera", className: "text-blue-500 dark:text-blue-400" },
    { text: "To" },
    { text: "WiFi" },
  ];

  // Setup steps
  const setupSteps = [
    {
      id: 1,
      title: "Connect to WiFi",
      description: "Connect your ESP32 camera to your WiFi network",
      icon: (
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
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      ),
      active: currentStep >= 1,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Verify Connection",
      description: "Ensure your camera is successfully connected",
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: currentStep >= 2,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Start Capturing",
      description: "Begin capturing images with your camera",
      icon: (
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
      ),
      active: currentStep >= 3,
      completed: currentStep > 3,
    },
  ];

  return (
    <section
      className={`min-h-screen bg-gradient-to-b ${
        theme === "light"
          ? "from-blue-50 to-indigo-50"
          : "from-slate-900 to-slate-800"
      } flex flex-col justify-start px-4 sm:px-6 md:px-8 py-5 relative overflow-hidden transition-colors duration-300`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
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

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/get-started"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Get Started
          </Link>
        </div>

        {/* Title Section with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <TypewriterEffect
              words={words}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className={`text-lg max-w-2xl mx-auto ${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            }`}
          >
            Follow these simple steps to connect your ESP32 camera to your WiFi
            network and start capturing moments.
          </motion.p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={"visible"}
          className="mb-12 w-full overflow-x-hidden"
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 px-4">
            {setupSteps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className="w-full md:flex-1 flex flex-col items-center text-center max-w-xs mx-auto"
                id={`step${step.id}`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    step.completed
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : step.active
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div
                      className={`${
                        step.active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.icon}
                    </div>
                  )}
                </div>

                <h3
                  className={`text-lg font-semibold mb-1 ${
                    step.active
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.title}
                </h3>

                <p
                  className={`text-sm ${
                    step.active
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.description}
                </p>

                {/* Connector line between steps - Only visible on md screens and above */}
                {index < setupSteps.length - 1 && (
                  <div className="hidden md:block absolute h-1 bg-gray-200 dark:bg-gray-700 w-1/3 left-[calc(50%+2rem)] top-8 z-0"></div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile step indicator */}
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex space-x-2">
              {setupSteps.map((step) => (
                <div
                  key={`indicator-${step.id}`}
                  className={`w-2 h-2 rounded-full ${
                    step.active ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Instructions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <BackgroundGradient className="rounded-2xl p-[1px]">
              <div
                className={`rounded-2xl p-6 ${
                  theme === "light" ? "bg-white" : "bg-slate-800"
                } h-full`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 flex items-center ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Setup Instructions
                </h2>

                <div className="space-y-6">
                  <div
                    className={`p-4 rounded-xl ${
                      theme === "light" ? "bg-blue-50" : "bg-blue-900/20"
                    } border ${
                      theme === "light" ? "border-blue-100" : "border-blue-800"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-2 flex items-center ${
                        theme === "light" ? "text-blue-800" : "text-blue-300"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Before You Begin
                    </h3>
                    <ul
                      className={`list-disc list-inside space-y-2 ${
                        theme === "light" ? "text-blue-700" : "text-blue-200"
                      } text-sm`}
                    >
                      <li>Make sure your ESP32 camera is powered on</li>
                      <li>
                        The camera should be in setup mode with its LED blinking
                        rapidly
                      </li>
                      <li>Keep the camera within range of your WiFi router</li>
                      <li>
                        Have your WiFi network name (SSID) and password ready
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${
                          theme === "light" ? "bg-blue-100" : "bg-blue-900/30"
                        } flex items-center justify-center ${
                          theme === "light" ? "text-blue-600" : "text-blue-400"
                        } mr-3`}
                      >
                        1
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          } mb-1`}
                        >
                          Power on your ESP32 camera
                        </h4>
                        <p
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          Connect the power supply to your ESP32 camera and wait
                          for the status LED to start blinking.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${
                          theme === "light" ? "bg-blue-100" : "bg-blue-900/30"
                        } flex items-center justify-center ${
                          theme === "light" ? "text-blue-600" : "text-blue-400"
                        } mr-3`}
                      >
                        2
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          } mb-1`}
                        >
                          Enter your WiFi credentials
                        </h4>
                        <p
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          Fill in your WiFi network name (SSID) and password in
                          the form on the right.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${
                          theme === "light" ? "bg-blue-100" : "bg-blue-900/30"
                        } flex items-center justify-center ${
                          theme === "light" ? "text-blue-600" : "text-blue-400"
                        } mr-3`}
                      >
                        3
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          } mb-1`}
                        >
                          Connect to WiFi
                        </h4>
                        <p
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          Click the "Connect" button and wait for the camera to
                          establish a connection.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${
                          theme === "light" ? "bg-blue-100" : "bg-blue-900/30"
                        } flex items-center justify-center ${
                          theme === "light" ? "text-blue-600" : "text-blue-400"
                        } mr-3`}
                      >
                        4
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          } mb-1`}
                        >
                          Verify connection
                        </h4>
                        <p
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          Once connected, the camera's LED will stop blinking
                          and remain solid.
                        </p>
                      </div>
                    </div>
                  </div>

                  <HoverCard>
                    <HoverCardTrigger>
                      <div
                        className={`p-4 rounded-xl ${
                          theme === "light" ? "bg-amber-50" : "bg-amber-900/20"
                        } border ${
                          theme === "light"
                            ? "border-amber-100"
                            : "border-amber-800"
                        } cursor-pointer`}
                      >
                        <h3
                          className={`text-lg font-semibold mb-2 flex items-center ${
                            theme === "light"
                              ? "text-amber-800"
                              : "text-amber-300"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Troubleshooting Tips
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "light"
                              ? "text-amber-700"
                              : "text-amber-200"
                          }`}
                        >
                          Having trouble connecting? Click for troubleshooting
                          tips...
                        </p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className={`p-4 ${
                        theme === "light" ? "bg-white" : "bg-slate-800"
                      } shadow-xl rounded-xl w-80 border ${
                        theme === "light"
                          ? "border-gray-200"
                          : "border-gray-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <h4
                          className={`font-semibold ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          Common Issues
                        </h4>
                        <ul
                          className={`list-disc list-inside space-y-1 text-sm ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-gray-300"
                          }`}
                        >
                          <li>
                            Make sure the camera is in setup mode (LED blinking)
                          </li>
                          <li>Check that your WiFi password is correct</li>
                          <li>
                            Ensure the camera is within range of your WiFi
                          </li>
                          <li>
                            Try restarting the camera by unplugging and plugging
                            it back in
                          </li>
                          <li>
                            Some networks with special characters may not work
                          </li>
                        </ul>
                        <div
                          className={`text-xs ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          } pt-2 border-t ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-700"
                          }`}
                        >
                          For more help, visit our{" "}
                          <a
                            href="#"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            support page
                          </a>
                          .
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Right Column - WiFi Connection Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            ref={formRef}
          >
            <div className="w-full mt-16 ">
              <div
                className={`rounded-2xl ${
                  theme === "light" ? "bg-white" : "bg-slate-800"
                } border ${
                  theme === "light" ? "border-gray-200" : "border-gray-700"
                } shadow-xl p-6 h-full`}
              >
                <div translateZ={50} className="w-full">
                  <h2
                    className={`text-2xl font-bold mb-6 flex items-center ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    WiFi Connection
                  </h2>

                  {connectionStatus === "success" ? (
                    <div className="text-center py-8">
                      <div
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                          theme === "light" ? "bg-green-100" : "bg-green-900/30"
                        } ${
                          theme === "light"
                            ? "text-green-600"
                            : "text-green-400"
                        } mb-4`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        Successfully Connected!
                      </h3>
                      <p
                        className={`mb-6 ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        Your ESP32 camera has been successfully connected to the
                        WiFi network.
                      </p>

                      <div
                        className={`p-4 rounded-xl ${
                          theme === "light" ? "bg-blue-50" : "bg-blue-900/20"
                        } mb-6 text-left`}
                      >
                        <h4
                          className={`font-medium mb-2 ${
                            theme === "light"
                              ? "text-blue-800"
                              : "text-blue-300"
                          }`}
                        >
                          Connection Details:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div
                            className={`${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Network:
                          </div>
                          <div
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            {ssid}
                          </div>
                          <div
                            className={`${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            IP Address:
                          </div>
                          <div
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            192.168.1.105
                          </div>
                          <div
                            className={`${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Status:
                          </div>
                          <div
                            className={`font-medium ${
                              theme === "light"
                                ? "text-green-600"
                                : "text-green-400"
                            }`}
                          >
                            Online
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setCurrentStep(3)}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex-1 flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Continue to Next Step
                        </button>
                        <button
                          onClick={resetForm}
                          className={`px-4 py-2 rounded-lg ${
                            theme === "light"
                              ? "bg-gray-200 text-gray-800"
                              : "bg-gray-700 text-gray-200"
                          } font-medium hover:bg-opacity-80 transition-all flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConnect} className="space-y-6">
                      {/* Network scanning section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <label
                            className={`block text-sm font-medium ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            Available Networks
                          </label>
                          <button
                            type="button"
                            onClick={handleScanNetworks}
                            className={`text-sm flex items-center ${
                              theme === "light"
                                ? "text-blue-600"
                                : "text-blue-400"
                            } hover:underline`}
                            disabled={scanningNetworks}
                          >
                            {scanningNetworks ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                                Scanning...
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Scan Networks
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className={`rounded-lg border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-700"
                          } overflow-hidden`}
                        >
                          {availableNetworks.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto">
                              {availableNetworks.map((network, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSelectNetwork(network)}
                                  className={`flex items-center justify-between p-3 cursor-pointer ${
                                    ssid === network.ssid
                                      ? theme === "light"
                                        ? "bg-blue-50"
                                        : "bg-blue-900/20"
                                      : theme === "light"
                                      ? "hover:bg-gray-50"
                                      : "hover:bg-gray-700"
                                  } ${
                                    index !== 0
                                      ? theme === "light"
                                        ? "border-t border-gray-200"
                                        : "border-t border-gray-700"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className="mr-3">
                                      {network.strength > 70 ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className={`h-5 w-5 ${
                                            theme === "light"
                                              ? "text-green-600"
                                              : "text-green-400"
                                          }`}
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : network.strength > 40 ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className={`h-5 w-5 ${
                                            theme === "light"
                                              ? "text-yellow-600"
                                              : "text-yellow-400"
                                          }`}
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className={`h-5 w-5 ${
                                            theme === "light"
                                              ? "text-red-600"
                                              : "text-red-400"
                                          }`}
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <div
                                        className={`font-medium ${
                                          theme === "light"
                                            ? "text-gray-900"
                                            : "text-white"
                                        }`}
                                      >
                                        {network.ssid}
                                      </div>
                                      <div
                                        className={`text-xs ${
                                          theme === "light"
                                            ? "text-gray-500"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        Signal: {network.strength}% •{" "}
                                        {network.secured ? "Secured" : "Open"}
                                      </div>
                                    </div>
                                  </div>
                                  {network.secured && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className={`h-4 w-4 ${
                                        theme === "light"
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : scanningNetworks ? (
                            <div
                              className={`p-6 text-center ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              <svg
                                className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500"
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
                              <p>Scanning for available networks...</p>
                            </div>
                          ) : (
                            <div
                              className={`p-6 text-center ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 mx-auto mb-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                                />
                              </svg>
                              <p>
                                Click "Scan Networks" to find available WiFi
                                networks
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SSID Input */}
                      <div>
                        <label
                          htmlFor="ssid"
                          className={`block text-sm font-medium ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-gray-300"
                          } mb-2`}
                        >
                          WiFi Network Name (SSID)
                        </label>
                        <input
                          type="text"
                          id="ssid"
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg ${
                            theme === "light"
                              ? "bg-white border-gray-300 focus:border-blue-500"
                              : "bg-slate-700 border-gray-600 focus:border-blue-400"
                          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                          placeholder="Enter WiFi name"
                          required
                        />
                      </div>

                      {/* Password Input */}
                      <div>
                        <label
                          htmlFor="password"
                          className={`block text-sm font-medium ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-gray-300"
                          } mb-2`}
                        >
                          WiFi Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg ${
                              theme === "light"
                                ? "bg-white border-gray-300 focus:border-blue-500"
                                : "bg-slate-700 border-gray-600 focus:border-blue-400"
                            } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                            placeholder="Enter WiFi password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                              theme === "light"
                                ? "text-gray-500 hover:text-gray-700"
                                : "text-gray-400 hover:text-gray-200"
                            }`}
                          >
                            {showPassword ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                  clipRule="evenodd"
                                />
                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                              </svg>
                            ) : (
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
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Connection Status */}
                      <AnimatePresence>
                        {connectionStatus === "error" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-4 rounded-lg ${
                              theme === "light"
                                ? "bg-red-50 text-red-800"
                                : "bg-red-900/20 text-red-300"
                            } flex items-start`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <p className="font-medium">Connection failed</p>
                              <p className="text-sm mt-1">
                                Unable to connect to the WiFi network. Please
                                check your credentials and try again.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isConnecting}
                        className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${
                          isConnecting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isConnecting ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                            Connecting...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Connect to WiFi
                          </div>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Camera Preview Section (shown when connected) */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
            id="step2"
          >
            <BackgroundGradient className="rounded-2xl p-[1px]">
              <div
                className={`rounded-2xl p-6 ${
                  theme === "light" ? "bg-white" : "bg-slate-800"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 flex items-center ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Camera Preview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`text-center ${
                          theme === "light" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-lg">Camera feed loading...</p>
                        <p className="text-sm mt-2">
                          This may take a few moments
                        </p>
                      </div>
                    </div>

                    {/* Status indicators */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                          Live
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                        ESP32-CAM • 192.168.1.105
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div
                      className={`p-4 rounded-xl ${
                        theme === "light" ? "bg-blue-50" : "bg-blue-900/20"
                      } border ${
                        theme === "light"
                          ? "border-blue-100"
                          : "border-blue-800"
                      }`}
                    >
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          theme === "light" ? "text-blue-800" : "text-blue-300"
                        }`}
                      >
                        Camera Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Connection:
                          </span>
                          <span
                            className={`font-medium ${
                              theme === "light"
                                ? "text-green-600"
                                : "text-green-400"
                            }`}
                          >
                            Online
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Signal Strength:
                          </span>
                          <span
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            Excellent (90%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Battery:
                          </span>
                          <span
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            Charging (85%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            Storage:
                          </span>
                          <span
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            2.4 GB Available
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3
                        className={`text-lg font-semibold mb-3 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        Camera Controls
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          className={`p-3 rounded-lg ${
                            theme === "light" ? "bg-white" : "bg-slate-700"
                          } border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-600"
                          } hover:bg-opacity-80 transition-all flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Take Photo
                        </button>
                        <button
                          className={`p-3 rounded-lg ${
                            theme === "light" ? "bg-white" : "bg-slate-700"
                          } border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-600"
                          } hover:bg-opacity-80 transition-all flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Record Video
                        </button>
                        <button
                          className={`p-3 rounded-lg ${
                            theme === "light" ? "bg-white" : "bg-slate-700"
                          } border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-600"
                          } hover:bg-opacity-80 transition-all flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-yellow-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                          </svg>
                          Settings
                        </button>
                        <button
                          className={`p-3 rounded-lg ${
                            theme === "light" ? "bg-white" : "bg-slate-700"
                          } border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-600"
                          } hover:bg-opacity-80 transition-all flex items-center justify-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-purple-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                          </svg>
                          More Options
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center`}
                      >
                        Continue to Next Step
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>
        )}

        {/* Start Capturing Section */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
            id="step3"
          >
            <BackgroundGradient className="rounded-2xl p-[1px]">
              <div
                className={`rounded-2xl p-6 ${
                  theme === "light" ? "bg-white" : "bg-slate-800"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 flex items-center ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Capturing
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div
                      className={`p-4 rounded-xl ${
                        theme === "light" ? "bg-green-50" : "bg-green-900/20"
                      } border ${
                        theme === "light"
                          ? "border-green-100"
                          : "border-green-800"
                      } mb-6`}
                    >
                      <h3
                        className={`text-lg font-semibold mb-2 flex items-center ${
                          theme === "light"
                            ? "text-green-800"
                            : "text-green-300"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Setup Complete!
                      </h3>
                      <p
                        className={`${
                          theme === "light"
                            ? "text-green-700"
                            : "text-green-200"
                        }`}
                      >
                        Your ESP32 camera is now successfully connected and
                        ready to use. You can start capturing images and videos.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3
                        className={`text-lg font-semibold ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        Capture Settings
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            className={`block text-sm font-medium ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            } mb-2`}
                          >
                            Capture Interval
                          </label>
                          <select
                            className={`w-full px-4 py-2 rounded-lg ${
                              theme === "light"
                                ? "bg-white border-gray-300"
                                : "bg-slate-700 border-gray-600"
                            } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                          >
                            <option value="15">
                              Every 15 minutes (Default)
                            </option>
                            <option value="30">Every 2 minutes</option>
                            <option value="60">Every 5 minute</option>
                            <option value="300">Every 10 minutes</option>
                            <option value="custom">Custom interval</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            } mb-2`}
                          >
                            Image Resolution
                          </label>
                          <select
                            className={`w-full px-4 py-2 rounded-lg ${
                              theme === "light"
                                ? "bg-white border-gray-300"
                                : "bg-slate-700 border-gray-600"
                            } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all`}
                          >
                            <option value="vga">VGA (640x480) - Default</option>
                            <option value="svga">SVGA (800x600)</option>
                            <option value="xga">XGA (1024x768)</option>
                            <option value="hd">HD (1280x720)</option>
                            <option value="sxga">SXGA (1280x1024)</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="night-mode"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="night-mode"
                            className={`ml-2 block text-sm ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            Enable night mode for low-light conditions
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="motion-detection"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="motion-detection"
                            className={`ml-2 block text-sm ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            Enable motion detection
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div
                      className={`p-4 rounded-xl ${
                        theme === "light" ? "bg-blue-50" : "bg-blue-900/20"
                      } border ${
                        theme === "light"
                          ? "border-blue-100"
                          : "border-blue-800"
                      } mb-6`}
                    >
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          theme === "light" ? "text-blue-800" : "text-blue-300"
                        }`}
                      >
                        Ready to Start
                      </h3>
                      <p
                        className={`${
                          theme === "light" ? "text-blue-700" : "text-blue-200"
                        } mb-4`}
                      >
                        Your camera will begin capturing images at the specified
                        interval once you click the Start button.
                      </p>

                      <div className="flex flex-col space-y-2">
                        <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Start Capturing
                        </button>

                        <Link
                          to="/dashboard"
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Go to Dashboard
                        </Link>
                      </div>
                    </div>

                    <div
                      className={`mt-auto p-4 rounded-xl ${
                        theme === "light" ? "bg-gray-50" : "bg-gray-800"
                      } border ${
                        theme === "light"
                          ? "border-gray-200"
                          : "border-gray-700"
                      }`}
                    >
                      <h3
                        className={`font-semibold mb-2 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        Need Help?
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        } mb-4`}
                      >
                        If you encounter any issues or have questions about your
                        camera setup, our support team is here to help.
                      </p>
                      <div className="flex space-x-4">
                        <a
                          href="#"
                          className={`text-sm ${
                            theme === "light"
                              ? "text-blue-600"
                              : "text-blue-400"
                          } hover:underline flex items-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          FAQ
                        </a>
                        <a
                          href="#"
                          className={`text-sm ${
                            theme === "light"
                              ? "text-blue-600"
                              : "text-blue-400"
                          } hover:underline flex items-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Contact Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </motion.div>
        )}

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-8 mb-12">
          <Link
            to="/get-started"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Get Started
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Go to Dashboard
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SetupCamera;
