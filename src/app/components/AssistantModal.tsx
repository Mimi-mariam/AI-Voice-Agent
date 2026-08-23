"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "listening" | "processing" | "speaking" | "ending";

interface AssistantModalProps {
  assistantId: string | null;
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export default function AssistantModal({ assistantId, isOpen, onClose, businessName }: AssistantModalProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (status !== "idle") {
        vapiRef.current?.stop();
        setStatus("idle");
      }
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      setErrorMsg("Missing Vapi API Key");
      return;
    }

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setStatus("listening");
      setErrorMsg(null);
    });

    vapi.on("call-end", () => {
      setStatus("idle");
      setVolumeLevel(0);
    });

    vapi.on("call-start-failed", (event: any) => {
      setStatus("idle");
      const errorVal = event?.error || "Call failed to connect.";
      setErrorMsg(typeof errorVal === "string" ? errorVal : JSON.stringify(errorVal));
      vapi.stop();
    });

    vapi.on("error", (e: any) => {
      if (status !== "listening" && status !== "processing" && status !== "speaking") {
        setStatus("idle");
        const msg = e?.error?.message || e?.message || e?.reason || e;
        setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
        vapi.stop();
      }
    });

    vapi.on("speech-start", () => {
      setVolumeLevel(1);
      setStatus("speaking");
    });
    vapi.on("speech-end", () => {
      setVolumeLevel(0);
      setStatus("listening");
    });
    vapi.on("volume-level", (v: number) => {
      setVolumeLevel(v);
    });
    
    // Auto-start when modal opens
    if (assistantId && status === "idle") {
      setStatus("connecting");
      vapi.start(assistantId).then((call) => {
        if (!call) {
          setStatus("idle");
          setErrorMsg((prev) => prev || "Failed to start call.");
        }
      }).catch((e) => {
        setStatus("idle");
        const catchErr = e?.message || e;
        setErrorMsg(typeof catchErr === "string" ? catchErr : JSON.stringify(catchErr));
        vapi.stop();
      });
    }

    return () => {
      vapi.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMute = () => {
    if (!vapiRef.current || (status !== "listening" && status !== "speaking" && status !== "processing")) return;
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleEndCall = () => {
    vapiRef.current?.stop();
    setStatus("idle");
    onClose();
  };

  const statusLabel: Record<CallStatus, string> = {
    idle: "Tap to talk",
    connecting: "Connecting...",
    listening: "Listening...",
    processing: "One moment...",
    speaking: "AI Assistant is speaking...",
    ending: "Ending...",
  };

  const isCallActive = status === "listening" || status === "processing" || status === "speaking";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full text-center mb-8 mt-2">
          <h2 className="text-xl font-bold text-gray-900">{businessName}</h2>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-widest">AI Assistant</p>
        </div>

        {/* Orb / Visualizer */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-8">
          {isCallActive && (
            <>
              {/* Outer pulsing ring */}
              <div 
                className="absolute inset-0 rounded-full bg-indigo-200 opacity-50 transition-all duration-100"
                style={{ transform: `scale(${1 + volumeLevel * 0.5})` }}
              />
              {/* Inner animated ring */}
              <div 
                className="absolute inset-2 rounded-full bg-indigo-300 opacity-60 transition-all duration-100"
                style={{ transform: `scale(${1 + volumeLevel * 0.3})` }}
              />
            </>
          )}
          
          {/* Core circle */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🎙️</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="h-16 flex flex-col items-center justify-center w-full">
          {errorMsg ? (
            <p className="text-red-500 text-sm text-center px-4">{errorMsg}</p>
          ) : (
            <p className="text-lg font-medium text-gray-800 animate-pulse">{statusLabel[status]}</p>
          )}
        </div>

        {/* Controls */}
        <div className="w-full flex gap-3 mt-4">
          <button
            onClick={handleMute}
            disabled={!isCallActive}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              !isCallActive 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : isMuted
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
          
          <button
            onClick={handleEndCall}
            className="flex-1 py-3 rounded-xl font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            {isCallActive ? "End Call" : "Close"}
          </button>
        </div>

      </div>
    </div>
  );
}
