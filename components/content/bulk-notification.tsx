"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bell, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function BulkNotification() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bulk_notification",
          message,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message Sent to Slack!",
        })
        setMessage("")
      } else {
        console.log("=========================[Bulk Notification 페이지]=========================");
        console.log(response);
        console.log("=========================[Bulk Notification 페이지]=========================");
        throw new Error("Failed to send");
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
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>일괄 공지</CardTitle>
            <CardDescription>내용을 입력하면 채널을 생성, 자동으로 사용자를 초대합니다.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">공지내용 입력</Label>
          <Textarea
            id="message"
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Notification"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
