import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundGradient } from "../ui/background-gradient";
import { TypewriterEffect } from "../ui/typewriter-effect";
import { CardContainer, CardBody } from "../ui/3d-card";
import { SparklesCore } from "../ui/sparkles";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";

const GetStarted = () => {
  const containerRef = useRef(null);
 
  const [activeStep, setActiveStep] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
   const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);

    // Set loaded state after a small delay to trigger animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Words for typewriter effect
  const words = [
    { text: "Discover" },
    { text: "How" },
    { text: "Our" },
    { text: "Camera", className: "text-blue-500 dark:text-blue-400" },
    { text: "Transforms", className: "text-blue-500 dark:text-blue-400" },
    { text: "Your" },
    { text: "Experience" },
  ];

  // Steps data with Pexels images
  const steps = [
    {
      id: 1,
      title: "Set Up Your Camera",
      description:
        "Simply charge your camera and connect it to your device. Our seamless setup process gets you started in minutes with minimal configuration required.",
      image:
        "https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      path: "/get-started/setup-camera",
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
      color: "from-blue-500 to-indigo-600",
      features: [
        "Quick 5-minute setup",
        "Automatic device pairing",
        "No technical knowledge required",
      ],
    },
    {
      id: 2,
      title: "Ask Your Questions",
      description:
        "Use the intuitive chatbot interface to inquire about your surroundings, get information about locations, identify objects, and receive personalized insights.",
      image:
        "https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      path: "/get-started/chatbot",
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-600",
      features: [
        "Natural language processing",
        "Context-aware responses",
        "Memory of previous interactions",
      ],
    },
    {
      id: 3,
      title: "Explore Your Data",
      description:
        "Dive into the rich visual data captured by your camera. Browse through your timeline, discover patterns, and gain insights from your daily experiences.",
      image:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      path: "/get-started/face-register",
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600",
      features: [
        "Interactive timeline view",
        "Advanced filtering options",
        "Visual data analytics",
      ],
    },
  ];

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

  return (
    <section
      className={`min-h-screen bg-gradient-to-b ${
        theme === "light"
          ? "from-primary-50 to-primary-100"
          : "from-slate-900 to-slate-800"
      } flex flex-col justify-start px-4 sm:px-6 md:px-5 py-12 relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <SparklesCore
            id="sparkles"
            background="transparent"
            minSize={1.5}
            maxSize={5}
            particleDensity={20}
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
        {/* Header Section with Parallax Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-20"
        >
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            {/* Animated title with typewriter effect */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <TypewriterEffect
                words={words}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <BackgroundGradient className=" rounded-2xl">
                <div
                  className={`${
                    theme === "light" ? "bg-white/90" : "bg-slate-800/90"
                  } p-6 rounded-xl backdrop-blur-sm`}
                >
                  <p
                    className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto ${
                      theme === "light" ? "text-secondary-950" : "text-gray-300"
                    }`}
                  >
                    Our innovative camera captures your surroundings every 15
                    seconds, converting visual data into actionable text. This
                    allows you to interact with your environment like never
                    before.
                  </p>
                </div>
              </BackgroundGradient>
            </motion.div>
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute -top-10 left-10 hidden md:block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-10 right-10 hidden md:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600"
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
            </div>
          </motion.div>
        </motion.div>

        {/* Main Steps Section with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className={`text-2xl md:text-3xl font-bold text-center mb-12 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Three Simple Steps to Get Started
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 px-4 sm:px-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className="h-full"
                onHoverStart={() => setActiveStep(step.id)}
                onHoverEnd={() => setActiveStep(null)}
              >
                <Link to={step.path} className="block h-full">
                  <CardContainer className="w-full h-full">
                    <CardBody
                      className={`rounded-xl shadow-xl overflow-hidden group transition-all duration-500 h-full ${
                        theme === "light"
                          ? "bg-white border border-blue-100 hover:shadow-2xl"
                          : "bg-slate-800 border border-slate-700 hover:shadow-2xl hover:shadow-blue-900/20"
                      }`}
                    >
                      <div className="w-full relative">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={step.image || "/placeholder.svg"}
                            alt={`Step ${step.id}`}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-40 group-hover:opacity-30 transition-opacity duration-500`}
                          ></div>

                          {/* Step number overlay */}
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-blue-600 font-bold shadow-lg">
                            {step.id}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center mb-4">
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white mr-3 shadow-lg`}
                            >
                              {step.icon}
                            </div>
                            <h2
                              className={`text-xl font-bold ${
                                theme === "light"
                                  ? "text-primary-950"
                                  : "text-white"
                              }`}
                            >
                              {step.title}
                            </h2>
                          </div>
                          <p
                            className={`text-sm ${
                              theme === "light"
                                ? "text-secondary-950"
                                : "text-gray-300"
                            } mb-4`}
                          >
                            {step.description}
                          </p>

                          {/* Feature list */}
                          <ul className="space-y-2 mb-4">
                            {step.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className={`flex items-center text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4 mr-2 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4">
                          <div
                            className={`bg-gradient-to-r ${step.color} text-white py-3 px-4 rounded-lg text-center transform transition-all duration-300 group-hover:scale-105 shadow-lg group-hover:shadow-xl`}
                          >
                            <span className="flex items-center justify-center">
                              Get Started
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </CardContainer>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mb-20"
        >
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className={`p-8 ${
                theme === "light"
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                  : "bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700"
              } rounded-2xl`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2
                    className={`text-2xl md:text-3xl font-bold mb-4 ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    See How It Works
                  </h2>
                  <p
                    className={`mb-6 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Our camera technology captures images every 15 seconds and
                    processes them into actionable insights. Watch the demo to
                    see how it transforms your daily experiences.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <HoverCard>
                      <HoverCardTrigger>
                        <button
                          className={`flex items-center px-5 py-3 rounded-lg ${
                            theme === "light"
                              ? "bg-white text-blue-600 shadow-md hover:shadow-lg"
                              : "bg-slate-700 text-blue-400 shadow-md hover:shadow-lg"
                          } transition-all duration-300`}
                        >
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
                          Watch Demo
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent
                        className={`p-4 ${
                          theme === "light" ? "bg-white" : "bg-slate-800"
                        } shadow-xl rounded-lg w-72`}
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold">Interactive Demo</h4>
                          <p className="text-sm">
                            Our 3-minute demo shows the complete experience from
                            setup to daily use.
                          </p>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">
                              Duration: 3:24
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>

                    <Link to="/get-started/setup-camera">
                      <button
                        className={`flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300`}
                      >
                        Start Now
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
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
                    <img
                      src="https://images.pexels.com/photos/3059745/pexels-photo-3059745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Camera Demo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 z-10"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 5,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-4 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 z-10"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 5,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg p-3 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
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
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mt-16 text-center"
        >
          <BackgroundGradient className="inline-block p-1 rounded-xl">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-slate-800/90"
              } px-8 py-8 rounded-2xl backdrop-blur-sm`}
            >
              <motion.h3
                className={`text-2xl md:text-3xl font-bold mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Ready to transform your experience?
              </motion.h3>
              <motion.p
                className={`text-lg mb-6 max-w-2xl mx-auto ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Follow these simple steps to get started with your new camera
                and unlock a new way to interact with your world.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Link to="/get-started/setup-camera">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg">
                    Begin Your Journey
                  </button>
                </Link>
              </motion.div>

              {/* Additional links */}
              <motion.div
                className="mt-6 flex flex-wrap justify-center gap-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <a
                  href="#"
                  className={`${
                    theme === "light"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-400 hover:text-blue-400"
                  } transition-colors`}
                >
                  View Documentation
                </a>
                <span
                  className={`${
                    theme === "light" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  •
                </span>
                <a
                  href="#"
                  className={`${
                    theme === "light"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-400 hover:text-blue-400"
                  } transition-colors`}
                >
                  Watch Tutorial
                </a>
                <span
                  className={`${
                    theme === "light" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  •
                </span>
                <a
                  href="#"
                  className={`${
                    theme === "light"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-400 hover:text-blue-400"
                  } transition-colors`}
                >
                  Contact Support
                </a>
              </motion.div>
            </div>
          </BackgroundGradient>
        </motion.div>
      </div>
    </section>
  );
};

export default GetStarted;
