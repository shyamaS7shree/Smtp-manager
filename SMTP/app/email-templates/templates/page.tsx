'use client'
import React from 'react'
import SidebarNav from '@/components/sidebar-nav'
import EmailTemplatesComponent from '@/components/email-template'
import Header from '@/components/common/header'

export default function EmailTemplates () {
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav />
        </div>

         {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-auto">
                {/* Top Header */}
                   <Header/>

                  <div className='m-4'><EmailTemplatesComponent/></div>
              </div>

          
    </div>
    </>
  )
}
