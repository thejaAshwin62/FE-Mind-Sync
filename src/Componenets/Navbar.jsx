import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.svg";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import ToggleButton from "./ToggleButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  const showToast = (message) => {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast toast-end";
    toast.style.zIndex = "9999";
    toast.innerHTML = `
      <div class="alert alert-info">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.5s ease-out";
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 3000);
  };

  const handleAuthAction = async () => {
    if (isSignedIn) {
      try {
        setIsLoading(true);
        navigate("/", { replace: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
        showToast("Successfully signed out!");
        await new Promise((resolve) => setTimeout(resolve, 100));
        await signOut();
      } catch (error) {
        showToast("Error signing out. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      navigate("/sign-in");
    }
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      setTimeout(() => {
        setIsLogoVisible(true);
      }, 250);
    } else {
      setTimeout(() => {
        setIsLogoVisible(false);
      }, 100);
      setIsMenuOpen(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    window.location.reload(); // Refresh the page to apply the theme change
  };

  return (
    <>
      <section
        className={`fixed top-0 left-0 right-0 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        } z-[1000] min-h-[64px]`}
      >
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 md:px-10 h-16 flex items-center">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
                <span
                  className={`text-lg font-bold ${
                    theme === "light" ? "text-slate-900" : "text-[#D6CDF9]"
                  }`}
                >
                  MindSync
                </span>
              </Link>
            </div>

            <div className="flex items-center lg:hidden">
              <ToggleButton onThemeChange={handleThemeChange} />
              <button
                className={`${
                  theme === "light" ? "text-secondary-950" : "text-[#D6CDF9]"
                } flex items-center gap-2 ml-2`}
                onClick={handleMenuToggle}
              >
                {!isMenuOpen ? (
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-10 ">
              <ul className="flex gap-10">
                <Link to="/">
                  <li
                    className={`hover:text-secondary-600 cursor-pointer transition-colors ${
                      theme === "light"
                        ? "text-secondary-950"
                        : "text-[#D6CDF9]"
                    }`}
                  >
                    Home
                  </li>
                </Link>
                <Link to="/about">
                  <li
                    className={`hover:text-secondary-600 cursor-pointer transition-colors ${
                      theme === "light"
                        ? "text-secondary-950"
                        : "text-[#D6CDF9]"
                    }`}
                  >
                    About
                  </li>
                </Link>
                <Link to="/contact">
                  <li
                    className={`hover:text-secondary-600 cursor-pointer transition-colors ${
                      theme === "light"
                        ? "text-secondary-950"
                        : "text-[#D6CDF9]"
                    }`}
                  >
                    Contact
                  </li>
                </Link>
                <Link to="/dashboard">
                  <li
                    className={`hover:text-secondary-600 cursor-pointer transition-colors ${
                      theme === "light"
                        ? "text-secondary-950"
                        : "text-[#D6CDF9]"
                    }`}
                  >
                    Dashboard
                  </li>
                </Link>
              </ul>
              <div className="">
                <ToggleButton onThemeChange={handleThemeChange} />
              </div>
              <button
                onClick={handleAuthAction}
                className={`bg-primary-950 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors min-w-[100px] ${
                  theme === "dark" ? "text-[#D6CDF9]" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-ball loading-sm"></span>
                ) : isSignedIn ? (
                  "Sign Out"
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            <div
              className={`
                lg:hidden fixed inset-0 ${
                  theme === "light" ? "bg-white" : "bg-slate-900"
                } z-50 transition-transform duration-300 ease-in-out
                ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <div
                  className={`transition-opacity duration-500 ${
                    isLogoVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Link to="/">
                    <img src={Logo} alt="Logo" className="h-8 w-8" />
                  </Link>
                </div>
                <button
                  className={`text-secondary-950 p-2 hover:bg-gray-100 rounded-full ${
                    theme === "dark" ? "text-[#D6CDF9]" : ""
                  }`}
                  onClick={handleMenuToggle}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col h-full px-4 pt-6">
                <ul className="flex flex-col gap-6 text-lg items-center">
                  <Link to="/" onClick={handleMenuToggle}>
                    <li
                      className={`hover:text-secondary-600 cursor-pointer transition-colors p-2 ${
                        theme === "light"
                          ? "text-secondary-950"
                          : "text-[#D6CDF9]"
                      }`}
                    >
                      Home
                    </li>
                  </Link>
                  <Link to="/about" onClick={handleMenuToggle}>
                    <li
                      className={`hover:text-secondary-600 cursor-pointer transition-colors p-2 ${
                        theme === "light"
                          ? "text-secondary-950"
                          : "text-[#D6CDF9]"
                      }`}
                    >
                      About
                    </li>
                  </Link>
                  <Link to="/contact" onClick={handleMenuToggle}>
                    <li
                      className={`hover:text-secondary-600 cursor-pointer transition-colors p-2 ${
                        theme === "light"
                          ? "text-secondary-950"
                          : "text-[#D6CDF9]"
                      }`}
                    >
                      Contact
                    </li>
                  </Link>
                  <Link to="/dashboard" onClick={handleMenuToggle}>
                    <li
                      className={`hover:text-secondary-600 cursor-pointer transition-colors p-2 ${
                        theme === "light"
                          ? "text-secondary-950"
                          : "text-[#D6CDF9]"
                      }`}
                    >
                      Dashboard
                    </li>
                  </Link>
                </ul>
                <button
                  onClick={() => {
                    handleAuthAction();
                    handleMenuToggle();
                  }}
                  className={`mt-8 bg-primary-950 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors mx-auto min-w-[100px] ${
                    theme === "dark" ? "text-[#D6CDF9]" : ""
                  }`}
                >
                  {isSignedIn ? "Sign Out" : "Sign In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Navbar;
