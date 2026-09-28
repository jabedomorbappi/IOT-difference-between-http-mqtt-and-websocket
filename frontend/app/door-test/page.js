"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, CheckCircle, XCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export default function DoorTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setStreaming(true);
  }, []);

  const captureAndSend = async () => {
    setLoading(true);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setResult({ error: "Camera is not ready yet. Wait for the video, then try again." });
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setResult({ error: "API URL is not configured. Set NEXT_PUBLIC_API_URL and restart the frontend." });
      setLoading(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setResult({ error: "Could not capture an image from the camera." });
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const res = await fetch(
          `${API_URL}/devices/laptop-test-cam/door-camera/upload/`,
          { method: "POST", body: formData }
        );
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const body = await res.text();
          throw new Error(`API returned non-JSON (${res.status}). Check the API URL and Django route. ${body.slice(0, 120)}`);
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        setResult(data);
      } catch (err) {
        console.error(err);
        setResult({ error: `Upload failed: ${err.message}` });
      } finally {
        setLoading(false);
      }
    }, "image/jpeg");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-8 max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <Camera size={22} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Door Camera Test</h1>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-xl bg-black mb-4"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!streaming ? (
          <button
            onClick={startCamera}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={captureAndSend}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? "Checking..." : "Capture & Identify"}
          </button>
        )}

        {result && !result.error && (
          <div
            className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              result.is_known ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {result.is_known ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {result.is_known ? `Known: ${result.matched_person}` : "Unknown person"}
              </p>
              {result.confidence && (
                <p className="text-xs text-gray-500">{result.confidence}% confidence</p>
              )}
              {result.is_known && (
                <p className="text-xs text-gray-600 mt-1">
                  {result.action_triggered
                    ? "Confidence is above 60% — action triggered."
                    : `Action not triggered — confidence must be above ${result.action_threshold ?? 60}%.`}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
  Face detected: {String(result.face_detected)} · Distance: {result.best_distance ?? "n/a"}
</p>
            </div>
          </div>
        )}

        {result?.error && (
          <p className="mt-4 text-sm text-red-600">{result.error}</p>
        )}
      </div>
    </main>
  );
}
