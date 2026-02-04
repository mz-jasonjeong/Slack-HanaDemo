"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

interface LoginViewProps {
  onLogin: (agencyName: string) => void
}

export function LoginView({ onLogin }: LoginViewProps) {
  const agencies = ["동아여행사", "MyTrip", "기가여행사"]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">여행사 견적 포탈</CardTitle>
          <p className="text-muted-foreground text-sm"></p>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {agencies.map((agency) => (
            <Button
              key={agency}
              variant="outline"
              className="w-full h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              onClick={() => onLogin(agency)}
            >
              {agency}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
