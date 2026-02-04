"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface QuoteProduct {
  channelId: string
  channelName: string
  title: string
  agencyName: string
  content?: string
}

interface QuoteItem {
  name: string
  desc: string
}

export function QuoteRegistration() {
  const { agencyName } = useAuth()
  const [formData, setFormData] = useState({
    product: "",
    accommodationCost: "",
    airfare: "",
    foodCost: "",
    details: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [quoteProducts, setQuoteProducts] = useState<QuoteItem[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const { toast } = useToast()

  // Fetch quote products from Slack List
  const fetchQuoteProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch("/api/slack/quote-list")
      const data = await response.json()
      if (response.ok && data.quotes) {
        setQuoteProducts(data.quotes)
      }
    } catch (error) {
      console.error("Failed to fetch quote products:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchQuoteProducts()
  }, [])

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
          agencyName,
          product: formData.product,
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
        setFormData({ product: "", accommodationCost: "", airfare: "", foodCost: "", details: "" })
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
            <CardTitle>견적등록</CardTitle>
            <CardDescription>대리점에서 견적상품을 선택 후 견적을 입력</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="product">견적상품</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchQuoteProducts}
              disabled={isLoadingProducts}
              className="h-6 px-2 text-xs"
            >
              {isLoadingProducts ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span className="ml-1">Refresh</span>
            </Button>
          </div>
          <Select
            value={formData.product}
            onValueChange={(value) => handleChange("product", value)}
            disabled={isLoading || isLoadingProducts}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
            </SelectTrigger>
            <SelectContent>
              {quoteProducts.length === 0 ? (
                <SelectItem value="no-products" disabled>
                  No quote requests available
                </SelectItem>
              ) : (
                quoteProducts.map((product) => (
                  <SelectItem key={product.name} value={product.name}>
                    {product.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="accommodation">숙박비</Label>
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
            <Label htmlFor="airfare">항공료</Label>
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
            <Label htmlFor="food">식비</Label>
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
          <Label htmlFor="details">상세내용</Label>
          <Textarea
            id="details"
            placeholder="내용입력"
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
            "등록"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
