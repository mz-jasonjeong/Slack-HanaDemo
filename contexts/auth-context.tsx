"use client"

import { createContext, useContext, type ReactNode } from "react"

interface AuthContextType {
  agencyName: string
}

const AuthContext = createContext<AuthContextType>({ agencyName: "" })

export function AuthProvider({
  children,
  agencyName,
}: {
  children: ReactNode
  agencyName: string
}) {
  return (
    <AuthContext.Provider value={{ agencyName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
