import { Suspense } from "react"
import { Search, Bell, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/common/header"
import CampaignsLoading from "../loading"
import CreateCampaignPage from "@/components/app/campigens/AddCampigens"

export default function Page() {
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
        <Suspense fallback={<CampaignsLoading />}>
          <CreateCampaignPage />
        </Suspense>
      </div>
    </div>
  )
}
