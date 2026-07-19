import { Suspense } from "react";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";
import CreateCampaignPage from "@/components/app/campigens/AddCampigens";

export default function Page() {
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
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading campaign wizard...</div>}>
          <CreateCampaignPage defaultType="Regular" />
        </Suspense>
      </div>
    </div>
  );
}
