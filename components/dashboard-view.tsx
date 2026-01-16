"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { BulkNotification } from "@/components/content/bulk-notification"
import { ProductInfoChange } from "@/components/content/product-info-change"
import { ApprovalArrivalSend } from "@/components/content/approval-arrival-send"
import { VacationApplication } from "@/components/content/vacation-application"
import { QuoteRegistration } from "@/components/content/quote-registration"
import { LogOut, Building2 } from "lucide-react"

interface DashboardViewProps {
  agencyName: string
  onLogout: () => void
}

export type MenuItem =
  | "bulk-notification"
  | "product-info-change"
  | "approval-arrival-send"
  | "vacation-application"
  | "quote-registration"

export function DashboardView({ agencyName, onLogout }: DashboardViewProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>("bulk-notification")

  const renderContent = () => {
    switch (selectedMenu) {
      case "bulk-notification":
        return <BulkNotification />
      case "product-info-change":
        return <ProductInfoChange />
      case "approval-arrival-send":
        return <ApprovalArrivalSend />
      case "vacation-application":
        return <VacationApplication />
      case "quote-registration":
        return <QuoteRegistration />
      default:
        return <BulkNotification />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-sidebar-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">{agencyName}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
