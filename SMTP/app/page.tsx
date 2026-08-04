'use client'

import SidebarNav from "@/components/sidebar-nav"
import MetricCard from "@/components/metric-card"
import Header from "@/components/common/header"
import { token } from "@/components/common/http";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import PromoModal from "@/components/promo-modal"
import { motion } from "framer-motion";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import OverviewChart from "@/components/dashboard/OverviewChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DeliverabilityCard from "@/components/dashboard/DeliverabilityCard";
import { Send, MailOpen, MousePointerClick, ShieldAlert } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface UserSession {
  name: string
  email: string
  tokenType: string
  token: string
  loginTime: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [stats, setStats] = useState({
    campaigns: 0,
    lists: 0,
    subscribers: 0,
    templates: 0,
    recentActivity: [],
    chartData: [],
    deliveryStats: { sent: 0, opens: 0, clicks: 0, bounces: 0 }
  })

  useEffect(() => {
    const checkAuthOnLoad = () => {
      const storedSession = localStorage.getItem("userSession")
      if (!storedSession) {
        setIsAuthenticated(false)
        setIsAuthLoading(false)
        router.replace('/authentication')
        return
      }
      try {
        const session: UserSession = JSON.parse(storedSession)
        if (!session || !session.token) {
          setIsAuthenticated(false)
          setIsAuthLoading(false)
          router.replace('/authentication')
          return
        }
        if (session.loginTime) {
          const loginTimeMs = new Date(session.loginTime).getTime()
          if (!isNaN(loginTimeMs)) {
            const sessionAge = Date.now() - loginTimeMs
            const twentyFourHours = 24 * 60 * 60 * 1000
            if (sessionAge > twentyFourHours) {
              localStorage.removeItem("userSession")
              localStorage.removeItem("cachedLists")
              setIsAuthenticated(false)
              setIsAuthLoading(false)
              router.replace('/authentication')
              return
            }
          }
        }
        setUserName(session.name || "User")
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth verification error:", error)
      } finally {
        setIsAuthLoading(false)
      }
    }
    checkAuthOnLoad()
  }, [router])

  const fetchDashboardStats = async (range: DateRange | undefined) => {
    try {
      setLoading(true)
      const url = new URL('/api/dashboard/stats', window.location.origin)
      url.searchParams.append('token', token())
      if (range?.from && range?.to) {
         url.searchParams.append('startDate', format(range.from, 'yyyy-MM-dd'))
         url.searchParams.append('endDate', format(range.to, 'yyyy-MM-dd 23:59:59'))
      }
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        }
      })
      const data = await res.json().catch(() => null)
      if (data?.data) {
          setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchDashboardStats(dateRange)
  }, [isAuthenticated, dateRange])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-base font-medium text-gray-700">Checking authentication...</p>
      </div>
    )
  }

  const { 
    deliveryStats = { sent: 0, opens: 0, clicks: 0, bounces: 0 }, 
    chartData = [], 
    recentActivity = [],
    campaigns = 0,
    lists = 0,
    subscribers = 0,
    templates = 0
  } = stats || {};

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/30 min-h-screen">
          <WelcomeBanner name={userName} date={dateRange} onDateChange={setDateRange} />
          
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MetricCard icon="Campaigns" title="Campaigns" value={campaigns} subtitle="Total Campaigns" delay={0.1} />
            <MetricCard icon="List" title="Lists" value={lists} subtitle="Total Lists" delay={0.2} />
            <MetricCard icon="Subscribers" title="Subscribers" value={subscribers} subtitle="Total Subscribers" delay={0.3} />
            <MetricCard icon="Templates" title="Templates" value={templates} subtitle="Email Templates" delay={0.4} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-full">
              <OverviewChart data={chartData} />
            </div>
            <div className="lg:col-span-1 h-full">
              <RecentActivity activities={recentActivity} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-orange-50 rounded-xl"><Send className="w-5 h-5 text-orange-500" /></div>
                 <span className="text-2xl font-bold text-gray-900">{deliveryStats.sent}</span>
               </div>
               <p className="text-[11px] font-bold text-gray-700">Emails Sent</p>
               <div className="w-4 h-0.5 bg-gray-200 my-1.5"></div>
               <p className="text-[10px] font-semibold text-gray-400">vs last 7 days</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-purple-50 rounded-xl"><MailOpen className="w-5 h-5 text-purple-500" /></div>
                 <span className="text-2xl font-bold text-gray-900">{deliveryStats.opens}</span>
               </div>
               <p className="text-[11px] font-bold text-gray-700">Opens</p>
               <div className="w-4 h-0.5 bg-gray-200 my-1.5"></div>
               <p className="text-[10px] font-semibold text-gray-400">vs last 7 days</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-50 rounded-xl"><MousePointerClick className="w-5 h-5 text-blue-500" /></div>
                 <span className="text-2xl font-bold text-gray-900">{deliveryStats.clicks}</span>
               </div>
               <p className="text-[11px] font-bold text-gray-700">Clicks</p>
               <div className="w-4 h-0.5 bg-gray-200 my-1.5"></div>
               <p className="text-[10px] font-semibold text-gray-400">vs last 7 days</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-green-50 rounded-xl"><ShieldAlert className="w-5 h-5 text-green-500" /></div>
                 <span className="text-2xl font-bold text-gray-900">{deliveryStats.bounces}</span>
               </div>
               <p className="text-[11px] font-bold text-gray-700">Bounces</p>
               <div className="w-4 h-0.5 bg-gray-200 my-1.5"></div>
               <p className="text-[10px] font-semibold text-gray-400">vs last 7 days</p>
            </div>
          </div>
        </main>
      </div>
      <PromoModal />
    </div>
  )
}