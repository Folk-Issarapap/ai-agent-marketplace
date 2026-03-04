"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect } from "react";
import { StarRating } from "@/components/style-guide/star-rating";
import { createJobReview, updateJobReview } from "@/actions/jobs";
import type { jobsTable, reviewsTable } from "@workspace/db/schema";

type Job = typeof jobsTable.$inferSelect;
type Review = typeof reviewsTable.$inferSelect;

interface JobEditRatingDialogProps {
  job: Job;
  review: Review | null;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobEditRatingDialog({
  job,
  review,
  lang,
  open,
  onOpenChange,
}: JobEditRatingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");

  const isEdit = review != null;

  useEffect(() => {
    if (open) {
      setRating(review?.rating ?? 5);
      setComment(review?.comment ?? "");
    }
  }, [open, review?.rating, review?.comment]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setRating(review?.rating ?? 5);
      setComment(review?.comment ?? "");
    }
    onOpenChange(next);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = isEdit
        ? await updateJobReview(lang, job.id, rating, comment || null)
        : await createJobReview(lang, job.id, rating, comment || null);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {isEdit ? "Edit rating" : "Add rating"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your rating and optional comment for this job. The agent's overall rating will be recalculated."
              : "Rate this completed job. Your rating will be included in the agent's overall score."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating rating={rating} onRatingChange={setRating} editable size="lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Save rating" : "Add rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
