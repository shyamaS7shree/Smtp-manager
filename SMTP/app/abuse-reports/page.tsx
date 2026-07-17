import { Suspense } from "react"
import { Search, Bell, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import SidebarNav from "@/components/sidebar-nav"
import AbuseReportsContent from "@/components/abuse-reports-content"
import AbuseReportsLoading from "./loading"

export default function AbuseReportsPage() {
    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <SidebarNav />
            </div>

            {/* Mobile Sidebar */}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left side - Search */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input placeholder="Search..." className="pl-10 w-64 bg-gray-50 border-gray-200" />
                            </div>
                        </div>

                        {/* Right side - Notifications, Cart, User */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell */}
                            <button className="text-muted-foreground hover:text-foreground">
                                <Bell className="h-5 w-5" />
                            </button>

                            {/* Shopping Cart */}
                            <button className="text-muted-foreground hover:text-foreground">
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            {/* User Profile */}
                            {/* User Profile */}
                            <div className="flex items-center gap-2">
                                <span className="hidden text-sm font-medium text-foreground sm:inline-block">Shyamashree Das</span>
                                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                                    <Image src="/face.jpg" alt="SMTP Master" width={120} height={32}
                                        className="bg-orange-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <Suspense fallback={<AbuseReportsLoading />}>
                    <AbuseReportsContent />
                </Suspense>
            </div>
        </div>
    )
}
