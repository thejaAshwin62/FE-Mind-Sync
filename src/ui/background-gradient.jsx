import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

// Utility function for conditional className merging

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
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

  useEffect(() => {
    if (!animate) return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      if (!container) return;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      container.style.setProperty("--x", x.toString());
      container.style.setProperty("--y", y.toString());
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // Apply different background classes based on the theme
        theme === "light"
          ? "relative w-full bg-white rounded-2xl overflow-hidden"
          : "relative w-full bg-slate-800 rounded-2xl overflow-hidden",
        containerClassName
      )}
    >
      <div
        className={cn(
          // Apply different background colors in the inner container
          theme === "light"
            ? "relative z-10 w-full h-full bg-white flex items-center justify-center"
            : "relative z-10 w-full h-full bg-slate-900 flex items-center justify-center",
          className
        )}
      >
        {children}
      </div>
      <div className="glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};