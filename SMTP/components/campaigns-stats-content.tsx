"use client";

import { useEffect, useState } from "react";
import { Mail, RotateCcw, TrendingUp, MousePointer, Eye, AlertOctagon, UserX, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiUrl, token } from "@/components/common/http";

interface CampaignStatItem {
  id: number | string;
  uniqueId: string;
  name: string;
  type: string;
  status: string;
  sendAt: string;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubs: number;
}

export default function CampaignsStatsContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStatItem[]>([]);
  const [summary, setSummary] = useState({
    totalDelivered: 0,
    totalOpens: 0,
    totalClicks: 0,
    totalBounces: 0,
    totalUnsubs: 0,
  });

  const deduplicateCampaigns = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = String(item.uniqueId || item.campaign_uid || item.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const fetchStats = async (isManualRefresh = false) => {
    if (!isManualRefresh) {
      // ⚡ Fast Initial Load from Local Cache on page mount
      try {
        const cached = localStorage.getItem("cachedCampaigns");
        const cachedAr = localStorage.getItem("cachedAutoresponders");
        const list1 = cached ? JSON.parse(cached) : [];
        const list2 = cachedAr ? JSON.parse(cachedAr) : [];
        const combined = deduplicateCampaigns([...list1, ...list2]);
        if (combined.length > 0) {
          const mappedCached: CampaignStatItem[] = combined.map((c: any, index: number) => ({
            id: `${c.uniqueId || c.campaign_uid || c.id || 'stat'}_${index}`,
            uniqueId: c.uniqueId || c.campaign_uid || `c_${index}`,
            name: c.name || c.campaign_name || "Untitled Campaign",
            type: c.type || (c.event ? "Autoresponder" : "Regular"),
            status: c.status || "Active",
            sendAt: c.sendAt || c.send_at || c.dateAdded || "-",
            delivered: parseInt(c.delivered || c.stats?.processed_subscribers || 0, 10) || 0,
            opens: parseInt(c.opens || c.stats?.opens_count || 0, 10) || 0,
            clicks: parseInt(c.clicks || c.stats?.clicks_count || 0, 10) || 0,
            bounces: parseInt(c.bounces || c.stats?.bounces_count || 0, 10) || 0,
            unsubs: parseInt(c.unsubs || c.stats?.unsubscribes_count || 0, 10) || 0,
          }));
          setStats(mappedCached);
          setLoading(false);
        }
      } catch {}
    }

    try {
      let fetchedCampaigns: any[] = [];

      const res = await fetch(`/api/get-all-campaigns?page_number=1&per_page=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const records = data?.data?.records || data?.records || [];
        if (Array.isArray(records) && records.length > 0) {
          fetchedCampaigns = records;
        }
      }

      if (fetchedCampaigns.length === 0) {
        const cached = localStorage.getItem("cachedCampaigns");
        const cachedAr = localStorage.getItem("cachedAutoresponders");
        const list1 = cached ? JSON.parse(cached) : [];
        const list2 = cachedAr ? JSON.parse(cachedAr) : [];
        fetchedCampaigns = [...list1, ...list2];
      }

      const deduplicated = deduplicateCampaigns(fetchedCampaigns);

      const mappedStats: CampaignStatItem[] = deduplicated.map((c: any, index: number) => ({
        id: `${c.uniqueId || c.campaign_uid || c.id || 'stat'}_${index}`,
        uniqueId: c.uniqueId || c.campaign_uid || `c_${index}`,
        name: c.name || c.campaign_name || "Untitled Campaign",
        type: c.type || (c.event ? "Autoresponder" : "Regular"),
        status: c.status || "Active",
        sendAt: c.sendAt || c.send_at || c.dateAdded || "-",
        delivered: parseInt(c.delivered || c.stats?.processed_subscribers || 0, 10) || 0,
        opens: parseInt(c.opens || c.stats?.opens_count || 0, 10) || 0,
        clicks: parseInt(c.clicks || c.stats?.clicks_count || 0, 10) || 0,
        bounces: parseInt(c.bounces || c.stats?.bounces_count || 0, 10) || 0,
        unsubs: parseInt(c.unsubs || c.stats?.unsubscribes_count || 0, 10) || 0,
      }));

      setStats(mappedStats);

      const totals = mappedStats.reduce(
        (acc, item) => ({
          totalDelivered: acc.totalDelivered + item.delivered,
          totalOpens: acc.totalOpens + item.opens,
          totalClicks: acc.totalClicks + item.clicks,
          totalBounces: acc.totalBounces + item.bounces,
          totalUnsubs: acc.totalUnsubs + item.unsubs,
        }),
        { totalDelivered: 0, totalOpens: 0, totalClicks: 0, totalBounces: 0, totalUnsubs: 0 }
      );

      setSummary(totals);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
  }, []);

  const openRate = summary.totalDelivered > 0 ? ((summary.totalOpens / summary.totalDelivered) * 100).toFixed(1) : "0.0";
  const clickRate = summary.totalDelivered > 0 ? ((summary.totalClicks / summary.totalDelivered) * 100).toFixed(1) : "0.0";

  const formatDateTime = (value: string | Date | undefined | null) => {
    if (!value || value === "-") return "-";
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else {
      let str = String(value).trim();
      if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(str)) {
        str = str.replace(" ", "T");
      }
      date = new Date(str);
    }
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Stats</h1>
        </div>

        <Button
          onClick={() => { setLoading(true); fetchStats(true); }}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-all shadow-xs"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Main Container Card */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {loading ? (
          /* ⚡ Skeleton Loading UI */
          <div className="p-6 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-2">
                  <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-zinc-700" />
                  <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <Skeleton className="h-4 w-36 bg-slate-200 dark:bg-zinc-700" />
                  <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-zinc-700" />
                  <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-zinc-700" />
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          </div>
        ) : stats.length === 0 ? (
          /* Empty State (Matching Image 2 Exactly) */
          <div className="p-16 sm:p-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Campaigns stats
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              This area shows overview reports for sent campaigns, so you will have to create and send at least one campaign in order to view information here.
            </p>
          </div>
        ) : (
          /* Data State - Summary Cards & Detailed Table */
          <div className="p-6 space-y-6">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                  <span>Total Delivered</span>
                  <Send className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalDelivered}</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                  <span>Total Opens</span>
                  <Eye className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalOpens}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">{openRate}% open rate</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                  <span>Total Clicks</span>
                  <MousePointer className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalClicks}</div>
                <div className="text-xs text-indigo-600 font-medium mt-1">{clickRate}% click rate</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                  <span>Total Bounces</span>
                  <AlertOctagon className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalBounces}</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                  <span>Unsubscribes</span>
                  <UserX className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.totalUnsubs}</div>
              </div>
            </div>

            {/* Detailed Campaigns Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Send At</th>
                    <th className="p-3 text-right">Delivered</th>
                    <th className="p-3 text-right">Opens</th>
                    <th className="p-3 text-right">Clicks</th>
                    <th className="p-3 text-right">Bounces</th>
                    <th className="p-3 text-right">Unsubs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
                  {stats.map((item, index) => (
                    <tr key={`${item.uniqueId || item.id || 'stat'}_${index}`} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="p-3">{item.type}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{formatDateTime(item.sendAt)}</td>
                      <td className="p-3 text-right font-medium">{item.delivered}</td>
                      <td className="p-3 text-right font-medium text-emerald-600">{item.opens}</td>
                      <td className="p-3 text-right font-medium text-indigo-600">{item.clicks}</td>
                      <td className="p-3 text-right font-medium text-amber-600">{item.bounces}</td>
                      <td className="p-3 text-right font-medium text-rose-600">{item.unsubs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
