"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [autoMode, setAutoMode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.status === "success") {
        const userSession = {
          id:         data.user.id,
          name:       data.user.name,
          email:      data.user.email,
          token:      data.user.token,
          tokenType:  data.user.tokenType,
          ttl:        data.user.ttl,
          generatedAt: data.user.generatedAt,
          loginTime:  new Date().toISOString(),
        }
        localStorage.setItem("userSession", JSON.stringify(userSession))
        setMessage("✅ Login successful! Redirecting...")
        setTimeout(() => router.push('/'), 1500)
      } else {
        setMessage("❌ " + (data.message || "Invalid credentials."))
      }
    } catch (error) {
      setMessage("💥 Error during login.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (router.isReady && router.query.email) {
      setEmail(router.query.email)
      setAutoMode(true)
      setCountdown(3)
    }
  }, [router.isReady, router.query])

  useEffect(() => {
    if (autoMode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (autoMode && countdown === 0 && !loading && !message) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, countdown])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "450px",
          border: "1px solid #e1e5e9",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#1a1a1a",
            fontSize: "2rem",
            fontWeight: "600",
          }}
        >
          🔐 Email Authentication
        </h1>

        {autoMode && countdown > 0 && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              padding: "1rem",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              border: "2px solid #f59e0b",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏰</div>
            <div style={{ color: "#92400e", fontWeight: "600" }}>
              Auto-authentication in: {countdown} second{countdown !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          Enter your email to login
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#374151",
                fontWeight: "500",
              }}
            >
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box",
                outline: "none",
              }}
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: loading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: loading || (autoMode && countdown > 0) ? "not-allowed" : "pointer",
              transition: "all 0.3s",
            }}
          >
            {loading
              ? "⏳ Authenticating..."
              : autoMode && countdown > 0
                ? `⏰ Auto-starting in ${countdown}s...`
                : "🚀 Authenticate Email"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: message.includes("successful") ? "#ecfdf5" : "#fef2f2",
              color: message.includes("successful") ? "#065f46" : "#991b1b",
              border: `2px solid ${message.includes("successful") ? "#a7f3d0" : "#fca5a5"}`,
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          <strong>ℹ️ Info:</strong>{" "}
          {autoMode
            ? "URL parameter detected! Email auto-loaded and authentication will start automatically."
            : "Enter your email address to proceed with authentication."}
        </div>

        {autoMode && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#ecfdf5",
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            }}
          >
            🔄 <strong>Auto Mode:</strong> Email field is readonly. Authentication will proceed automatically.
          </div>
        )}
      </div>
    </div>
  )
}