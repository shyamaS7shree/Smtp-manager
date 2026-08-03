'use client'
import React from 'react'
import { SidebarNav } from '@/components/sidebar-nav'
import BounceServersContent from '@/components/app/servers/bounce-servers-content'
import Header from '@/components/common/header'

export default function BounceServers () {
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav />
        </div>

         {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-auto bg-slate-50">
                {/* Top Header */}
                   <Header/>

                  <div className='m-4'><BounceServersContent/></div>
              </div>
    </div>
    </>
  )
}
