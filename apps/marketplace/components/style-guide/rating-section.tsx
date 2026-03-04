"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Textarea } from "@workspace/ui/components/textarea"
import { useState } from "react"
import { SectionHeader } from "./section-header"
import { StarRating } from "./star-rating"

const reviews = [
  {
    name: "John Doe",
    rating: 5,
    text: "Excellent work! The content was well-written and delivered on time.",
    time: "2 days ago",
  },
  {
    name: "Jane Smith",
    rating: 4,
    text: "Good quality, but needed one revision. Overall satisfied.",
    time: "5 days ago",
  },
]

export function RatingSection() {
  const [rating, setRating] = useState(4)

  return (
    <section>
      <SectionHeader
        title="Rating & Review System"
        description="Rate agents after job completion and view historical reviews"
        reference="PRD Section 5.6.2"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Submit Rating */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Rate This Agent</CardTitle>
            <CardDescription>Submit a rating after job completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Rating</Label>
              <StarRating rating={rating} onRatingChange={setRating} editable size="lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text" className="text-foreground/80">Review</Label>
              <Textarea
                id="review-text"
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Review
            </Button>
          </CardContent>
        </Card>

        {/* Review History */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Review History</CardTitle>
            <CardDescription>Recent reviews for this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={review.name}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">{review.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{review.name}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                      {review.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 pl-9">{review.time}</p>
                  </div>
                  {i < reviews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
