import { Search, Bell, ShoppingCart } from "lucide-react"
import Image from "next/image"
import SidebarNav from "@/components/sidebar-nav"
import ToolsContent from "@/components/tools-content"
import MobileSidebar from "@/components/mobile-sidebar"
import Header from "@/components/common/header"

export default function ToolsPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-auto">
         <Header />
        <main className="p-4 sm:p-6">
          <ToolsContent />
        </main>
      </div>
    </div>
  )
}
