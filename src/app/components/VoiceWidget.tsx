"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "active" | "ending";

export default function VoiceWidget() {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Fetch the assistant ID from business settings
  useEffect(() => {
    const fetchAssistantId = async () => {
      try {
        const res = await fetch("/api/business");
        if (res.ok) {
          const data = await res.json();
          setAssistantId(data.vapiAssistantId || null);
        }
      } catch (e) {
        console.error("Failed to fetch assistant ID", e);
      }
    };
    fetchAssistantId();
  }, []);

  // Initialise Vapi SDK
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error("NEXT_PUBLIC_VAPI_API_KEY is not set");
      setApiKeyMissing(true);
      return;
    }

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setStatus("active");
      setErrorMsg(null);
    });

    vapi.on("call-end", () => {
      setStatus("idle");
      setVolumeLevel(0);
    });

    // This is the critical event — fires when Vapi can't connect
    vapi.on("call-start-failed", (event: any) => {
      console.error("Call start failed:", event);
      setStatus("idle");
      setErrorMsg(event?.error || "Call failed to connect. Check your Vapi assistant ID and API key.");
      setIsExpanded(true);
      vapi.stop();
    });

    vapi.on("error", (e: any) => {
      console.error("Vapi error (full):", JSON.stringify(e, null, 2), e);
      if (status !== "active") {
        setStatus("idle");
        // Try to extract the most useful error message from various Vapi error shapes
        const msg =
          (typeof e === "string" ? e : null) ||
          e?.error?.message ||
          e?.error ||
          e?.message ||
          e?.errorMsg ||
          e?.reason ||
          JSON.stringify(e) ||
          "An error occurred.";
        setErrorMsg(String(msg));
        setIsExpanded(true);
        vapi.stop();
      }
    });

    vapi.on("speech-start", () => setVolumeLevel(1));
    vapi.on("speech-end", () => setVolumeLevel(0));
    vapi.on("volume-level", (v: number) => setVolumeLevel(v));

    return () => {
      vapi.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleCall = async () => {
    const vapi = vapiRef.current;
    setErrorMsg(null);

    if (!vapi) {
      setErrorMsg("Vapi is not initialised. Check NEXT_PUBLIC_VAPI_API_KEY.");
      setIsExpanded(true);
      return;
    }

    if (status === "active") {
      setStatus("ending");
      vapi.stop();
      return;
    }

    if (status === "connecting" || status === "ending") return;

    if (!assistantId) {
      setErrorMsg("No Vapi Assistant ID configured. Go to Settings and save it.");
      setIsExpanded(true);
      return;
    }

    setStatus("connecting");
    try {
      // Ensure any previous stuck state is cleared
      vapi.stop();
      const call = await vapi.start(assistantId);
      if (!call) {
        setStatus("idle");
        setErrorMsg("Failed to start call — check your Vapi assistant ID.");
        setIsExpanded(true);
      }
    } catch (e: any) {
      console.error("Failed to start call:", e);
      setStatus("idle");
      setErrorMsg(e?.message || "Failed to start call.");
      setIsExpanded(true);
      vapi.stop();
    }
  };

  const handleMute = () => {
    if (!vapiRef.current || status !== "active") return;
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const statusLabel: Record<CallStatus, string> = {
    idle: "Talk to AI",
    connecting: "Connecting…",
    active: "Live",
    ending: "Ending…",
  };

  const pulseScale = status === "active" ? `scale(${1 + volumeLevel * 0.4})` : "scale(1)";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded info panel */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  status === "active" ? "bg-green-500 animate-pulse" :
                  status === "connecting" ? "bg-yellow-400 animate-pulse" :
                  "bg-gray-300"
                }`}
              />
              <span className="text-sm font-semibold text-gray-700">
                {status === "active" ? "Call in progress" :
                 status === "connecting" ? "Connecting…" :
                 "AI Receptionist"}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mt-1 mb-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* API key missing warning */}
          {apiKeyMissing && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
              ⚠️ NEXT_PUBLIC_VAPI_API_KEY is not set in environment variables.
            </p>
          )}

          {/* No assistant ID warning */}
          {!assistantId && !apiKeyMissing && status === "idle" && !errorMsg && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              ⚠️ Set your Vapi Assistant ID in Settings first.
            </p>
          )}

          {/* Active call: volume bars + mute */}
          {status === "active" && (
            <>
              <div className="flex items-end gap-0.5 h-8 mb-3 justify-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-indigo-500 transition-all duration-100"
                    style={{
                      height: `${Math.max(4, Math.min(32, volumeLevel * 32 * (0.4 + Math.random() * 0.6)))}px`,
                      opacity: volumeLevel > 0.05 ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleMute}
                className={`w-full text-sm py-1.5 rounded-lg border transition-colors ${
                  isMuted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
              </button>
            </>
          )}

          {/* Mic permission hint */}
          {status === "idle" && !errorMsg && assistantId && (
            <p className="text-xs text-gray-400 mt-1">
              Click the mic button to start a call. Your browser will ask for mic permission.
            </p>
          )}
        </div>
      )}

      {/* Main floating button */}
      <div className="relative">
        {/* Pulse ring when active */}
        {status === "active" && (
          <div
            className="absolute inset-0 rounded-full bg-indigo-400 opacity-30 transition-transform duration-150"
            style={{ transform: pulseScale }}
          />
        )}

        <button
          onClick={() => {
            if (status === "idle") setIsExpanded(true);
            handleToggleCall();
          }}
          onContextMenu={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
          disabled={status === "connecting" || status === "ending"}
          className={`relative w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 select-none
            ${status === "idle"
              ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95"
              : status === "active"
              ? "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
              : "bg-yellow-500 cursor-not-allowed opacity-80"
            }`}
          title={status === "idle" ? "Click to start call" : status === "active" ? "Click to end call" : statusLabel[status]}
        >
          {status === "connecting" || status === "ending" ? (
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : status === "active" ? (
            // Pause/end icon
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="4" height="12" rx="1" />
              <rect x="14" y="6" width="4" height="12" rx="1" />
            </svg>
          ) : (
            // Mic icon
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4z" />
              <path d="M19 11a7 7 0 01-14 0H3a9 9 0 0018 0h-2z" />
              <rect x="11" y="20" width="2" height="3" rx="1" />
            </svg>
          )}
        </button>

        {/* Status label badge */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
          <span className="text-xs font-medium bg-gray-800 text-white px-2 py-1 rounded-full shadow">
            {statusLabel[status]}
          </span>
        </div>
      </div>
    </div>
  );
}
