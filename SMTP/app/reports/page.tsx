import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/common/header"
import ReportsContent from "@/components/app/reports/reports-content"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background font-sans">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <ReportsContent />
          </div>
        </main>
      </div>
    </div>
  )
}
