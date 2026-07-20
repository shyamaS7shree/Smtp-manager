"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { token } from "@/components/common/http";
import {
  ArrowLeft,
  Eye,
  Code,
  Edit3,
  Tag,
  Save,
  Copy,
  RotateCcw,
  X,
  Bold,
  Italic,
  Underline,
  Heading2,
  Pilcrow,
  List,
  ListOrdered,
  Check,
  FileCode,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const availableTags = [
  { tag: "[UNSUBSCRIBE_URL]", required: "YES" },
  { tag: "[FNAME]", required: "NO" },
  { tag: "[LNAME]", required: "NO" },
  { tag: "[EMAIL]", required: "NO" },
  { tag: "[COMPANY_NAME]", required: "NO" },
  { tag: "[CURRENT_YEAR]", required: "NO" },
  { tag: "[WEB_VERSION_URL]", required: "NO" },
  { tag: "[UPDATE_PROFILE_URL]", required: "NO" },
  { tag: "[SUBSCRIBE_URL]", required: "NO" },
  { tag: "[CAMPAIGN_NAME]", required: "NO" },
  { tag: "[CAMPAIGN_SUBJECT]", required: "NO" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "fixed top-5 right-5 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 text-white shadow-xl animate-in slide-in-from-top-2 duration-200",
        type === "success" ? "bg-emerald-600" : "bg-red-600",
      )}
      role="status"
    >
      <span className="h-2 w-2 rounded-full bg-white" />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-3 rounded-md px-1.5 py-0.5 text-white/80 hover:bg-white/20 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function EditEmailTemplateComponent() {
  const router = useRouter();
  const params = useParams();
  const template_uid = (params?.id as string) || "";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<"edit" | "source" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const validate = useCallback(() => {
    if (!template_uid) return "Template UID missing in route.";
    if (!name.trim()) return "Template name is required.";
    if (!content.includes("[UNSUBSCRIBE_URL]")) {
      return "Template must include [UNSUBSCRIBE_URL]. Click '[UNSUBSCRIBE_URL]' in Quick Tags to add it.";
    }
    return null;
  }, [template_uid, name, content]);

  // Load existing template data & prefill
  const fetchTemplate = useCallback(async () => {
    if (!template_uid) {
      setLoading(false);
      showToast("error", "Template UID missing in route.");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/template/get-one-template?template_uid=${encodeURIComponent(template_uid)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        cache: "no-store",
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      if (!res.ok || (json?.status && json?.status !== "success")) {
        throw new Error(json?.message || `Server error ${res.status}`);
      }

      const payload = json?.data ?? json;
      const rec = payload?.record || payload;

      const nextName = String(rec?.name ?? payload?.name ?? "");
      const nextCategory = String(rec?.category || rec?.category_name || payload?.category || "general");
      const nextContent = String(rec?.content ?? rec?.meta?.content ?? payload?.content ?? "");

      setName(nextName);
      setCategory(nextCategory);
      setContent(nextContent);
      setSource(nextContent);

      window.setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = nextContent || "";
        }
      }, 50);
    } catch (e: any) {
      showToast("error", e?.message || "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, [template_uid, showToast]);

  useEffect(() => {
    fetchTemplate();
  }, [template_uid]);

  const handleUpdate = useCallback(async () => {
    const err = validate();
    if (err) {
      showToast("error", err);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/template/update-template?template_uid=${encodeURIComponent(template_uid)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({
            template_uid,
            name: name.trim(),
            category: category.trim() || "general",
            content,
            inline_css: "yes",
          }),
        },
      );

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok || (data?.status && data?.status !== "success")) {
        throw new Error(data?.message || `Server error ${res.status}`);
      }

      showToast("success", "Template updated successfully!");
    } catch (e: any) {
      showToast("error", e?.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  }, [template_uid, name, category, content, validate, showToast]);

  const insertTag = useCallback(
    (tag: string) => {
      if (mode !== "edit") {
        setSource((s) => s + tag);
        setContent((c) => c + tag);
        showToast("success", `Inserted ${tag}`);
        return;
      }

      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        editor.innerHTML = (editor.innerHTML || "") + tag;
        setContent(editor.innerHTML);
        showToast("success", `Inserted ${tag}`);
        return;
      }

      const range = sel.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) {
        editor.innerHTML = (editor.innerHTML || "") + tag;
        setContent(editor.innerHTML);
        showToast("success", `Inserted ${tag}`);
        return;
      }

      range.deleteContents();
      const node = document.createTextNode(tag);
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      sel.removeAllRanges();
      sel.addRange(range);

      setContent(editor.innerHTML);
      showToast("success", `Inserted ${tag}`);
    },
    [mode, showToast],
  );

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    setContent(editorRef.current?.innerHTML ?? "");
  }, []);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(content);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
    showToast("success", "HTML copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/email-templates/templates")}
              className="p-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg transition-colors"
              title="Back to Templates"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Edit Email Template
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update existing template content, category, and HTML markup
              </p>
            </div>
          </div>

          {/* Mode Switcher & Cancel Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  mode === "edit"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Edit3 size={14} />
                Visual Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSource(content);
                  setMode("source");
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  mode === "source"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Code size={14} />
                HTML Source
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  mode === "preview"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Eye size={14} />
                Live Preview
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/email-templates/templates")}
              className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border-slate-200 flex items-center gap-1.5"
            >
              <X size={15} className="text-slate-500" />
              <span>Cancel</span>
            </Button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Editor */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              {/* Template Name & Category Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Template Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    suppressHydrationWarning
                    className="w-full h-10 px-3 text-sm bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    suppressHydrationWarning
                    className="w-full h-10 px-3 text-sm bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 capitalize"
                  >
                    <option value="general">General</option>
                    <option value="marketing">Marketing</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Template Content
                </label>

                {mode === "edit" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    {/* Rich Text Formatting Toolbar */}
                    <div className="bg-slate-50 p-2 border-b border-slate-200 flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => exec("bold")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        title="Bold"
                      >
                        <Bold size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exec("italic")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                        title="Italic"
                      >
                        <Italic size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exec("underline")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                        title="Underline"
                      >
                        <Underline size={15} />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => exec("formatBlock", "h2")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-0.5 font-semibold"
                        title="Heading 2"
                      >
                        <Heading2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exec("formatBlock", "p")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-0.5"
                        title="Paragraph"
                      >
                        <Pilcrow size={15} />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => exec("insertUnorderedList")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                        title="Bullet List"
                      >
                        <List size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => exec("insertOrderedList")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                        title="Numbered List"
                      >
                        <ListOrdered size={15} />
                      </button>
                    </div>

                    {/* ContentEditable Container */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="min-h-[440px] p-5 outline-none text-slate-800 text-sm bg-white"
                      onInput={() => setContent(editorRef.current?.innerHTML ?? "")}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                        setContent(editorRef.current?.innerHTML ?? "");
                      }}
                    />
                  </div>
                )}

                {/* HTML Source View */}
                {mode === "source" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileCode size={14} /> HTML Source Code
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setContent(source);
                          showToast("success", "Source HTML applied!");
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        Apply Changes
                      </button>
                    </div>
                    <textarea
                      value={source}
                      onChange={(e) => {
                        setSource(e.target.value);
                        setContent(e.target.value);
                      }}
                      className="w-full h-[440px] p-4 font-mono text-xs text-slate-100 bg-slate-950 outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Live Preview View */}
                {mode === "preview" && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-4 min-h-[480px] flex justify-center">
                    <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-6">
                      {content ? (
                        <div
                          className="prose max-w-none text-slate-800 text-sm"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <div className="py-16 text-center text-slate-400 text-xs">
                          No HTML content available.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Tags & Actions */}
          <div className="space-y-5">
            {/* Quick Tags Box */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Quick Tags</h3>
                </div>
                <span className="text-[10px] font-medium text-slate-400">Click to Insert</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1 max-h-[280px] overflow-y-auto pr-1">
                {availableTags.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => insertTag(item.tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all border",
                      item.required === "YES"
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
                    )}
                    title={`Click to insert ${item.tag}`}
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Actions
              </h3>

              <div className="space-y-2">
                <Button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>{saving ? "Updating..." : "Update Template"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopyHtml}
                  className="w-full h-9 text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  {copiedHtml ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copiedHtml ? "HTML Copied!" : "Copy HTML"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={fetchTemplate}
                  className="w-full h-9 text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
                  <span>Reload from API</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
