"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { token } from "@/components/common/http";



const availableTags = [
  { tag: "[COMPANY_FULL_ADDRESS]", required: "NO" },
  { tag: "[UPDATE_PROFILE_URL]", required: "NO" },
  { tag: "[WEB_VERSION_URL]", required: "NO" },
  { tag: "[CAMPAIGN_URL]", required: "NO" },
  { tag: "[FORWARD_FRIEND_URL]", required: "NO" },
  { tag: "[LIST_UID]", required: "NO" },
  { tag: "[LIST_NAME]", required: "NO" },
  { tag: "[LIST_SUBJECT]", required: "NO" },
  { tag: "[LIST_DESCRIPTION]", required: "NO" },
  { tag: "[LIST_FROM_NAME]", required: "NO" },
  { tag: "[LIST_FROM_EMAIL]", required: "NO" },
  { tag: "[LIST_VCARD_URL]", required: "NO" },
  { tag: "[CURRENT_YEAR]", required: "NO" },
  { tag: "[CURRENT_MONTH]", required: "NO" },
  { tag: "[CURRENT_DAY]", required: "NO" },
  { tag: "[CURRENT_DATE]", required: "NO" },
  { tag: "[CURRENT_MONTH_FULL_NAME]", required: "NO" },
  { tag: "[COMPANY_NAME]", required: "NO" },
  { tag: "[COMPANY_WEBSITE]", required: "NO" },
  { tag: "[COMPANY_ADDRESS_1]", required: "NO" },
  { tag: "[COMPANY_ADDRESS_2]", required: "NO" },
  { tag: "[COMPANY_CITY]", required: "NO" },
  { tag: "[COMPANY_ZONE]", required: "NO" },
  { tag: "[COMPANY_ZONE_CODE]", required: "NO" },
  { tag: "[COMPANY_ZIP]", required: "NO" },
  { tag: "[COMPANY_COUNTRY]", required: "NO" },
  { tag: "[COMPANY_COUNTRY_CODE]", required: "NO" },
  { tag: "[COMPANY_PHONE]", required: "NO" },
  { tag: "[CAMPAIGN_NAME]", required: "NO" },
  { tag: "[CAMPAIGN_TYPE]", required: "NO" },
  { tag: "[CAMPAIGN_SUBJECT]", required: "NO" },
  { tag: "[CAMPAIGN_TO_NAME]", required: "NO" },
  { tag: "[CAMPAIGN_FROM_NAME]", required: "NO" },
  { tag: "[CAMPAIGN_FROM_EMAIL]", required: "NO" },
  { tag: "[CAMPAIGN_REPLY_TO]", required: "NO" },
  { tag: "[CAMPAIGN_UID]", required: "NO" },
  { tag: "[CAMPAIGN_SEND_AT]", required: "NO" },
  { tag: "[CAMPAIGN_STARTED_AT]", required: "NO" },
  { tag: "[CAMPAIGN_DATE_ADDED]", required: "NO" },
  { tag: "[CAMPAIGN_SEGMENT_NAME]", required: "NO" },
  { tag: "[CAMPAIGN_VCARD_URL]", required: "NO" },
  { tag: "[SUBSCRIBER_UID]", required: "NO" },
  { tag: "[SUBSCRIBER_IP]", required: "NO" },
  { tag: "[SUBSCRIBER_DATE_ADDED]", required: "NO" },
  { tag: "[SUBSCRIBER_DATE_ADDED_LOCALIZED]", required: "NO" },
  { tag: "[SUBSCRIBER_OPTIN_IP]", required: "NO" },
  { tag: "[SUBSCRIBER_OPTIN_DATE]", required: "NO" },
  { tag: "[SUBSCRIBER_CONFIRM_IP]", required: "NO" },
  { tag: "[SUBSCRIBER_CONFIRM_DATE]", required: "NO" },
  { tag: "[SUBSCRIBER_LAST_SENT_DATE]", required: "NO" },
  { tag: "[SUBSCRIBER_LAST_SENT_DATE_LOCALIZED]", required: "NO" },
  { tag: "[SUBSCRIBER_EMAIL_NAME]", required: "NO" },
  { tag: "[SUBSCRIBER_EMAIL_DOMAIN]", required: "NO" },
  { tag: "[EMAIL_NAME]", required: "NO" },
  { tag: "[EMAIL_DOMAIN]", required: "NO" },
  { tag: "[DATE]", required: "NO" },
  { tag: "[DATETIME]", required: "NO" },
  { tag: "[RANDOM_CONTENT:a|b|c]", required: "NO" },
  { tag: "[REMOTE_CONTENT url='https://www.google.com/']", required: "NO" },
  {
    tag: "[COUNTDOWN until='2026-02-02 09:02:07' size='large' text-color='db9842' background-color='ffffff' show-circle='yes' circle-background-color='ffcccc' circle-foreground-color='ff0000' max-frames=60 show-text-label='yes']",
    required: "NO",
  },
  { tag: "[CAMPAIGN_REPORT_ABUSE_URL]", required: "NO" },
  { tag: "[CURRENT_DOMAIN_URL]", required: "NO" },
  { tag: "[CURRENT_DOMAIN]", required: "NO" },
  { tag: "[SIGN_LT]", required: "NO" },
  { tag: "[SIGN_LTE]", required: "NO" },
  { tag: "[SIGN_GT]", required: "NO" },
  { tag: "[SIGN_GTE]", required: "NO" },
  { tag: "[DS_NAME]", required: "NO" },
  { tag: "[DS_HOST]", required: "NO" },
  { tag: "[DS_TYPE]", required: "NO" },
  { tag: "[DS_ID]", required: "NO" },
  { tag: "[DS_FROM_NAME]", required: "NO" },
  { tag: "[DS_FROM_EMAIL]", required: "NO" },
  { tag: "[DS_REPLYTO_EMAIL]", required: "NO" },
  { tag: "[SUBSCRIBE_URL]", required: "NO" },
  { tag: "[SUBSCRIBE_LINK]", required: "NO" },
  { tag: "[UNSUBSCRIBE_URL]", required: "YES" },
  { tag: "[UNSUBSCRIBE_LINK]", required: "NO" },
  { tag: "[DIRECT_UNSUBSCRIBE_URL]", required: "NO" },
  { tag: "[DIRECT_UNSUBSCRIBE_LINK]", required: "NO" },
  { tag: "[UNSUBSCRIBE_FROM_CUSTOMER_URL]", required: "NO" },
  { tag: "[UNSUBSCRIBE_FROM_CUSTOMER_LINK]", required: "NO" },
  { tag: "[SURVEY:SURVEY_UNIQUE_ID_HERE:VIEW_URL]", required: "NO" },
  { tag: "[EMAIL]", required: "NO" },
  { tag: "[FNAME]", required: "NO" },
  { tag: "[LNAME]", required: "NO" },
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
        "fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-md px-4 py-3 text-white shadow-lg",
        type === "success" ? "bg-green-600" : "bg-red-600",
      )}
      role="status"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-white/90" />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded px-2 py-1 text-white/90 hover:text-white"
        aria-label="Close toast"
      >
        x
      </button>
    </div>
  );
}

