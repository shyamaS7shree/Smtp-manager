import SidebarNav from '@/components/sidebar-nav'
import React from 'react'
import AbuseComplaintsComponent from "@/components/abuse-complaints-component"
import Header from '@/components/common/header'

export default function AbuseComplaintsPage() {
  return (
    <>
    
    <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <SidebarNav />
        </div>

         {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                  <Header/>

                  <div className='m-4'> <AbuseComplaintsComponent/></div>
              </div>

          
    </div>
    </>
  )
}
