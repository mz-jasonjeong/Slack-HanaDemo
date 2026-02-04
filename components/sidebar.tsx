"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { MenuItem } from "@/components/dashboard-view"
import { Bell, FileEdit, Send, Calendar, FileText, FilePlus } from "lucide-react"

interface SidebarProps {
  selectedMenu: MenuItem
  onMenuSelect: (menu: MenuItem) => void
}

const menuItems: { id: MenuItem; label: string; labelKr: string; icon: React.ElementType }[] = [
  { id: "bulk-notification", label: "일괄공지", labelKr: "일괄공지", icon: Bell },
  { id: "product-info-change", label: "상품정보 변경", labelKr: "상품 주요 내용이 변경된 경우", icon: FileEdit },
  { id: "approval-arrival-send", label: "전자결재 도착 발송", labelKr: "전자결재 도착시 메시지 발송", icon: Send },
  { id: "vacation-application", label: "휴가상태 적용", labelKr: "Slack의 휴가상태 적용", icon: Calendar },
  { id: "quote-request", label: "견적 요청 등록", labelKr: "대리점 견적 요청 접수", icon: FilePlus },
  { id: "quote-registration", label: "견적등록", labelKr: "대리점에서 견적등록", icon: FileText },
]

export function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border shrink-0">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isSelected = selectedMenu === item.id
          return (
            <button
              key={item.id}
              onClick={() => onMenuSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                isSelected
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs opacity-70">{item.labelKr}</span>
              </div>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
