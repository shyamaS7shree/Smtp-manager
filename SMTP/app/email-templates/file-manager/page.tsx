import { Suspense } from "react";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";
import FileManagerContent from "@/components/file-manager-content";

export default function FileManagerPage() {
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
          <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading File Manager...</div>}>
            <FileManagerContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
