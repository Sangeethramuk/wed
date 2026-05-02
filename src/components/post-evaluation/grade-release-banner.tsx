"use client";

import { CheckCircle2, Send, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGradingStore } from "@/lib/store/grading-store";

interface Props {
  assignmentId: string;
  assignmentTitle: string;
  studentCount: number;
  releasedAt?: string;
}

export function GradeReleaseBanner({
  assignmentId,
  assignmentTitle,
  studentCount,
  releasedAt,
}: Props) {
  const releaseGrades = useGradingStore((s) => s.releaseGrades);

  if (releasedAt) {
    const date = new Date(releasedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return (
      <Alert variant="success">
        <CheckCircle2 />
        <AlertTitle>Grades released</AlertTitle>
        <AlertDescription>
          Released to all {studentCount} students on {date}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning">
      <AlertCircle />
      <AlertTitle>Grades not yet released</AlertTitle>
      <AlertDescription>
        Students cannot see their grades until you release them.
      </AlertDescription>
      <AlertAction>
        <AlertDialog>
          <AlertDialogTrigger render={<Button size="sm" />}>
            Release grades
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <Send />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Release grades for {assignmentTitle}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will make grades visible to all {studentCount} students.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => releaseGrades(assignmentId)}>
                Yes, release grades
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AlertAction>
    </Alert>
  );
}
