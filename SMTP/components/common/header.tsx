'use client'

import React, { useState, useEffect, useRef } from 'react'
import MobileSidebar from "@/components/mobile-sidebar"
import { Search, Bell, ShoppingCart, LogOut, Mail, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserSession {
  name: string
  email: string
  token: string
  tokenType: string
  loginTime: string
  avatar?: string
}

interface Notification {
  id: number
  title: string
  message: string
  created_at: string
  is_read: boolean
  expires_at: string
}

export default function Header() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const storedSession = localStorage.getItem("userSession")
      if (!storedSession) return;
      const session = JSON.parse(storedSession)
      
      const res = await fetch(`/api/notifications`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      })
      if (!res.ok) return;
      const json = await res.json()
      if (json.status === 'success') {
        setNotifications(json.data)
        setUnreadCount(json.data.filter((n: any) => !n.is_read).length)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadUser = () => {
    const storedSession = localStorage.getItem("userSession")
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        setUser(session)
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }
  };

  useEffect(() => {
    loadUser();
    fetchNotifications();

    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [])

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
        setSelectedNotification(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    localStorage.removeItem("cachedLists")
    window.location.href = window.location.origin + "/authentication"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleNotificationClick = async (notification: Notification) => {
    const updated = notifications.map(n =>
      n.id === notification.id ? { ...n, is_read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.is_read).length)
    setSelectedNotification({ ...notification, is_read: true })

    try {
      const storedSession = localStorage.getItem("userSession")
      if (!storedSession) return;
      const session = JSON.parse(storedSession)
      
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.token}` }
      })
    } catch (error) {
      console.error('Error marking notification read:', error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2 border-b bg-card px-3 py-2 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <MobileSidebar />
        <div className="relative hidden w-[42vw] max-w-[180px] sm:block sm:max-w-[240px]">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* 🔔 Bell Notification */}
        <div className="relative flex items-center" ref={notificationRef}>
          <button
            className="relative flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground sm:h-8 sm:w-8"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setSelectedNotification(null)
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed left-3 right-3 top-14 z-50 max-h-[80dvh] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">

              {selectedNotification ? (
                <div>
                  <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1 ml-2">
                      <Mail className="h-4 w-4" /> Messages
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="border rounded overflow-hidden text-sm">
                      <div className="grid grid-cols-[80px_1fr] border-b">
                        <span className="bg-gray-50 px-3 py-2 text-gray-500 font-medium border-r">Title</span>
                        <span className="px-3 py-2 text-gray-800">{selectedNotification.title}</span>
                      </div>
                      <div className="flex flex-col border-b">
                        <span className="bg-gray-50 px-3 py-2 text-gray-500 font-medium border-b">Message</span>
                        <span
                          className="px-3 py-2 text-gray-800 leading-relaxed break-words text-xs"
                          dangerouslySetInnerHTML={{ __html: selectedNotification.message }}
                        />
                      </div>
                      <div className="grid grid-cols-[80px_1fr]">
                        <span className="bg-gray-50 px-3 py-2 text-gray-500 font-medium border-r">Date</span>
                        <span className="px-3 py-2 text-gray-800">{formatDate(selectedNotification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <span className="text-sm font-semibold text-gray-700">
                      You have {unreadCount} unread messages!
                    </span>
                  </div>
                  <div className="max-h-[55dvh] overflow-y-auto divide-y divide-gray-100 sm:max-h-72">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {notification.title}
                              </p>
                              <p
                                className="text-xs text-gray-500 mt-0.5 line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: notification.message.replace(/<[^>]*>/g, ' ')
                                }}
                              />
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t px-4 py-2 text-center">
                    <span className="text-xs text-gray-400">
                      Notifications expire after 24 hours
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 👤 User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex min-h-10 items-center gap-2 rounded-md px-1 transition-opacity hover:opacity-80"
          >
            <span className="hidden text-sm font-medium text-foreground sm:inline-block">
              {user?.name || "User"}
            </span>
            <div className="relative h-8 w-8 overflow-hidden rounded-full cursor-pointer">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <Image
                  src="/face.jpg"
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="bg-orange-100 h-full w-full object-cover"
                />
              )}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-64 overflow-hidden rounded-lg border border-blue-400 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg">
              <div className="bg-blue-600 px-4 py-6 text-center">
                <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-white font-semibold text-lg">{user?.name || "User"}</h3>
              </div>
              <div className="bg-gray-50 px-4 py-4">
                <p className="text-xs text-gray-600">Logged in as</p>
                <p className="truncate text-sm font-bold text-gray-900">{user?.name || "User"}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || ""}</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <Link
                  href="/account"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
