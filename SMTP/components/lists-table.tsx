"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Archive,
  RefreshCw,
  List,
  SlidersHorizontal,
  Users,
  Download,
  ChevronLeft,
  Info,
  X,
  Import,
  Settings,
  Edit2,
  Copy,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ListsTableSkeleton from "./lists-table-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

import axios from "axios";
import { apiUrl, axiosInstance, token } from "./common/http";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive" | "success";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  [key: string]: any;
}

interface InputWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}

interface TextareaWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
  error?: string;
  [key: string]: any;
}

interface SelectWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: string;
  [key: string]: any;
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  [key: string]: any;
}

interface ToastProps {
  message: string;
  onClose: () => void;
}

interface AvailableTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  token: string;
  tokenType: string;
  ttl: number;
  generatedAt: number;
  loginTime: string;
}

// Custom Button component
const formatDateTime = (dateStr: any) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString("en-US", { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch (e) {
    return String(dateStr);
  }
};

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };
  const sizeClasses = {
    default: "h-8 px-3 py-1 text-sm",
    sm: "h-7 px-2 text-xs",
    lg: "h-10 px-4 text-base",
    icon: "h-8 w-8",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input component with tooltip
const InputWithTooltip = ({
  label,
  tooltip,
  required = false,
  className = "",
  error,
  ...props
}: InputWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium dark:text-gray-300 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Info
            className="h-4 w-4  text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50">
              <div className="relative">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <input
        className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Custom Textarea with tooltip
const TextareaWithTooltip = ({
  label,
  tooltip,
  required,
  className = "",
  error,
  ...props
}: TextareaWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium dark:text-gray-300 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Info
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50">
              <div className="relative">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <textarea
        className={`flex min-h-20 w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Custom Select with tooltip
const SelectWithTooltip = ({
  label,
  tooltip,
  required,
  children,
  className = "",
  error = "",
  ...props
}: SelectWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium dark:text-gray-300 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Info
            className="h-4 w-4 text-gray-400 cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50">
              <div className="relative">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <select
        className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Custom Input component (simple)
const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Custom Textarea component (simple)
const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Custom Checkbox component
const Checkbox = ({
  id,
  checked,
  onCheckedChange,
  label = "",
  ...props
}: CheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 border-b border-gray-100 py-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm dark:text-slate-100 text-gray-700"
        >
          {label}
        </label>
      )}
    </div>
  );
};

// Success Toast Component
const SuccessToast = ({ message, onClose }: ToastProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
        ×
      </button>
    </div>
  );
};

// Error Toast Component
const ErrorToast = ({ message, onClose }: ToastProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
        ×
      </button>
    </div>
  );
};

interface EmailList {
  id: string;
  uniqueId: string;
  name: string;
  displayName: string;
  subscribersCount: number;
  optIn: string;
  optOut: string;
  dateAdded: string;
  lastUpdated: string;
  archived?: boolean;
  description?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  subject?: string;
  companyName?: string;
  companyIndustry?: string;
  companyCountry?: string;
  companyZone?: string;
  companyAddress1?: string;
  companyAddress2?: string;
  companyCity?: string;
  companyZip?: string;
  companyPhone?: string;
  companyWebsite?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface CreateListFormData {
  name: string;
  displayName: string;
  description: string;
  optIn: string;
  optOut: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  companyName: string;
  companyIndustry: string;
  companyCountry: string;
  companyZone: string;
  companyAddress1: string;
  companyAddress2: string;
  companyCity: string;
  companyZip: string;
  companyPhone: string;
  companyWebsite: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EmailListManager() {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [filteredLists, setFilteredLists] = useState<EmailList[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("List created successfully!");
  const [errorMessage, setErrorMessage] = useState("");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ NEW: real-time subscriber counts from API
  const [subscriberCounts, setSubscriberCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState<Record<string, boolean>>({});

  const [columns, setColumns] = useState<Column[]>([
    { id: "uniqueId", label: "Unique ID", visible: true },
    { id: "name", label: "Name", visible: true },
    { id: "displayName", label: "Display name", visible: true },
    { id: "subscribersCount", label: "Subscribers count", visible: true },
    { id: "optIn", label: "Opt in", visible: true },
    { id: "optOut", label: "Opt out", visible: true },
    { id: "dateAdded", label: "Date added", visible: true },
    { id: "lastUpdated", label: "Last updated", visible: true },
    { id: "action", label: "Action", visible: true },
  ]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<CreateListFormData>({
    name: "",
    displayName: "",
    description: "",
    optIn: "double",
    optOut: "single",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    subject: "",
    companyName: "",
    companyIndustry: "",
    companyCountry: "",
    companyZone: "",
    companyAddress1: "",
    companyAddress2: "",
    companyCity: "",
    companyZip: "",
    companyPhone: "",
    companyWebsite: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [showAvailableTags, setShowAvailableTags] = useState(false);
  const [subscriberActionTab, setSubscriberActionTab] = useState("subscribe");
  const [selectedLists, setSelectedLists] = useState<{
    selectAllSubscribe: boolean;
    selectAllUnsubscribe: boolean;
    subscribe: Record<string, boolean>;
    unsubscribe: Record<string, boolean>;
  }>({
    selectAllSubscribe: false,
    selectAllUnsubscribe: false,
    subscribe: {},
    unsubscribe: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifySubscribe, setNotifySubscribe] = useState<"yes" | "no">("yes");
  const [notifyUnsubscribe, setNotifyUnsubscribe] = useState<"yes" | "no">("no");
  const [subscribeToEmail, setSubscribeToEmail] = useState("");
  const [unsubscribeToEmail, setUnsubscribeToEmail] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    uniqueId: "",
    name: "",
    displayName: "",
    subscribersCount: "",
    optIn: "",
    optOut: "",
    dateAdded: "",
    lastUpdated: "",
  });

  // ✅ NEW: fetch real subscriber count for a single list from your API
  const fetchSubscriberCountForList = useCallback(
    async (listUid: string, sessionToken: string): Promise<number> => {
      try {
        const url = new URL(
          "/api/get-all-subscribers",
          window.location.origin
        );
        url.searchParams.append("list_uid", listUid);
        url.searchParams.append("page_number", "1");
        url.searchParams.append("per_page", "100");

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await res.json();

        // Try all common response shapes your API might return
        const count =
          data?.data?.data?.total_count ??
          data?.data?.total_count ??
          data?.data?.total ??
          data?.data?.data?.records?.length ??
          data?.data?.records?.length ??
          0;

        return count;
      } catch (error) {
        console.error(`Error fetching count for list ${listUid}:`, error);
        return 0;
      }
    },
    []
  );

  // ✅ NEW: fetch counts for ALL lists and update state
  const fetchAllSubscriberCounts = useCallback(
    async (listsToCount: EmailList[], sessionToken: string) => {
      // Mark all as loading
      const loadingState: Record<string, boolean> = {};
      listsToCount.forEach((l) => { loadingState[l.uniqueId] = true; });
      setCountsLoading(loadingState);

      // Fetch all in parallel
      const results = await Promise.all(
        listsToCount.map(async (list) => {
          const count = await fetchSubscriberCountForList(list.uniqueId, sessionToken);
          return { uid: list.uniqueId, count };
        })
      );

      // Update counts and clear loading
      const newCounts: Record<string, number> = {};
      const doneLoading: Record<string, boolean> = {};
      results.forEach(({ uid, count }) => {
        newCounts[uid] = count;
        doneLoading[uid] = false;
      });

      setSubscriberCounts(newCounts);
      setCountsLoading(doneLoading);
    },
    [fetchSubscriberCountForList]
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedSession = localStorage.getItem("userSession");
        if (storedSession) {
          const session: UserSession = JSON.parse(storedSession);
          setUserSession(session);
          await fetchListsFromAPI(session);
        } else {
          window.location.href = "/authentication";
        }
      } catch (error) {
        console.error("💥 Client: Error loading user session:", error);
        window.location.href = "/authentication";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const checkAuthOnLoad = () => {
      const storedSession = localStorage.getItem("userSession");
      if (!storedSession) {
        window.location.href = window.location.origin + "/authentication";
        return;
      }
      try {
        const session = JSON.parse(storedSession);
        const sessionAge = Date.now() - new Date(session.loginTime).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (sessionAge > twentyFourHours) {
          localStorage.removeItem("userSession");
          localStorage.removeItem("cachedLists");
          window.location.href = window.location.origin + "/authentication";
        }
      } catch (error) {
        localStorage.removeItem("userSession");
        localStorage.removeItem("cachedLists");
        window.location.href = window.location.origin + "/authentication";
      }
    };
    checkAuthOnLoad();
  }, []);

  // ✅ NEW: fetch subscriber counts once when lists are loaded (no continuous polling)
  useEffect(() => {
    if (!userSession || lists.length === 0) return;

    // Fetch counts only once when lists are loaded
    fetchAllSubscriberCounts(lists, userSession.token);
  }, [lists, userSession, fetchAllSubscriberCounts]);

  const fetchListsFromAPI = async (session: UserSession) => {
    try {
      const url = new URL("/api/get-all-lists", window.location.origin);
      url.searchParams.append("pageNumber", "1");
      url.searchParams.append("perPage", "10");
      url.searchParams.append("token", session.token);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const records = data?.data?.records || data?.data?.data?.records || [];
      console.log(`lists: ${JSON.stringify(records)}`);

      if (response.ok && records) {
        const processedLists = records.map((item: any) => {
          const uid =
            item?.general?.list_uid ||
            item?.general?.unique_id ||
            String(item?.general?.id || Date.now());
          const savedOpt = localStorage.getItem(`optValues_${uid}`);
          const optValues = savedOpt ? JSON.parse(savedOpt) : null;

          return {
            id: uid,
            uniqueId: uid,
            name: item.general?.name || "",
            displayName: item.general?.display_name || "",
            description: item.general?.description || "",
            fromEmail: item.general?.from_email || "",
            fromName: item.general?.from_name || "",
            replyTo: item.general?.reply_to || "",
            subject: item.general?.subject || "",
            companyName: item.company?.name || "",
            companyCountry: item.company?.country || "",
            companyZone: item.company?.zone || "",
            companyAddress1: item.company?.address_1 || "",
            companyAddress2: item.company?.address_2 || "",
            companyCity: item.company?.city || "",
            companyZip: item.company?.zip_code || "",
            companyPhone: item.company?.phone || "",
            companyWebsite: item.company?.website || "",
            companyIndustry: item.company?.industry || "",
            subscribersCount: 0, // will be overridden by real API counts
            optIn: item.general?.opt_in || "single",
            optOut: item.general?.opt_out || "single",
            dateAdded: formatDateTime(
              item.local_created_at ||
              item.date_added ||
              item.general?.date_added
            ),
            lastUpdated: formatDateTime(
              item.general?.last_updated ||
              item.last_updated ||
              item.local_created_at ||
              item.date_added ||
              item.general?.date_added
            ),
          };
        });

        setLists(processedLists);
        setFilteredLists(processedLists);
      } else {
        setLists([]);
        setFilteredLists([]);
        if (!response.ok) {
          setErrorMessage(`Failed to fetch lists: ${data?.message || "Unknown error"}`);
          setShowErrorToast(true);
        }
      }
    } catch (error: any) {
      console.error("💥 Error fetching lists:", error.message);
      setLists([]);
      setFilteredLists([]);
      setErrorMessage(`Failed to fetch lists: ${error.message}`);
      setShowErrorToast(true);
    }
  };

  const [countries, setCountries] = useState<any[]>([]);
  const fetchAllCountry = async () => {
    try {
      const storedSession = localStorage.getItem("userSession");
      if (!storedSession) return;
      const session: UserSession = JSON.parse(storedSession || "");
      const url = new URL("/api/get-all-countries", window.location.origin);
      url.searchParams.append("token", session.token);
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        const records = data?.data?.records || data?.data?.data?.data?.records || [];
        setCountries(records);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };
  useEffect(() => { fetchAllCountry(); }, []);

  const [countryZone, setCountryZone] = useState<any[]>([]);
  const fetchCountryZone = async () => {
    try {
      const storedSession = localStorage.getItem("userSession");
      if (!storedSession) return;
      const session: UserSession = JSON.parse(storedSession || "");
      const url = new URL(`/api/get-country-zone/${formData.companyCountry}`, window.location.origin);
      url.searchParams.append("token", session.token);
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "content-type": "application/json", accept: "application/json" },
      });
      const data = await res.json();
      setCountryZone(data?.data?.records || data?.data?.data?.data?.records || []);
    } catch (error) {}
  };
  useEffect(() => {
    if (formData.companyCountry) {
      fetchCountryZone();
    } else {
      setCountryZone([]);
    }
  }, [formData.companyCountry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target?.closest(".columns-dropdown")) {
        setShowColumnsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    const activeListsOnly = lists.filter((list) => !list.archived);
    const filtered = activeListsOnly.filter((list) => {
      return (
        (list.uniqueId?.toLowerCase() || "").includes(searchFilters.uniqueId?.toLowerCase() || "") &&
        (list.name?.toLowerCase() || "").includes(searchFilters.name?.toLowerCase() || "") &&
        (list.displayName?.toLowerCase() || "").includes(searchFilters.displayName?.toLowerCase() || "") &&
        (subscriberCounts[list.uniqueId] ?? 0).toString().includes(searchFilters.subscribersCount || "") &&
        (searchFilters.optIn === "" || list.optIn === searchFilters.optIn) &&
        (searchFilters.optOut === "" || list.optOut === searchFilters.optOut) &&
        (list.dateAdded?.toLowerCase() || "").includes(searchFilters.dateAdded?.toLowerCase() || "") &&
        (list.lastUpdated?.toLowerCase() || "").includes(searchFilters.lastUpdated?.toLowerCase() || "")
      );
    });
    setFilteredLists(filtered);
  }, [lists, searchFilters, subscriberCounts]);

  const tabs = ["general", "default", "notifications", "subscribers", "company"];
  const tabNames = {
    general: "General Data",
    default: "Defaults",
    notifications: "Notifications",
    subscribers: "Subscriber Actions",
    company: "Company Details",
  };

  const [archivedLists, setArchivedLists] = useState<EmailList[]>([]);
  const { toast } = useToast();

  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [listToArchive, setListToArchive] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const storedSession = localStorage.getItem("userSession");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        await fetchListsFromAPI(session);
        // Also refresh counts immediately after
        if (userSession) {
          await fetchAllSubscriberCounts(lists, userSession.token);
        }
      }
    } catch (error) {
      console.error("❌ Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotifySubscribeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "yes" | "no";
    setNotifySubscribe(v);
    if (v === "yes") setNotifyUnsubscribe("no");
    else setNotifyUnsubscribe((prev) => (prev === "no" ? "yes" : prev));
  };

  const handleNotifyUnsubscribeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "yes" | "no";
    setNotifyUnsubscribe(v);
    if (v === "yes") setNotifySubscribe("no");
    else setNotifySubscribe((prev) => (prev === "no" ? "yes" : prev));
  };

  const generateUniqueId = () => Math.random().toString(36).substr(2, 12);
  const csvEscape = (value: unknown) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const exportToCSV = () => {
    const headers = visibleColumns.map((col) => col.label).join(",");
    const rows = filteredLists.map((list) => {
      const rowData = visibleColumns
        .map((col) => {
          const value =
            col.id === "subscribersCount"
              ? subscriberCounts[list.uniqueId] ?? 0
              : list[col.id as keyof EmailList];
          return csvEscape(value);
        })
        .join(",");
      return rowData;
    });
    const csvContent = [headers, ...rows].join("\n");
    downloadCSV(csvContent, `email-lists-${new Date().toISOString().split("T")[0]}.csv`);
    setSuccessMessage("Lists exported to CSV successfully!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const exportListToCSV = (list: EmailList) => {
    const columns = [
      { label: "Unique ID", value: list.uniqueId },
      { label: "Name", value: list.name },
      { label: "Display name", value: list.displayName },
      { label: "Description", value: list.description },
      { label: "Subscribers count", value: subscriberCounts[list.uniqueId] ?? 0 },
      { label: "Opt in", value: list.optIn },
      { label: "Opt out", value: list.optOut },
      { label: "From name", value: list.fromName },
      { label: "From email", value: list.fromEmail },
      { label: "Reply to", value: list.replyTo },
      { label: "Subject", value: list.subject },
      { label: "Company name", value: list.companyName },
      { label: "Company industry", value: list.companyIndustry },
      { label: "Company country", value: list.companyCountry },
      { label: "Company zone", value: list.companyZone },
      { label: "Company address 1", value: list.companyAddress1 },
      { label: "Company address 2", value: list.companyAddress2 },
      { label: "Company city", value: list.companyCity },
      { label: "Company zip", value: list.companyZip },
      { label: "Company phone", value: list.companyPhone },
      { label: "Company website", value: list.companyWebsite },
      { label: "Date added", value: list.dateAdded },
      { label: "Last updated", value: list.lastUpdated },
    ];
    const csvContent = [
      columns.map((column) => csvEscape(column.label)).join(","),
      columns.map((column) => csvEscape(column.value)).join(","),
    ].join("\n");
    const safeName = (list.name || list.uniqueId || "list").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "list";
    downloadCSV(csvContent, `${safeName}-${new Date().toISOString().split("T")[0]}.csv`);
    setSuccessMessage(`${list.name || "List"} exported successfully!`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const clearAllFilters = () => {
    setSearchFilters({
      uniqueId: "", name: "", displayName: "", subscribersCount: "",
      optIn: "", optOut: "", dateAdded: "", lastUpdated: "",
    });
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.displayName.trim()) errors.displayName = "Display name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.fromName.trim()) errors.fromName = "From name is required";
    if (!formData.fromEmail.trim()) errors.fromEmail = "From email is required";
    if (!formData.replyTo.trim()) errors.replyTo = "Reply to is required";
    if (!formData.companyName.trim()) errors.companyName = "Company name is required";
    if (!formData.companyCountry.trim()) errors.companyCountry = "Country is required";
    if (!formData.companyAddress1.trim()) errors.companyAddress1 = "Address 1 is required";
    if (!formData.companyCity.trim()) errors.companyCity = "City is required";
    if (!formData.companyZip.trim()) errors.zipCode = "Zip code is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.fromEmail && !emailRegex.test(formData.fromEmail)) errors.fromEmail = "Please enter a valid email address";
    if (formData.replyTo && !emailRegex.test(formData.replyTo)) errors.replyTo = "Please enter a valid email address";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateList = async (action: "save" | "update" = "save") => {
    if (isSubmitting) return;
    if (!validateForm()) {
      setErrorMessage("Please fill in all required fields correctly");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    if (!userSession) {
      setErrorMessage("User session not found. Please login again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingListId) {
        const listToUpdate = lists.find((list) => list.id === editingListId);
        if (!listToUpdate) throw new Error("List not found for editing");
        const selectedZone = countryZone.find((z) => String(z.zone_id) === String(formData.companyZone));
        const selectedCountry = countries.find((c) => String(c.country_id) === String(formData.companyCountry));
        const zoneName = selectedZone?.name || selectedZone?.zone_name || "";
        const updatePayload = {
          list_uid: listToUpdate.uniqueId,
          list_name: formData.name,
          list_description: formData.description,
          notification_subscribe: notifySubscribe,
          notification_unsubscribe: notifyUnsubscribe,
          company_name: formData.companyName,
          company_country: selectedCountry?.name || selectedCountry?.country_name || "",
          company_country_id: Math.floor(Number(selectedCountry?.country_id || 1)),
          company_zone_id: Math.floor(Number(formData.companyZone || 1)),
          zone: zoneName,
          company_address1: formData.companyAddress1,
          company_address2: formData.companyAddress2 || "",
          company_zone_name: zoneName,
          company_city: formData.companyCity,
          company_zip_code: formData.companyZip,
          userToken: userSession.token,
        };
        const response = await fetch("/api/update-list", {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userSession?.token}`
          },
          body: JSON.stringify(updatePayload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || "Failed to update list");
        if (result.status === "success" || result.success) {
          const updatedLists = lists.map((list) => {
            if (list.id === editingListId) {
              return { ...list, ...formData, lastUpdated: new Date().toLocaleDateString() };
            }
            return list;
          });
          setLists(updatedLists);
          updateListsCache(updatedLists);
          setSuccessMessage("List updated successfully!");
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
          resetForm();
        } else {
          throw new Error(result.message || "Failed to update list");
        }
      } else {
        const selectedZone = countryZone.find((z) => String(z.zone_id) === String(formData.companyZone));
        const selectedCountry = countries.find((c) => String(c.country_id) === String(formData.companyCountry));
        if (!selectedCountry) throw new Error("Please select a valid country");
        const response = await fetch("/api/create-list", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userSession?.token}`
          },
          body: JSON.stringify({
            list_name: formData.name,
            list_display_name: formData.displayName,
            list_description: formData.description,
            company_name: formData.companyName,
            company_industry: formData.companyIndustry,
            company_country: selectedCountry.name || selectedCountry.country_name,
            company_country_id: Math.floor(Number(selectedCountry.country_id)),
            company_zone_name: selectedZone?.name || selectedZone?.zone_name || "",
            company_zone_id: Math.floor(Number(selectedZone?.zone_id || 1)),
            company_address1: formData.companyAddress1,
            company_address2: formData.companyAddress2 || "",
            company_city: formData.companyCity,
            company_zip_code: formData.companyZip,
            company_phone: formData.companyPhone,
            company_website: formData.companyWebsite,
            list_opt_in: formData.optIn,
            list_opt_out: formData.optOut,
            notification_subscribe: notifySubscribe,
            notification_unsubscribe: notifyUnsubscribe,
            from_name: formData.fromName,
            reply_to: formData.replyTo,
            from_email: formData.fromEmail,
            subject: formData.subject,
          }),
        });
        const result = await response.json();
        if (result.status === "success" || result.success) {
          const uid = result.data?.record?.uid || result.data?.data || result.data?.unique_id || generateUniqueId();
          const newList: EmailList = {
            id: uid,
            uniqueId: uid,
            ...formData,
            subscribersCount: 0,
            dateAdded: new Date().toLocaleDateString(),
            lastUpdated: new Date().toLocaleDateString(),
          };
          localStorage.setItem(`optValues_${uid}`, JSON.stringify({ optIn: formData.optIn, optOut: formData.optOut }));
          const updatedLists = [newList, ...lists];
          setLists(updatedLists);
          updateListsCache(updatedLists);
          setSuccessMessage("List created successfully!");
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
          resetForm();
        } else {
          setErrorMessage(result.message);
          setShowErrorToast(true);
          setTimeout(() => setShowErrorToast(false), 3000);
        }
      }
    } catch (error) {
      console.error("💥 Error in handleCreateList:", error);
      setErrorMessage(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Error processing request"
          : String(error) || "Error processing request"
      );
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setFormData({
      name: "", displayName: "", description: "", optIn: "double", optOut: "single",
      fromName: "", fromEmail: "", replyTo: "", subject: "", companyName: "",
      companyIndustry: "", companyCountry: "", companyZone: "", companyAddress1: "",
      companyAddress2: "", companyCity: "", companyZip: "", companyPhone: "", companyWebsite: "",
    });
    setFormErrors({});
    setActiveTab("general");
    setEditingListId(null);
    setNotifySubscribe("yes");
    setNotifyUnsubscribe("no");
    setSubscribeToEmail("");
    setUnsubscribeToEmail("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const validateCurrentTab = (): boolean => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (activeTab === "general") {
      if (!formData.name.trim()) errors.name = "Name is required";
      if (!formData.displayName.trim()) errors.displayName = "Display name is required";
      if (!formData.description.trim()) errors.description = "Description is required";
      if (!formData.optIn) errors.optIn = "Opt-in is required";
      if (!formData.optOut) errors.optOut = "Opt-out is required";
    }
    if (activeTab === "default") {
      if (!formData.fromName.trim()) errors.fromName = "From name is required";
      if (!formData.fromEmail.trim()) errors.fromEmail = "From email is required";
      else if (!emailRegex.test(formData.fromEmail)) errors.fromEmail = "Enter a valid email";
      if (!formData.replyTo.trim()) errors.replyTo = "Reply-to is required";
      else if (!emailRegex.test(formData.replyTo)) errors.replyTo = "Enter a valid email";
    }
    if (activeTab === "company") {
      if (!formData.companyName.trim()) errors.companyName = "Company name is required";
      if (!formData.companyCountry) errors.companyCountry = "Country is required";
      if (!formData.companyZone) errors.companyZone = "Zone is required";
      if (!formData.companyAddress1.trim()) errors.companyAddress1 = "Address 1 is required";
      if (!formData.companyCity.trim()) errors.companyCity = "City is required";
      if (!formData.companyZip.trim()) errors.zipCode = "Zip code is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextTab = () => {
    if (!validateCurrentTab()) {
      setErrorMessage("Please fill the required fields in this tab");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };

  const handleEditList = (list: EmailList) => {
    setFormData({
      name: list.name || "", displayName: list.displayName || "",
      description: list.description || "", optIn: list.optIn || "double",
      optOut: list.optOut || "single", fromName: list.fromName || "",
      fromEmail: list.fromEmail || "", replyTo: list.replyTo || "",
      subject: list.subject || "", companyName: list.companyName || "",
      companyIndustry: list.companyIndustry || "", companyCountry: list.companyCountry || "",
      companyZone: list.companyZone || "", companyAddress1: list.companyAddress1 || "",
      companyAddress2: list.companyAddress2 || "", companyCity: list.companyCity || "",
      companyZip: list.companyZip || "", companyPhone: list.companyPhone || "",
      companyWebsite: list.companyWebsite || "",
    });
    setFormErrors({});
    setEditingListId(list.id);
    setShowCreateForm(true);
  };

  const updateListsCache = (updatedLists: EmailList[]) => {
    localStorage.setItem("cachedLists", JSON.stringify({ lists: updatedLists, timestamp: Date.now() }));
    const archived = updatedLists.filter((list) => list.archived);
    localStorage.setItem("archivedLists", JSON.stringify({ lists: archived, timestamp: Date.now() }));
  };

  const handleDeleteList = async (list: EmailList) => {
    if (!userSession) { setErrorMessage("User session not found"); setShowErrorToast(true); setTimeout(() => setShowErrorToast(false), 3000); return; }
    try {
      if (!list.uniqueId) { setErrorMessage("List UID is missing. Cannot delete list."); setShowErrorToast(true); setTimeout(() => setShowErrorToast(false), 3000); return; }
      const response = await fetch("/api/delete-list", {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userSession?.token}`
        },
        body: JSON.stringify({ list_uid: list.uniqueId }),
      });
      const result = await response.json();
      if (result.status === "success" || result.success) {
        const updatedLists = lists.filter((l) => l.uniqueId !== list.uniqueId);
        setLists(updatedLists);
        updateListsCache(updatedLists);
        // Remove from counts state too
        setSubscriberCounts((prev) => { const next = { ...prev }; delete next[list.uniqueId]; return next; });
        setSuccessMessage("List deleted successfully!");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setErrorMessage(result.message || "Failed to delete list");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (error) {
      const errorMsg = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : String(error);
      setErrorMessage("Error deleting list: " + errorMsg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const handleCopyList = async (list: EmailList) => {
    const url = new URL("/api/copy-list", window.location.origin);
    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { 
          accept: "application/json", 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userSession?.token || token()}`
        },
        body: JSON.stringify({ list_uid: list.uniqueId }),
      });
      const data = await res.json();
      if (!userSession) return;
      await fetchListsFromAPI(userSession);
    } catch (error) { console.log(error); }
  };

  const handleArchiveList = (id: string) => {
    setListToArchive(id);
    setArchiveConfirmOpen(true);
  };

  const confirmArchiveList = async () => {
    if (!listToArchive) return;
    setArchiveConfirmOpen(false);

    try {
      const res = await fetch(`/api/archive-list?list_uid=${listToArchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data?.message || "Failed to archive list", variant: "destructive" });
        return;
      }

      toast({ title: "Success", description: "List archived successfully!" });
      if (userSession) {
        await fetchListsFromAPI(userSession);
      }
    } catch (error) {
      console.error("Archive list error:", error);
      toast({ title: "Error", description: "Error archiving list. Please try again.", variant: "destructive" });
    }
  };

  const router = useRouter();
  // ✅ FIXED - uid passed in URL:
