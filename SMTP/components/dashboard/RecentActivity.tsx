"use client";

import { Users, Mail, FileText, ShieldAlert, List, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function RecentActivity({ activities = [] }: { activities: any[] }) {
  const getIconAndStyle = (type: string) => {
    switch (type) {
      case 'campaign': return { icon: Mail, color: "text-orange-500", bg: "bg-orange-50", prefix: "Campaign" };
      case 'list': return { icon: List, color: "text-purple-500", bg: "bg-purple-50", prefix: "List" };
      case 'template': return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", prefix: "Template" };
      default: return { icon: Clock, color: "text-gray-500", bg: "bg-gray-50", prefix: "Item" };
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h2>
        </div>
        <Link href="/campaigns" className="text-xs font-bold text-orange-500 border border-orange-100 px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors">
          View All
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        {activities.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>}
        {activities.map((activity, idx) => {
          const style = getIconAndStyle(activity.type);
          const Icon = style.icon;
          return (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${style.bg}`}>
                  <Icon className={`w-4 h-4 ${style.color}`} />
                </div>
                <p className="text-xs font-bold text-gray-800">{style.prefix} "{activity.name}" created.</p>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
