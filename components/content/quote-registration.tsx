"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function QuoteRegistration() {
  const [formData, setFormData] = useState({
    accommodationCost: "",
    airfare: "",
    foodCost: "",
    details: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const total =
      (Number(formData.accommodationCost) || 0) + (Number(formData.airfare) || 0) + (Number(formData.foodCost) || 0)

    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote_registration",
          accommodationCost: formData.accommodationCost,
          airfare: formData.airfare,
          foodCost: formData.foodCost,
          total,
          details: formData.details,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message Sent to Slack!",
        })
        setFormData({ accommodationCost: "", airfare: "", foodCost: "", details: "" })
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

  const isFormValid = formData.accommodationCost || formData.airfare || formData.foodCost

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Quote Registration</CardTitle>
            <CardDescription>견적등록 - Register a new travel quote</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="accommodation">Accommodation Cost</Label>
            <Input
              id="accommodation"
              type="number"
              placeholder="0"
              value={formData.accommodationCost}
              onChange={(e) => handleChange("accommodationCost", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airfare">Airfare</Label>
            <Input
              id="airfare"
              type="number"
              placeholder="0"
              value={formData.airfare}
              onChange={(e) => handleChange("airfare", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="food">Food Cost</Label>
            <Input
              id="food"
              type="number"
              placeholder="0"
              value={formData.foodCost}
              onChange={(e) => handleChange("foodCost", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="details">Details</Label>
          <Textarea
            id="details"
            placeholder="Enter additional details about the quote..."
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Submit Quote"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
