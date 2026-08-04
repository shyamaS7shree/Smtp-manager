'use client'
import React from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import DeliveryServersContent from '@/components/app/servers/delivery-servers-content'
import Header from '@/components/common/header'

export default function DeliveryServers () {
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav />
        </div>

         {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
                {/* Top Header */}
                   <Header/>

                  <div className='m-4'><DeliveryServersContent/></div>
              </div>
    </div>
    </>
  )
}
