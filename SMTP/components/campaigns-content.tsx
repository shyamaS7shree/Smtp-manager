"use client";

import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { token } from "@/components/common/http";

import {
  Mail,
  SlidersHorizontal,
  X,
  PlusCircle,
  Download,
  Upload,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "sonner";

interface Campaign {
  id: number;
  uniqueId: string;
  campaign_uid?: string;
  name: string;
  type: string;
  group: string;
  sendGroup: string;
  list: string;
  list_uid?: string;
  segment: string;
  recurring: string;
  sendAt: string;
  startedAt: string;
  status: string;
  template: string;
  delivered: string;
  opens: string;
  clicks: string;
  bounces: string;
  unsubs: string;
  dateAdded?: string;
  lastUpdated?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  toName?: string;
  subject?: string;
  [key: string]: any;
}

export default function CampaignsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All Campaigns");
  const [showToggleColumns, setShowToggleColumns] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showImportShareCodeModal, setShowImportShareCodeModal] =
    useState(false);
  const [shareCodeData, setShareCodeData] = useState({ code: "", list: "" });
  const [showCampaignInfoModal, setShowCampaignInfoModal] = useState(false);
  const [selectedCampaignInfo, setSelectedCampaignInfo] =
    useState<Campaign | null>(null);

  const [searchFilters, setSearchFilters] = useState({
    id: "",
    uniqueId: "",
    campaignName: "",
    type: "all",
    group: "",
    sendGroup: "",
    list: "",
    segment: "",
    recurring: "",
    sendAt: "",
    startedAt: "",
    status: "all",
    template: "",
    delivered: "",
  });

  const [visibleColumns, setVisibleColumns] = useState({
    ID: true,
    "Unique ID": true,
    "Campaign name": true,
    Type: true,
    List: true,
    Segment: true,
    Recurring: true,
    "Send at": true,
    Status: true,
    Delivered: true,
    Opens: true,
    Clicks: true,
    Bounces: true,
    Unsubs: true,
    Options: true,
  });

  const columns: (keyof typeof visibleColumns)[] = [
    "ID",
    "Unique ID",
    "Campaign name",
    "Type",
    "List",
    "Segment",
    "Recurring",
    "Send at",
    "Status",
    "Delivered",
    "Opens",
    "Clicks",
    "Bounces",
    "Unsubs",
    "Options",
  ];

  type ListType = { id: string; uid?: string; name: string };
  const [availableLists, setAvailableLists] = useState<ListType[]>([]);

  // ✅ Helper: check if campaign is editable (only Draft status)
  const isCampaignEditable = (campaign: Campaign): boolean => {
    const s = campaign.status?.toLowerCase();
    return s !== "sending" && s !== "pending";
  };
  const handleColumnToggle = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }));
  };

  const handleSaveChanges = () => {
    setShowToggleColumns(false);
  };

  const handleCreateNew = () => {
    router.push("/campaigns/create");
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCampaigns();
  };

  const handleExport = () => {
    if (campaigns.length === 0) {
      toast.error("No campaigns to export");
      return;
    }

    const headers = [
      "Type",
      "Campaign name",
      "From name",
      "From email",
      "To name",
      "Reply to",
      "Subject",
      "Subject Encoded",
      "Activate at",
      "Started at",
      "Finished at",
      "Daily sending window - Start hour",
      "Daily sending window - Interval",
      "Delivery Logs",
      "Archived",
      "Priority",
      "Status",
      "Date added",
      "Last updated",
      "Send group",
      "Group",
      "List",
      "Segment",
      "Recipients",
      "Sent",
      "Delivered",
      "Opens",
      "Clicks",
      "Bounces",
      "Unsubs",
    ];

    const csvData = campaigns.map((campaign) => [
      campaign.type,
      campaign.name,
      campaign.fromName || "",
      campaign.fromEmail || "",
      campaign.toName || "",
      campaign.replyTo || "",
      campaign.subject || "",
      campaign.subject || "",
      campaign.sendAt,
      campaign.startedAt,
      "",
      "",
      "",
      "",
      "No",
      "Normal",
      campaign.status,
      campaign.dateAdded || "",
      campaign.lastUpdated || "",
      campaign.sendGroup,
      campaign.group,
      campaign.list,
      campaign.segment,
      "0",
      "0",
      campaign.delivered,
      campaign.opens,
      campaign.clicks,
      campaign.bounces,
      campaign.unsubs,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "campaigns.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCampaignId = () => {
    return Math.floor(Math.random() * 9000) + 1000;
  };

  const generateUniqueId = () => {
    return (
      Math.random().toString(36).substr(2, 9) +
      Math.random().toString(36).substr(2, 5)
    );
  };

  useEffect(() => {
    const fetchUserLists = () => {
      const cachedLists = localStorage.getItem("cachedLists");
      if (cachedLists) {
        const parsed = JSON.parse(cachedLists);
        setAvailableLists(parsed.lists || []);
      }
    };
    fetchUserLists();
  }, []);

  useEffect(() => {
    const cachedCampaigns = localStorage.getItem("cachedCampaigns");
    if (cachedCampaigns) {
      setCampaigns(JSON.parse(cachedCampaigns));
    }

    fetchCampaigns().catch((error) => {
      console.error("Failed to fetch latest campaigns", error);
    });
  }, []);

  const fetchCampaignStats = async (campaignUid: string) => {
    try {
      if (!campaignUid) return null;

      const statsUrl = new URL(
        "/api/get-campaign-stats",
        window.location.origin,
      );
      statsUrl.searchParams.append("token", token());
      statsUrl.searchParams.append("campaign_uid", campaignUid);

      const statsRes = await fetch(statsUrl.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const statsData = await statsRes.json();
      if (!statsRes.ok || statsData?.status !== "success") return null;

      const payload = statsData?.data ?? {};
      const source = payload?.data ?? payload;

      return {
        opens: String(
          source?.opens ?? source?.open_count ?? source?.opened ?? 0,
        ),
        clicks: String(
          source?.clicks ?? source?.click_count ?? source?.clicked ?? 0,
        ),
        bounces: String(source?.bounces ?? source?.bounce_count ?? 0),
        unsubs: String(
          source?.unsubs ??
            source?.unsubscribe_count ??
            source?.unsubscribed ??
            0,
        ),
        delivered: String(source?.delivered ?? source?.sent ?? 0),
      };
    } catch (error) {
      console.error("Error fetching stats for campaign", campaignUid, error);
      return null;
    }
  };

  const templatesCacheRef = useRef<any[] | null>(null);

  const fetchTemplateName = async (templateUid: string) => {
    if (!templateUid || templateUid === "-") return "-";
    try {
      if (!templatesCacheRef.current) {
        const cached = localStorage.getItem("cachedTemplates");
        if (cached) templatesCacheRef.current = JSON.parse(cached);
      }
      if (!templatesCacheRef.current) {
        const res = await fetch(
          `/api/get-all-templates?page_number=1&per_page=100`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token()}`,
              Accept: "application/json",
            },
          },
        );
        const data = await res.json();
        const templates = data?.data?.records || data?.records || [];
        templatesCacheRef.current = templates;
        try { localStorage.setItem("cachedTemplates", JSON.stringify(templates)); } catch {}
      }
      const found = (templatesCacheRef.current || []).find(
        (t: any) => String(t.template_uid) === String(templateUid),
      );
      return found?.name ?? "-";
    } catch (e) {
      return "-";
    }
  };

  const fetchOneCampaign = async (campaignUid: string) => {
    try {
      const res = await fetch(
        `/api/get-one-campaign?campaign_uid=${encodeURIComponent(campaignUid)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        },
      );
      const data = await res.json();
      return data?.data?.record || {};
    } catch (e) {
      console.warn("get-one-campaign failed:", campaignUid);
      return {};
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(
        `/api/get-all-campaigns?page_number=1&per_page=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      const records = data?.data?.records || [];

      if (!Array.isArray(records) || records.length === 0) {
        const cached = localStorage.getItem("cachedCampaigns");
        const cachedAr = localStorage.getItem("cachedAutoresponders");
        const combined = [
          ...(cached ? JSON.parse(cached) : []),
          ...(cachedAr ? JSON.parse(cachedAr) : []),
        ];
        if (combined.length > 0) {
          // Remove duplicates by uniqueId or id
          const uniqueMap = new Map();
          combined.forEach((c) => uniqueMap.set(c.uniqueId || c.id, c));
          setCampaigns(Array.from(uniqueMap.values()));
        } else {
          setCampaigns([]);
        }
        return;
      }

      const mappedCampaigns: Campaign[] = records.map((item: any, index: number) => {
        const stats = item?.stats || {};
        return {
          id: Number(item?.campaign_id ?? item?.id ?? Date.now() + index),
          uniqueId: String(item?.campaign_uid ?? item?.uid ?? ""),
          campaign_uid: String(item?.campaign_uid ?? item?.uid ?? ""),
          name: String(item?.name ?? "Untitled"),
          type: String(item?.type ?? "Regular"),
          status: String(item?.status ?? "Draft"),
          list: item?.list?.name || item?.list_name || "-",
          list_uid: item?.list?.list_uid || item?.list_uid || "",
          listId: item?.list?.list_uid || item?.list_uid || "",
          subject: item?.subject || "-",
          fromName: item?.from_name || "-",
          fromEmail: item?.from_email || "-",
          replyTo: item?.reply_to || "-",
          toName: item?.to_name || "[EMAIL]",
          segment: item?.segment?.name || item?.segment_name || "-",
          group: item?.group?.name || item?.group_name || "-",
          recurring: item?.recurring_status ? "Yes" : "No",
          sendAt: item?.send_at || "",
          dateAdded: item?.date_added || item?.created_at || "",
          startedAt: item?.started_at || "",
          template: item?.template?.name || item?.template_name || "-",
          delivered: String(stats?.processed_subscribers ?? stats?.delivered ?? item?.delivered ?? 0),
          opens: String(stats?.opens_count ?? stats?.opens ?? item?.opens ?? 0),
          clicks: String(stats?.clicks_count ?? stats?.clicks ?? item?.clicks ?? 0),
          bounces: String(stats?.bounces_count ?? stats?.bounces ?? item?.bounces ?? 0),
          unsubs: String(stats?.unsubscribes_count ?? stats?.unsubs ?? item?.unsubs ?? 0),
          sendGroup: item?.send_group?.name || item?.send_group || "",
          lastUpdated: item?.updated_at || "",
        };
      });

      setCampaigns(mappedCampaigns);
      localStorage.setItem("cachedCampaigns", JSON.stringify(mappedCampaigns));
    } catch (error) {
      console.error("fetchCampaigns error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handlePauseUnpause = async (
    campaignUid: string,
    campaignId: number,
  ) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const userToken = session?.token || "";

      const res = await fetch(
        `/api/campaigns/all-campaigns/pause-unpause-a-campaign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ token: userToken, campaign_uid: campaignUid }),
        },
      );

      const data = await res.json();
      console.log("⏸️ Pause/Unpause response:", data);

      if (res.ok && data?.status === "success") {
        await fetchCampaigns();
      } else {
        toast.error(data?.message || "Failed to pause/unpause campaign.");
      }
    } catch (error) {
      console.error("Pause/unpause error:", error);
      toast.error("An error occurred.");
    }
  };

  const markAsSent = async (campaignUid: string) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const userToken = session?.token || "";

      if (!userToken) {
        toast.error("User is not authenticated");
        return;
      }

      const res = await fetch(
        `/api/campaigns/all-campaigns/mark-a-campaign-as-sent`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ token: userToken, campaign_uid: campaignUid }),
        },
      );

      const data = await res.json();
      console.log("✅ Mark as sent response:", data);

      if (res.ok && data?.status === "success") {
        await fetchCampaigns();
        toast.success("Campaign marked as sent successfully");
      } else {
        toast.error(data?.message || "Failed to mark campaign as sent.");
      }
    } catch (error) {
      console.error("Mark as sent error:", error);
      toast.error("An error occurred.");
    }
  };

  const copyCampaign = async (campaign: Campaign) => {
    setConfirmAction({
      message: "Are you sure you want to copy this campaign?",
      onConfirm: async () => {
        try {
          const session = JSON.parse(localStorage.getItem("userSession") || "{}");
          const userToken = session?.token;

          if (!userToken) {
            alert("User is not authenticated");
            return;
          }

          const response = await fetch(`/api/copy-a-campaign`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
              Accept: "application/json",
            },
            body: JSON.stringify({
              token: userToken,
              campaign_uid: campaign.campaign_uid || campaign.uniqueId,
            }),
          });

          const data = await response.json();
          if (response.ok && data?.status === "success") {
            await fetchCampaigns();
            toast.success("Campaign copied successfully");
          } else {
            toast.error(data?.message || "Failed to copy campaign");
          }
        } catch (error) {
          console.error("Copy campaign error:", error);
          toast.error("An error occurred while copying campaign");
        }
      }
    });
  };

  const deleteCampaign = async (campaignUid: string) => {
    setConfirmAction({
      message: "Are you sure you want to delete this campaign?",
      onConfirm: async () => {
        try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const userToken = session?.token;

      if (!userToken) {
        toast.error("User is not authenticated");
        return;
      }

      const response = await fetch(`/api/delete-a-campaign`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ token: userToken, campaign_uid: campaignUid }),
      });

      const data = await response.json();
      if (response.ok && data?.status === "success") {
        await fetchCampaigns();
        toast.success("Campaign deleted successfully");
      } else {
        toast.error(data?.message || "Failed to delete campaign");
      }
        } catch (error) {
          console.error("Delete campaign error:", error);
          toast.error("Error deleting campaign");
        }
      }
    });
  };

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

  const resolveCampaignListName = (campaign: Campaign) => {
    try {
      const raw = localStorage.getItem("cachedLists");
      if (!raw) return campaign.list || "-";

      const lists = JSON.parse(raw).lists || [];
      const keys = [campaign.listId, campaign.list_uid, campaign.list].filter(
        Boolean,
      );

      const found = lists.find((l: any) =>
        keys.some((key) =>
          [l.id, l.uniqueId, l.uid, l.list_uid].some(
            (v: any) => v && String(v) === String(key),
          ),
        ),
      );

      if (found) return found.name || found.displayName || "-";
    } catch {}

    if (
      campaign.list &&
      campaign.list !== "-" &&
      campaign.list !== campaign.list_uid
    )
      return campaign.list;

    return "-";
  };

  const calculateCampaignPerformance = (campaign: Campaign) => {
    const delivered = parseInt(campaign.delivered) || 0;
    const opens = parseInt(campaign.opens) || 0;
    const clicks = parseInt(campaign.clicks) || 0;
    const bounces = parseInt(campaign.bounces) || 0;
    const unsubs = parseInt(campaign.unsubs) || 0;

    const openRate = delivered > 0 ? (opens / delivered) * 100 : 0;
    const clickRate = delivered > 0 ? (clicks / delivered) * 100 : 0;
    const bounceRate = delivered > 0 ? (bounces / delivered) * 100 : 0;
    const unsubRate = delivered > 0 ? (unsubs / delivered) * 100 : 0;

    return {
      openRate,
      clickRate,
      bounceRate,
      unsubRate,
      delivered,
      opens,
      clicks,
      bounces,
      unsubs,
    };
  };

  const isWellPerformingCampaign = (campaign: Campaign): boolean => {
    const performance = calculateCampaignPerformance(campaign);

    const goodOpenRate = performance.openRate >= 20;
    const goodClickRate = performance.clickRate >= 2;
    const lowBounceRate = performance.bounceRate <= 5;
    const lowUnsubRate = performance.unsubRate <= 1;
    const minimumDelivered = performance.delivered >= 100;

    const criteriaMet = [
      goodOpenRate,
      goodClickRate,
      lowBounceRate,
      lowUnsubRate,
      minimumDelivered,
    ].filter(Boolean).length;

    return criteriaMet >= 3;
  };

  const moveWellPerformingToRegular = async () => {
    try {
      const wellPerformingCampaigns = campaigns.filter(
        isWellPerformingCampaign,
      );

      if (wellPerformingCampaigns.length === 0) {
        toast.error("No well-performing campaigns found to move.");
        return;
      }

      const confirmMessage = `Found ${wellPerformingCampaigns.length} well-performing campaign(s). Do you want to move them to the regular campaigns category?`;
      setConfirmAction({
        message: confirmMessage,
        onConfirm: async () => {
          try {
            // Update campaign types to "Regular" for well-performing campaigns
            const updatedCampaigns = campaigns.map(campaign => {
              if (isWellPerformingCampaign(campaign)) {
                return { ...campaign, type: "Regular" };
              }
              return campaign;
            });

            setCampaigns(updatedCampaigns);
            localStorage.setItem("cachedCampaigns", JSON.stringify(updatedCampaigns));
            
            toast.success(`Successfully moved ${wellPerformingCampaigns.length} campaigns to regular category!`);
            
            // Refresh the campaigns data
            await fetchCampaigns();
          } catch (error) {
            console.error("Error moving campaigns to regular category:", error);
            toast.error("An error occurred while moving campaigns to regular category.");
          }
        }
      });
    } catch (error) {
      console.error("Error setting up move action:", error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Campaigns</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu
            open={showToggleColumns}
            onOpenChange={setShowToggleColumns}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Toggle columns</span>
                <span className="sm:hidden">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
              <div className="p-2 space-y-2">
                {columns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                        visibleColumns[column]
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() =>
                        handleColumnToggle(column, !visibleColumns[column])
                      }
                    >
                      {visibleColumns[column] && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <label
                      className="text-sm cursor-pointer flex-1"
                      onClick={() =>
                        handleColumnToggle(column, !visibleColumns[column])
                      }
                    >
                      {column}
                    </label>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Button
                    onClick={handleSaveChanges}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="default"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleCreateNew}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create new</span>
            <span className="sm:hidden">Create</span>
          </Button>

          <Button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Bulk Actions Dropdown */}
        {showBulkActions && selectedCampaigns.length > 0 && (
          <div className="bg-blue-50 border-b p-3">
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[120px]"
                onChange={(e) => {
                  const action = e.target.value;
                  if (action === "delete") {
                    setConfirmAction({
                      message: `Delete ${selectedCampaigns.length} selected campaigns?`,
                      onConfirm: () => {
                        const updatedCampaigns = campaigns.filter(
                          (c) => !selectedCampaigns.includes(c.id),
                        );
                        setCampaigns(updatedCampaigns);
                        localStorage.setItem(
                          "cachedCampaigns",
                          JSON.stringify(updatedCampaigns),
                        );
                        setSelectedCampaigns([]);
                        setShowBulkActions(false);
                        toast.success("Selected campaigns deleted successfully!");
                      }
                    });
                  } else if (action === "copy") {
                    const copiesToAdd: Campaign[] = [];
                    selectedCampaigns.forEach((id) => {
                      const campaign = campaigns.find((c) => c.id === id);
                      if (campaign) {
                        copiesToAdd.push({
                          ...campaign,
                          id: generateCampaignId(),
                          uniqueId: generateUniqueId(),
                          name: `${campaign.name} (Copy)`,
                          status: "Draft",
                          dateAdded: new Date().toISOString(),
                          lastUpdated: new Date().toISOString(),
                          sendAt: new Date().toLocaleDateString("en-US", {
                            year: "2-digit",
                            month: "numeric",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }),
                        });
                      }
                    });
                    const updatedCampaigns = [...copiesToAdd, ...campaigns];
                    setCampaigns(updatedCampaigns);
                    localStorage.setItem(
                      "cachedCampaigns",
                      JSON.stringify(updatedCampaigns),
                    );
                    toast.success(
                      `Selected ${selectedCampaigns.length} campaigns copied to draft!`,
                    );
                    setSelectedCampaigns([]);
                  } else if (action === "pause") {
                    for (const id of selectedCampaigns) {
                      const campaign = campaigns.find((c) => c.id === id);
                      if (campaign?.campaign_uid) {
                        handlePauseUnpause(campaign.campaign_uid, campaign.id);
                      }
                    }
                    setSelectedCampaigns([]);
                    setShowBulkActions(false);
                  } else if (action === "mark-sent") {
                    for (const id of selectedCampaigns) {
                      const campaign = campaigns.find((c) => c.id === id);
                      if (campaign?.campaign_uid) {
                        markAsSent(campaign.campaign_uid);
                      }
                    }
                    setSelectedCampaigns([]);
                    setShowBulkActions(false);
                  }
                  setSelectedCampaigns([]);
                  setShowBulkActions(false);
                  e.target.value = "choose";
                }}
                defaultValue="choose"
              >
                <option value="choose">Choose</option>
                <option value="delete">Delete</option>
                <option value="copy">Copy</option>
                <option value="pause">Pause/Unpause</option>
                <option value="mark-sent">Mark as sent</option>
              </select>
              <span className="text-xs text-gray-600">
                {selectedCampaigns.length} campaign(s) selected
              </span>
            </div>
          </div>
        )}

        {/* Campaign Info Modal */}
        {showCampaignInfoModal && selectedCampaignInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-blue-500 text-white p-4 flex items-center gap-2">
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-sm">i</span>
                </div>
                <h3 className="font-medium">Campaign info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCampaignInfoModal(false)}
                  className="ml-auto h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">List/Segment</span>
                  <span className="font-medium">
                    {(() => {
                      const foundList = availableLists.find(
                        (l) => l.id === selectedCampaignInfo.list,
                      );
                      return foundList
                        ? foundList.name
                        : selectedCampaignInfo.list;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.subject || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From name</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.fromName || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From email</span>
                  <span className="font-medium text-blue-600">
                    {selectedCampaignInfo.fromEmail || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reply to</span>
                  <span className="font-medium text-blue-600">
                    {selectedCampaignInfo.replyTo || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To name</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.toName || "[EMAIL]"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date added</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.dateAdded
                      ? new Date(
                          selectedCampaignInfo.dateAdded,
                        ).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Send at</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.sendAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started at</span>
                  <span className="font-medium">
                    {selectedCampaignInfo.startedAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showImportShareCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-4 border-b">
                <h3 className="text-base font-medium text-gray-900">
                  Import campaigns from share code
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Code"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value={shareCodeData.code}
                    onChange={(e) =>
                      setShareCodeData({
                        ...shareCodeData,
                        code: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    List <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={shareCodeData.list}
                    onChange={(e) =>
                      setShareCodeData({
                        ...shareCodeData,
                        list: e.target.value,
                      })
                    }
                  >
                    <option value="">Choose list</option>
                    {availableLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowImportShareCodeModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log("Import share code:", shareCodeData);
                    setShowImportShareCodeModal(false);
                  }}
                  className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="table-scroll">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-sm text-gray-700 whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedCampaigns.length === campaigns.length &&
                      campaigns.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCampaigns(campaigns.map((c) => c.id));
                        setShowBulkActions(true);
                      } else {
                        setSelectedCampaigns([]);
                        setShowBulkActions(false);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <th
                      key={column}
                      className="text-left p-3 font-medium text-sm text-gray-700 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
              </tr>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 transition-colors">
                <th className="p-2 text-center align-middle">
                  {(searchFilters.id || searchFilters.campaignName || searchFilters.type !== "all" || searchFilters.status !== "all") && (
                    <button
                      onClick={() => setSearchFilters({ ...searchFilters, id: "", campaignName: "", type: "all", status: "all" })}
                      title="Clear all filters"
                      className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </th>
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <th key={`filter-${column}`} className="p-2 min-w-[120px] align-middle">
                      {column === "Status" ? (
                        <Select
                          value={searchFilters.status}
                          onValueChange={(value) =>
                            setSearchFilters({
                              ...searchFilters,
                              status: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8.5 w-full bg-white text-xs font-normal text-slate-700 border-slate-200/90 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                            <SelectItem value="Draft" className="text-xs">
                              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Draft</span>
                            </SelectItem>
                            <SelectItem value="Sent" className="text-xs">
                              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Sent</span>
                            </SelectItem>
                            <SelectItem value="Paused" className="text-xs">
                              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Paused</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : column === "Type" ? (
                        <Select
                          value={searchFilters.type}
                          onValueChange={(value) =>
                            setSearchFilters({ ...searchFilters, type: value })
                          }
                        >
                          <SelectTrigger className="h-8.5 w-full bg-white text-xs font-normal text-slate-700 border-slate-200/90 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                            <SelectItem value="all" className="text-xs">All Types</SelectItem>
                            <SelectItem value="Regular" className="text-xs">Regular</SelectItem>
                            <SelectItem value="Autoresponder" className="text-xs">Autoresponder</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : column === "ID" ? (
                        <div className="relative flex items-center">
                          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            className="h-8.5 w-full pl-8 pr-2 text-xs bg-white text-slate-800 placeholder:text-slate-400 border-slate-200/90 shadow-2xs rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                            placeholder="Filter ID..."
                            value={searchFilters.id}
                            onChange={(e) =>
                              setSearchFilters({
                                ...searchFilters,
                                id: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : column === "Campaign name" ? (
                        <div className="relative flex items-center">
                          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            className="h-8.5 w-full pl-8 pr-2 text-xs bg-white text-slate-800 placeholder:text-slate-400 border-slate-200/90 shadow-2xs rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                            placeholder="Search campaign..."
                            value={searchFilters.campaignName}
                            onChange={(e) =>
                              setSearchFilters({
                                ...searchFilters,
                                campaignName: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="h-8.5 flex items-center justify-center text-slate-300 text-xs font-light pointer-events-none select-none"></div>
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredCampaigns = campaigns.filter((campaign) => {
                  return (
                    (searchFilters.id === "" ||
                      campaign.id.toString().includes(searchFilters.id)) &&
                    (searchFilters.uniqueId === "" ||
                      campaign.uniqueId
                        .toLowerCase()
                        .includes(searchFilters.uniqueId.toLowerCase())) &&
                    (searchFilters.campaignName === "" ||
                      campaign.name
                        .toLowerCase()
                        .includes(searchFilters.campaignName.toLowerCase())) &&
                    (searchFilters.type === "all" ||
                      String(campaign.type || '').toLowerCase() === String(searchFilters.type || '').toLowerCase()) &&
                    (searchFilters.status === "all" ||
                      String(campaign.status || '').toLowerCase() === String(searchFilters.status || '').toLowerCase())
                  );
                });

                if (loading) {
                  return [1, 2, 3, 4, 5].map((i) => (
                    <tr key={`skel-${i}`} className="border-b border-gray-200 animate-pulse">
                      <td className="p-3"><Skeleton className="h-4 w-4 bg-slate-200" /></td>
                      {columns.filter((col) => visibleColumns[col]).map((_, idx) => (
                        <td key={idx} className="p-3"><Skeleton className="h-4 w-full bg-slate-200" /></td>
                      ))}
                    </tr>
                  ));
                }

                return filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCampaigns([
                                ...selectedCampaigns,
                                campaign.id,
                              ]);
                              setShowBulkActions(true);
                            } else {
                              const newSelected = selectedCampaigns.filter(
                                (id) => id !== campaign.id,
                              );
                              setSelectedCampaigns(newSelected);
                              if (newSelected.length === 0) {
                                setShowBulkActions(false);
                              }
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      {visibleColumns.ID && (
                        <td className="p-3 text-sm">{campaign.id}</td>
                      )}
                      {visibleColumns["Unique ID"] && (
                        <td className="p-3 font-mono text-sm text-blue-600">
                          {campaign.uniqueId}
                        </td>
                      )}
                      {visibleColumns["Campaign name"] && (
                        <td className="p-3 text-sm">
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {campaign.name}
                          </span>
                        </td>
                      )}
                      {visibleColumns.Type && (
                        <td className="p-3 text-sm">{campaign.type}</td>
                      )}
                      {visibleColumns.List && (
                        <td className="p-3 text-sm">
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {resolveCampaignListName(campaign)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.Segment && (
                        <td className="p-3 text-sm">{campaign.segment}</td>
                      )}
                      {visibleColumns.Recurring && (
                        <td className="p-3 text-sm">
                          {campaign.recurring || "No"}
                        </td>
                      )}
                      {visibleColumns["Send at"] && (
                        <td className="p-3 text-sm">
                          {formatDateTime(
                            String(
                              campaign.sendAt ||
                                campaign.startedAt ||
                                campaign.dateAdded ||
                                campaign.lastUpdated ||
                                "",
                            ),
                          )}
                        </td>
                      )}
                      {visibleColumns.Status && (
                        <td className="p-3 text-sm">{campaign.status}</td>
                      )}
                      {visibleColumns.Delivered && (
                        <td className="p-3 text-sm">{campaign.delivered}</td>
                      )}
                      {visibleColumns.Opens && (
                        <td className="p-3 text-sm">{campaign.opens}</td>
                      )}
                      {visibleColumns.Clicks && (
                        <td className="p-3 text-sm">{campaign.clicks}</td>
                      )}
                      {visibleColumns.Bounces && (
                        <td className="p-3 text-sm">{campaign.bounces}</td>
                      )}
                      {visibleColumns.Unsubs && (
                        <td className="p-3 text-sm">{campaign.unsubs}</td>
                      )}
                      {visibleColumns.Options && (
                        <td className="p-3">
                          <div className="relative">
                            <button
                              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                document
                                  .querySelectorAll('[id^="action-row-"]')
                                  .forEach((row) => {
                                    if (
                                      row.id !== `action-row-${campaign.id}`
                                    ) {
                                      row.classList.add("hidden");
                                    }
                                  });
                                const actionRow = document.getElementById(
                                  `action-row-${campaign.id}`,
                                );
                                if (actionRow) {
                                  actionRow.classList.toggle("hidden");
                                }
                              }}
                            >
                              <span className="text-sm">⚙️</span>
                            </button>
                            <div
                              id={`action-row-${campaign.id}`}
                              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 z-50 hidden"
                            >
                              <div className="flex items-center space-x-1">
                                {/* ✅ Edit button — disabled for non-Draft statuses */}
                                {isCampaignEditable(campaign) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document
                                        .getElementById(
                                          `action-row-${campaign.id}`,
                                        )
                                        ?.classList.add("hidden");
                                      router.push(
                                        `/campaigns/create?edit=${campaign.id}`,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <span className="text-white text-xs">
                                      ✏️
                                    </span>
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyCampaign(campaign);
                                    document
                                      .getElementById(
                                        `action-row-${campaign.id}`,
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                  title="Copy"
                                >
                                  <span className="text-white text-xs">📋</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCampaignInfo(campaign);
                                    setShowCampaignInfoModal(true);
                                    document
                                      .getElementById(
                                        `action-row-${campaign.id}`,
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded flex items-center justify-center transition-colors"
                                  title="View Info"
                                >
                                  <span className="text-white text-xs">👁️</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const campaignToDelete =
                                      campaign.campaign_uid ||
                                      campaign.uniqueId ||
                                      campaign.id;
                                    deleteCampaign(String(campaignToDelete));
                                    document
                                      .getElementById(
                                        `action-row-${campaign.id}`,
                                      )
                                      ?.classList.add("hidden");
                                  }}
                                  className="w-8 h-8 bg-red-400 hover:bg-red-500 rounded flex items-center justify-center transition-colors"
                                  title="Delete"
                                >
                                  <span className="text-white text-xs">🗑️</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        columns.filter((col) => visibleColumns[col]).length + 1
                      }
                      className="text-center py-8 text-gray-500"
                    >
                      No campaigns found
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page 1 of 1</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title="Confirmation"
          description={confirmAction.message}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}
