import React, { useState, useEffect } from "react";
import { SignUp as ClerkSignUp, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [hasShownToast, setHasShownToast] = React.useState(false);

  // Theme state
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);

    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "light";
      setTheme(updatedTheme);
      document.documentElement.setAttribute("data-theme", updatedTheme);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  React.useEffect(() => {
    if (isSignedIn && !hasShownToast) {
      setHasShownToast(true);
      navigate("/get-started", { replace: true });
    }
  }, [isSignedIn, navigate, hasShownToast]);

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-primary-100" : "bg-gray-900"} flex items-center justify-center`}>
      <div className={`${theme === "light" ? "bg-white" : "bg-gray-800"} mb-10 pb-5 rounded-2xl shadow-lg w-full max-w-md`}>
        <h2 className={`text-2xl font-bold ${theme === "light" ? "text-primary-950" : "text-white"} text-center mb-3`}>
          Create an Account
        </h2>
        <ClerkSignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
              socialButtonsBlockButton:
                `bg-white border-2 ${theme === "light" ? "border-primary-200 hover:bg-primary-50" : "border-gray-700 hover:bg-gray-600 text-black"} transition-colors`,
                formButtonPrimary: theme === "light" ? "bg-primary-950 hover:bg-primary-800 text-white" : "bg-gray-600 hover:bg-gray-500 text-white",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl={import.meta.env.VITE_CLERK_SIGN_IN_URL}
          afterSignInUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL}
          afterSignUpUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL}
        />
      </div>
    </div>
  );
};

export default SignUp;