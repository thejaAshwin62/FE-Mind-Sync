import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundGradient } from "../ui/background-gradient";
import { SparklesCore } from "../ui/sparkles";
import { CardContainer, CardBody, CardItem } from "../ui/3d-card";
import { TypewriterEffect } from "../ui/typewriter-effect";

const About = () => {
  const containerRef = useRef(null);
  const [theme, setTheme] = useState("light");

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

  // Words for typewriter effect
  const words = [
    { text: "About" },
    { text: "Our" },
    { text: "Vision" },
    { text: "And" },
    { text: "Journey", className: "text-blue-500" },
  ];

  // Team members data
  const teamMembers = [
    {
      name: "THEJA ASHWIN",
      role: "DEVELOPER",
      bio: "handles the backend, managing the server, OCR processing, and AI-driven query retrieval.",
      image:
        "https://res.cloudinary.com/dhhgw0who/image/upload/v1742576747/MindSync/hnplcm3x2qdyyvsuhqyv.png", // Ensure this path is correct and the image exists
    },
    {
      name: "MAHESHWAR",
      role: "DEVELOPER",
      bio: "is responsible for IoT, developing ESP32-CAM firmware and optimizing power efficiency.",
      image:
        "https://res.cloudinary.com/dhhgw0who/image/upload/v1742576746/MindSync/cycsybmbdbrpc9axrpsk.jpg",
    },
    {
      name: "VIMAL",
      role: "DEVELOPER",
      bio: "handles the frontend, designing the user interface and integrating AI-powered search.",
      image:
        "https://res.cloudinary.com/dhhgw0who/image/upload/v1742576746/MindSync/fetuhjgujohxiz4tedy0.jpg",
    },
    {
      name: "SURYA",
      role: "DEVELOPER",
      bio: "works on the frontend, ensuring real-time synchronization and seamless data interaction.",
      image:
        "https://res.cloudinary.com/dhhgw0who/image/upload/v1742576748/MindSync/iakpeii6mgwqapobprj3.jpg",
    },
  ];

  // Milestones data
  const milestones = [
    {
      year: "1",
      title: "Image Capture",
      description:
        "The ESP32-CAM, embedded in the glasses, captures an image every 15 minutes.",
    },
    {
      year: "2",
      title: "Image Upload to Backend",
      description:
        "The ESP32 sends the captured image to a backend server over Wi-Fi, along with the user's session token for authentication.",
    },
    {
      year: "3",
      title: "AI-Powered Image Processing",
      description:
        "The backend processes the image using OCR (Tesseract, Google Vision API, etc.) to extract text and store it in a database.",
    },
    {
      year: "4",
      title: "AI-Based Querying",
      description:
        "When the user asks a question (e.g., “What was I doing last Monday?”), the AI assistant searches stored text data using semantic search & NLP.",
    },
    {
      year: "5",
      title: "AI Assistant Response",
      description:
        "The AI provides a response based on past records, giving users a memory augmentation experience via voice or text.",
    },
  ];

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        theme === "light"
          ? "bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50"
          : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900 text-white"
      }`}
    >
      
      <SparklesCore
        id="sparkles"
        background="transparent"
        minSize={1.5}
        maxSize={5}
        particleDensity={15}
        particleColor={theme === "light" ? "#3b82f6" : "#60a5fa"}
        particleSpeed={0.5}
        opacity={0.3}
      />
     
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
       

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <TypewriterEffect
              words={words}
              className="text-3xl sm:text-4xl md:text-5xl"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${
              theme === "light" ? "text-slate-700" : "text-slate-400"
            }`}
          >
            At MindSync, we're revolutionizing how people interact with their
            surroundings through cutting-edge camera technology and AI-powered
            insights. Our journey began with a simple question: What if your
            camera could not only capture moments but understand them?
          </motion.p>
        </div>

        {/* Our Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-24"
        >
          <BackgroundGradient className="p-[1px] rounded-2xl">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-slate-800"
              } backdrop-blur-sm p-8 sm:p-10 rounded-2xl overflow-hidden`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2
                    className={`text-2xl sm:text-3xl font-bold ${
                      theme === "light" ? "text-slate-900" : "text-slate-50"
                    } mb-4`}
                  >
                    Our Mission
                  </h2>
                  <p
                    className={`text-slate-700 mb-6 ${
                      theme === "light" ? "text-slate-700" : "text-white"
                    }`}
                  >
                    We believe that visual data is one of the most underutilized
                    resources in our daily lives. Our mission is to transform
                    how people capture, process, and interact with visual
                    information, making it more accessible, insightful, and
                    actionable.
                  </p>
                  <p
                    className={`text-slate-700 ${
                      theme === "light" ? "text-slate-700" : "text-white"
                    }`}
                  >
                    Through our innovative camera technology, we're building a
                    future where your surroundings become a rich source of
                    information that enhances your decision-making, creativity,
                    and understanding of the world around you.
                  </p>
                </div>
                <div className="relative h-64 sm:h-80 md:h-full rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10 rounded-xl"></div>
                  <img
                    src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
                    alt="Advanced camera technology capturing visual data"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

        {/* Team Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-3xl font-bold ${
                theme === "light" ? "text-slate-900" : "text-white"
              } mb-4 `}
            >
              TEAM MEMBERS
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={`text-lg max-w-2xl mx-auto ${
                theme === "light" ? "text-slate-700" : "text-slate-400"
              }`}
            >
              Passionate innovators dedicated to transforming how you experience
              and interact with your world.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <CardContainer className="w-full">
                  <CardBody
                    className={`${
                      theme === "light"
                        ? "bg-white/80 border border-gray-100"
                        : "bg-slate-800/80 border-none"
                    } backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full`}
                  >
                    <CardItem translateZ={50} className="w-full">
                      <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <h3
                        className={`text-xl font-bold ${
                          theme === "light" ? "text-slate-900" : "text-white"
                        } mb-1`}
                      >
                        {member.name}
                      </h3>
                      <p className={`font-medium mb-3 ${
                        theme === "light" ? "text-blue-600" : "text-blue-400"
                      }`}>
                        {member.role}
                      </p>
                      <p
                        className={`${
                          theme === "light"
                            ? "text-slate-600"
                            : "text-slate-300"
                        } text-sm`}
                      >
                        {member.bio}
                      </p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-3xl font-bold ${
                theme === "light" ? "text-slate-900" : "text-white"
              } mb-4`}
            >
              HOW IT WORKS
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={`text-lg max-w-2xl mx-auto  ${
                theme === "light" ? "text-slate-700" : "text-slate-400"
              }`}
            >
              Key milestones that have shaped our path to innovation and
              excellence.
            </motion.p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full"></div>

            {/* Timeline items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1 md:w-1/2 mb-4 md:mb-0 ">
                    <BackgroundGradient
                      className={`p-[1px] rounded-xl  ${
                        index % 2 === 0 ? "md:mr-8" : "md:ml-8"
                      }`}
                    >
                      <div
                        className={`${
                          theme === "light"
                            ? "bg-white/90 "
                            : "bg-slate-800/90 "
                        } backdrop-blur-sm rounded-xl p-6 h-full`}
                      >
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mb-3">
                          {milestone.year}
                        </div>
                        <h3
                          className={`text-xl font-bold ${
                            theme === "light" ? "text-slate-900" : "text-white"
                          } mb-2`}
                        >
                          {milestone.title}
                        </h3>
                        <p
                          className={`${
                            theme === "light"
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          {milestone.description}
                        </p>
                      </div>
                    </BackgroundGradient>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-blue-500 z-10"></div>

                  {/* Empty div for layout on alternate sides */}
                  <div className="flex-1 md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <BackgroundGradient className="p-[1px] rounded-2xl">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-slate-800/90"
              } backdrop-blur-sm rounded-2xl p-8 sm:p-10`}
            >
              <h2
                className={`text-2xl sm:text-3xl font-bold ${
                  theme === "light" ? "text-slate-900" : "text-white"
                } mb-8 text-center`}
              >
                Our Core Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div
                  className={`${
                    theme === "light"
                      ? "bg-blue-50 border-gray-100"
                      : "bg-slate-700 border-gray-100"
                  } p-6 rounded-xl`}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === "light" ? "text-slate-900" : "text-white"
                    } mb-2`}
                  >
                    Innovation
                  </h3>
                  <p
                    className={`${
                      theme === "light" ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    We constantly push the boundaries of what's possible,
                    embracing new ideas and technologies to create breakthrough
                    solutions.
                  </p>
                </div>

                <div
                  className={`${
                    theme === "light"
                      ? "bg-indigo-50 border-gray-100"
                      : "bg-slate-700 border-gray-100"
                  } p-6 rounded-xl`}
                >
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === "light" ? "text-slate-900" : "text-white"
                    } mb-2`}
                  >
                    User-Centered
                  </h3>
                  <p
                    className={`${
                      theme === "light" ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    We design with empathy, putting our users' needs,
                    experiences, and feedback at the heart of everything we
                    create.
                  </p>
                </div>

                <div
                  className={`${
                    theme === "light"
                      ? "bg-purple-50 border-gray-100"
                      : "bg-slate-700 border-gray-100"
                  } p-6 rounded-xl`}
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === "light" ? "text-slate-900" : "text-white"
                    } mb-2`}
                  >
                    Privacy & Trust
                  </h3>
                  <p
                    className={`${
                      theme === "light" ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    We uphold the highest standards of data privacy and
                    security, ensuring our users can trust us with their
                    information.
                  </p>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className={`text-3xl font-bold ${
              theme === "light" ? "text-slate-900" : "text-white"
            } mb-4`}
          >
            Ready to Join Our Journey?
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto mb-8 ${
              theme === "light" ? "text-slate-700" : "text-slate-400"
            }`}
          >
            Experience the future of visual data capture and analysis with
            MindSync.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-started">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1">
                Get Started
              </button>
            </Link>
            <Link to="/contact">
              <button
                className={`px-8 py-4 rounded-xl transition-all border shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  theme === "light"
                    ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-900"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                Contact Us
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;