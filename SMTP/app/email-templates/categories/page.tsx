'use client'
import React, { useState } from 'react'
import SidebarNav from '@/components/sidebar-nav'
import Image from "next/image"
import { Bell, Menu, Search, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import EmailTempCatagoryComponent from '@/components/EmailTempCatagoryComponent'
import Header from '@/components/common/header'

export default function EmailTempCatagory () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block w-64 border-r border-gray-200  ">
        <SidebarNav />
      </div>

      {/* Sidebar for Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64   border-r border-gray-200 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav />
        <button
          className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
           <Header/>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6  bg-gray-50  dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <EmailTempCatagoryComponent />
          </div>
        </main>
      </div>
    </div>
  )
}
