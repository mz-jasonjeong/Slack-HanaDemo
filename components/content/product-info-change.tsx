"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileEdit, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProductInfoChange() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product_info_change",
          title,
          content,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message Sent to Slack!",
        })
        setTitle("")
        setContent("")
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
            <FileEdit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>상품정보 중 중요사항 변경</CardTitle>
            <CardDescription></CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Enter content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSend} disabled={!title.trim() || !content.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
