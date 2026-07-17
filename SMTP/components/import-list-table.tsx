"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { rateLimitedFetch } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CsvLiveImportProps {
  listUid?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EmailList {
  id: string;
  uniqueId: string;
  name: string;
  displayName: string;
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  records?: Array<{
    data: { email: string; first_name: string; last_name: string };
    errors?: Record<string, string>;
  }>;
}

export default function CsvLiveImport({ listUid: listUidProp, onSuccess, onCancel }: CsvLiveImportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lists, setLists] = useState<EmailList[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [selectedListUid, setSelectedListUid] = useState<string>("");
  const [selectedListName, setSelectedListName] = useState<string>("");

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLists = async () => {
      setListsLoading(true);
      try {
        const storedSession = localStorage.getItem("userSession");
        if (!storedSession) return;
        const session = JSON.parse(storedSession);

        const url = new URL("/api/get-all-lists", window.location.origin);
        url.searchParams.append("pageNumber", "1");
        url.searchParams.append("perPage", "100");
        url.searchParams.append("token", session.token);

        const data = await rateLimitedFetch(url.toString(), {
          method: "GET",
          headers: { accept: "application/json", "Content-Type": "application/json" },
        }, `get-all-lists-${session.token}`, 0);
        const records = data?.data?.records || [];

        const processed: EmailList[] = records.map((item: any) => {
          const uid =
            item?.general?.list_uid ||
            item?.general?.unique_id ||
            String(item?.general?.id || "");
          return {
            id: uid,
            uniqueId: uid,
            name: item?.general?.name || "",
            displayName: item?.general?.display_name || item?.general?.name || "",
          };
        });

        setLists(processed);

        const uidFromProp = listUidProp;
        const uidFromUrl = searchParams?.get("list_uid");
        const preselect = uidFromProp || uidFromUrl || processed[0]?.uniqueId || "";

        if (preselect) {
          setSelectedListUid(preselect);
          const found = processed.find((l) => l.uniqueId === preselect);
          if (found) setSelectedListName(found.name);
        }
      } catch (err) {
        console.error("Error fetching lists:", err);
      } finally {
        setListsLoading(false);
      }
    };

    fetchLists();
  }, [listUidProp, searchParams]);

  const handleListChange = (uid: string) => {
    setSelectedListUid(uid);
    const found = lists.find((l) => l.uniqueId === uid);
    setSelectedListName(found?.name || "");
    setResult(null);
    setError(null);
  };

  const downloadSampleCsv = () => {
    const csvContent = ["EMAIL,FNAME,LNAME", "john@example.com,John,Doe", "jane@example.com,Jane,Smith"].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") return "Only CSV files are supported.";
    if (file.size > 10 * 1024 * 1024) return "File size must be less than 10 MB.";
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError(null);
    setResult(null);
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!selectedFile) { setError("Please select a CSV file."); return; }
    if (!selectedListUid) { setError("Please select a list to import into."); return; }

    setImporting(true);
    setError(null);
    setProgress(10);

    try {
      const storedSession = localStorage.getItem("userSession");
      if (!storedSession) { setError("Session expired. Please login again."); setImporting(false); return; }
      const session = JSON.parse(storedSession);

      const fileText = await selectedFile.text();
      const rows = fileText.split(/\r?\n/).map(row => row.trim()).filter(row => row);

      if (rows.length < 2) {
        throw new Error("CSV file is empty or missing data.");
      }

      const headers = rows[0].split(',').map(h => h.trim().toUpperCase());
      const emailIdx = headers.indexOf('EMAIL');
      const fnameIdx = headers.indexOf('FNAME');
      const lnameIdx = headers.indexOf('LNAME');

      if (emailIdx === -1) {
        throw new Error("CSV must contain an 'EMAIL' column.");
      }

      const subscribers = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim());
        if (cols[emailIdx]) {
          subscribers.push({
            email: cols[emailIdx],
            first_name: fnameIdx !== -1 ? cols[fnameIdx] : '',
            last_name: lnameIdx !== -1 ? cols[lnameIdx] : '',
            status: 'confirmed'
          });
        }
      }

      setProgress(30);

      const response = await fetch("/api/create-subscribers-in-bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          list_uid: selectedListUid,
          subscribers: subscribers
        }),
      });

      setProgress(80);
      const data = await response.json();

      if (!response.ok || data.status === "error" || data.success === false) {
        throw new Error(data.message || "Import failed. Please check your CSV and try again.");
      }

      setProgress(100);

      const total = data?.data?.total || subscribers.length;
      const imported = data?.data?.imported || 0;
      const failed = total - imported;

      setResult({ total, imported, failed, records: [] });

      window.dispatchEvent(new CustomEvent("subscriberCreated", { detail: { listId: selectedListUid } }));
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Something went wrong during import.");
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const steps = [
    { label: "Select list", done: !!selectedListUid },
    { label: "Upload file", done: !!selectedFile },
    { label: "Review", done: !!result },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-4 sm:p-8 flex items-start justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl mt-2 sm:mt-6"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Import Subscribers</h1>
              <p className="text-sm text-gray-500 font-medium">Upload a CSV to instantly add contacts</p>
            </div>
          </div>
          <button
            onClick={onCancel ?? (() => router.back())}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-md text-sm font-semibold text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: step.done ? 1.1 : i === steps.findIndex(s => !s.done) ? 1.05 : 1,
                    backgroundColor: step.done ? "#22c55e" : i === steps.findIndex(s => !s.done) ? "#4f46e5" : "#f3f4f6",
                    borderColor: step.done ? "#22c55e" : i === steps.findIndex(s => !s.done) ? "#4f46e5" : "#e5e7eb"
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                    ${step.done ? "text-white" : i === steps.findIndex(s => !s.done) ? "text-white shadow-md shadow-indigo-500/20" : "text-gray-400"}`}
                >
                  {step.done ? (
                    <motion.svg initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (i + 1)}
                </motion.div>
                <span className={`text-sm font-bold hidden sm:block tracking-wide
                  ${step.done ? "text-green-600" : i === steps.findIndex(s => !s.done) ? "text-indigo-600" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 rounded-full bg-gray-100 overflow-hidden">
                   <motion.div 
                      className="h-full bg-green-500" 
                      initial={{ width: "0%" }}
                      animate={{ width: step.done ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                   />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* List selector card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl bg-white border border-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full" />
            <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">Target List</label>
          </div>

          {listsLoading ? (
            <div className="flex items-center gap-3 h-12 text-sm font-medium text-gray-400 bg-gray-50 rounded-xl px-4">
              <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Fetching your lists…
            </div>
          ) : lists.length === 0 ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              No lists found. Please create a list first.
            </div>
          ) : (
            <div className="relative group">
              <select
                value={selectedListUid}
                onChange={(e) => handleListChange(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 px-4 pr-10 text-sm font-medium text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white hover:bg-white transition-all cursor-pointer shadow-sm"
              >
                <option value="">— Select a list —</option>
                {lists.map((list) => (
                  <option key={list.uniqueId} value={list.uniqueId}>{list.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-md shadow-sm border border-gray-100 flex items-center justify-center pointer-events-none group-hover:border-indigo-200 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          <AnimatePresence>
            {selectedListUid && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-green-50 border border-green-200 text-xs font-bold text-green-700 shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Importing into: <span className="text-green-800">{selectedListName}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Template banner */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 p-5 flex items-start gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-10 h-10 bg-white rounded-xl border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900 tracking-tight">Required CSV format</p>
            <p className="text-sm font-medium text-indigo-700/80 mt-1 flex flex-wrap items-center gap-1.5">
              Columns must be uppercase:
              <code className="bg-white border border-blue-200/60 px-2 py-0.5 rounded-md text-xs font-bold font-mono text-indigo-600 shadow-sm">EMAIL</code>
              <code className="bg-white border border-blue-200/60 px-2 py-0.5 rounded-md text-xs font-bold font-mono text-indigo-600 shadow-sm">FNAME</code>
              <code className="bg-white border border-blue-200/60 px-2 py-0.5 rounded-md text-xs font-bold font-mono text-indigo-600 shadow-sm">LNAME</code>
            </p>
            <button onClick={downloadSampleCsv} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group">
              <div className="bg-white p-1 rounded-md border border-indigo-100 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              Download sample CSV
            </button>
          </div>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-14 text-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            ${dragOver ? "border-indigo-400 bg-indigo-50/50 scale-[1.02] shadow-xl shadow-indigo-500/10" : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-lg"}
            ${selectedFile ? "border-green-400 bg-green-50/50 border-solid" : ""}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileInputChange} />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div 
                key="file-selected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 flex items-center justify-center shadow-inner">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800">{selectedFile.name}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="no-file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner
                  ${dragOver ? 'bg-indigo-100 border border-indigo-200' : 'bg-amber-50 border border-amber-100'}
                `}>
                  <svg className={`w-8 h-8 transition-colors duration-300 ${dragOver ? 'text-indigo-600' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-700">Drop your CSV file here</p>
                  <p className="text-sm font-medium text-gray-500 mt-1 bg-gray-100 px-3 py-1 rounded-full inline-block">or click to browse · Max 10 MB</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 shadow-sm"
            >
              <div className="bg-red-100 rounded-full p-1 mt-0.5 shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {importing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-5 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Importing subscribers…
                </span>
                <span className="text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-green-400 relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5 border-b border-green-200/50 pb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-green-900 tracking-tight">Import Complete!</p>
                    <p className="text-sm font-medium text-green-700/80">Your subscribers have been processed.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-3xl font-black text-gray-800">{result.total}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Total Rows</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                    <p className="text-3xl font-black text-green-600">{result.imported}</p>
                    <p className="text-xs font-bold text-green-600/70 mt-1 uppercase tracking-wider">Imported</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm relative overflow-hidden">
                    {result.failed > 0 && <div className="absolute top-0 right-0 w-8 h-8 bg-red-50 rounded-bl-full flex justify-end p-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div></div>}
                    <p className={`text-3xl font-black ${result.failed > 0 ? 'text-red-500' : 'text-gray-400'}`}>{result.failed}</p>
                    <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${result.failed > 0 ? 'text-red-400' : 'text-gray-400'}`}>Failed</p>
                  </div>
                </div>
              </div>

              {result.failed > 0 && result.records && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl bg-red-50/50 border border-red-100 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-sm font-bold text-red-800">
                      {result.failed} row{result.failed > 1 ? "s" : ""} failed — check column headers
                    </p>
                  </div>
                  <p className="text-xs font-medium text-red-600/80 mb-4 ml-7">
                    Make sure headers are uppercase:{" "}
                    <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">EMAIL</code>{" "}
                    <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">FNAME</code>{" "}
                    <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">LNAME</code>
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {result.records
                      .filter((r: any) => r.errors && Object.keys(r.errors).length > 0)
                      .map((r: any, i: number) => (
                        <div key={i} className="text-xs bg-white rounded-lg p-3 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                          <span className="font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {r.data?.email || "unknown"}
                          </span>
                          <span className="text-red-500 font-medium bg-red-50 px-2 py-1 rounded-md">{Object.values(r.errors).join(", ")}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
            {selectedFile && selectedListUid ? (
              <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Ready to import</>
            ) : (
              "Select a list and upload a CSV to begin"
            )}
          </p>
          {result ? (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel ?? (() => router.back())}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
            >
              Done — Back to lists
            </motion.button>
          ) : (
            <motion.button
              whileHover={!(!selectedFile || importing || !selectedListUid) ? { scale: 1.02, y: -1 } : {}}
              whileTap={!(!selectedFile || importing || !selectedListUid) ? { scale: 0.98 } : {}}
              onClick={handleImport}
              disabled={!selectedFile || importing || !selectedListUid}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg
                ${(!selectedFile || importing || !selectedListUid) 
                  ? "bg-gray-300 shadow-none cursor-not-allowed" 
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-blue-500"
                }`}
            >
              {importing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Importing…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import from CSV
                </>
              )}
            </motion.button>
          )}
        </div>

      </motion.div>
    </div>
  );
}