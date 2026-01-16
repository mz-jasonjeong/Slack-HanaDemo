"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ApprovalArrivalSend() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "approval_arrival",
          message: "Electronic approval document has arrived and requires attention.",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message Sent to Slack!",
        })
      } else {
        throw new Error("Failed to send")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send",
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
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>결재문서 도착 알림</CardTitle>
            <CardDescription></CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          결재가 필요한 문서가 도착하면 Slack로 알림을 보냅니다.
          아래 버튼을 클릭하면 Demo-Bot를 통하여 문서 도착 알림을 받을 수 있습니다.
        </p>
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Approval Arrival"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
