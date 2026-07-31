// 🔄 Custom backend URL — replace MailWizz dependency
// Set NEXT_PUBLIC_BACKEND_URL in .env.local to your deployed backend
export const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://smtp-backend-api.onrender.com") + "/api"

