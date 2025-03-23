import { useState, useEffect } from "react"

const LoadingScreen = () => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light"
    setTheme(currentTheme)
  }, [])

  return (
    <div className={`fixed inset-0 ${theme === "light" ? "bg-white" : "bg-slate-900"} z-[9999] flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <span className="loading loading-ball loading-xs"></span>
          <span className="loading loading-ball loading-sm"></span>
          <span className="loading loading-ball loading-md"></span>
          <span className="loading loading-ball loading-lg"></span>
        </div>
        <p className={`animate-pulse ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
          Loading...
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen