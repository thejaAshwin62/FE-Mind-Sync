import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { BackgroundGradient } from "../ui/background-gradient"
import { SparklesCore } from "../ui/sparkles"
import { CardContainer, CardBody, CardItem } from "../ui/3d-card"
import { TypewriterEffect } from "../ui/typewriter-effect"
import Footer from "../Componenets/Footer"
import emailjs from '@emailjs/browser'

const Contact = () => {
  const containerRef = useRef(null)
  const formRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState({})
  const [theme, setTheme] = useState("light")

  // EmailJS configuration
  const serviceId = 'service_nkh3h2o'
  const templateId = 'template_9j52fmf'
  const publicKey = 'H-Pf9nDC3WyS-5kuc'
  const toName = 'Theja Ashwin'
  const toEmail = 'thejaashwin62@gmail.com'

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(publicKey)
  }, [])

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light"
    setTheme(currentTheme)
    document.documentElement.setAttribute("data-theme", currentTheme)

    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "light"
      setTheme(updatedTheme)
      document.documentElement.setAttribute("data-theme", updatedTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Words for typewriter effect
  const words = [
    { text: "Get" },
    { text: "In" },
    { text: "Touch" },
    { text: "With", className: "text-blue-500" },
    { text: "Us", className: "text-blue-500" },
  ]

  // Contact information
  const contactInfo = [
    {
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email Us",
      content: "info@mindsync.com",
      link: "mailto:info@mindsync.com",
    },
    {
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Call Us",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Visit Us",
      content: "123 Innovation Drive, San Francisco, CA 94103",
      link: "https://maps.google.com",
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formState.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Email validation
    if (!formState.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Subject validation
    if (!formState.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    // Message validation
    if (!formState.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formState.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      const templateParams = {
        from_name: formState.name,
        to_name: toName,
        from_email: formState.email,
        to_email: toEmail,
        subject: formState.subject,
        message: formState.message,
      }

      try {
        const response = await emailjs.send(
          serviceId,
          templateId,
          templateParams
        )

        console.log('Email sent successfully:', response)
        setShowSuccess(true)
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        })

        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)
      } catch (error) {
        console.error("Error sending email:", error)
        // Show error message
        const errorMessage = document.createElement("div")
        errorMessage.className = "mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
        errorMessage.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>Failed to send message. Please try again.</span>
        `
        const form = document.querySelector("form")
        if (form) {
          form.insertBefore(errorMessage, form.firstChild)
          setTimeout(() => {
            if (errorMessage.parentNode === form) {
              errorMessage.remove()
            }
          }, 5000)
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        theme === "light"
          ? "bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50"
          : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900 text-white"
      }`}
    >
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
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        {/* Header Section with reduced spacing */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <TypewriterEffect
              words={words}
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto leading-relaxed ${
              theme === "light" ? "text-slate-700" : "text-slate-400"
            }`}
          >
            Have questions about our product or services? We'd love to hear from
            you. Fill out the form below and our team will get back to you as
            soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Cards - Above the form
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {contactInfo.map((item, index) => (
            <CardContainer key={index}>
              <CardBody className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-md hover:shadow-lg transition-all p-6">
                <CardItem translateZ={20} className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <a
                      href={item.link}
                      className="text-base text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {item.content}
                    </a>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </motion.div> */}
          {/* Contact Form - 8 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-8"
          >
            <BackgroundGradient
              className={`p-[1px] rounded-2xl ${
                theme === "light" ? "" : "bg-slate-800"
              }`}
            >
              <div
                className={`${
                  theme === "light" ? "bg-white" : "bg-slate-800"
                } backdrop-blur-sm p-6 rounded-xl`}
              >
                <h2
                  className={`text-2xl font-bold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  } mb-6`}
                >
                  Send Us a Message
                </h2>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Your message has been sent successfully! We'll get back
                        to you soon.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-medium ${
                          theme === "light"
                            ? "text-slate-700"
                            : "text-slate-300"
                        } mb-1`}
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === "light"
                            ? "bg-white border border-slate-200 focus:border-blue-500 text-slate-900"
                            : "bg-slate-700 border border-slate-600 focus:border-blue-500 text-white"
                        } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium ${
                          theme === "light"
                            ? "text-slate-700"
                            : "text-slate-300"
                        } mb-1`}
                      >
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === "light"
                            ? "bg-white border border-slate-200 focus:border-blue-500 text-slate-900"
                            : "bg-slate-700 border border-slate-600 focus:border-blue-500 text-white"
                        } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className={`block text-sm font-medium ${
                        theme === "light" ? "text-slate-700" : "text-slate-300"
                      } mb-1`}
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg ${
                        theme === "light"
                          ? "bg-white border border-slate-200 focus:border-blue-500 text-slate-900"
                          : "bg-slate-700 border border-slate-600 focus:border-blue-500 text-white"
                      } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base`}
                      placeholder="How can we help you?"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className={`block text-sm font-medium ${
                        theme === "light" ? "text-slate-700" : "text-slate-300"
                      } mb-1`}
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg ${
                        theme === "light"
                          ? "bg-white border border-slate-200 focus:border-blue-500 text-slate-900"
                          : "bg-slate-700 border border-slate-600 focus:border-blue-500 text-white"
                      } shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base resize-none`}
                      placeholder="Tell us what you need help with..."
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </BackgroundGradient>
          </motion.div>

          {/* Right Sidebar - 4 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Social Media Links */}
            <BackgroundGradient className="p-[1px] rounded-x2l">
              <div
                className={`${
                  theme === "light" ? "bg-white/90" : "bg-slate-900/90"
                } backdrop-blur-sm p-6 rounded-xl`}
              >
                <h3
                  className={`text-lg font-semibold ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  } mb-4`}
                >
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="#"
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors group ${
                      theme === "light"
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors group ${
                      theme === "light"
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-instagram"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">Instagram</span>
                  </a>
                  <a
                    href="#"
                    className={`flex items-center justify-center p-3 rounded-lg transition-colors group ${
                      theme === "light"
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="ml-2 font-medium text-sm">LinkedIn</span>
                  </a>
                </div>
              </div>
            </BackgroundGradient>

            {/* Office Hours */}
            <BackgroundGradient className="p-[1px] rounded-xl">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Mind-Sync
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium text-sm">
                      Infinity
                    </span>
                    <span className="font-semibold text-slate-900 text-sm"></span>
                  </li>
                </ul>
              </div>
            </BackgroundGradient>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2
              className={`text-2xl font-bold ${
                theme === "light" ? "text-slate-900" : "text-white"
              } mb-3`}
            >
              Frequently Asked Questions
            </h2>
            <p
              className={`text-base max-w-2xl mx-auto ${
                theme === "light" ? "text-slate-700" : "text-slate-400"
              }`}
            >
              Find answers to common questions about our products and services.
            </p>
          </div>

          <BackgroundGradient className="p-[1px] rounded-xl">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-slate-800/90"
              } backdrop-blur-sm p-6 rounded-xl`}
            >
              <div className="grid grid-cols-4 md:grid-cols-2 gap-6 items-center ">
                {/* FAQ items */}
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "light" ? "bg-slate-50" : "bg-slate-700"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      } mb-2`}
                    >
                      How does the camera capture data?
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      Our camera automatically captures images every 15 seconds,
                      processing them through our AI system to convert visual
                      data into actionable insights.
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "light" ? "bg-slate-50" : "bg-slate-700"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      } mb-2`}
                    >
                      Is my data secure and private?
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      Absolutely! We follow strict privacy protocols and use
                      Google Sign-In to keep your data secure. Your captured
                      images are processed instantly — we don't store them
                      anywhere. Your privacy is our top priority.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "light" ? "bg-slate-50" : "bg-slate-700"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      } mb-2`}
                    >
                      How long does the battery last?
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      The ESP32-CAM supports lithium batteries, usually ranging
                      from 1000mAh to 3000mAh. Battery life depends on factors
                      like usage, camera activity, and power-saving modes,
                      making it adaptable for various applications.
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "light" ? "bg-slate-50" : "bg-slate-700"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      } mb-2`}
                    >
                      Can I integrate with other apps?
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      Yes! We're working on providing API access to make
                      integration with other apps seamless. This will allow you
                      to connect and enhance your workflows effortlessly. Stay
                      tuned for updates!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact

