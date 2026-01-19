"use client"

import { useState } from "react"
import { LoginView } from "@/components/login-view"
import { DashboardView } from "@/components/dashboard-view"
import { AuthProvider } from "@/contexts/auth-context"

export default function Home() {
  const [currentView, setCurrentView] = useState<"login" | "dashboard">("login")
  const [selectedAgency, setSelectedAgency] = useState<string>("")

  const handleLogin = (agencyName: string) => {
    setSelectedAgency(agencyName)
    setCurrentView("dashboard")
  }

  const handleLogout = () => {
    setSelectedAgency("")
    setCurrentView("login")
  }

  if (currentView === "login") {
    return <LoginView onLogin={handleLogin} />
  }

  // return <DashboardView agencyName={selectedAgency} onLogout={handleLogout} />
  return (
    <AuthProvider agencyName={selectedAgency}>
      <DashboardView agencyName={selectedAgency} onLogout={handleLogout} />
    </AuthProvider>
  )
}