// ✅ REPLACE WITH:
const handelImport = (list: EmailList) => { 
  router.push(`/lists/import?list_uid=${list.uniqueId}`); 
};

  const toggleColumn = (id: string) => {
    setColumns(columns.map((col) => col.id === id ? { ...col, visible: !col.visible } : col));
  };

  const saveColumnChanges = () => { setShowColumnsDropdown(false); };

  const handleSelectAllChange = (tab: "subscribe" | "unsubscribe", checked: boolean) => {
    const all: Record<string, boolean> = {};
    lists.forEach((l) => { all[l.id] = checked; });
    setSelectedLists((prev) =>
      tab === "subscribe"
        ? { ...prev, selectAllSubscribe: checked, subscribe: all }
        : { ...prev, selectAllUnsubscribe: checked, unsubscribe: all }
    );
  };

  const handleListSelection = (tab: "subscribe" | "unsubscribe", listId: string, checked: boolean) => {
    setSelectedLists((prev) =>
      tab === "subscribe"
        ? { ...prev, subscribe: { ...prev.subscribe, [listId]: checked } }
        : { ...prev, unsubscribe: { ...prev.unsubscribe, [listId]: checked } }
    );
  };

  const visibleColumns = columns.filter((col) => col.visible);

  const AvailableTagsModal = ({ isOpen, onClose }: AvailableTagsModalProps) => {
    if (!isOpen) return null;
    const tags = [
      { tag: "[COMPANY_NAME]", required: "YES" }, { tag: "[COMPANY_WEBSITE]", required: "NO" },
      { tag: "[COMPANY_ADDRESS_1]", required: "YES" }, { tag: "[COMPANY_ADDRESS_2]", required: "NO" },
      { tag: "[COMPANY_CITY]", required: "YES" }, { tag: "[COMPANY_ZONE]", required: "NO" },
      { tag: "[COMPANY_ZONE_CODE]", required: "NO" }, { tag: "[COMPANY_ZIP]", required: "NO" },
      { tag: "[COMPANY_COUNTRY]", required: "YES" }, { tag: "[COMPANY_COUNTRY_CODE]", required: "NO" },
    ];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-96 max-h-96">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Available tags</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">Tag</span>
              <span className="font-medium text-gray-700">Required</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {tags.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-800 font-mono">{item.tag}</span>
                  <span className={`font-medium ${item.required === "YES" ? "text-green-600" : "text-gray-500"}`}>{item.required}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <ListsTableSkeleton />;

  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access the email list manager.</p>
          <button onClick={() => (window.location.href = "/authentication")} className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    const isLastTab = activeTab === "company";
    const isFirstTab = activeTab === tabs[0];
    return (
      <div className="min-h-screen bg-gray-50 p-3 dark:bg-black sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 dark:text-lime-500 text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="h-4 w-4" />
              {editingListId ? "Back to list" : "Back to lists"}
            </button>
            <h2 className="text-lg font-medium">{editingListId ? "Edit List" : "Create New List"}</h2>
          </div>
          <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:bg-slate-950">
            <div className="p-4 sm:p-6">
              <div className="mb-6 border-b">
                <nav className="flex gap-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button key={tab} onClick={(e) => e.preventDefault()}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? "border-blue-500 dark:text-lime-500 text-blue-600" : "border-transparent dark:text-slate-100 text-gray-500 hover:text-gray-700"}`}>
                      {tabNames[tab as keyof typeof tabNames]}
                    </button>
                  ))}
                </nav>
              </div>

              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-base font-medium dark:text-gray-300 text-gray-900">General Data</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputWithTooltip label="Name" tooltip="Your mail list verbose name." required value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, name: e.target.value }); if (formErrors.name && e.target.value.trim() !== "") setFormErrors({ ...formErrors, name: "" }); }}
                        placeholder="Newsletter Subscribers" error={formErrors.name} />
                      <InputWithTooltip label="Display name" tooltip="The public name subscribers will see." required value={formData.displayName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, displayName: e.target.value }); if (formErrors.displayName && e.target.value.trim() !== "") setFormErrors({ ...formErrors, displayName: "" }); }}
                        placeholder="Weekly Newsletter" error={formErrors.displayName} />
                    </div>
                    <TextareaWithTooltip label="Description" tooltip="A brief description of this list." required value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setFormData({ ...formData, description: e.target.value }); if (formErrors.description && e.target.value.trim() !== "") setFormErrors({ ...formErrors, description: "" }); }}
                      placeholder="Weekly updates about our latest products." error={formErrors.description} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SelectWithTooltip label="Option in" tooltip="Double opt-in requires email confirmation." required value={formData.optIn}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, optIn: e.target.value })}>
                        <option value="double">Double option-in</option>
                        <option value="single">Single option-in</option>
                        <option value="none">None</option>
                      </SelectWithTooltip>
                      <SelectWithTooltip label="Opt out" tooltip="Single opt-out allows immediate unsubscription." required value={formData.optOut}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, optOut: e.target.value })}>
                        <option value="single">Single option-out</option>
                        <option value="double">Double option-out</option>
                      </SelectWithTooltip>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "default" && (
                <div className="space-y-6">
                  <h2 className="text-base font-medium dark:text-white text-gray-900">Defaults</h2>
                  <div className="space-y-4">
                    <InputWithTooltip label="From name" tooltip="The sender name in inboxes." required value={formData.fromName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, fromName: e.target.value }); if (formErrors.fromName && e.target.value.trim() !== "") setFormErrors({ ...formErrors, fromName: "" }); }}
                      placeholder="John Smith" error={formErrors.fromName} />
                    <InputWithTooltip label="From email" tooltip="The email address emails are sent from." required value={formData.fromEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, fromEmail: e.target.value }); if (formErrors.fromEmail && e.target.value.trim() !== "") setFormErrors({ ...formErrors, fromEmail: "" }); }}
                      placeholder="newsletter@yourcompany.com" error={formErrors.fromEmail} />
                    <InputWithTooltip label="Reply to" tooltip="Where replies will be sent." required value={formData.replyTo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, replyTo: e.target.value }); if (formErrors.replyTo && e.target.value.trim() !== "") setFormErrors({ ...formErrors, replyTo: "" }); }}
                      placeholder="support@yourcompany.com" error={formErrors.replyTo} />
                    <InputWithTooltip label="Subject" tooltip="Default subject line for emails." value={formData.subject}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Weekly Newsletter - [DATE]" />
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-base font-medium dark:text-white text-gray-900">Notifications</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <SelectWithTooltip label="Subscribe" tooltip="Get notified on subscription." value={notifySubscribe} onChange={handleNotifySubscribeChange}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </SelectWithTooltip>
                    <SelectWithTooltip label="Unsubscribe" tooltip="Get notified on unsubscription." value={notifyUnsubscribe} onChange={handleNotifyUnsubscribeChange}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </SelectWithTooltip>
                    <InputWithTooltip label="Subscribe to" tooltip="Email for subscription notifications."
                      placeholder={notifySubscribe === "no" ? "Disabled" : "admin@yourcompany.com"}
                      value={subscribeToEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubscribeToEmail(e.target.value)}
                      disabled={notifySubscribe === "no"} />
                    <InputWithTooltip label="Unsubscribe to" tooltip="Email for unsubscription notifications."
                      placeholder={notifyUnsubscribe === "no" ? "Disabled" : "admin@yourcompany.com"}
                      value={unsubscribeToEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnsubscribeToEmail(e.target.value)}
                      disabled={notifyUnsubscribe === "no"} />
                  </div>
                </div>
              )}

              {activeTab === "subscribers" && (
                <div className="space-y-6">
                  <h2 className="text-base font-medium dark:text-white text-gray-900">Subscriber actions</h2>
                  <div className="flex overflow-x-auto border-b" role="tablist">
                    <button type="button" role="tab" aria-selected={subscriberActionTab === "subscribe"}
                      className={`px-4 py-2 border-b-2 ${subscriberActionTab === "subscribe" ? "border-blue-500 font-medium text-blue-600" : "border-transparent dark:text-slate-200 text-gray-600 hover:text-blue-600"}`}
                      onClick={() => setSubscriberActionTab("subscribe")}>Actions when subscribe</button>
                    <button type="button" role="tab" aria-selected={subscriberActionTab === "unsubscribe"}
                      className={`px-4 py-2 border-b-2 ${subscriberActionTab === "unsubscribe" ? "border-blue-500 font-medium text-blue-600" : "border-transparent dark:text-slate-200 text-gray-600 hover:text-blue-600"}`}
                      onClick={() => setSubscriberActionTab("unsubscribe")}>Actions when unsubscribe</button>
                  </div>
                  {subscriberActionTab === "subscribe" ? (
                    <section className="rounded-md border p-4">
                      <h3 className="text-base font-medium dark:text-white text-gray-900 mb-3">Actions when subscribe</h3>
                      <div className="rounded-md bg-blue-50 p-4 text-blue-800 mb-3">
                        <p className="text-sm">When a subscriber subscribes to this list, if they exist in any of the lists below, unsubscribe them from those lists as well.</p>
                      </div>
                      <div className="space-y-2">
                        <Checkbox id="selectAllSubscribe" checked={selectedLists.selectAllSubscribe} onCheckedChange={(chk) => handleSelectAllChange("subscribe", chk)} label="Select all" />
                        {lists.map((list) => (
                          <Checkbox key={list.id} id={`subscribe-${list.id}`} checked={(selectedLists.subscribe[list.id] as boolean) || false}
                            onCheckedChange={(chk) => handleListSelection("subscribe", list.id, chk)} label={list.name} />
                        ))}
                      </div>
                    </section>
                  ) : (
                    <section className="rounded-md border p-4">
                      <h3 className="text-base font-medium dark:text-white text-gray-900 mb-3">Actions when unsubscribe</h3>
                      <div className="rounded-md bg-blue-50 p-4 text-blue-800 mb-3">
                        <p className="text-sm">When a subscriber will unsubscribe from this list, if they exists in any of the lists below, unsubscribe them from those lists as well. Please note that the unsubscribe from the lists below is silent, no email is sent to the subscriber.</p>
                      </div>
                      <div className="space-y-2">
                        <Checkbox id="selectAllUnsubscribe" checked={selectedLists.selectAllUnsubscribe} onCheckedChange={(chk) => handleSelectAllChange("unsubscribe", chk)} label="Select all" />
                        {lists.map((list) => (
                          <Checkbox key={list.id} id={`unsubscribe-${list.id}`} checked={(selectedLists.unsubscribe[list.id] as boolean) || false}
                            onCheckedChange={(chk) => handleListSelection("unsubscribe", list.id, chk)} label={list.name} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "company" && (
                <div className="space-y-6">
                  <h2 className="text-base font-medium dark:text-white text-gray-900">
                    Company details <span className="text-sm dark:text-cyan-500 text-gray-500">(defaults to account company)</span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputWithTooltip label="Name" tooltip="Your company name." required value={formData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, companyName: e.target.value }); if (formErrors.companyName && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyName: "" }); }}
                      placeholder="Your Company Name" error={formErrors.companyName} />
                    <SelectWithTooltip label="Type/Industry" tooltip="Select your business type." value={formData.companyIndustry}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, companyIndustry: e.target.value })}>
                      <option value="">Please select</option>
                      <option value="technology">Technology & Software</option>
                      <option value="finance">Finance & Banking</option>
                      <option value="healthcare">Healthcare & Medical</option>
                      <option value="retail">Retail & E-commerce</option>
                      <option value="education">Education & Training</option>
                      <option value="other">Other</option>
                    </SelectWithTooltip>
                    <SelectWithTooltip label="Country" tooltip="Your company's primary country." required value={formData.companyCountry}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFormData({ ...formData, companyCountry: e.target.value }); if (formErrors.companyCountry && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyCountry: "" }); }}
                      error={formErrors.companyCountry}>
                      <option value="">Please select</option>
                      {countries.map((c: any, idx: number) => (<option key={idx} value={c.country_id ?? ""}>{c.country_name || c.name || ""}</option>))}
                    </SelectWithTooltip>
                    <SelectWithTooltip label="Zone" tooltip="Geographic zone within your country." value={formData.companyZone} required
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFormData({ ...formData, companyZone: e.target.value }); if (formErrors.companyZone && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyZone: "" }); }}>
                      <option value="">Please select</option>
                      {countryZone.map((zone: any, idx: number) => (<option key={idx} value={zone.zone_id ?? ""}>{zone.zone_name || zone.name || ""}</option>))}
                    </SelectWithTooltip>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputWithTooltip label="Address 1" tooltip="Primary business address." required value={formData.companyAddress1}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, companyAddress1: e.target.value }); if (formErrors.companyAddress1 && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyAddress1: "" }); }}
                      placeholder="123 Business Street" error={formErrors.companyAddress1} />
                    <InputWithTooltip label="Address 2" tooltip="Additional address information." value={formData.companyAddress2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, companyAddress2: e.target.value })}
                      placeholder="Suite 100" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InputWithTooltip label="City" tooltip="City where your business is located." required value={formData.companyCity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, companyCity: e.target.value }); if (formErrors.companyCity && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyCity: "" }); }}
                      placeholder="New York" error={formErrors.companyCity} />
                    <InputWithTooltip label="Zip code" tooltip="Postal or ZIP code." required value={formData.companyZip}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, companyZip: e.target.value }); if (formErrors.companyZip && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyZip: "" }); }}
                      placeholder="10001" error={formErrors.zipCode} />
                    <InputWithTooltip label="Phone" tooltip="Business phone number." value={formData.companyPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, companyPhone: e.target.value }); if (formErrors.companyPhone && e.target.value.trim() !== "") setFormErrors({ ...formErrors, companyPhone: "" }); }}
                      placeholder="+1 (555) 123-4567" />
                  </div>
                  <InputWithTooltip label="Website" tooltip="Your company website URL." value={formData.companyWebsite}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://yourcompany.com" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Address format <span className="text-red-500">*</span></label>
                      <button onClick={() => setShowAvailableTags(true)} className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer">[Available tags]</button>
                    </div>
                    <Textarea className="min-h-[120px] border-gray-300 font-mono"
                      defaultValue={`[COMPANY_NAME][COMPANY_ADDRESS_1] [COMPANY_ADDRESS_2][COMPANY_CITY] [COMPANY_ZONE] [COMPANY_ZIP][COMPANY_COUNTRY][COMPANY_WEBSITE]`} />
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => resetForm()}>Cancel</Button>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {!isFirstTab && (<Button variant="outline" onClick={handlePrevTab}>Back</Button>)}
                  {!isLastTab && (<Button className="bg-blue-500 dark:bg-lime-500 dark:text-black text-white hover:bg-blue-600" onClick={handleNextTab}>Next</Button>)}
                  {isLastTab && (
                    <Button className="bg-green-500 dark:bg-orange-400 dark:text-black text-white hover:bg-green-600" onClick={() => handleCreateList()} disabled={isSubmitting}>
                      {isSubmitting ? (editingListId ? "Updating..." : "Saving...") : (editingListId ? "Update List" : "Create List")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <AvailableTagsModal isOpen={showAvailableTags} onClose={() => setShowAvailableTags(false)} />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 dark:bg-black sm:p-6">
        {showSuccessToast && <SuccessToast message={successMessage} onClose={() => setShowSuccessToast(false)} />}
        {showErrorToast && <ErrorToast message={errorMessage} onClose={() => setShowErrorToast(false)} />}
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <List className="h-6 w-6 dark:text-white text-gray-700" />
              <h1 className="text-2xl font-semibold dark:text-white text-gray-900">Lists</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button className="bg-blue-500 dark:bg-lime-300 dark:text-black text-white hover:bg-blue-600 px-3 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors text-sm" onClick={openCreateForm}>
                <PlusCircle className="h-4 w-4" />Create new
              </button>
              <Link href="/lists/archived" className="bg-blue-500 dark:bg-lime-300 dark:text-black text-white hover:bg-blue-600 px-3 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors text-sm">
                <Archive className="h-4 w-4" />Archived lists
              </Link>
              <button className={`bg-blue-500 dark:bg-lime-300 dark:text-black text-white hover:bg-blue-600 px-3 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition-colors text-sm ${isRefreshing ? "opacity-75" : ""}`} onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />Refresh
              </button>
            </div>
          </div>
          <div className="flex min-h-96 flex-col items-center justify-center rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-16">
            <div className="mb-6 rounded-lg dark:bg-purple-800 bg-gray-100 p-6">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-gray-400 dark:text-yellow-400">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-semibold dark:text-white text-gray-900">Create your first email list</h2>
            <p className="max-w-lg text-center dark:text-white text-gray-600 leading-relaxed">
              Start creating your first email list, add subscribers to it, edit its forms and pages and create custom fields.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main table view ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen dark:bg-gray-950 bg-gray-50 mobile-spacing">
      {showSuccessToast && <SuccessToast message={successMessage} onClose={() => setShowSuccessToast(false)} />}
      {showErrorToast && <ErrorToast message={errorMessage} onClose={() => setShowErrorToast(false)} />}

      <div className="container-responsive">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <List className="h-5 w-5 text-gray-700" />
            <h1 className="text-responsive-lg font-semibold dark:text-gray-50 text-gray-900">Lists</h1>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <div className="relative columns-dropdown">
              <button className="bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors"
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Toggle columns</span><span className="sm:hidden">Columns</span>
              </button>
              {showColumnsDropdown && (
                <div className="absolute top-full right-0 mt-1 w-48 sm:w-56 bg-white rounded-md shadow-lg border z-50">
                  <div className="p-3">
                    {columns.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2 py-1">
                        <Checkbox id={column.id} checked={column.visible} onCheckedChange={() => toggleColumn(column.id)} />
                        <label htmlFor={column.id} className="text-xs sm:text-sm font-medium text-gray-700">{column.label}</label>
                      </div>
                    ))}
                    <button className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded text-xs font-medium" onClick={saveColumnChanges}>Save changes</button>
                  </div>
                </div>
              )}
            </div>
            <button className="bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors" onClick={openCreateForm}>
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create new</span><span className="sm:hidden">Create</span>
            </button>
            <Link href="/lists/archived" className="bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Archived lists</span><span className="sm:hidden">Archived</span>
            </Link>
            <button className="bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors" onClick={exportToCSV}>
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span><span className="sm:hidden">Export</span>
            </button>
            <button className={`bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-1 font-medium transition-colors ${isRefreshing ? "opacity-75" : ""}`} onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span><span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Displaying 1-{filteredLists.length} of {lists.length} result{lists.length !== 1 ? "s" : ""}.
            {filteredLists.length !== lists.length && (<span className="ml-2 text-blue-600">({filteredLists.length} filtered)</span>)}
          </div>
          {Object.values(searchFilters).some((filter) => filter !== "") && (
            <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <X className="h-3 w-3" />Clear all filters
            </button>
          )}
        </div>

        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          {/* Search filters row */}
          <div className="border-b border-gray-200 dark:bg-gray-950 bg-gray-50 p-2">
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-[600px]">
                {visibleColumns.map((column) => (
                  <div key={column.id} className="flex-1 min-w-[120px]">
                    {column.id === "action" ? (
                      <div className="w-full h-8"></div>
                    ) : column.id === "optIn" || column.id === "optOut" ? (
                      <select className="w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchFilters[column.id as keyof typeof searchFilters]}
                        onChange={(e) => setSearchFilters({ ...searchFilters, [column.id]: e.target.value })}>
                        <option value="">All</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="none">None</option>
                      </select>
                    ) : (
                      <input type="text" className="w-full h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Search ${column.label.toLowerCase()}...`}
                        value={searchFilters[column.id as keyof typeof searchFilters]}
                        onChange={(e) => setSearchFilters({ ...searchFilters, [column.id]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:bg-gray-950 bg-gray-50">
                  {visibleColumns.map((column) => (
                    <th key={column.id} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium dark:text-gray-400 text-gray-700">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length} className="px-4 py-8 text-center dark:text-gray-400 text-gray-500">
                      {Object.values(searchFilters).some((filter) => filter !== "") ? "No lists match your search criteria" : "No lists found"}
                    </td>
                  </tr>
                ) : (
                  filteredLists.map((list) => (
                    <tr key={list.id} className="border-b dark:bg-gray-950 border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-50">
                      {visibleColumns.map((column) => (
                        <td key={column.id} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm dark:text-gray-300 text-gray-700">
                          {column.id === "uniqueId" || column.id === "name" || column.id === "displayName" ? (
                            <Link href={`/lists/${list.id}`} className="text-blue-600 hover:text-blue-800 no-underline cursor-pointer font-medium">
                              {list[column.id as keyof EmailList]}
                            </Link>

                          ) : column.id === "subscribersCount" ? (
                            // ✅ REAL-TIME SUBSCRIBER COUNT FROM API
                            <span className="font-medium">
                              {countsLoading[list.uniqueId] ? (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                  <span className="text-xs">...</span>
                                </span>
                              ) : (
                                subscriberCounts[list.uniqueId] ?? 0
                              )}
                            </span>

                          ) : column.id === "action" ? (
                            <div className="relative">
                              <button className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.querySelectorAll('[id^="action-row-"]').forEach((row) => { if (row.id !== `action-row-${list.id}`) row.classList.add("hidden"); });
                                  document.getElementById(`action-row-${list.id}`)?.classList.toggle("hidden");
                                }}>
                                <span className="text-sm">⚙️</span>
                              </button>
                              <div id={`action-row-${list.id}`} className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 z-50 hidden">
                                <div className="flex items-center space-x-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleEditList(list); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors" title="Edit">
                                    <span className="text-white text-xs">✏️</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleCopyList(list); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors" title="Copy">
                                    <span className="text-white text-xs">📋</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); exportListToCSV(list); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors" title="Export">
                                    <span className="text-white text-xs">📤</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleArchiveList(list.id); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors" title="Archive">
                                    <span className="text-white text-xs">📦</span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handelImport(list); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors" title="Import">
                                    <span className="text-white text-xs"><Import /></span>
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list); document.getElementById(`action-row-${list.id}`)?.classList.add("hidden"); }}
                                    className="w-8 h-8 bg-red-400 hover:bg-red-500 rounded flex items-center justify-center transition-colors" title="Delete">
                                    <span className="text-white text-xs">🗑️</span>
                                  </button>

                                </div>
                              </div>
                            </div>
                          ) : (
                            <span>{list[column.id as keyof EmailList]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AvailableTagsModal isOpen={showAvailableTags} onClose={() => setShowAvailableTags(false)} />
      
      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will archive the list. You can restore it later from the archived lists page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchiveList} className="bg-blue-500 hover:bg-blue-600">Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
