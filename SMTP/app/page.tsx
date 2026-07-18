'use client'

import SidebarNav from "@/components/sidebar-nav"
import MetricCard from "@/components/metric-card"
import Header from "@/components/common/header"
import { token } from "@/components/common/http";
import { useEffect, useState } from "react";
import { rateLimitedFetch } from "@/lib/utils";
import { useRouter } from "next/navigation"
import PromoModal from "@/components/promo-modal"

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
  const [campaignCount, setCampaignCount] = useState(0)
  const [listCount, setListCount] = useState(0)  // ✅ fixed typo
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [templatesCount, setTemplatesCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuthOnLoad = () => {
      const storedSession = localStorage.getItem("userSession")
      if (!storedSession) {
        router.replace('/authentication')
        return
      }
      try {
        const session: UserSession = JSON.parse(storedSession)
        const sessionAge = Date.now() - new Date(session.loginTime).getTime()
        const twentyFourHours = 24 * 60 * 60 * 1000
        if (sessionAge > twentyFourHours) {
          localStorage.removeItem("userSession")
          localStorage.removeItem("cachedLists")
          router.replace('/authentication')
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("userSession")
        localStorage.removeItem("cachedLists")
        router.replace('/authentication')
        return
      }
      setIsAuthLoading(false)  // ✅ moved outside try block, runs after setIsAuthenticated(true)
    }
    checkAuthOnLoad()
  }, [router])

  const handelCampaignsCount = async () => {
    try {
      const url = new URL('/api/dashboard/stats', window.location.origin)
      url.searchParams.append('token', token())
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        }
      })
      const data = await res.json().catch(() => null)
      setCampaignCount(data?.data?.campaigns || 0)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleTemplatesCount = async () => {
    try {
      const url = new URL('/api/get-all-templates', window.location.origin)
      url.searchParams.append("page_number", "1")
      url.searchParams.append("per_page", "1")
      url.searchParams.append("token", token())
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          'accept': "application/json",
          'Content-Type': "application/json",
          'Authorization': `Bearer ${token()}`,
        },
      })
      const data = await res.json()
      const count = data?.data?.count || data?.data?.data?.count || 0
      setTemplatesCount(count)
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const handleSubscribersCount = async (listRecords: any[]) => {
    try {
      if (listRecords.length === 0) {
        setSubscribersCount(0)
        return
      }

      const counts = await Promise.all(
        listRecords.map(async (list: any) => {
          const list_uid = list?.general?.list_uid || list?.uid || list?.list_uid
          if (!list_uid) return 0
          try {
            const res = await fetch(
              `/api/get-all-subscribers?list_uid=${list_uid}&page_number=1&per_page=100`,
              {
                headers: {
                  Authorization: `Bearer ${token()}`,
                  Accept: "application/json",
                },
              }
            )
            const data = await res.json()
            return data?.count || data?.data?.data?.count || data?.data?.count || 0
          } catch {
            return 0
          }
        })
      )

      const total = counts.reduce((sum, count) => sum + count, 0)
      setSubscribersCount(total)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    }
  }

  const loadListsAndSubscribers = async () => {
    try {
      setLoading(true)
      const url = new URL('/api/get-all-lists', window.location.origin)
      url.searchParams.append("pageNumber", "1")
      url.searchParams.append("perPage", "100")
      url.searchParams.append("token", token())
      url.searchParams.append("_t", Date.now().toString())

      const data = await rateLimitedFetch(url.toString(), {
        method: "GET",
        headers: {
          'accept': "application/json",
          'Content-Type': "application/json",
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }, `get-all-lists-${token()}`);
      const records =
        data?.data?.data?.records ||
        data?.data?.records ||
        data?.records ||
        []

      setListCount(records.length)  // ✅ fixed typo

      if (records.length > 0) {
        await handleSubscribersCount(records)
      } else {
        setSubscribersCount(0)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)  // ✅ always runs, even on error
    }
  }

  // ✅ Only fetch data once auth is confirmed
  useEffect(() => {
    if (!isAuthenticated) return
    handelCampaignsCount()
    handleTemplatesCount()
    loadListsAndSubscribers()
  }, [isAuthenticated])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-base font-medium text-gray-700">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon="Campaigns" title="Campaigns" value={campaignCount} description="" percentage={""} trend={"up"} />
            <MetricCard icon="List" title="List" value={listCount} description="" percentage={""} trend={"up"} />
            <MetricCard icon="Subscribers" title="Subscribers" value={subscribersCount} description="" percentage={""} trend={"up"} />
            <MetricCard icon="Templates" title="Templates" value={templatesCount} description="" percentage={""} trend={"up"} />
          </div>
        </main>
      </div>
      <PromoModal />
    </div>
  )
}