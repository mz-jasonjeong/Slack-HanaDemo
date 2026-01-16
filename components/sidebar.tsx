"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { MenuItem } from "@/components/dashboard-view"
import { Bell, FileEdit, Send, Calendar, FileText } from "lucide-react"

interface SidebarProps {
  selectedMenu: MenuItem
  onMenuSelect: (menu: MenuItem) => void
}

const menuItems: { id: MenuItem; label: string; labelKr: string; icon: React.ElementType }[] = [
  { id: "bulk-notification", label: "일괄 공지", labelKr: "채널 생성 및 일괄 공지를 진행합니다.", icon: Bell },
  { id: "product-info-change", label: "중요 상품 변경", labelKr: "중요한 변경 내용에 대한 알림을 발송합니다.", icon: FileEdit },
  { id: "approval-arrival-send", label: "전자결재 도착", labelKr: "결재가 필요한 문서가 도착하면 수신되는 알림", icon: Send },
  { id: "vacation-application", label: "휴가 적용", labelKr: "Slack 사용자 상태를 휴가중으로 설정", icon: Calendar },
  { id: "quote-registration", label: "견적 등록", labelKr: "견적을 등록합니다", icon: FileText },
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
