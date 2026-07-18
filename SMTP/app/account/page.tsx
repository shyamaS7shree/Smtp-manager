"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/common/header";
import SidebarNav from "@/components/sidebar-nav";
import { useRouter } from "next/navigation";
import { User, Save, Upload, Briefcase, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    timezone: "(GMT+05:30) Asia/Kolkata",
    language: "Application default",
    birthDate: "",
    phone: "",
  });

  const [companyData, setCompanyData] = useState({
    name: "",
    website: "",
    country: "",
    zone: "",
    address: "",
    address2: "",
    zoneName: "",
    city: "",
    zipCode: "",
    phone: "",
    fax: "",
    typeIndustry: "",
    vatNumber: ""
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [countryZone, setCountryZone] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("userSession");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);

    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user`, { headers: { 'Authorization': `Bearer ${session.token}` }});
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const d = json.data;
          setFormData(prev => ({
            ...prev,
            firstName: d.first_name || d.name?.split(" ")[0] || "",
            lastName: d.last_name || d.name?.split(" ").slice(1).join(" ") || "",
            email: d.email || "",
            confirmEmail: d.email || "",
            timezone: d.timezone || "(GMT+05:30) Asia/Kolkata",
            language: d.language || "Application default",
            birthDate: d.birth_date ? new Date(d.birth_date).toISOString().split('T')[0] : "",
            phone: d.phone || "",
          }));
          setCompanyData(prev => ({
            ...prev,
            name: d.company_name || "",
            website: d.company_website || "",
            country: d.company_country || "",
            zone: d.company_zone || "",
            address: d.company_address || "",
            address2: d.company_address2 || "",
            zoneName: d.company_zone_name || "",
            city: d.company_city || "",
            zipCode: d.company_zip_code || "",
            phone: d.company_phone || "",
            fax: d.company_fax || "",
            typeIndustry: d.company_type_industry || "",
            vatNumber: d.company_vat_number || ""
          }));
          if (d.avatar_url) {
            setAvatar(d.avatar_url);
          }
        }
      } catch(e) {}
    };

    const fetchCountries = async () => {
      try {
        const res = await fetch(`/api/get-all-countries`, { headers: { 'Authorization': `Bearer ${session.token}` }});
        const json = await res.json();
        if (json.status === 'success') {
          setCountries(json.data.records || []);
        }
      } catch(e) {}
    };

    fetchUserData();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!companyData.country) return;
    const sessionStr = localStorage.getItem("userSession");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    
    const fetchZones = async () => {
      try {
        const url = new URL(`/api/get-country-zone/${companyData.country}`, window.location.origin);
        const res = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${session.token}` }});
        const json = await res.json();
        if (json.status === 'success') {
          setCountryZone(json.data.records || []);
        }
      } catch(e) {}
    };
    fetchZones();
  }, [companyData.country]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (activeTab === "profile") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (activeTab === "company") {
      setCompanyData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email !== formData.confirmEmail) {
      toast({ title: "Error", description: "Emails do not match", variant: "destructive" });
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    const sessionStr = localStorage.getItem("userSession");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);

    try {
      const res = await fetch(`/api/user`, {
        method: "PUT",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          timezone: formData.timezone,
          language: formData.language,
          birth_date: formData.birthDate,
          phone: formData.phone,
          avatar_url: avatar,
          company_name: companyData.name,
          company_website: companyData.website,
          company_country: companyData.country,
          company_zone: companyData.zone,
          company_address: companyData.address,
          company_address2: companyData.address2,
          company_zone_name: companyData.zoneName,
          company_city: companyData.city,
          company_zip_code: companyData.zipCode,
          company_phone: companyData.phone,
          company_fax: companyData.fax,
          company_type_industry: companyData.typeIndustry,
          company_vat_number: companyData.vatNumber
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        setSuccessMessage("Profile info successfully updated!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccessMessage(null), 2000);
        session.avatar = avatar;
        session.name = (formData.firstName + ' ' + formData.lastName).trim() || session.name;
        localStorage.setItem("userSession", JSON.stringify(session));
        window.dispatchEvent(new Event("storage"));
      } else {
        toast({ title: "Error", description: json.message || "Failed to update", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const handleExport = () => {
    // Generate CSV data
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Field,Value\n"
      + `First Name,${formData.firstName}\n`
      + `Last Name,${formData.lastName}\n`
      + `Email,${formData.email}\n`
      + `Timezone,${formData.timezone}\n`
      + `Language,${formData.language}\n`
      + `Birth Date,${formData.birthDate}\n`
      + `Phone,${formData.phone}\n`
      + `Company Name,${companyData.name}\n`
      + `Website,${companyData.website}\n`
      + `Country,${companyData.country}\n`
      + `Zone,${companyData.zone}\n`
      + `City,${companyData.city}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "account_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {successMessage && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-4 rounded-lg mb-6 flex justify-between items-center text-sm font-medium shadow-lg shadow-emerald-500/20 border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>{successMessage}</span>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="text-emerald-50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full leading-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200 px-4">
                <div className="flex space-x-6">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`py-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab("company")}
                    className={`py-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab === 'company' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Company
                  </button>
                  <button 
                    onClick={handleExport}
                    className={`py-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700`}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-6">
                {activeTab === "profile" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      
                      <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Confirm email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Timezone <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                      <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                      <option value="(GMT-05:00) Eastern Time (US & Canada)">(GMT-05:00) Eastern Time (US & Canada)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="Application default">Application default</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Birth date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-24 h-24 bg-blue-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      New avatar
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-300 rounded-md bg-gray-50"
                      />
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar(null)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 text-sm rounded-md text-sm font-medium transition-colors whitespace-nowrap border border-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
                )}

                {activeTab === "company" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={companyData.name}
                        onChange={handleChange}
                        required
                        placeholder="Name"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={companyData.website}
                        onChange={handleChange}
                        placeholder="Website"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={companyData.country}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      >
                        <option value="">Please select</option>
                        {countries.map((c: any, idx: number) => (
                          <option key={idx} value={c.country_id ?? ""}>{c.country_name || c.name || ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Zone
                      </label>
                      <select
                        name="zone"
                        value={companyData.zone}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      >
                        <option value="">Please select</option>
                        {countryZone.map((zone: any, idx: number) => (
                          <option key={idx} value={zone.zone_id ?? ""}>{zone.zone_name || zone.name || ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={companyData.address}
                        onChange={handleChange}
                        required
                        placeholder="Address"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Address 2
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={companyData.address2}
                        onChange={handleChange}
                        placeholder="Address 2"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Zone name
                      </label>
                      <input
                        type="text"
                        name="zoneName"
                        value={companyData.zoneName}
                        onChange={handleChange}
                        placeholder="Zone name"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={companyData.city}
                        onChange={handleChange}
                        required
                        placeholder="City"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Zip code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={companyData.zipCode}
                        onChange={handleChange}
                        required
                        placeholder="Zip code"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={companyData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Fax
                      </label>
                      <input
                        type="text"
                        name="fax"
                        value={companyData.fax}
                        onChange={handleChange}
                        placeholder="Fax"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Type/Industry
                      </label>
                      <select
                        name="typeIndustry"
                        value={companyData.typeIndustry}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      >
                        <option value="">Please select</option>
                        <option value="IT">IT & Software</option>
                        <option value="Finance">Finance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        name="vatNumber"
                        value={companyData.vatNumber}
                        onChange={handleChange}
                        placeholder="VAT Number"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "export" && (
                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <Download className="h-12 w-12 text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Export Your Data</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      Download a CSV file containing all your account profile and company information.
                    </p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); toast({title: "Export Started", description: "Your CSV file is being generated."}) }}
                      className="bg-[#0096ff] text-white hover:bg-blue-600 px-6 py-3 rounded-md font-medium transition-colors"
                    >
                      Export to CSV
                    </button>
                  </div>
                )}

                {activeTab !== "export" && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0096ff] text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      Save changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
