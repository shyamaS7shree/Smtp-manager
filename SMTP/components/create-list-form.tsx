"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateListFormProps {
  isEditing?: boolean
  listId?: string
}

export default function CreateListForm({ isEditing = false, listId }: CreateListFormProps) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="p-4 sm:p-6">
        <h1 className="mb-4 sm:mb-6 text-xl font-semibold text-foreground">
          {isEditing ? `Edit list ${listId}` : "Create new list"}
        </h1>

        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <div className="mb-6 overflow-x-auto">
            <TabsList className="grid w-max min-w-full auto-cols-fr grid-flow-col">
              <TabsTrigger value="general" className={activeTab === "general" ? "border-b-2 border-blue-500" : ""}>
                General Data
              </TabsTrigger>
              <TabsTrigger value="default" className={activeTab === "default" ? "border-b-2 border-blue-500" : ""}>
                Default
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className={activeTab === "notifications" ? "border-b-2 border-blue-500" : ""}
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className={activeTab === "subscribers" ? "border-b-2 border-blue-500" : ""}
              >
                Subscribers Action
              </TabsTrigger>
              <TabsTrigger value="company" className={activeTab === "company" ? "border-b-2 border-blue-500" : ""}>
                Company Details
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general">
            <div className="space-y-6">
              <h2 className="text-base font-medium text-foreground">General Data</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Name*
                  </label>
                  <Input
                    id="name"
                    placeholder="List name i.e. Newsletter Subscribers"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Newsletter Subscribers" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                    Display name*
                  </label>
                  <Input
                    id="displayName"
                    placeholder="Display name"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Newsletter" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description*
                </label>
                <Textarea
                  id="description"
                  placeholder="List short description, something your subscribers will understand."
                  className="min-h-[80px] border-input bg-background"
                  defaultValue={isEditing ? "Our main newsletter subscribers list" : ""}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="optionIn" className="text-sm font-medium text-foreground">
                    Option in*
                  </label>
                  <Select defaultValue="double">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="double">Double option-in</SelectItem>
                      <SelectItem value="single">Single option-in</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="doubleOptConfirmation" className="text-sm font-medium text-foreground">
                    Double optin confirmation
                  </label>
                  <Select defaultValue="no">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="optOut" className="text-sm font-medium text-foreground">
                    Opt out*
                  </label>
                  <Select defaultValue="single">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single option-out</SelectItem>
                      <SelectItem value="double">Double option-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="doubleOptOut" className="text-sm font-medium text-foreground">
                    Double opt-out
                  </label>
                  <Select defaultValue="no">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="subNotFoundRedirect" className="text-sm font-medium text-foreground">
                    Sub not found redirect
                  </label>
                  <Input
                    id="subNotFoundRedirect"
                    placeholder="http://domain.com/page"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "http://example.com/not-found" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subExistRedirect" className="text-sm font-medium text-foreground">
                    Sub exist redirect
                  </label>
                  <Input
                    id="subExistRedirect"
                    placeholder="http://domain.com/page"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "http://example.com/already-subscribed" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="subRequireApproval" className="text-sm font-medium text-foreground">
                    Sub require approval
                  </label>
                  <Select defaultValue="no">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="default">
            <div className="space-y-6">
              <h2 className="text-base font-medium text-foreground">Defaults</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fromName" className="text-sm font-medium text-foreground">
                    From name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fromName"
                    placeholder="krish nendu"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Krish Nendu" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fromEmail" className="text-sm font-medium text-foreground">
                    From email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fromEmail"
                    placeholder="krish@official.com"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "krish@official.com" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="replyTo" className="text-sm font-medium text-foreground">
                    Reply to <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="replyTo"
                    placeholder="krish@official.com"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "support@official.com" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="Weekly newsletter"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Weekly newsletter" : ""}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              <h2 className="text-base font-medium text-foreground">Notifications</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="subscribe" className="text-sm font-medium text-foreground">
                    Subscribe <span className="text-red-500">*</span>
                  </label>
                  <Select defaultValue="no">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="No" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="unsubscribe" className="text-sm font-medium text-foreground">
                    Unsubscribe <span className="text-red-500">*</span>
                  </label>
                  <Select defaultValue="no">
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="No" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subscribeTo" className="text-sm font-medium text-foreground">
                    Subscribe to
                  </label>
                  <Input
                    id="subscribeTo"
                    placeholder="me@mydomain.com"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "notifications@official.com" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="unsubscribeTo" className="text-sm font-medium text-foreground">
                    Unsubscribe to
                  </label>
                  <Input
                    id="unsubscribeTo"
                    placeholder="me@mydomain.com"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "notifications@official.com" : ""}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="space-y-6">
              <h2 className="text-base font-medium text-foreground">Subscriber Actions</h2>

              <div className="flex border-b">
                <button className="px-4 py-2 border-b-2 border-blue-500 font-medium">Actions when subscribe</button>
                <button className="px-4 py-2 text-gray-600">Actions when unsubscribe</button>
              </div>

              <div className="rounded-md bg-blue-50 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                <p className="text-sm">
                  When a subscriber will subscribe to this list, if they exists in any of the lists below, unsubscribe
                  them from those lists as well. Please note that the unsubscribe from the lists below is silent, no
                  email is sent to the subscriber.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select all</label>
                <Select defaultValue="select">
                  <SelectTrigger className="border-input bg-background">
                    <SelectValue placeholder="Select all" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select all</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="space-y-6">
              <h2 className="text-base font-medium text-foreground">
                Company details <span className="text-sm text-gray-500">(defaults to account company)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="companyName"
                    placeholder="Name"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "SMTP Master Inc." : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="typeIndustry" className="text-sm font-medium text-foreground">
                    Type/Industry
                  </label>
                  <Select defaultValue={isEditing ? "tech" : undefined}>
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium text-foreground">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select defaultValue={isEditing ? "us" : undefined}>
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="zone" className="text-sm font-medium text-foreground">
                    Zone
                  </label>
                  <Select defaultValue={isEditing ? "west" : undefined}>
                    <SelectTrigger className="border-input bg-background">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="address1" className="text-sm font-medium text-foreground">
                    Address 1 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="address1"
                    placeholder="Address 1"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "123 Tech Avenue" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address2" className="text-sm font-medium text-foreground">
                    Address 2
                  </label>
                  <Input
                    id="address2"
                    placeholder="Address 2"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Suite 500" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <label htmlFor="zoneName" className="text-sm font-medium text-foreground">
                    Zone name
                  </label>
                  <Input
                    id="zoneName"
                    placeholder="Zone name"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "Silicon Valley" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-foreground">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "San Francisco" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="zipCode" className="text-sm font-medium text-foreground">
                    Zip code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="zipCode"
                    placeholder="Zip code"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "94105" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    placeholder="Phone"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "415-555-1234" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-foreground">
                    Website
                  </label>
                  <Input
                    id="website"
                    placeholder="Website"
                    className="border-input bg-background"
                    defaultValue={isEditing ? "" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="addressFormat" className="text-sm font-medium text-foreground">
                  Address format <span className="text-red-500">*</span>{" "}
                  <span className="text-blue-500">[Available tags]</span>
                </label>
                <Textarea
                  id="addressFormat"
                  className="min-h-[120px] border-input bg-background font-mono"
                  defaultValue={`[COMPANY_NAME]
[COMPANY_ADDRESS_1] [COMPANY_ADDRESS_2]
[COMPANY_CITY] [COMPANY_ZONE] [COMPANY_ZIP]
[COMPANY_COUNTRY]
[COMPANY_WEBSITE]`}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">{isEditing ? "Update" : "Save"}</Button>
        </div>
      </div>
    </div>
  )
}
