import { baseUrl } from "./common/http";

// pages/api/authenticate.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { email } = req.body

    const response = await fetch(`${baseUrl}/single-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    console.log("🔐 Server: API Response:", data)

    if (data.status === "success") {
      // Extract user details and token
      const userDetails = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.authorisation.token,
        tokenType: data.authorisation.type,
        ttl: data.authorisation.ttl,
        generatedAt: data.authorisation.generated_at,
      }
      console.log("✅ Server: Authentication successful for user:", userDetails.name)
      console.log("🔑 Server: Bearer Token Generated:", userDetails.token.substring(0, 20) + "...")
      console.log("👤 Server: User Details:", {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        tokenType: userDetails.tokenType,
        ttl: userDetails.ttl,
      })

      // Return success with user details and token
      res.status(200).json({
        status: "success",
        user: userDetails,
        message: "Authentication successful",
      })
    } else {
      console.log("❌ Server: Authentication failed for:", email)
      res.status(200).json(data)
    }
  } catch (error) {
    console.error("💥 Server: Authentication error:", error)
    res.status(500).json({
      status: "error",
      message: "Authentication failed",
    })
  }
}
