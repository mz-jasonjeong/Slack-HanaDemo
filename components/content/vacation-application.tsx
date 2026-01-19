"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VacationApplication() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleApply = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vacation_application",
          message: "Vacation application submitted for approval.",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "휴가상태 적용 완료",
        })
      } else {
        throw new Error("Failed to send")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "휴가상태 적용 오류",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>휴가 적용</CardTitle>
            <CardDescription></CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          버튼을 클릭하면 Slack의 상태 메시지가 휴가중으로 설정됩니다.
        </p>
        <Button onClick={handleApply} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Apply for Vacation"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
