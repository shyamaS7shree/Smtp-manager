"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, SlidersHorizontal, X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LISTS_URL = "/api/get-all-lists";
const TEMPLATE_URL = "/api/create-template";
const CAMPAIGN_URL = "/api/create-a-campaign";
const UPDATE_CAMPAIGN_URL = "/api/update-a-campaign";

type ListRecord = {
  general: {
    list_uid: string;
    name: string;
    display_name?: string;
    description?: string;
  };
  defaults?: {
    from_email?: string;
    from_name?: string;
    reply_to?: string;
    subject?: string;
  };
};

type ListType = {
  id: string;
  name: string;
  defaults?: {
    from_email?: string;
    from_name?: string;
    reply_to?: string;
    subject?: string;
  };
};

// ✅ Template type for modal
type TemplateItem = {
  template_uid: string;
  name: string;
  screenshot: string | null;
  content?: string;
};

type FormTab = "Details" | "Setup" | "Template" | "Confirmation";

type FormData = {
  campaignName: string;
  type: "Regular" | "Autoresponder";
  list: string;
  segment: string;
  group: string;
  sendGroup: string;
  subject: string;
  templateName: string;
  onlyPlainText: "Yes" | "No";
  autoPlainText: "Yes" | "No";
  content: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  toName: string;
  altText: string;
  embedImages: "Yes" | "No";
  plainTextEmail: "Yes" | "No";
  trackingDomain: string;
  maxSubscribers: string;
  reprocessSubscribers: "Yes" | "No";
  emailStats: string;
  preheader: string;
  emailStatsDays: string;
  forwardFriendSubject: string;
  openTracking: "Yes" | "No";
  urlTracking: "Yes" | "No";
  deepTracking: "Yes" | "No";
  openTrackingExclude: "Yes" | "No";
  urlTrackingExclude: "Yes" | "No";
  plainTextContent: string;
};

const DEFAULT_FORM: FormData = {
  campaignName: "",
  type: "Regular",
  list: "Choose",
  segment: "Choose",
  group: "Choose",
  sendGroup: "",
  subject: "",
  templateName: "",
  onlyPlainText: "No",
  autoPlainText: "Yes",
  content: "",
  fromName: "",
  fromEmail: "",
  replyTo: "",
  toName: "",
  altText: "",
  embedImages: "No",
  plainTextEmail: "Yes",
  trackingDomain: "",
  maxSubscribers: "",
  reprocessSubscribers: "No",
  emailStats: "",
  preheader: "",
  emailStatsDays: "",
  forwardFriendSubject: "",
  openTracking: "Yes",
  urlTracking: "Yes",
  deepTracking: "Yes",
  openTrackingExclude: "No",
  urlTrackingExclude: "No",
  plainTextContent: "",
};

const formTabs: FormTab[] = ["Details", "Setup", "Template", "Confirmation"];

const availableTags = [
  { tag: "[CURRENT_DATE]", description: "Current date" },
  { tag: "[CURRENT_YEAR]", description: "Current year" },
  { tag: "[CURRENT_MONTH]", description: "Current month" },
  { tag: "[CURRENT_DAY]", description: "Current day" },
  { tag: "[CURRENT_MONTH_FULL_NAME]", description: "Full month name" },
  { tag: "[SIGN_LT]", description: "Less than sign" },
  { tag: "[SIGN_LTE]", description: "Less than or equal sign" },
  { tag: "[SIGN_GT]", description: "Greater than sign" },
  { tag: "[SIGN_GTE]", description: "Greater than or equal sign" },
  { tag: "[REMOTE_CONTENT]", description: "Remote content" },
  { tag: "[EMAIL]", description: "Subscriber email" },
  { tag: "[NAME]", description: "Subscriber name" },
  { tag: "[FIRST_NAME]", description: "Subscriber first name" },
  { tag: "[UNSUBSCRIBE_URL]", description: "[UNSUBSCRIBE_URL]" },
];

const emojiCategories: Record<string, string[]> = {
  "Smileys & People": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳"],
  "Animals & Nature": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇"],
  "Food & Drink": ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥒","🌶️","🌽","🥕","🧄","🧅","🥔","🍠","🥐","🍞"],
  Activities: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷"],
  Objects: ["⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️"],
};

function buildSimpleHtml() {
  return `<html><body><h2>Hello!</h2><p>This is a test campaign.</p><p><a href="[UNSUBSCRIBE_URL]">Click here to unsubscribe</a></p></body></html>`;
}

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function getShortName(fullName: string): string {
  const first = (fullName || "").trim().split(" ")[0] || "";
  if (first.length <= 6) return first;
  return first.slice(0, 5);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

function yn(v: any, fallback: "yes" | "no" = "no"): "yes" | "no" {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "yes" || s === "y" || s === "true" || s === "1") return "yes";
  if (s === "no" || s === "n" || s === "false" || s === "0") return "no";
  return fallback;
}

