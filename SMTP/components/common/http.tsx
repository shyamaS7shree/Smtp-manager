import axios from "axios"
interface UserSession {
  id: number
  name: string
  email: string
  token: string
  tokenType: string
  ttl: number
  generatedAt: number
  loginTime: string
}


// 🔄 Custom backend URL — replace MailWizz dependency
export const apiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api"
export const token=()=>{
    if (typeof window === 'undefined') return '' 
    const storedSession = localStorage.getItem("userSession")
    if (!storedSession) return ''
    try {
        const session: UserSession = JSON.parse(storedSession)
        return session.token
    } catch {
        return ''
    }
}

export const axiosInstance = axios.create({
    baseURL:apiUrl,
    headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to dynamically set the token
axiosInstance.interceptors.request.use(
  (config) => {
    const userToken = token()
    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


