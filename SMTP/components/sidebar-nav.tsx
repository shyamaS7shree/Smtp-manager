"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-expand the sidebar item based on current path
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
  }, [pathname])

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
        //{ label: "Tools", href: "/lists/tools" }, [[[mailwizz not provieded api for all]]]
        //{ label: "Email blacklist", href: "/lists/email-blacklist" },
        //{ label: "Suppression lists", href: "/lists/suppression" },
        //{ label: "IP blacklist", href: "/lists/ip-blacklist" },
      ],
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Campaigns",
      subItems: [
        { label: "All campaigns", href: "/campaigns" },
        { label: "Regular campaigns", href: "/campaigns/regular" },
        //{ label: "Autoresponders", href: "/campaigns/autoresponders" }, [[[mailwizz not provieded api for all]]]
        //{ label: "Groups", href: "/campaigns/groups" },
        //{ label: "Send groups", href: "/campaigns/send-groups" },
        //{ label: "Stats", href: "/campaigns/stats" },
        //{ label: "Custom tags", href: "/campaigns/tags" },
        //{ label: "Abuse complaints", href: "/campaigns/abuse-complaints" },
        //{ label: "Abuse reports", href: "/abuse-reports" },
      ],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Email templates",
      subItems: [
        //{ label: "Categories", href: "/email-templates/categories" },[[[mailwizz not provieded api for all]]]
        { label: "Templates", href: "/email-templates/templates" },
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
      <div className="flex items-center justify-between border-t border-border p-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="rounded-md p-1 hover:bg-accent"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {mounted && theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </button>
        </div>
      </div>
      {!isMobile && (
        <div className="border-t border-border p-4">
          <div className="rounded-md bg-orange-500 p-6 text-white">
            <div className="mb-1 text-center text-xs font-medium">Current Plan</div>
            <div className="mb-2 text-center text-lg font-bold">BASIC</div>
            <div className="mb-1 text-xs">STORAGE</div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/30">
              <div className="h-full w-[40%] rounded-full bg-white"></div>
            </div>
            <div className="text-right text-xs">40%</div>
            <button
              onClick={() => (window.location.href = "UPGRADE_LINK_HERE")}
              className="w-full rounded-md bg-white py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
            >
              Upgrade Plan
            </button>
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
