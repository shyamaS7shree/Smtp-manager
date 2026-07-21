"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Settings, Plus, HelpCircle, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";
import { apiUrl, token } from "@/components/common/http";

interface CustomFieldCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface OperatorOption {
  operator_id: string;
  name: string;
}

interface CampaignCondition {
  id: string;
  campaignAction: string;
  campaign: string;
  comparison: string;
  timeValue: string;
  timeUnit: string;
}

interface CampaignOption {
  uid: string;
  name: string;
}

interface CustomFieldOption {
  field_id: string;
  label: string;
}

export default function CreateEditSegmentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = params?.id as string;
  const segmentId = searchParams?.get("segmentId") || undefined;
  const isEditing = !!segmentId;
  const { toast } = useToast();

  const [segmentName, setSegmentName] = useState("");
  const [operatorMatch, setOperatorMatch] = useState("any");
  const [customFieldConditions, setCustomFieldConditions] = useState<CustomFieldCondition[]>([]);
  const [campaignConditions, setCampaignConditions] = useState<CampaignCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSegment, setFetchingSegment] = useState(isEditing);
  const [showValueTagsModal, setShowValueTagsModal] = useState(false);

  const [listCampaigns, setListCampaigns] = useState<CampaignOption[]>([]);
  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldOption[]>([
    { field_id: "EMAIL", label: "Email" },
    { field_id: "FNAME", label: "First name" },
    { field_id: "LNAME", label: "Last name" },
  ]);
  const [fetchingFields, setFetchingFields] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [operatorsReady, setOperatorsReady] = useState(false);
  const [campaignsReady, setCampaignsReady] = useState(false);

  const segmentFetched = useRef(false);

  // Only prefill once — when all dropdowns are ready and segment not yet fetched
  useEffect(() => {
    if (isEditing && fieldsReady && operatorsReady && campaignsReady && !segmentFetched.current) {
      segmentFetched.current = true;
      fetchSegmentForEdit();
    }
  }, [isEditing, fieldsReady, operatorsReady, campaignsReady]);

  useEffect(() => {
    if (listId) fetchCustomFields();
  }, [listId]);

  useEffect(() => {
    if (!listId) return;
    const loadCampaigns = async () => {
      try {
        const res = await fetch(
          `/api/get-all-campaigns?page_number=1&per_page=100&list_uid=${encodeURIComponent(listId)}&token=${token()}`
        );
        const data = await res.json();
        const records: any[] = data?.data?.records || data?.records || [];
        const mapped: CampaignOption[] = records.map((r: any) => ({
          uid: String(r.campaign_uid || r.campaign_id || r.id),
          name: r.name || r.campaign_uid,
        }));
        setListCampaigns(mapped);
      } catch (e) {
        console.error("Failed to load campaigns", e);
      } finally {
        setCampaignsReady(true);
      }
    };
    loadCampaigns();
  }, [listId]);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const res = await fetch(`/api/get-segment-conditions`, {
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        const ops =
          data?.data?.data?.operators ||
          data?.data?.operators ||
          data?.operators ||
          [];
        const mapped: OperatorOption[] = ops
          .map((o: any) => ({
            operator_id: String(o?.operator_id || o?.id || ""),
            name: o?.name || o?.label || "",
          }))
          .filter((o: OperatorOption) => !!o.operator_id);
        if (mapped.length > 0) setOperators(mapped);
      } catch (e) {
        console.error("Failed to fetch operators", e);
      } finally {
        setOperatorsReady(true);
      }
    };
    fetchConditions();
  }, []);

  // Fetch segment data from API using get-one-segment
