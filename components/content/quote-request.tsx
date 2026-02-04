"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FilePlus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function QuoteRequest() {
  const { agencyName } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/slack/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          title: formData.title,
          content: formData.content,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Quote request registered! Channel: ${data.channelName}`,
        })
        setFormData({ title: "", content: "" })
      } else {
        throw new Error(data.error || "Failed to send")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim()

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FilePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>견적 요청 등록</CardTitle>
            <CardDescription>대리점이 사용할 견적 요청 항목을 생성</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">요청 제목</Label>
          <Input
            id="title"
            placeholder="예: A회사 팀워크샵 견적요청"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">요청 내용</Label>
          <Textarea
            id="content"
            placeholder="예: 인원 10명, 장소 베트남, 일정 3박 4일..."
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            rows={6}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Quote Request"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
