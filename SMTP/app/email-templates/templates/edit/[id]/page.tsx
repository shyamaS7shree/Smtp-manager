'use client'
import React from 'react'
import SidebarNav from '@/components/sidebar-nav'
import EmailTemplatesComponent from '@/components/email-template'
import Header from '@/components/common/header'
import { useParams } from 'next/navigation'
import EditEmailTemplateEditor from '@/components/app/email-template/edit-email-template'

export default function EmailTemplates () {
  const params = useParams()
  const id = (params?.id as string) || ''

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

                  <div className='m-4'><EditEmailTemplateEditor/></div>
              </div>

          
    </div>
    </>
  )
}
