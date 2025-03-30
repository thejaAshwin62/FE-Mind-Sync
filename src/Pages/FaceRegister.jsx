import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BackgroundGradient } from "../ui/background-gradient"
import { SparklesCore } from "../ui/sparkles"
import {
  Camera,
  Upload,
  X,
  Check,
  User,
  Save,
  RefreshCw,
  Zap,
  Shield,
  Database,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import axios from "axios"

const FaceRegister = () => {
  const [captureMethod, setCaptureMethod] = useState(null)
  const [cameraPermission, setCameraPermission] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [faceName, setFaceName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState("light")
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Check if dark mode is enabled in system
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    // Get theme from localStorage or use system preference
    const savedTheme = localStorage.getItem("theme")
    const currentTheme = savedTheme || (systemDarkMode ? "dark" : "light")
    setTheme(currentTheme)
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')

    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        const updatedTheme = e.newValue || "light"
        setTheme(updatedTheme)
        document.documentElement.classList.toggle('dark', updatedTheme === 'dark')
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Set loaded state after a small delay to trigger animations
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearTimeout(timer)
    }
  }, [])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const requestCameraPermission = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setCameraPermission("granted")
      return stream
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraPermission("denied")
      setError("Camera access denied. Please enable camera permissions and try again.")
      return null
    }
  }

  const startCamera = async () => {
    const stream = streamRef.current || (await requestCameraPermission())
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      setIsCameraActive(true)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/png")
      setCapturedImage(imageDataUrl)

      // Stop the camera
      stopCamera()
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setError(null)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.onerror = () => {
        setError("Error reading file. Please try again with a different image.")
      }
      reader.readAsDataURL(file)
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    setFaceName("")
    setError(null)

    if (captureMethod === "camera") {
      startCamera()
    }
  }

  const handleMethodSelect = (method) => {
    setCaptureMethod(method)
    setError(null)

    if (method === "camera") {
      startCamera()
    }
  }

  const saveFace = async () => {
    if (!faceName.trim()) {
      setError("Please enter a name for this face")
      return
    }

    const imageToSave = capturedImage || uploadedImage
    if (!imageToSave) {
      setError("No image captured or uploaded")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Convert base64 image to blob with proper type
      const base64Data = imageToSave.split(',')[1] // Remove the data URL prefix
      const byteCharacters = atob(base64Data)
      const byteArrays = []
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024)
        const byteNumbers = new Array(slice.length)
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        
        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }
      
      const blob = new Blob(byteArrays, { type: 'image/png' })

      // Create FormData with fresh data
      const formData = new FormData()
      formData.append('image', blob, 'face.png')
      formData.append('name', faceName.trim())

      // Send to backend with fresh data
      const result = await axios.post('http://localhost:5500/face-register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (result.data.success) {
        setIsSuccess(true)
        // Reset all state after successful upload
        setTimeout(() => {
          setIsSuccess(false)
          setCaptureMethod(null)
          setCapturedImage(null)
          setUploadedImage(null)
          setFaceName("")
          setError(null)
        }, 3000)
      } else {
        throw new Error(result.data.message || 'Failed to save face')
      }
    } catch (err) {
      console.error('Error saving face:', err)
      setError(err.response?.data?.message || err.message || "Failed to save face. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  }

  const pulse = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
  }

  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  const rotateAnimation = {
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  const glowAnimation = {
    boxShadow: [
      "0 0 5px rgba(59, 130, 246, 0.5)",
      "0 0 20px rgba(59, 130, 246, 0.7)",
      "0 0 5px rgba(59, 130, 246, 0.5)",
    ],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        theme === "light"
          ? "bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50"
          : "bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white"
      }`}
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0 opacity-30">
        <SparklesCore
          id="faceregister-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={20}
          particleColor={theme === "light" ? "#4f46e5" : "#818cf8"}
          particleSpeed={0.3}
        />
      </div>

      {/* Gradient orbs */}
      <motion.div
        animate={floatAnimation}
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />
      <motion.div
        animate={{
          ...floatAnimation,
          transition: { ...floatAnimation.transition, delay: 0.5 },
        }}
        className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />
      <motion.div
        animate={{
          ...floatAnimation,
          transition: { ...floatAnimation.transition, delay: 1 },
        }}
        className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />

      <div className="max-w-5xl mx-auto relative z-10 px-4 py-12 sm:px-6 sm:py-16">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="text-center mb-12">
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <BackgroundGradient className="p-[1px] rounded-full">
              <div
                className={`${
                  theme === "light" ? "bg-white/90" : "bg-slate-800/90"
                } backdrop-blur-sm px-6 py-2 rounded-full`}
              >
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Face Recognition Technology
                </span>
              </div>
            </BackgroundGradient>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Face{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Recognition
            </span>{" "}
            Lab
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className={`text-lg md:text-xl ${
              theme === "light" ? "text-slate-700" : "text-slate-300"
            } max-w-2xl mx-auto`}
          >
            Capture and store faces to enhance your memory experience. Your personal face database helps MindSync
            recognize people in your daily life.
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Method Selection */}
          {!captureMethod && !isSuccess && (
            <motion.div
              key="method-selection"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {/* Camera Card */}
              <motion.div variants={itemVariants} className="h-full relative">
                <div className="w-full h-full rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 flex flex-col justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-blue-100 dark:border-slate-700">
                  <div className="text-center h-full flex flex-col">
                    <motion.div
                      animate={floatAnimation}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Camera className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}>
                      Use Camera
                    </h3>
                    <p className={`${theme === "light" ? "text-slate-600" : "text-slate-300"} mb-8 flex-grow text-lg`}>
                      Capture a face in real-time using your device's camera
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMethodSelect("camera")}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg cursor-pointer relative z-50"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>

                  <motion.div
                    animate={rotateAnimation}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg absolute -bottom-3 -right-3 z-10"
                  >
                    <Zap className="w-8 h-8" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Upload Card */}
              <motion.div variants={itemVariants} className="h-full relative">
                <div className="w-full h-full rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 flex flex-col justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-purple-100 dark:border-slate-700">
                  <div className="text-center h-full flex flex-col">
                    <motion.div
                      animate={floatAnimation}
                      className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Upload className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}>
                      Upload Image
                    </h3>
                    <p className={`${theme === "light" ? "text-slate-600" : "text-slate-300"} mb-8 flex-grow text-lg`}>
                      Select an existing photo from your device
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMethodSelect("upload")}
                      className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg cursor-pointer relative z-50"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Photo
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>

                  <motion.div
                    animate={rotateAnimation}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg absolute -bottom-3 -right-3 z-10"
                  >
                    <Database className="w-8 h-8" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Camera Capture Interface */}
          {captureMethod === "camera" && !capturedImage && !isSuccess && (
            <motion.div
              key="camera-interface"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="max-w-3xl mx-auto"
            >
              <BackgroundGradient className="p-[2px] rounded-2xl">
                <div
                  className={`${
                    theme === "light" ? "bg-white/90" : "bg-slate-800/90"
                  } backdrop-blur-sm rounded-2xl p-8 shadow-xl`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className={`text-2xl font-bold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      } flex items-center`}
                    >
                      <Camera className="w-6 h-6 mr-3 text-blue-600" />
                      Camera Capture
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        stopCamera()
                        setCaptureMethod(null)
                      }}
                      className={`p-2 rounded-full ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      } transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="relative mb-8">
                    {cameraPermission === "denied" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${
                          theme === "light"
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-red-900/20 border border-red-800/50 text-red-300"
                        } rounded-xl p-6 flex items-start`}
                      >
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-4 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Camera access denied</h3>
                          <p className={`${theme === "light" ? "text-red-700" : "text-red-400"}`}>
                            Please enable camera access in your browser settings and refresh the page.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className={`aspect-video ${
                            theme === "light"
                              ? "bg-gray-100 border border-gray-200"
                              : "bg-gray-900/80 border border-gray-700/50"
                          } rounded-xl overflow-hidden relative shadow-lg`}
                        >
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            onCanPlay={() => setIsCameraActive(true)}
                          />

                          {!isCameraActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                              <motion.div animate={pulse} className="text-white text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin" />
                                <p className="text-lg">Initializing camera...</p>
                              </motion.div>
                            </div>
                          )}

                          {/* Face detection guide overlay */}
                          {isCameraActive && (
                            <div className="absolute inset-0 pointer-events-none">
                              <motion.div
                                animate={{
                                  boxShadow: [
                                    "0 0 0 rgba(96, 165, 250, 0)",
                                    "0 0 20px rgba(96, 165, 250, 0.5)",
                                    "0 0 0 rgba(96, 165, 250, 0)",
                                  ],
                                  scale: [1, 1.02, 1],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                                className="w-1/2 h-1/2 mx-auto mt-[10%] border-2 border-dashed border-blue-400 rounded-full opacity-80"
                              />
                            </div>
                          )}
                        </motion.div>

                        <canvas ref={canvasRef} className="hidden" />

                        <div className="mt-6 flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={captureImage}
                            disabled={!isCameraActive}
                            className={`px-8 py-4 bg-gradient-to-r ${
                              theme === "light" 
                                ? "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                : "from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800"
                            } text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center text-lg ${
                              !isCameraActive ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <Camera className="w-6 h-6 mr-2" />
                            Capture Face
                          </motion.button>
                        </div>
                      </>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${
                      theme === "light"
                        ? "bg-blue-50 border border-blue-100 text-blue-800"
                        : "bg-blue-900/20 border border-blue-800/50 text-blue-300"
                    } rounded-xl p-6`}
                  >
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <Shield className="w-5 h-5 mr-2" />
                      Tips for best results
                    </h3>
                    <ul className={`space-y-2 ${theme === "light" ? "text-blue-700" : "text-blue-400"}`}>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Ensure good lighting on the face
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Position face within the circular guide
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Remove glasses and face coverings for better recognition
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Keep a neutral expression
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </BackgroundGradient>
            </motion.div>
          )}

          {/* File Upload Interface */}
          {captureMethod === "upload" && !uploadedImage && !isSuccess && (
            <motion.div
              key="upload-interface"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="max-w-3xl mx-auto"
            >
              <BackgroundGradient className="p-[2px] rounded-2xl">
                <div
                  className={`${
                    theme === "light" ? "bg-white/90" : "bg-slate-800/90"
                  } backdrop-blur-sm rounded-2xl p-8 shadow-xl`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className={`text-2xl font-bold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      } flex items-center`}
                    >
                      <Upload className="w-6 h-6 mr-3 text-purple-600" />
                      Upload Photo
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCaptureMethod(null)}
                      className={`p-2 rounded-full ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      } transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="mb-8">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-3 border-dashed ${
                        theme === "light"
                          ? "border-purple-300 hover:border-purple-500 bg-white/90"
                          : "border-purple-700 hover:border-purple-500 bg-slate-800/90"
                      } rounded-xl p-10 text-center cursor-pointer transition-colors aspect-video flex items-center justify-center`}
                    >
                      <motion.div whileHover={{ y: -5 }} className="mx-auto flex flex-col items-center">
                        <motion.div
                          animate={floatAnimation}
                          className={`w-24 h-24 ${
                            theme === "light" ? "bg-purple-100" : "bg-purple-900/30"
                          } rounded-full flex items-center justify-center mb-6 shadow-lg`}
                        >
                          <Upload className="w-12 h-12 text-purple-600" />
                        </motion.div>
                        <h3
                          className={`text-xl font-medium ${theme === "light" ? "text-gray-900" : "text-white"} mb-3`}
                        >
                          Click to upload
                        </h3>
                        <p className={`text-base ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          PNG, JPG or JPEG (max. 5MB)
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${
                      theme === "light"
                        ? "bg-purple-50 border border-purple-100 text-purple-800"
                        : "bg-purple-900/20 border border-purple-800/50 text-purple-300"
                    } rounded-xl p-6`}
                  >
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <Shield className="w-5 h-5 mr-2" />
                      Tips for best results
                    </h3>
                    <ul className={`space-y-2 ${theme === "light" ? "text-purple-700" : "text-purple-400"}`}>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Choose a clear, well-lit photo
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Face should be clearly visible and centered
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Avoid group photos - one face per image
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                        Higher resolution images work better
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </BackgroundGradient>
            </motion.div>
          )}

          {/* Face Preview and Naming */}
          {(capturedImage || uploadedImage) && !isSuccess && (
            <motion.div
              key="face-preview"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={slideUp}
              className="max-w-3xl mx-auto"
            >
              <BackgroundGradient className="p-[2px] rounded-2xl">
                <div
                  className={`${
                    theme === "light" ? "bg-white/90" : "bg-slate-800/90"
                  } backdrop-blur-sm rounded-2xl p-8 shadow-xl`}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2
                      className={`text-2xl font-bold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      } flex items-center`}
                    >
                      <User className="w-6 h-6 mr-3 text-blue-600" />
                      Name This Face
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={resetCapture}
                      className={`p-2 rounded-full ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      } transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className={`aspect-square ${
                          theme === "light"
                            ? "bg-gray-100 border border-gray-200"
                            : "bg-gray-900/80 border border-gray-700/50"
                        } rounded-xl overflow-hidden mb-4 shadow-lg`}
                      >
                        <img
                          src={capturedImage || uploadedImage}
                          alt="Captured face"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={resetCapture}
                        className={`w-full py-3 px-4 border ${
                          theme === "light"
                            ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                            : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                        } font-medium rounded-xl transition-colors flex items-center justify-center`}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retake
                      </motion.button>
                    </div>

                    <div>
                      <div className="mb-6">
                        <label
                          htmlFor="face-name"
                          className={`block text-base font-medium ${
                            theme === "light" ? "text-gray-700" : "text-gray-300"
                          } mb-2`}
                        >
                          Person's Name
                        </label>
                        <motion.input
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          type="text"
                          id="face-name"
                          value={faceName}
                          onChange={(e) => setFaceName(e.target.value)}
                          placeholder="Enter name"
                          className={`w-full px-4 py-3 rounded-xl ${
                            theme === "light"
                              ? "bg-white border border-slate-200 focus:border-blue-500 text-slate-900"
                              : "bg-slate-700 border border-slate-600 focus:border-blue-500 text-white"
                          } shadow-md focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mb-6 p-4 ${
                            theme === "light"
                              ? "bg-red-50 border border-red-200 text-red-700"
                              : "bg-red-900/20 border border-red-800 text-red-400"
                          } rounded-xl text-sm flex items-center`}
                        >
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={saveFace}
                        disabled={isProcessing || !faceName.trim()}
                        className={`w-full py-4 px-6 bg-gradient-to-r ${
                          theme === "light" 
                            ? "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            : "from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800"
                        } text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg ${
                          isProcessing || !faceName.trim() ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save to Memory Lab
                          </>
                        )}
                      </motion.button>

                      <p
                        className={`mt-4 text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"} text-center`}
                      >
                        This face will be added to your personal memory database
                      </p>
                    </div>
                  </div>
                </div>
              </BackgroundGradient>
            </motion.div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              key="success"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="max-w-md mx-auto"
            >
              <motion.div
                animate={glowAnimation}
                className={`${
                  theme === "light"
                    ? "bg-white/90 border border-green-100"
                    : "bg-slate-800/90 border border-green-800/50"
                } rounded-2xl p-10 shadow-xl text-center backdrop-blur-sm`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className={`w-24 h-24 ${
                    theme === "light" ? "bg-green-100" : "bg-green-900/30"
                  } rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Check className="w-12 h-12 text-green-600" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`text-3xl font-bold ${theme === "light" ? "text-gray-900" : "text-gray-100"} mb-4`}
                >
                  Face Saved!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className={`text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"} mb-8`}
                >
                  <span className="font-semibold">{faceName}</span> has been successfully added to your memory database.
                  MindSync will now recognize this person in your captures.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSuccess(false)
                    setCaptureMethod(null)
                    setCapturedImage(null)
                    setUploadedImage(null)
                    setFaceName("")
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Add Another Face
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {!captureMethod && !isSuccess && (
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mt-20">
            <motion.h2
              variants={itemVariants}
              className={`text-3xl font-bold text-center ${theme === "light" ? "text-gray-900" : "text-white"} mb-10`}
            >
              Why Register Faces?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`${
                  theme === "light" ? "bg-white/90 border border-gray-100" : "bg-slate-800/90 border border-gray-700/50"
                } backdrop-blur-sm rounded-xl p-8 shadow-lg transition-all duration-300 h-full`}
              >
                <motion.div
                  animate={floatAnimation}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}>
                  Enhanced Recognition
                </h3>
                <p className={`text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  Train MindSync to recognize important people in your life for better context in your memories and more
                  personalized insights.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`${
                  theme === "light" ? "bg-white/90 border border-gray-100" : "bg-slate-800/90 border border-gray-700/50"
                } backdrop-blur-sm rounded-xl p-8 shadow-lg transition-all duration-300 h-full`}
              >
                <motion.div
                  animate={floatAnimation}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}>
                  Private & Secure
                </h3>
                <p className={`text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  All face data is stored locally on your device, ensuring your privacy and security at all times with
                  end-to-end encryption.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`${
                  theme === "light" ? "bg-white/90 border border-gray-100" : "bg-slate-800/90 border border-gray-700/50"
                } backdrop-blur-sm rounded-xl p-8 shadow-lg transition-all duration-300 h-full`}
              >
                <motion.div
                  animate={floatAnimation}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Database className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} mb-4`}>
                  Smart Insights
                </h3>
                <p className={`text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  Get personalized insights about your interactions with specific people over time and build a rich
                  memory database.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default FaceRegister