function formatSendAtUTC(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

const CAMPAIGN_TYPE_MAP: Record<FormData["type"], string> = {
  Regular: "regular",
  Autoresponder: "autoresponder",
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdRaw = searchParams?.get("edit") || null;

  const editId = useMemo(() => {
    const n = editIdRaw ? Number(editIdRaw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [editIdRaw]);

  const [activeFormTab, setActiveFormTab] = useState<FormTab>("Details");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAvailableTags, setShowAvailableTags] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTagField, setActiveTagField] = useState<string>("");
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalType, setInfoModalType] = useState<string>("");
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  const [showUploadTemplateModal, setShowUploadTemplateModal] = useState(false);
  const [showChangeTemplateModal, setShowChangeTemplateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [availableLists, setAvailableLists] = useState<ListType[]>([]);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [pageError, setPageError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", shortName: "", token: "", loginTime: "" });
  const [templateUid, setTemplateUid] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [campaignUid, setCampaignUid] = useState<string>("");
  const [debugBox, setDebugBox] = useState<any>(null);

  // ✅ Template modal states
  const [templateList, setTemplateList] = useState<TemplateItem[]>([]);
  const [templateListLoading, setTemplateListLoading] = useState(false);
  const [selectedTemplateUid, setSelectedTemplateUid] = useState<string>("");
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const initOnceRef = useRef(false);
  const listsLoadingRef = useRef(false);
  const listsLoadedRef = useRef(false);
  const submitInFlightRef = useRef(false);
  const isMountedRef = useRef(false);

  function handleCloseForm() {
    router.push("/campaigns");
  }

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => prev[field] ? { ...prev, [field]: "" } : prev);
  }

  function handleTabChange(tab: FormTab) {
    setValidationErrors({});
    setActiveFormTab(tab);
  }

  function handleBackButton() {
    const idx = formTabs.indexOf(activeFormTab);
    if (idx > 0) {
      setActiveFormTab(formTabs[idx - 1]);
      setValidationErrors({});
    } else {
      handleCloseForm();
    }
  }

  function openAvailableTags(field: keyof FormData) {
    setActiveTagField(field);
    if (field === "plainTextContent" || field === "content") {
      setInfoModalType("available_tags");
      setShowInfoModal(true);
      return;
    }
    setShowAvailableTags(true);
  }

  function openEmojiList(field: keyof FormData) {
    setActiveTagField(field);
    setShowEmojiPicker(true);
  }

  function insertTag(tag: string) {
    if (!activeTagField) return;
    setFormData((prev) => ({
      ...prev,
      [activeTagField]: ((prev[activeTagField as keyof FormData] || "") as string) + tag,
    }));
    setShowAvailableTags(false);
    setShowInfoModal(false);
  }

  function insertEmoji(emoji: string) {
    if (!activeTagField) return;
    setFormData((prev) => ({
      ...prev,
      [activeTagField]: ((prev[activeTagField as keyof FormData] || "") as string) + emoji,
    }));
    setShowEmojiPicker(false);
  }

  function exec(command: string, value?: string) {
    if (typeof document === "undefined") return;
    try { document.execCommand(command, false, value); } catch {}
  }

  function normalizeListItem(item: any): ListType | null {
    if (!item) return null;
    const id = item?.id || item?.list_uid || item?.uniqueId || item?.unique_id || item?.general?.list_uid || item?.general?.unique_id || item?.general?.id || "";
    if (!id) return null;
    const name = item?.name || item?.displayName || item?.general?.display_name || item?.general?.name || item?.general?.list_name || String(id);
    const defaults = item?.defaults || item?.general?.defaults || {};
    return { id: String(id), name: String(name), defaults };
  }

  function getListNameById(listUid: string) {
    const list = availableLists.find((l) => l.id === listUid);
    return list ? list.name : listUid;
  }

  function validateCurrentTab() {
    const errors: Record<string, string> = {};
    if (activeFormTab === "Details") {
      if (!formData.campaignName.trim()) errors.campaignName = "Campaign name is required";
      if (!formData.list || formData.list === "Choose") errors.list = "Please select a list";
    } else if (activeFormTab === "Setup") {
      if (!formData.fromName.trim()) errors.fromName = "From name is required";
      if (!formData.subject.trim()) errors.subject = "Subject is required";
      if (formData.emailStats.trim() && !isValidEmail(formData.emailStats.trim())) {
        errors.emailStats = "Please enter a valid email (or keep empty).";
      }
    } else if (activeFormTab === "Template") {
      if (!(formData.content || "").trim()) errors.content = "Content is required.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleListChange(listUid: string) {
    handleInputChange("list", listUid);
    const selected = availableLists.find((l) => l.id === listUid);
    if (selected?.defaults) {
      setFormData((prev) => ({
        ...prev,
        fromEmail: prev.fromEmail || selected.defaults?.from_email || prev.fromEmail,
        fromName: prev.fromName || selected.defaults?.from_name || prev.fromName,
        replyTo: prev.replyTo || selected.defaults?.reply_to || prev.replyTo,
        subject: prev.subject || selected.defaults?.subject || prev.subject,
      }));
    }
  }

  function forceLogout() {
    localStorage.removeItem("userSession");
    localStorage.removeItem("cachedLists");
    localStorage.removeItem("cachedCampaigns");
    if (typeof window !== "undefined") window.location.href = "/authentication";
  }

  // ✅ FIXED: loadLists — token না থাকলে session থেকে নেবে
  async function loadLists(token?: string) {
    if (listsLoadingRef.current) return;

    // ✅ token resolve করো
    const resolvedToken = token || (() => {
      try {
        const s = JSON.parse(localStorage.getItem("userSession") || "{}");
        return s?.token || s?.access_token || "";
      } catch { return ""; }
    })();

    if (!resolvedToken) return; // token ছাড়া call করো না

    listsLoadingRef.current = true;
    setPageError("");

    const cached = safeParse<{ lists?: any[] }>(localStorage.getItem("cachedLists"), {});
    if (cached?.lists?.length) {
      const normalized = cached.lists.map((item: any) => normalizeListItem(item)).filter((x): x is ListType => !!x);
      if (normalized.length && isMountedRef.current) setAvailableLists(normalized);
    }

    try {
      const all: ListType[] = [];
      const visited = new Set<number>();
      let page = 1;
      const PER_PAGE = 10;
      const MAX_PAGES = 5;

      for (let i = 0; i < MAX_PAGES; i++) {
        if (visited.has(page)) break;
        visited.add(page);

        const url = `${LISTS_URL}?pageNumber=${page}&perPage=${PER_PAGE}&token=${encodeURIComponent(resolvedToken)}`;
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const text = await res.text();
        let json: any = null;
        try { json = text ? JSON.parse(text) : null; } catch { json = { message: text }; }

        if (res.status === 401) { forceLogout(); throw new Error("Unauthorized"); }
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        const dataObj = json?.data?.data?.data || json?.data?.data || json?.data || json;
        const records: ListRecord[] = (dataObj?.records || dataObj?.data?.records || json?.records || json?.data?.records || []) as ListRecord[];

        if (!records?.length) break;

        const mapped = records.map((r) => normalizeListItem(r)).filter((x): x is ListType => !!x);
        for (const item of mapped) {
          if (!all.some((x) => x.id === item.id)) all.push(item);
        }

        const nextPage = Number(dataObj?.next_page ?? dataObj?.data?.next_page ?? json?.next_page ?? json?.data?.next_page ?? NaN) || NaN;
        const currentPage = Number(dataObj?.page_number ?? dataObj?.current_page ?? json?.page_number ?? json?.current_page ?? NaN) || NaN;
        const totalPages = Number(dataObj?.total_pages ?? dataObj?.last_page ?? json?.total_pages ?? json?.last_page ?? NaN) || NaN;

        if (Number.isFinite(totalPages) && Number.isFinite(currentPage) && currentPage >= totalPages) break;
        if (!Number.isFinite(nextPage) || nextPage <= page) break;
        page = nextPage;
      }

      if (!isMountedRef.current) return;
      setAvailableLists(all);
      localStorage.setItem("cachedLists", JSON.stringify({ lists: all }));
      listsLoadedRef.current = true;
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (isMountedRef.current) setPageError(e?.message || "Failed to load lists");
    } finally {
      listsLoadingRef.current = false;
    }
  }

  // ✅ Template list fetch function
  const fetchTemplateList = async () => {
    setTemplateListLoading(true);
    setTemplateList([]);
    try {
      const resolvedToken = userInfo.token || (() => {
        try {
          const s = JSON.parse(localStorage.getItem("userSession") || "{}");
          return s?.token || s?.access_token || "";
        } catch { return ""; }
      })();

      const res = await fetch("/api/get-all-templates?page_number=1&per_page=100", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${resolvedToken}`,
        },
      });
      const json = await res.json();
      const payload = json?.data ?? json;
      setTemplateList(Array.isArray(payload?.records) ? payload.records : []);
    } catch (e) {
      console.error("template list fetch failed", e);
    } finally {
      setTemplateListLoading(false);
    }
  };

  // ✅ Apply selected template — content editor এ load করো
const applySelectedTemplate = async () => {
  if (!selectedTemplateUid) return;
  setApplyingTemplate(true);
  try {
    const resolvedToken = userInfo.token || (() => {
      try {
        const s = JSON.parse(localStorage.getItem("userSession") || "{}");
        return s?.token || "";
      } catch { return ""; }
    })();

    // ✅ সরাসরি get-one-template call করো — get-all এর উপর নির্ভর করো না
    const res = await fetch(
      `/api/template/get-one-template?template_uid=${selectedTemplateUid}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${resolvedToken}`,
          Accept: "application/json",
        },
        cache: "no-store", // ✅ 304 cache bypass করো
      }
    );

    const json = await res.json();
    console.log("get-one-template response:", json); // debug

    // ✅ multiple response structure handle করো
    const payload = json?.data?.record ?? json?.data ?? json?.record ?? json;
    const tplContent = payload?.content ?? "";
    const tplName = payload?.name ?? templateList.find(t => t.template_uid === selectedTemplateUid)?.name ?? "";

    if (tplContent) {
      handleInputChange("content", tplContent);
      // ✅ editor DOM update করো
      if (editorRef.current) {
        editorRef.current.innerHTML = tplContent;
      }
    }

    if (tplName) {
      handleInputChange("templateName", tplName);
    }

    setShowChangeTemplateModal(false);
    setSelectedTemplateUid("");
  } catch (e) {
    console.error("apply template failed", e);
  } finally {
    setApplyingTemplate(false);
  }
};

  /** ========= INIT ========= */
  useEffect(() => {
    isMountedRef.current = true;

    if (initOnceRef.current) return;
    initOnceRef.current = true;

    // ✅ refs reset করো fresh load এর জন্য
    listsLoadedRef.current = false;
    listsLoadingRef.current = false;

    (async () => {
      try {
        const stored = localStorage.getItem("userSession");
        if (!stored) return forceLogout();

        const session = JSON.parse(stored);
        const sessionAge = Date.now() - new Date(session.loginTime).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (!session.loginTime || sessionAge > twentyFourHours) return forceLogout();

        const shortName = getShortName(session.name || "");
        const userEmail = session.email || "";
        const token = session.token || session.access_token || "";

        setUserInfo({ name: session.name || "", email: userEmail, shortName, token, loginTime: session.loginTime || "" });

        setFormData((prev) => ({
          ...prev,
          fromName: shortName,
          fromEmail: userEmail,
          replyTo: userEmail,
          toName: "[EMAIL]",
          altText: "Hello",
          emailStats: "",
          content: prev.content || buildSimpleHtml(),
        }));

        // ✅ token directly pass করো
        await loadLists(token);
      } catch {
        forceLogout();
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEditorFocused = useRef(false);

  useEffect(() => {
    if (isSourceMode) return;
    if (!editorRef.current) return;
    if (isEditorFocused.current) return;
    const html = formData.content || "";
    if (editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html;
  }, [formData.content, isSourceMode]);

  useEffect(() => {
    if (!editId) return;

    const loadEditCampaign = async () => {
      setLoadingEdit(true);
      try {
        if (userInfo?.token) await loadLists(userInfo.token);

        const cachedCampaigns = safeParse<any[]>(localStorage.getItem("cachedCampaigns"), []);
        let campaign = cachedCampaigns.find((x) => x?.id === editId || x?.campaign_uid === String(editId) || x?.uniqueId === String(editId));

        if (!campaign && userInfo?.token) {
          try {
            const allCampaignsRes = await fetch(
              `/api/campaigns/all-campaigns/fetchAllCampaigns?page_number=1&per_page=500&token=${encodeURIComponent(userInfo.token)}`,
              { method: "GET", headers: { Accept: "application/json" } }
            );
            const allCampaignsJson = await allCampaignsRes.json();
            const records = allCampaignsJson?.data?.data?.records || allCampaignsJson?.data?.records || allCampaignsJson?.data || allCampaignsJson?.records || [];
            campaign = Array.isArray(records) ? records.find((item: any) => item?.id === editId || String(item?.campaign_uid) === String(editId) || String(item?.unique_id) === String(editId)) : null;
          } catch {}
        }

        if (!campaign && userInfo?.token) {
          const q = editId ? `campaign_uid=${encodeURIComponent(String(editId))}` : "";
          const oneRes = await fetch(`/api/campaigns/get-one-campaign?${q}&token=${encodeURIComponent(userInfo.token)}`, { method: "GET", headers: { Accept: "application/json" } });
          if (oneRes.ok) {
            const oneJson = await oneRes.json();
            const remoteCampaign = oneJson?.data?.data || oneJson?.data || oneJson;
            if (remoteCampaign) campaign = remoteCampaign;
          }
        }

        if (campaign) {
          setCampaignUid(String(campaign?.campaign_uid || campaign?.unique_id || campaign?.id || ""));
          setCampaignId(String(campaign?.id || ""));
          setFormData((prev) => ({
            ...prev,
            campaignName: campaign?.campaignName ?? campaign?.name ?? campaign?.campaign_name ?? prev.campaignName,
            type: campaign?.type ?? campaign?.campaign_type ?? prev.type,
            list: campaign?.list ?? campaign?.list_uid ?? prev.list,
            segment: campaign?.segment ?? campaign?.segment_uid ?? prev.segment,
            group: campaign?.group ?? prev.group,
            sendGroup: campaign?.sendGroup ?? campaign?.send_group ?? prev.sendGroup,
            subject: campaign?.subject ?? prev.subject,
            templateName: campaign?.templateName ?? campaign?.template_uid ?? prev.templateName,
            content: campaign?.content ?? prev.content,
            fromName: campaign?.fromName ?? campaign?.from_name ?? prev.fromName,
            fromEmail: campaign?.fromEmail ?? campaign?.from_email ?? prev.fromEmail,
            replyTo: campaign?.replyTo ?? campaign?.reply_to ?? prev.replyTo,
            autoPlainText: campaign?.auto_plain_text ? (campaign.auto_plain_text === "yes" ? "Yes" : "No") : prev.autoPlainText,
            plainTextContent: campaign?.plain_text ?? prev.plainTextContent,
            emailStats: campaign?.email_stats ?? prev.emailStats,
          }));
        } else {
          setPageError("Unable to load campaign for editing.");
        }
      } catch (e: any) {
        setPageError(e?.message || "Failed to load campaign for edit");
      } finally {
        setLoadingEdit(false);
      }
    };

    loadEditCampaign();
  }, [editId, userInfo?.token]);

  async function handleSaveAndNext() {
    setPageError("");
    if (!validateCurrentTab()) return;
    const idx = formTabs.indexOf(activeFormTab);
    if (idx < formTabs.length - 1) setActiveFormTab(formTabs[idx + 1]);
    else handleCloseForm();
  }

  function buildTemplatePayload() {
    return {
      name: formData.templateName?.trim() || `Template_${Date.now()}`,
      content: formData.content || buildSimpleHtml(),
    };
  }

  function buildCampaignPayloadStrict(finalTemplateUid: string) {
    const list_uid = formData.list && formData.list !== "Choose" ? formData.list : "";
    if (!list_uid) throw new Error("list_uid is required. Please select a list.");
    const apiType = CAMPAIGN_TYPE_MAP[formData.type];
    if (!apiType) throw new Error("Type is not in the allowed list.");

    const payload: any = {
      name: (formData.campaignName || "").trim(),
      type: apiType,
      from_name: (formData.fromName || "").trim(),
      from_email: (formData.fromEmail || "").trim(),
      reply_to: (formData.replyTo || "").trim(),
      subject: (formData.subject || "").trim(),
      send_at: formatSendAtUTC(new Date()),
      list_uid,
      template_uid: finalTemplateUid,
      ...(campaignUid ? { campaign_uid: campaignUid } : {}),
      url_tracking: yn(formData.urlTracking, "yes"),
      content: formData.content || buildSimpleHtml(),
      plain_text: (formData.plainTextContent || "").trim() ? formData.plainTextContent.trim() : "",
      auto_plain_text: yn(formData.autoPlainText, "yes"),
      plain_text_email: yn(formData.plainTextEmail, "yes"),
      inline_css: yn(formData.embedImages, "no"),
      archive: "none",
      json_feed: "no",
      xml_feed: "no",
    };

    const statsEmail = (formData.emailStats || "").trim();
    if (statsEmail) {
      if (!isValidEmail(statsEmail)) throw new Error("Email stats must be a valid email.");
      payload.email_stats = statsEmail;
    }

    const segment_uid = formData.segment && formData.segment !== "Choose" ? formData.segment : "";
    if (segment_uid) payload.segment_uid = segment_uid;

    return payload;
  }

  function extractTemplateUid(templateRes: any): string {
    const candidates = [
      templateRes?.data?.record?.template_uid,
      templateRes?.data?.record?.uid,
      templateRes?.data?.data,
      templateRes?.template_uid,
      templateRes?.uid,
      templateRes?.data?.template_uid,
      templateRes?.data?.uid,
      templateRes?.data?.data?.template_uid,
      templateRes?.data?.data?.uid,
    ];
    const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
    return found ? found.trim() : "";
  }

  async function submitCampaign() {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    if (isMountedRef.current) setPageError("");
    setSaving(true);
    setDebugBox(null);
    const token = userInfo.token || "";

    try {
      if (!formData.list || formData.list === "Choose") { setPageError("Please select a list."); return; }
      if (!(formData.content || "").trim()) { setPageError("Content is required."); setActiveFormTab("Template"); return; }

      const templatePayload = buildTemplatePayload();
      const tRes = await fetch(TEMPLATE_URL, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...templatePayload, ...(token ? { token } : {}) }),
      });

      const tText = await tRes.text();
      let templateRes: any = null;
      try { templateRes = tText ? JSON.parse(tText) : null; } catch { templateRes = { message: tText }; }

      if (tRes.status === 401) { forceLogout(); throw new Error("Unauthorized"); }
      if (!tRes.ok) {
        if (tRes.status === 429) {
          const retryAfter = tRes.headers.get("Retry-After");
          throw new Error(
            retryAfter
              ? `Too many attempts. Please wait ${retryAfter} seconds and try again.`
              : "Too many attempts. Please wait a little and try again."
          );
        }
        throw new Error(templateRes?.details?.message || templateRes?.message || `HTTP ${tRes.status}`);
      }

      const newTemplateUid = extractTemplateUid(templateRes);
      if (!newTemplateUid) { setPageError("template_uid not returned."); setDebugBox({ error: "no uid", templateRes }); return; }

      setTemplateUid(newTemplateUid);

      const campaignPayload = buildCampaignPayloadStrict(newTemplateUid);
      const targetUrl = editId ? UPDATE_CAMPAIGN_URL : CAMPAIGN_URL;
      const cRes = await fetch(targetUrl, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...campaignPayload, ...(token ? { token } : {}) }),
      });

      const cText = await cRes.text();
      let campaignRes: any = null;
      try { campaignRes = cText ? JSON.parse(cText) : null; } catch { campaignRes = { message: cText }; }

      if (cRes.status === 401) { forceLogout(); throw new Error("Unauthorized"); }
      if (!cRes.ok) {
        if (cRes.status === 429) {
          const retryAfter = cRes.headers.get("Retry-After");
          throw new Error(
            retryAfter
              ? `Too many attempts. Please wait ${retryAfter} seconds and try again.`
              : "Too many attempts. Please wait a little and try again."
          );
        }
        const details = campaignRes?.details || {};
        const errors = details?.errors || campaignRes?.errors || {};
        const msg = details?.message || campaignRes?.message || "Access Denied";
        throw new Error(errors && Object.keys(errors).length ? `${msg}: ${JSON.stringify(errors)}` : `${msg} (HTTP ${cRes.status})`);
      }

      const returnedCampaignUid = campaignRes?.data?.record?.campaign_uid || campaignRes?.data?.campaign_uid || campaignRes?.campaign_uid || "";

      if (returnedCampaignUid) {
        const cached = safeParse<any[]>(localStorage.getItem("cachedCampaigns"), []);
        const alreadyExists = cached.some((c) => c.campaign_uid === returnedCampaignUid);

        if (!alreadyExists) {
          const selectedListName = availableLists.find((l) => l.id === formData.list)?.name || formData.list;
          cached.unshift({
            id: returnedCampaignUid, campaign_uid: returnedCampaignUid,
            name: formData.campaignName, type: formData.type, status: "sending",
            list: selectedListName, listId: formData.list, list_uid: formData.list,
            subject: formData.subject, fromName: formData.fromName, fromEmail: formData.fromEmail,
            replyTo: formData.replyTo, toName: formData.toName,
            sendAt: new Date().toISOString(), send_at: new Date().toISOString(),
            dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString(),
            sendGroup: formData.sendGroup, segment: formData.segment,
            delivered: "0", opens: "0", clicks: "0", bounces: "0", unsubs: "0",
          });
        } else {
          const updated = cached.map((c) => c.campaign_uid === returnedCampaignUid ? { ...c, campaign_uid: returnedCampaignUid, list_uid: formData.list, list: formData.list } : c);
          localStorage.setItem("cachedCampaigns", JSON.stringify(updated));
        }

        localStorage.setItem("cachedCampaigns", JSON.stringify(cached));
        setCampaignId(returnedCampaignUid);
        setCampaignUid(returnedCampaignUid);

        const existingNotifications = (() => { try { return JSON.parse(localStorage.getItem("appNotifications") || "[]"); } catch { return []; } })();
        existingNotifications.unshift({
          id: `notif_${Date.now()}`,
          title: "Campaign created!",
          message: `<strong>${formData.campaignName}</strong> created at ${new Date().toLocaleString()}.`,
          dateAdded: new Date().toISOString(), read: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        localStorage.setItem("appNotifications", JSON.stringify(existingNotifications));
      }

      setDebugBox({ success: true, templatePayload, templateRes, campaignPayload, campaignRes, savedCampaignUid: returnedCampaignUid });
      setShowSuccessModal(true);
      setTimeout(() => { setShowSuccessModal(false); handleCloseForm(); }, 900);
    } catch (e: any) {
      setPageError(e?.message || "Failed to submit");
      setDebugBox({ error: e?.message, stack: e?.stack });
    } finally {
      submitInFlightRef.current = false;
      setSaving(false);
    }
  }

  function tabButtonClass(tab: FormTab) {
    return `min-w-max flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-xs font-medium transition-colors sm:px-6 sm:text-sm ${
      activeFormTab === tab ? "border-blue-500 text-blue-600 bg-blue-100 shadow-sm" : "border-transparent text-gray-600 hover:text-blue-500 dark:hover:bg-black hover:bg-white"
    }`;
  }

  function TabIcon({ tab }: { tab: FormTab }) {
    if (tab === "Details") return <Mail className="h-4 w-4 text-blue-500" />;
    if (tab === "Setup") return <SlidersHorizontal className="h-4 w-4 text-green-500" />;
    if (tab === "Template") return <div className="h-4 w-4 bg-purple-500 rounded" />;
    return <Check className="h-4 w-4 text-green-600" />;
  }

  function ModalShell({ open, title, onClose, children, widthClass = "max-w-2xl" }: {
    open: boolean; title: string; onClose: () => void; children: React.ReactNode; widthClass?: string;
  }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className={`relative w-full ${widthClass} max-h-[92dvh] overflow-hidden bg-white dark:bg-black rounded-lg shadow-lg border`}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-medium">{title}</div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-zinc-900" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[calc(92dvh-57px)] overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b bg-white p-3 dark:bg-black sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 items-center gap-2">
            <Mail className="h-5 w-5" />
            <h2 className="truncate text-base font-medium sm:text-lg">
              {editId ? "Edit campaign" : "Create new campaign"}
              {loadingEdit ? " (Loading...)" : ""}
            </h2>
          </div>
          <Button onClick={handleBackButton} size="sm" className="w-full bg-black text-white hover:bg-black dark:bg-zinc-200 dark:text-black sm:w-auto">Back</Button>
        </div>

        {pageError ? <div className="px-6 py-3 bg-red-50 text-red-700 border-b text-sm font-medium">❌ {pageError}</div> : null}


        <div className="flex-1 overflow-y-auto dark:bg-black bg-white">
          <div className="mx-auto w-full max-w-5xl border border-gray-200 bg-white p-4 shadow-sm dark:bg-black sm:m-4 sm:rounded-lg sm:p-6 lg:m-6 lg:p-8">

            {/* DETAILS TAB */}
            {activeFormTab === "Details" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">Campaign name <span className="text-red-500">*</span></Label>
                      <Input value={formData.campaignName} onChange={(e) => handleInputChange("campaignName", e.target.value)} className={`mt-2 w-full h-10 ${validationErrors.campaignName ? "border-red-500" : ""}`} placeholder="I.E: Weekly digest subscribers" />
                      {validationErrors.campaignName && <p className="mt-1 text-sm text-red-500">{validationErrors.campaignName}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">List <span className="text-red-500">*</span></Label>
                      <Select value={formData.list} onValueChange={handleListChange}>
                        <SelectTrigger className={`mt-2 w-full h-10 ${validationErrors.list ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={availableLists.length ? "Choose list" : "Loading lists..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLists.length ? availableLists.map((list) => <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>) : <SelectItem value="none" disabled>No lists found</SelectItem>}
                        </SelectContent>
                      </Select>
                      {validationErrors.list && <p className="mt-1 text-sm text-red-500">{validationErrors.list}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">Group</Label>
                      <Select value={formData.group} onValueChange={(v) => handleInputChange("group", v)}>
                        <SelectTrigger className="mt-2 w-full h-10"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Choose">Choose</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">Type</Label>
                      <Select value={formData.type} onValueChange={(v) => handleInputChange("type", v as any)}>
                        <SelectTrigger className="mt-2 w-full h-10"><SelectValue placeholder="Choose type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="Autoresponder">Autoresponder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">Segment</Label>
                      <Select value={formData.segment} onValueChange={(v) => handleInputChange("segment", v)}>
                        <SelectTrigger className="mt-2 w-full h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Choose">Choose</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium dark:text-white text-gray-700">Send group</Label>
                      <Input value={formData.sendGroup} onChange={(e) => handleInputChange("sendGroup", e.target.value)} className="mt-2 w-full h-10" placeholder="Start typing..." />
                    </div>
                  </div>
                </div>
                <div className="border-b mt-10 dark:bg-gray-900 bg-gray-50">
                  <div className="flex overflow-x-auto">
                    {formTabs.map((tab) => <button key={tab} onClick={() => handleTabChange(tab)} className={tabButtonClass(tab)}><TabIcon tab={tab} />{tab}</button>)}
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <Button onClick={handleSaveAndNext} className="w-full bg-blue-500 px-8 py-2 text-white hover:bg-blue-600 sm:w-auto">Save and next</Button>
                </div>
              </div>
            )}

            {/* SETUP TAB */}
            {activeFormTab === "Setup" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-black">
                  <div className="flex items-center gap-2 mb-4"><Mail className="h-4 w-4" /><h3 className="font-medium">Campaign setup</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-slate-300">From name <span className="text-red-500">*</span><button type="button" onClick={() => openAvailableTags("fromName")} className="text-xs text-blue-600 underline hover:text-blue-800">Available tags</button></Label>
                      <Input className={`h-9 text-sm ${validationErrors.fromName ? "border-red-500" : ""}`} value={formData.fromName} onChange={(e) => handleInputChange("fromName", e.target.value)} />
                      {validationErrors.fromName && <p className="mt-1 text-sm text-red-500">{validationErrors.fromName}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-gray-100 text-gray-700">From email *</Label>
                      <Input value={formData.fromEmail} className="h-9 text-sm" onChange={(e) => handleInputChange("fromEmail", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-gray-100 text-gray-700">Reply to *</Label>
                      <Input value={formData.replyTo} className="h-9 text-sm" onChange={(e) => handleInputChange("replyTo", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-gray-100">To name<button type="button" onClick={() => openAvailableTags("toName")} className="text-xs text-blue-600 underline hover:text-blue-800">Available tags</button></Label>
                      <Input className="h-9 text-sm" value={formData.toName || "[EMAIL]"} onChange={(e) => handleInputChange("toName", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-gray-100">Subject <span className="text-red-500">*</span><button type="button" onClick={() => openAvailableTags("subject")} className="text-xs text-blue-600 underline hover:text-blue-800">Available tags</button><span className="hidden text-gray-400 sm:inline">|</span><button type="button" onClick={() => openEmojiList("subject")} className="text-xs text-blue-600 underline hover:text-blue-800">Toggle emoji list</button></Label>
                      <Input className={`h-9 text-sm ${validationErrors.subject ? "border-red-500" : ""}`} value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)} />
                      {validationErrors.subject && <p className="mt-1 text-sm text-red-500">{validationErrors.subject}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-gray-100 text-gray-700">AltText</Label>
                      <Input className="h-9 text-sm" value={formData.altText || "Hello"} onChange={(e) => handleInputChange("altText", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-gray-100 text-gray-700">Email stats (optional)</Label>
                      <Input className={`h-9 text-sm ${validationErrors.emailStats ? "border-red-500" : ""}`} placeholder="reports@yourdomain.com" value={formData.emailStats} onChange={(e) => handleInputChange("emailStats", e.target.value)} />
                      {validationErrors.emailStats && <p className="mt-1 text-sm text-red-500">{validationErrors.emailStats}</p>}
                    </div>
                  </div>
                </div>
                <div className="border-b dark:bg-gray-900 bg-gray-50 mt-10">
                  <div className="flex overflow-x-auto">
                    {formTabs.map((tab) => <button key={tab} onClick={() => handleTabChange(tab)} className={tabButtonClass(tab)}><TabIcon tab={tab} />{tab}</button>)}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button disabled={saving} onClick={handleSaveAndNext} className="w-full bg-blue-500 px-6 text-white hover:bg-blue-600 sm:w-auto">{saving ? "Saving..." : "Save and next"}</Button>
                </div>
              </div>
            )}

            {/* TEMPLATE TAB */}
            {activeFormTab === "Template" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-black">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><h3 className="font-medium">Campaign template</h3></div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="h-9 flex-1 bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 sm:flex-none" onClick={() => setShowImportUrlModal(true)}>Import html from url</Button>
                      <Button className="h-9 flex-1 bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 sm:flex-none" onClick={() => setShowUploadTemplateModal(true)}>Upload template</Button>
                      {/* ✅ Change/Select template — fetch করে modal খোলো */}
                      <Button
                        className="h-9 flex-1 bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 sm:flex-none"
                        onClick={() => {
                          setShowChangeTemplateModal(true);
                          setSelectedTemplateUid("");
                          fetchTemplateList();
                        }}
                      >
                        Change/Select template
                      </Button>
                      <Button className="h-9 flex-1 bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 sm:flex-none" onClick={handleCloseForm}>Cancel</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-white text-gray-700">Template name</Label>
                      <Input className="h-9 text-sm" value={formData.templateName || ""} onChange={(e) => handleInputChange("templateName", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-white text-gray-700">Only plain text <span className="text-red-500">*</span></Label>
                      <Select value={formData.onlyPlainText} onValueChange={(v) => handleInputChange("onlyPlainText", v as any)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm dark:text-white text-gray-700">Auto plain text <span className="text-red-500">*</span></Label>
                      <Select value={formData.autoPlainText} onValueChange={(v) => handleInputChange("autoPlainText", v as any)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  {validationErrors.content ? <div className="mb-3 text-sm text-red-600 font-medium">❌ {validationErrors.content}</div> : null}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-white">
                        Content
                        <button type="button" onClick={() => { setInfoModalType("available_tags"); setShowInfoModal(true); }} className="text-xs text-blue-600 hover:text-blue-800 underline">[Available tags]</button>
                      </Label>
                    </div>
                    <div className="border rounded overflow-hidden">
                      <div className="border-b border-gray-300 shadow-sm">
                        <div className="flex flex-wrap items-center px-3 py-2 gap-1">
                          <button className={`h-7 px-2 text-xs border rounded-sm ${isSourceMode ? "bg-blue-500 text-white border-blue-500" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`} onClick={() => setIsSourceMode(!isSourceMode)} type="button">📄 Source</button>
                          <button className="h-7 px-2 border border-gray-300 hover:bg-blue-50 text-xs rounded" disabled={isSourceMode} onClick={() => openAvailableTags("content")} type="button">Tags</button>
                        </div>
                      </div>
                      {isSourceMode ? (
                        <textarea className="w-full min-h-[280px] p-3 text-sm outline-none dark:bg-black bg-white" value={formData.content} onChange={(e) => handleInputChange("content", e.target.value)} />
                      ) : (
                        <div ref={editorRef} className="w-full min-h-[280px] p-3 text-sm outline-none dark:bg-black bg-white" contentEditable suppressContentEditableWarning onFocus={() => { isEditorFocused.current = true; }} onBlur={() => { isEditorFocused.current = false; }} onInput={(e) => handleInputChange("content", (e.target as HTMLDivElement).innerHTML)} />
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" className="text-xs" onClick={() => handleInputChange("content", buildSimpleHtml())}>Use simple HTML</Button>
                    </div>
                  </div>

                  <div className="border-b mt-10 dark:bg-gray-900 bg-gray-50">
                    <div className="flex overflow-x-auto">
                      {formTabs.map((tab) => <button key={tab} onClick={() => handleTabChange(tab)} className={tabButtonClass(tab)}><TabIcon tab={tab} />{tab}</button>)}
                    </div>
                  </div>
                  <div className="flex justify-end pt-6">
                  <Button onClick={handleSaveAndNext} className="w-full bg-blue-500 px-8 py-2 text-white hover:bg-blue-600 sm:w-auto">Save and next</Button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION TAB */}
            {activeFormTab === "Confirmation" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-black">
                  <div className="flex items-center gap-2 mb-4"><Check className="h-4 w-4 text-green-600" /><h3 className="font-medium">Confirmation</h3></div>
                  <div className="rounded-lg border overflow-hidden text-sm">
                    {[
                      { label: "Campaign name", value: formData.campaignName || "-" },
                      { label: "List/Segment", value: formData.list === "Choose" ? "-" : getListNameById(formData.list) },
                      { label: "From name", value: formData.fromName || "-" },
                      { label: "From email", value: formData.fromEmail || "-" },
                      { label: "Reply to", value: formData.replyTo || "-" },
                      { label: "To name", value: formData.toName || "[EMAIL]" },
                      { label: "Subject", value: formData.subject || "-" },
                      { label: "Email stats", value: formData.emailStats?.trim() || "Disabled" },
                      ...(campaignId ? [{ label: "Campaign ID", value: campaignId, green: true }] : []),
                    ].map((row: any, i) => (
                      <div key={row.label} className={`grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-2 sm:px-5 ${i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : "bg-white dark:bg-black"}`}>
                        <span className="text-gray-500 dark:text-gray-400 font-normal">{row.label}</span>
                        <span className={`font-normal ${row.green ? "text-green-600" : "dark:text-white text-gray-800"}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end">
                    <Button className="bg-green-500 text-white hover:bg-green-600 px-6" onClick={submitCampaign} disabled={saving}>{saving ? "Creating..." : "✓ Confirm & Create"}</Button>
                    <Button variant="outline" className="px-6" onClick={handleCloseForm}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Tags */}
      {showAvailableTags && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAvailableTags(false)}>
          <div className="absolute left-3 right-3 top-20 bg-white p-3 shadow-lg dark:bg-black sm:left-auto sm:right-10 sm:top-24 sm:w-[340px] border rounded" onClick={(e) => e.stopPropagation()}>
            <div className="font-medium text-sm mb-2">Available tags</div>
            <div className="max-h-[260px] overflow-auto space-y-1">
              {availableTags.map((t) => (
                <button key={t.tag} onClick={() => insertTag(t.tag)} className="w-full text-left text-xs p-2 rounded hover:bg-gray-50 dark:hover:bg-zinc-900" type="button">
                  <div className="font-mono">{t.tag}</div>
                  <div className="text-gray-500">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)}>
          <div className="absolute left-3 right-3 top-20 bg-white p-3 shadow-lg dark:bg-black sm:left-auto sm:right-10 sm:top-24 sm:w-[360px] border rounded" onClick={(e) => e.stopPropagation()}>
            <div className="font-medium text-sm mb-2">Emoji</div>
            <div className="max-h-[320px] overflow-auto space-y-3">
              {Object.entries(emojiCategories).map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs text-gray-500 mb-1">{cat}</div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((emo) => <button key={emo} className="h-8 w-8 border rounded hover:bg-gray-50 dark:hover:bg-zinc-900" onClick={() => insertEmoji(emo)} type="button">{emo}</button>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      <ModalShell open={showInfoModal} title={infoModalType === "available_tags" ? "Available tags" : "Info"} onClose={() => setShowInfoModal(false)}>
        {infoModalType === "available_tags" ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">Click any tag to insert.</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {availableTags.map((t) => (
                <button key={t.tag} onClick={() => insertTag(t.tag)} className="text-left text-xs p-2 rounded border hover:bg-gray-50 dark:hover:bg-zinc-900" type="button">
                  <div className="font-mono">{t.tag}</div>
                  <div className="text-gray-500">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        ) : <div className="text-sm text-gray-700 dark:text-gray-200">Template help.</div>}
      </ModalShell>

      {/* Import HTML Modal */}
      <ModalShell open={showImportUrlModal} title="Import HTML from URL" onClose={() => setShowImportUrlModal(false)} widthClass="max-w-xl">
        <div className="space-y-3">
          <Label className="text-sm">URL</Label>
          <Input placeholder="https://example.com/template.html" className="h-9" />
          <div className="flex justify-end gap-2">
            <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => setShowImportUrlModal(false)}>Import</Button>
            <Button variant="outline" onClick={() => setShowImportUrlModal(false)}>Cancel</Button>
          </div>
        </div>
      </ModalShell>

      {/* Upload Template Modal */}
      <ModalShell open={showUploadTemplateModal} title="Upload template" onClose={() => setShowUploadTemplateModal(false)} widthClass="max-w-xl">
        <div className="space-y-3">
          <Label className="text-sm">Archive file</Label>
          <Input type="file" className="h-9" />
          <div className="flex justify-end gap-2">
            <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => setShowUploadTemplateModal(false)}>Upload</Button>
            <Button variant="outline" onClick={() => setShowUploadTemplateModal(false)}>Cancel</Button>
          </div>
        </div>
      </ModalShell>

      {/* ✅ Change/Select Template Modal */}
      <ModalShell
        open={showChangeTemplateModal}
        title="Change/Select template"
        onClose={() => { setShowChangeTemplateModal(false); setSelectedTemplateUid(""); }}
        widthClass="max-w-4xl"
      >
        {templateListLoading ? (
          <div className="text-center py-16 text-sm text-gray-500">Loading templates...</div>
        ) : templateList.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-500">No templates found.</div>
        ) : (
          <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3">
            {templateList.map((tpl) => (
              <div
                key={tpl.template_uid}
                onClick={() => setSelectedTemplateUid(tpl.template_uid)}
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  selectedTemplateUid === tpl.template_uid
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 hover:border-blue-300 dark:border-gray-700"
                }`}
              >
                {/* Screenshot */}
                <div className="h-28 w-full rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-2">
                  {tpl.screenshot ? (
                    <img src={tpl.screenshot} alt={tpl.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <FileText size={28} />
                      <span className="text-xs mt-1">No preview</span>
                    </div>
                  )}
                </div>
                {/* Name */}
                <div className="text-sm font-medium text-gray-800 dark:text-white truncate" title={tpl.name}>{tpl.name}</div>
                <div className="text-[11px] text-gray-400 truncate mt-0.5">{tpl.template_uid}</div>
                {/* Selected badge */}
                {selectedTemplateUid === tpl.template_uid && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-semibold">
                    <Check size={12} /> Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          {/* ✅ Use this template */}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!selectedTemplateUid || applyingTemplate}
            onClick={applySelectedTemplate}
          >
            {applyingTemplate ? "Applying..." : "Use this template"}
          </Button>
          <Button variant="outline" onClick={() => { setShowChangeTemplateModal(false); setSelectedTemplateUid(""); }}>Cancel</Button>
        </div>
      </ModalShell>

      {/* Success Modal */}
      <ModalShell open={showSuccessModal} title="Success" onClose={() => setShowSuccessModal(false)} widthClass="max-w-md">
        <div className="text-sm text-gray-700 dark:text-gray-200">Campaign created successfully.</div>
        <div className="flex justify-end pt-4 gap-2">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowSuccessModal(false)}>Done</Button>
        </div>
      </ModalShell>
    </>
  );
}
