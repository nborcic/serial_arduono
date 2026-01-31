"use client";

import { useState, useEffect } from "react";

type ServoDirection = "fullleft" | "left" | "right" | "fullright";

export default function Home() {
  const [currentDirection, setCurrentDirection] = useState<ServoDirection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  const moveServo = async (direction: ServoDirection) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setCurrentDirection(direction);
    
    try {
      const response = await fetch("/api/servo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}: Failed to control servo`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to control servo");
      }
    } catch (error) {
      console.error("Failed to control servo:", error);
      setError(error instanceof Error ? error.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const getServoAngle = (direction: ServoDirection): number => {
    switch (direction) {
      case "fullleft": return 0;
      case "left": return 45;
      case "right": return 135;
      case "fullright": return 180;
    }
  };

  // Check connection status
  const checkConnection = async () => {
    try {
      const response = await fetch("/api/servo/status");
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.open && data.available);
      }
    } catch {
      setIsConnected(false);
    }
  };

  // Connect to port
  const connectPort = async () => {
    setConnectionLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/servo/connect", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
      } else {
        setError(data.error || "Failed to connect");
        setIsConnected(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnected(false);
    } finally {
      setConnectionLoading(false);
    }
  };

  // Disconnect from port
  const disconnectPort = async () => {
    setConnectionLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/servo/disconnect", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setCurrentDirection(null);
      } else {
        setError(data.error || "Failed to disconnect");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnection failed");
    } finally {
      setConnectionLoading(false);
    }
  };

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="text-center space-y-8 sm:space-y-12 max-w-4xl w-full">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Servo Motor Control
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">SG90 Servo Motor Controller</p>
          
          {/* Connection Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isConnected === true 
                ? "bg-green-900/30 border border-green-700" 
                : isConnected === false 
                ? "bg-red-900/30 border border-red-700"
                : "bg-slate-800/50 border border-slate-700"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected === true 
                  ? "bg-green-400 animate-pulse" 
                  : isConnected === false 
                  ? "bg-red-400"
                  : "bg-slate-500"
              }`}></div>
              <span className={`text-xs sm:text-sm font-medium ${
                isConnected === true 
                  ? "text-green-400" 
                  : isConnected === false 
                  ? "text-red-400"
                  : "text-slate-400"
              }`}>
                {isConnected === true ? "Connected" : isConnected === false ? "Disconnected" : "Checking..."}
              </span>
            </div>
            
            <button
              onClick={connectPort}
              disabled={connectionLoading || isConnected === true}
              className="cursor-pointer px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {connectionLoading ? "..." : "Connect"}
            </button>
            
            <button
              onClick={disconnectPort}
              disabled={connectionLoading || isConnected === false}
              className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {connectionLoading ? "..." : "Disconnect"}
            </button>
          </div>
        </div>
        
        {/* Servo Visual Indicator */}
        <div className="flex justify-center items-center py-6 sm:py-10">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Base Platform */}
            <div className="absolute bottom-0 w-36 h-14 sm:w-40 sm:h-16 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl shadow-2xl border-t-4 border-slate-600"></div>
            
            {/* Servo Body */}
            <div className="absolute bottom-14 sm:bottom-16 w-48 h-24 sm:w-56 sm:h-28 bg-gradient-to-b from-slate-700 to-slate-600 rounded-xl shadow-2xl border-2 border-slate-500">
              <div className="absolute inset-2 bg-slate-800/30 rounded-lg"></div>
            </div>
            
            {/* Servo Arm */}
            <div 
              className="absolute bottom-24 sm:bottom-28 w-32 h-1.5 sm:w-36 sm:h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-transform duration-700 ease-out origin-bottom z-10"
              style={{ transform: currentDirection ? `rotate(${getServoAngle(currentDirection)}deg)` : 'rotate(90deg)' }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-300 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)] ring-2 ring-cyan-400/50"></div>
            </div>
            
            {/* Angle Indicator */}
            {currentDirection && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
                <p className="text-cyan-400 font-mono font-bold text-lg sm:text-xl">
                  {getServoAngle(currentDirection)}°
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => moveServo("fullleft")}
            disabled={loading}
            className={`group cursor-pointer px-6 py-6 sm:px-8 sm:py-7 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none border-2 min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-2 ${
              currentDirection === "fullleft"
                ? "bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-2xl shadow-cyan-500/60 border-cyan-400 ring-4 ring-cyan-500/30"
                : "bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 shadow-xl border-slate-600 hover:border-slate-500"
            }`}
          >
            <span className="text-3xl sm:text-4xl">↶</span>
            <span>Full Left</span>
            {currentDirection === "fullleft" && (
              <span className="text-xs sm:text-sm text-cyan-200 font-normal">Active</span>
            )}
          </button>
          
          <button
            onClick={() => moveServo("left")}
            disabled={loading}
            className={`group cursor-pointer px-6 py-6 sm:px-8 sm:py-7 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none border-2 min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-2 ${
              currentDirection === "left"
                ? "bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-2xl shadow-cyan-500/60 border-cyan-400 ring-4 ring-cyan-500/30"
                : "bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 shadow-xl border-slate-600 hover:border-slate-500"
            }`}
          >
            <span className="text-3xl sm:text-4xl">←</span>
            <span>Left</span>
            {currentDirection === "left" && (
              <span className="text-xs sm:text-sm text-cyan-200 font-normal">Active</span>
            )}
          </button>
          
          <button
            onClick={() => moveServo("right")}
            disabled={loading}
            className={`group cursor-pointer px-6 py-6 sm:px-8 sm:py-7 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none border-2 min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-2 ${
              currentDirection === "right"
                ? "bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-2xl shadow-cyan-500/60 border-cyan-400 ring-4 ring-cyan-500/30"
                : "bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 shadow-xl border-slate-600 hover:border-slate-500"
            }`}
          >
            <span className="text-3xl sm:text-4xl">→</span>
            <span>Right</span>
            {currentDirection === "right" && (
              <span className="text-xs sm:text-sm text-cyan-200 font-normal">Active</span>
            )}
          </button>
          
          <button
            onClick={() => moveServo("fullright")}
            disabled={loading}
            className={`group cursor-pointer px-6 py-6 sm:px-8 sm:py-7 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none border-2 min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-2 ${
              currentDirection === "fullright"
                ? "bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-2xl shadow-cyan-500/60 border-cyan-400 ring-4 ring-cyan-500/30"
                : "bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 shadow-xl border-slate-600 hover:border-slate-500"
            }`}
          >
            <span className="text-3xl sm:text-4xl">↷</span>
            <span>Full Right</span>
            {currentDirection === "fullright" && (
              <span className="text-xs sm:text-sm text-cyan-200 font-normal">Active</span>
            )}
          </button>
        </div>

        {/* Status Display */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-2xl max-w-lg mx-auto">
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 font-semibold text-base sm:text-lg">Processing command...</p>
                <p className="text-slate-500 text-xs sm:text-sm">Please wait</p>
              </div>
            ) : currentDirection ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                  <p className={`font-semibold text-sm uppercase tracking-wider ${isConnected ? "text-green-400" : "text-red-400"}`}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>
                <p className="text-slate-200 font-bold text-xl sm:text-2xl">
                  Position: <span className="text-cyan-400">{currentDirection.charAt(0).toUpperCase() + currentDirection.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                </p>
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    Servo Angle: <span className="text-cyan-300 font-mono font-bold text-base">{getServoAngle(currentDirection)}°</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <p className="text-slate-400 font-medium text-base">Ready - Select a direction</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Click any button to move the servo</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-950/50 border-2 border-red-800 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">⚠</span>
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold text-sm mb-1">Connection Error</p>
                    <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
