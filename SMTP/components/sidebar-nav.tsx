"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  List,
  Mail,
  FileText,
  Key,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  LayoutTemplate,
  MessageSquare,
  Network,
  Globe,
  Settings,
} from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import SidebarNavSkeleton from "./sidebar-nav-skeleton"

interface NavItem {
  icon: React.ReactNode
  label: string
  href?: string
  subItems?: { label: string; href: string }[]
}

interface SidebarNavProps {
  isMobile?: boolean
  onClose?: () => void
}

export function SidebarNav({ isMobile = false, onClose }: SidebarNavProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Lists: false,
    Campaigns: false,
    "Email templates": false,
    "Landing pages": false,
    Surveys: false,
  })
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // After mounting, we can access the theme and set time
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const prevPathnameRef = useRef(pathname);

  // Auto-expand sidebar item & auto-close mobile drawer on route change
  useEffect(() => {
    if (pathname) {
      if (pathname.startsWith("/lists") || pathname.startsWith("/subscribers")) {
        setExpandedItems((prev) => ({ ...prev, Lists: true }))
      }
      if (pathname.startsWith("/campaigns") || pathname.startsWith("/abuse-reports")) {
        setExpandedItems((prev) => ({ ...prev, Campaigns: true }))
      }
      if (pathname.startsWith("/email-templates")) {
        setExpandedItems((prev) => ({ ...prev, "Email templates": true }))
      }
      if (pathname.startsWith("/landing-pages")) {
        setExpandedItems((prev) => ({ ...prev, "Landing pages": true }))
      }
      if (pathname.startsWith("/surveys")) {
        setExpandedItems((prev) => ({ ...prev, Surveys: true }))
      }
    }

    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isMobile && onClose) {
        onClose();
      }
    }
  }, [pathname, isMobile, onClose])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", href: "/" },
    {
      icon: <List className="h-5 w-5" />,
      label: "Lists",
      subItems: [
        { label: "Lists", href: "/lists" },
        { label: "Tools", href: "/lists/tools" },
        { label: "Email blacklist", href: "/lists/email-blacklist" },
        { label: "Suppression lists", href: "/lists/suppression" },
        { label: "IP blacklist", href: "/lists/ip-blacklist" },
      ],
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Campaigns",
      subItems: [
        { label: "All campaigns", href: "/campaigns" },
        { label: "Regular campaigns", href: "/campaigns/regular" },
        { label: "Autoresponders", href: "/campaigns/autoresponders" },
        { label: "Stats", href: "/campaigns/stats" },
      ],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Email templates",
      subItems: [
        { label: "Templates", href: "/email-templates/templates" },
        { label: "File manager", href: "/email-templates/file-manager" },
      ],
    },
    /*{
      icon: <LayoutTemplate className="h-5 w-5" />,
      label: "Landing pages",
      subItems: [
        { label: "Landing pages", href: "/landing-pages" },
        { label: "Domains", href: "/landing-pages/domains" },
      ],
    },*/
    /*{
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Surveys",
      href: "/surveys",
    },*/
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const sidebarContent = (
    <>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index} className="rounded-md">
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {expandedItems[item.label] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems[item.label] && (
                    <ul className="mt-1 space-y-1 pl-10">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            href={subItem.href}
                            onClick={isMobile ? onClose : undefined}
                            className={`block rounded-md px-3 py-2 text-sm ${pathname === subItem.href
                              ? "bg-orange-50 text-orange-500 dark:bg-gray-800"
                              : "text-foreground hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-gray-800"
                              }`}
                          >
                            • {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${pathname === item.href
                    ? "bg-orange-50 text-orange-500 dark:bg-gray-800"
                    : "text-foreground hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-gray-800"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-between border-t border-border p-3 text-[13px] font-medium text-muted-foreground">
        <span>Local time</span>
        <span>
          {mounted && currentTime 
            ? `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}` 
            : "..."}
        </span>
      </div>
      {!isMobile && (
        <div className="border-t border-border p-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black p-5 text-white shadow-xl dark:from-gray-800 dark:to-gray-900">
            {/* Subtle glow effect */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl"></div>
            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Current Plan</span>
              <span className="mb-4 text-2xl font-black tracking-tight text-white drop-shadow-sm">BASIC</span>
              
              <button
                onClick={() => (window.location.href = "/upgrade")}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:from-orange-400 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98]"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // For mobile view we return just the content without the wrapper
  if (isMobile) {
    return sidebarContent
  }

  if (!mounted) {
    // Render a skeleton while the theme hook finishes mounting
    return <SidebarNavSkeleton />
  }
  // For desktop view we return the content wrapped in the sidebar container
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* ✅ FIXED LOGO WITH CONSISTENT SIZING */}
      <div className="flex items-center justify-center px-4 py-3 mt-3 h-16">
        <Link href={'/'}>
          <Image src={theme === 'dark' || false ? ("/smtpdarklogo.png") : ("/smtplogo.jpg")} alt="SMTP Master" width={120} height={32} className="h-25 w-auto object-contain" />
        </Link>
      </div>
      {sidebarContent}
    </div>
  )
}

export default SidebarNav
