import React, { Suspense, lazy } from "react";
import "./App.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./Componenets/Navbar";
import LoadingScreen from "./Componenets/LoadingScreen";
import { ChatProvider } from "./Context/ChatContext";

// Lazy load components
const Hero = lazy(() => import("./Pages/Hero"));
const SignIn = lazy(() => import("./Pages/SignIn"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const GetStarted = lazy(() => import("./Pages/GetStarted"));
const ChatBot = lazy(() => import("./Pages/ChatBot"));
const SetupCamera = lazy(() => import("./Pages/SetupCamera"));
const StartRecording = lazy(() => import("./Pages/StartRecording"));
const About = lazy(() => import("./Pages/About"));
const Contact = lazy(() => import("./Pages/Contact"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const FaceRegister = lazy(() => import("./Pages/FaceRegister"));

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
};

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-primary-100 main-content">
            <Navbar />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route
                  path="/sign-in"
                  element={
                    <SignedOut>
                      <SignIn />
                    </SignedOut>
                  }
                />
                <Route
                  path="/sign-up"
                  element={
                    <SignedOut>
                      <SignUp />
                    </SignedOut>
                  }
                />
                <Route path="/sign-in/sso-callback" element={<SignIn />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route
                  path="/get-started/*"
                  element={
                    <ProtectedRoute>
                      <Routes>
                        <Route path="chatbot" element={<ChatBot />} />
                        <Route path="setup-camera" element={<SetupCamera />} />
                        <Route path="face-register" element={<FaceRegister />} />
                        <Route
                          path="start-recording"
                          element={<StartRecording />}
                        />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ChatProvider>
    </ClerkProvider>
  );
};

export default App;
