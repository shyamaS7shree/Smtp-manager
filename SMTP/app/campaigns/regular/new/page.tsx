"use client"

import Link from "next/link"
import { useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegularCampaignCreatePage() {
  const [step, setStep] = useState<"details" | "setup">("details")

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav />
      </div>

      {/* Mobile Sidebar */}

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-4">
          {step === "details" ? (
            <Details onNext={() => setStep("setup")} />
          ) : (
            <Setup onBack={() => setStep("details")} />
          )}
        </div>
      </div>
    </div>
  )
}

function StepsBar({ active, showDone }: { active: "details" | "setup"; showDone?: boolean }) {
  const base = "px-3 py-1 rounded-md text-xs border"
  const activeCls = "bg-sky-50 border-sky-200 text-sky-700"
  const idle = "bg-muted border-transparent text-muted-foreground"
  const items = ["Details", "Setup", "Template", "Confirmation" + (showDone ? "" : "")] as const

  return (
    <div className="flex items-center gap-2">
      <span className={`${base} ${active === "details" ? activeCls : idle}`}>Details</span>
      <span className={`${base} ${active === "setup" ? activeCls : idle}`}>Setup</span>
      <span className={`${base} ${idle}`}>Template</span>
      <span className={`${base} ${idle}`}>Confirmation</span>
      {showDone ? <span className={`${base} ${idle}`}>Done</span> : null}
    </div>
  )
}

function Details({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Create new campaign</CardTitle>
        <Button asChild variant="secondary" className="bg-sky-500 text-white hover:bg-sky-600">
          <Link href="/campaigns/regular">Cancel</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Two-column form to match screenshot 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">Campaign name</Label>
            <Input placeholder="I.E: Weekly digest subscribers" />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select defaultValue="regular" disabled>
              <SelectTrigger>
                <SelectValue placeholder="Regular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">List</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list-1">List 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Segment</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="segment-1">Segment 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group-1">Group 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Send group</Label>
            <Input placeholder="Start typing..." />
          </div>
        </div>

        {/* Footer with steps and CTA */}
        <div className="mt-6 flex items-center justify-between">
          <StepsBar active="details" />
          <Button onClick={onNext} className="bg-sky-500 text-white hover:bg-sky-600">
            Save and next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Setup({ onBack }: { onBack: () => void }) {
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Campaign setup</CardTitle>
        <Button asChild variant="secondary" className="bg-sky-500 text-white hover:bg-sky-600">
          <Link href="/campaigns/regular">Cancel</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sender + subject section to match screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>
              From name <span className="text-xs text-muted-foreground">[Available tags]</span>
            </Label>
            <Input placeholder="Krish" />
          </div>
          <div className="space-y-2">
            <Label>Reply to</Label>
            <Input placeholder="official.krishnendu@gmail.com" />
          </div>
          <div className="space-y-2">
            <Label>From email</Label>
            <Input placeholder="official.krishnendu@gmail.com" />
          </div>
          <div className="space-y-2">
            <Label>
              To name <span className="text-xs text-muted-foreground">[Available tags]</span>
            </Label>
            <Input placeholder="[EMAIL]" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>
              Subject <span className="text-xs text-muted-foreground">[Available tags] [Toggle emoji list]</span>
            </Label>
            <Input placeholder="Hello!" />
          </div>
        </div>

        {/* Campaign options */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Campaign options</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Embed images</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plain text email</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue placeholder="Yes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tracking domain</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain-1">Domain 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max. subscribers</Label>
              <Input placeholder="0" />
            </div>

            <div className="space-y-2">
              <Label>Randomize subscribers</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email stats delay days</Label>
              <Input placeholder="0" />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Email stats</Label>
              <Input placeholder="Email stats" />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Preheader</Label>
              <Input placeholder="Preheader" />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Forward friend subject</Label>
              <Input placeholder="Forward friend subject" />
            </div>
          </div>
        </div>

        {/* Campaign tracking options */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="font-medium">Campaign tracking options</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Open tracking</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue placeholder="Yes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Url tracking</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue placeholder="Yes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Open tracking from url tracking</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue placeholder="Yes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Open tracking - Exclude crawlers</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Url tracking - Exclude crawlers</Label>
              <Select defaultValue="no">
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Button variant="outline" className="border-sky-500 text-sky-700 hover:bg-sky-50 bg-transparent">
            Show more options
          </Button>
          <div className="flex items-center gap-3">
            <StepsBar active="setup" showDone />
            <Button className="bg-sky-500 text-white hover:bg-sky-600">Save and next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
