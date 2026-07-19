import { Suspense } from "react";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";
import CampaignsStatsContent from "@/components/campaigns-stats-content";

export default function CampaignsStatsPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading stats...</div>}>
            <CampaignsStatsContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