const fetchSegmentForEdit = async () => {
  if (!segmentId) return;
  setFetchingSegment(true);
  try {
    const res = await fetch(
      `/api/get-one-segment?segment_uid=${encodeURIComponent(segmentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    

    if (!res.ok) {
      console.error("Failed to fetch segment:", data?.message);
      return;
    }

    const segment =
      data?.data?.data?.record ||
      data?.data?.record ||
      data?.record ||
      data?.data ||
      null;

    if (!segment) {
      console.error("No segment record found in response");
      return;
    }

    setSegmentName(segment.name || "");
    setOperatorMatch(segment.operator_match || "any");

    // Conditions is a JSON object with field_conditions and campaign_conditions
    const conditionsObj = typeof segment.conditions === 'string' ? JSON.parse(segment.conditions) : (segment.conditions || {});
    
    const fieldConditions = conditionsObj.field_conditions || segment.field_conditions || [];
    const campConditions = conditionsObj.campaign_conditions || segment.campaign_conditions || [];

    if (fieldConditions.length > 0) {
      setCustomFieldConditions(
        fieldConditions.map((c: any) => ({
          id: Date.now().toString() + Math.random(),
          field: String(c.field_id || ""),
          operator: String(c.operator_id || ""),
          value: c.value || "",
        }))
      );
    } else {
      setCustomFieldConditions([
        {
          id: Date.now().toString(),
          field: String(segment.field_id || ""),
          operator: String(segment.operator_id || ""),
          value: segment.value || "",
        },
      ]);
    }

    if (campConditions.length > 0) {
      setCampaignConditions(
        campConditions.map((c: any) => ({
          id: Date.now().toString() + Math.random(),
          campaignAction: c.action || "",
          campaign: String(c.campaign_id || ""),
          comparison: c.time_comparison_operator || "",
          timeValue: String(c.time_value || ""),
          timeUnit: c.time_unit || "",
        }))
      );
    } else {
      setCampaignConditions([
        {
          id: Date.now().toString(),
          campaignAction: segment.action || "",
          campaign: String(segment.campaign_id || ""),
          comparison: segment.time_comparison_operator || "",
          timeValue: String(segment.time_value || ""),
          timeUnit: segment.time_unit || "",
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching segment for edit:", error);
  } finally {
    setFetchingSegment(false);
  }
};

  const fetchCustomFields = async () => {
    setFetchingFields(true);
    try {
      const url = new URL("/api/get-all-fields", window.location.origin);
      url.searchParams.append("list_uid", listId);
      url.searchParams.append("token", token());
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json", "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const records: any[] =
        data?.data?.data?.records || data?.data?.records || data?.records || [];
      const mapped: CustomFieldOption[] = records
        .map((f: any) => ({
          field_id: String(f?.field_id || f?.id || ""),
          label: f?.label || f?.tag || "Unnamed Field",
        }))
        .filter((f: CustomFieldOption) => !!f.field_id);
      setCustomFields(
        mapped.length > 0
          ? mapped
          : [
              { field_id: "EMAIL", label: "Email" },
              { field_id: "FNAME", label: "First name" },
              { field_id: "LNAME", label: "Last name" },
            ]
      );
    } catch {
      setCustomFields([
        { field_id: "EMAIL", label: "Email" },
        { field_id: "FNAME", label: "First name" },
        { field_id: "LNAME", label: "Last name" },
      ]);
    } finally {
      setFetchingFields(false);
      setFieldsReady(true);
    }
  };

  const handleCancel = () => router.push(`/lists/${listId}/segment`);

  const addCustomFieldCondition = () => {
    setCustomFieldConditions([
      ...customFieldConditions,
      { id: Date.now().toString(), field: "", operator: "", value: "" },
    ]);
  };

  const addCampaignCondition = () => {
    setCampaignConditions([
      ...campaignConditions,
      { id: Date.now().toString(), campaignAction: "", campaign: "", comparison: "", timeValue: "", timeUnit: "" },
    ]);
  };

  const removeCustomFieldCondition = (id: string) => {
    setCustomFieldConditions(customFieldConditions.filter((c) => c.id !== id));
  };

  const removeCampaignCondition = (id: string) => {
    setCampaignConditions(campaignConditions.filter((c) => c.id !== id));
  };

  const updateCustomFieldCondition = (id: string, field: keyof CustomFieldCondition, value: string) => {
    setCustomFieldConditions(customFieldConditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const updateCampaignCondition = (id: string, field: keyof CampaignCondition, value: string) => {
    setCampaignConditions(campaignConditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleSaveChanges = async () => {
    if (!segmentName.trim()) {
      toast({ title: "Validation Error", description: "Please enter a segment name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payloadConditions = {
        field_conditions: customFieldConditions.map((c) => ({
          field_id: c.field,
          operator_id: c.operator,
          value: c.value,
        })).filter((c) => c.field_id),
        campaign_conditions: campaignConditions.map((c) => ({
          action: c.campaignAction,
          campaign_id: c.campaign,
          time_comparison_operator: c.comparison,
          time_value: c.timeValue,
          time_unit: c.timeUnit,
        })).filter((c) => c.action && c.campaign_id),
      };

      if (isEditing) {
        const res = await fetch(`/api/update-segment`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            list_uid: listId,
            segment_uid: segmentId,
            name: segmentName,
            operator_match: operatorMatch,
            conditions: payloadConditions,
          }),
        });

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

        if (!res.ok) {
          toast({ title: "Error", description: data?.message || "Failed to update segment", variant: "destructive" });
          return;
        }

        toast({ title: "Success", description: "Segment updated successfully!" });
        router.push(`/lists/${listId}/segment`);

      } else {
        if (campaignConditions.length === 0) {
          toast({ title: "Validation Error", description: "Please add at least one campaign condition", variant: "destructive" });
          return;
        }
        const condition = campaignConditions[0];
        if (!condition.campaign || !condition.campaignAction || !condition.comparison) {
          toast({ title: "Validation Error", description: "Please fill out Campaign action, Campaign, and Comparison for all campaign conditions.", variant: "destructive" });
          return;
        }

        const res = await fetch(`/api/create-segment`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            list_uid: listId,
            name: segmentName,
            operator_match: operatorMatch,
            conditions: payloadConditions,
          }),
        });

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

        if (!res.ok) {
          toast({ title: "Error", description: data?.message || "Failed to create segment", variant: "destructive" });
          return;
        }

        toast({ title: "Success", description: "Segment created successfully!" });
        router.push(`/lists/${listId}/segment`);
      }
    } catch (error) {
      console.error("Error saving segment:", error);
      toast({ title: "Error", description: "Error saving segment. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const valueTags = [
    { tag: "[EMPTY]", description: "It will be transformed into an empty value" },
    { tag: "[DATETIME]", description: "It will be transformed into the current date time in the format of Y-m-d H:i:s" },
    { tag: "[DATE]", description: "It will be transformed into the current date in the format of Y-m-d" },
    { tag: "[PAST_DAYS_X]", description: "It will rewind the current date by X days" },
    { tag: "[FUTURE_DAYS_X]", description: "It will forward the current date by X days" },
    { tag: "[BIRTHDAY]", description: "It requires the birthday custom field value to be in the format of Y-m-d" },
    { tag: "[BIRTHDAY_FUTURE_DAYS_X]", description: "It will forward the birthday by X days relative to the current date" },
  ];

  if (fetchingSegment) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block"><SidebarNav /></div>
        <div className="wraper w-full">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block"><SidebarNav /></div>
      <div className="wraper w-full">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 dark:text-gray-300 text-gray-700" />
                    <h1 className="text-xl font-semibold dark:text-gray-100 text-gray-900">
                      {isEditing ? "Edit list segment" : "Create a new list segment"}
                    </h1>
                  </div>
                  <Button onClick={handleCancel} className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium dark:text-gray-300 text-gray-700">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Name"
                          value={segmentName}
                          onChange={(e) => setSegmentName(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-800 border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operator" className="text-sm font-medium dark:text-gray-300 text-gray-700">
                          Operator match <span className="text-red-500">*</span>
                        </Label>
                        <Select value={operatorMatch} onValueChange={setOperatorMatch}>
                          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">any</SelectItem>
                            <SelectItem value="all">all</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-sm dark:text-gray-400 text-gray-700">
                          Conditions that apply to your list custom fields:
                        </span>
                        <div className="flex items-center gap-1 sm:ml-auto">
                          <Button onClick={addCustomFieldCondition} size="icon" className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Dialog open={showValueTagsModal} onOpenChange={setShowValueTagsModal}>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-500 hover:bg-blue-50">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Available value tags</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-blue-500 text-white p-3 rounded-lg text-sm">
                                  Following tags can be used as dynamic values.
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-4 text-sm font-medium dark:text-gray-400 text-gray-700 border-b pb-2">
                                    <div>Tag</div>
                                    <div className="lg:col-span-2">Description</div>
                                  </div>
                                  {valueTags.map((item, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100">
                                      <div className="font-mono text-blue-600">{item.tag}</div>
                                      <div className="col-span-2 dark:text-gray-400 text-gray-600">{item.description}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                  <Button onClick={() => setShowValueTagsModal(false)} variant="outline">Close</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {customFieldConditions.map((condition) => (
                        <div key={condition.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg items-end">
                          <div className="lg:col-span-3">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Field <span className="text-red-500">*</span></Label>
                            <Select value={condition.field} onValueChange={(v) => updateCustomFieldCondition(condition.id, "field", v)}>
                              <SelectTrigger>
                                <SelectValue placeholder={fetchingFields ? "Loading..." : "Select field"} />
                              </SelectTrigger>
                              <SelectContent>
                                {customFields.map((f) => (
                                  <SelectItem key={f.field_id} value={f.field_id}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-3">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Operator <span className="text-red-500">*</span></Label>
                            <Select value={condition.operator} onValueChange={(v) => updateCustomFieldCondition(condition.id, "operator", v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.length > 0 ? (
                                  operators.map((o) => (
                                    <SelectItem key={o.operator_id} value={o.operator_id}>{o.name}</SelectItem>
                                  ))
                                ) : (
                                  <>
                                    <SelectItem value="1">is</SelectItem>
                                    <SelectItem value="2">is not</SelectItem>
                                    <SelectItem value="3">contains</SelectItem>
                                    <SelectItem value="4">not contains</SelectItem>
                                    <SelectItem value="5">starts with</SelectItem>
                                    <SelectItem value="6">ends with</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-5">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Value <span className="text-red-500">*</span></Label>
                            <Input placeholder="Value" value={condition.value} onChange={(e) => updateCustomFieldCondition(condition.id, "value", e.target.value)} />
                          </div>
                          <div className="lg:col-span-1">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Action</Label>
                            <Button onClick={() => removeCustomFieldCondition(condition.id)} size="icon" className="w-full h-10 bg-red-500 hover:bg-red-600 text-white">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-sm dark:text-gray-300 text-gray-700">
                          Conditions that apply to the campaigns sent to the list this segment belongs to:
                        </span>
                        <div className="flex items-center gap-1 sm:ml-auto">
                          <Button onClick={addCampaignCondition} size="icon" className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {campaignConditions.map((condition) => (
                        <div key={condition.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 p-4 dark:bg-gray-900 bg-gray-50 rounded-lg items-end">
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Campaign action <span className="text-red-500">*</span></Label>
                            <Select value={condition.campaignAction} onValueChange={(v) => updateCampaignCondition(condition.id, "campaignAction", v)}>
                              <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="click">Click</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Campaign <span className="text-red-500">*</span></Label>
                            {listCampaigns.length > 0 ? (
                              <Select value={condition.campaign} onValueChange={(v) => updateCampaignCondition(condition.id, "campaign", v)}>
                                <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                                <SelectContent>
                                  {listCampaigns.map((c) => (
                                    <SelectItem key={c.uid} value={c.uid}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="mt-1 p-2 text-xs text-gray-500 border rounded bg-gray-100 dark:bg-gray-800">
                                No campaigns found
                              </div>
                            )}
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Comparison <span className="text-red-500">*</span></Label>
                            <Select value={condition.comparison} onValueChange={(v) => updateCampaignCondition(condition.id, "comparison", v)}>
                              <SelectTrigger><SelectValue placeholder="Select comparison" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lte">Less than or equal</SelectItem>
                                <SelectItem value="lt">Less than</SelectItem>
                                <SelectItem value="gte">Greater than or equal</SelectItem>
                                <SelectItem value="gt">Greater than</SelectItem>
                                <SelectItem value="eq">Equal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Time value</Label>
                            <Input placeholder="80" value={condition.timeValue} onChange={(e) => updateCampaignCondition(condition.id, "timeValue", e.target.value)} />
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Time unit</Label>
                            <Select value={condition.timeUnit} onValueChange={(v) => updateCampaignCondition(condition.id, "timeUnit", v)}>
                              <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">Day(s)</SelectItem>
                                <SelectItem value="month">Month(s)</SelectItem>
                                <SelectItem value="year">Year(s)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="lg:col-span-2">
                            <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">Action</Label>
                            <Button onClick={() => removeCampaignCondition(condition.id)} size="icon" className="w-full h-10 bg-red-500 hover:bg-red-600 text-white">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button onClick={handleSaveChanges} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
                        {loading
                          ? isEditing ? "Updating..." : "Saving..."
                          : isEditing ? "Update changes" : "Save changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}