function TagsModal({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (tag: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Available Tags</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-3 overflow-y-auto max-h-[60vh]">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-700">
            <span className="w-3/4">Tag</span>
            <span className="w-1/4 text-right">Required</span>
          </div>
          <div className="rounded border border-gray-200">
            {availableTags.map((t) => (
              <div
                key={t.tag}
                className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs hover:bg-gray-50 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onInsert(t.tag)}
                  className="w-3/4 text-left text-blue-600 hover:text-blue-800 hover:underline"
                  title="Insert tag"
                >
                  <code className="font-mono">{t.tag}</code>
                </button>
                <div className="w-1/4 text-right">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-semibold",
                      t.required === "YES"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {t.required}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddEmailTemplateEditor() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"edit" | "source" | "preview">("edit");
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showTags, setShowTags] = useState(false);

  // ── mode switch ref (edit mode এ ফিরলে content sync করতে) ──────────────
  const prevModeRef = useRef<"edit" | "source" | "preview">("edit");
  React.useEffect(() => {
    if (mode === "edit" && prevModeRef.current !== "edit") {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
    prevModeRef.current = mode;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      window.setTimeout(() => setToast(null), 2000);
    },
    [],
  );

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    if (!name.trim()) return "Template name is required.";
    if (!content.trim()) return "Template content cannot be empty.";
    if (!content.includes("[UNSUBSCRIBE_URL]"))
      return "Template must include [UNSUBSCRIBE_URL].";
    return null;
  }, [name, content]);

  // ── Insert tag ────────────────────────────────────────────────────────────
  const insertTag = useCallback(
    (tag: string) => {
      if (mode !== "edit") {
        setSource((s) => s + tag);
        showToast("success", "Tag inserted");
        return;
      }

      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();
      const sel = window.getSelection();

      if (!sel || sel.rangeCount === 0) {
        editor.innerHTML = (editor.innerHTML || "") + tag;
        setContent(editor.innerHTML);
        showToast("success", "Tag inserted");
        return;
      }

      const range = sel.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) {
        editor.innerHTML = (editor.innerHTML || "") + tag;
        setContent(editor.innerHTML);
        showToast("success", "Tag inserted");
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
      showToast("success", "Tag inserted");
    },
    [mode, showToast],
  );

  // ── Toolbar commands ──────────────────────────────────────────────────────
  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    setContent(editorRef.current?.innerHTML ?? "");
  }, []);

  // ── CREATE (POST) ─────────────────────────────────────────────────────────
const handleCreate = useCallback(async () => {
    const err = validate();
    if (err) {
      showToast("error", err);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/template/create-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          content,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        throw new Error(data?.message || `Server error ${res.status}`);
      }

      showToast("success", data?.message || "Template created successfully!");
      window.setTimeout(() => router.push("/email-templates/templates"), 900);
    } catch (e: any) {
      showToast("error", e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }, [validate, showToast, name, content, router]);

  // ── Reset / Clear form ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setName("");
    setContent("");
    setSource("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <TagsModal
        open={showTags}
        onClose={() => setShowTags(false)}
        onInsert={(t) => insertTag(t)}
      />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add Email Template
            </h1>
            <p className="text-sm text-gray-600">Create a new email template</p>
          </div>

          <div className="flex items-center gap-2">
            {(["edit", "source", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "h-9 rounded px-3 text-sm font-medium border capitalize",
                  mode === m
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200 hover:bg-gray-200",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Editor ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                  />
                </div>

                {/* Edit mode */}
                {mode === "edit" && (
                  <div className="border border-gray-300 rounded">
                    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-sm font-bold"
                        onClick={() => exec("bold")}
                      >
                        B
                      </button>
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-sm italic"
                        onClick={() => exec("italic")}
                      >
                        I
                      </button>
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-sm underline"
                        onClick={() => exec("underline")}
                      >
                        U
                      </button>
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-xs"
                        onClick={() => exec("formatBlock", "h2")}
                      >
                        H2
                      </button>
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-xs"
                        onClick={() => exec("formatBlock", "p")}
                      >
                        P
                      </button>
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-xs"
                        onClick={() => exec("insertUnorderedList")}
                      >
                        UL
                      </button>
                      <button
                        className="h-8 px-2 rounded hover:bg-gray-200 text-xs"
                        onClick={() => exec("insertOrderedList")}
                      >
                        OL
                      </button>
                      <div className="flex-1" />
                      <button
                        type="button"
                        onClick={() => setShowTags(true)}
                        className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Tags
                      </button>
                    </div>

                    {/* contentEditable editor — কোনো useEffect এর মধ্যে innerHTML set হয় না */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="min-h-[420px] p-4 outline-none"
                      onInput={() =>
                        setContent(editorRef.current?.innerHTML ?? "")
                      }
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                        setContent(editorRef.current?.innerHTML ?? "");
                      }}
                    />
                  </div>
                )}

                {/* Source mode */}
                {mode === "source" && (
                  <div className="border border-gray-300 rounded">
                    <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        HTML Source
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowTags(true)}
                          className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          Tags
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setContent(source);
                            showToast("success", "Source applied");
                          }}
                          className="h-8 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full h-[460px] p-4 font-mono text-sm outline-none resize-none"
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Preview mode */}
                {mode === "preview" && (
                  <div className="border border-gray-300 rounded">
                    <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowTags(true)}
                        className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        Tags
                      </button>
                    </div>
                    <div
                      className="min-h-[420px] bg-white p-4"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Required:{" "}
                  <span className="font-semibold text-red-600">
                    [UNSUBSCRIBE_URL]
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-6">
            {/* Quick Tags */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Quick Tags
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTags(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {[
                  "[FNAME]",
                  "[LNAME]",
                  "[EMAIL]",
                  "[COMPANY_NAME]",
                  "[CURRENT_YEAR]",
                  "[UNSUBSCRIBE_URL]",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => insertTag(t)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded border hover:bg-gray-50",
                      t === "[UNSUBSCRIBE_URL]"
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className={cn(
                    "w-full h-10 rounded text-sm font-semibold text-white",
                    saving
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700",
                  )}
                >
                  {saving ? "Creating..." : "Create Template"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(content);
                      showToast("success", "Copied");
                    } catch {
                      showToast("error", "Clipboard denied");
                    }
                  }}
                  className="w-full h-10 rounded border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Copy HTML
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full h-10 rounded border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Reset / Clear
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full h-10 rounded border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-700">
                Preview shows raw HTML. Do server validation for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}