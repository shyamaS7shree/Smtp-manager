import SidebarNav from "@/components/sidebar-nav"
import RegularCampaignsTable from "@/components/regular-content"
import Header from "@/components/common/header"

export default function RegularCampaignsPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Mobile Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
         <Header/>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <RegularCampaignsTable />
          </div>
        </div>
      </div>
    </div>
  )
}