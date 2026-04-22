import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Home",
}
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  PlusCircle, 
  ClipboardCheck, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Professor</h1>
        <p className="text-muted-foreground">You have 2 assignments pending evaluation and 1 draft in progress.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="relative overflow-hidden group border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-primary text-primary-foreground mb-2">
              <PlusCircle className="h-5 w-5" />
            </div>
            <CardTitle>Prepare Assignment</CardTitle>
            <CardDescription>Set up a new task, rubric, and calibration strategy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pre-evaluation">
              <Button className="w-full">
                Start Preparation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-secondary text-secondary-foreground mb-2">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <CardTitle>Grading Desk</CardTitle>
            <CardDescription>Review student submissions and AI suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/evaluation">
              <Button variant="outline" className="w-full">
                Open Triage Desk
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-2 w-fit rounded-lg bg-secondary text-secondary-foreground mb-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <CardTitle>Result Insights</CardTitle>
            <CardDescription>View cohort performance and feedback patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/post-evaluation">
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
            <CardDescription>Current status of your ongoing course evaluations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[color:var(--status-info)]" />
                  Software Engineering - Phase 2
                </div>
                <span className="text-muted-foreground">24/45 Graded</span>
              </div>
              <Progress value={53} className="h-2" />
              <div className="flex justify-between text-xs font-bold tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Evaluation in progress</span>
                <Link href="/dashboard/evaluation" className="text-primary hover:underline">Continue Grading →</Link>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[color:var(--status-success)]" />
                  Database Systems - Quiz 1
                </div>
                <span className="text-muted-foreground">42/42 Graded</span>
              </div>
              <Progress value={100} className="h-2" />
              <div className="flex justify-between text-xs font-bold tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1 text-[color:var(--status-success)] dark:text-[color:var(--status-success)]"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                <Link href="/dashboard/post-evaluation" className="text-primary hover:underline">View Results →</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
            <CardDescription>AI insights and calibration alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
                <div className="p-2 h-fit rounded-full bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] dark:bg-muted dark:text-[color:var(--status-warning)]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New Pattern Detected</p>
                  <p className="text-xs text-muted-foreground">60% of students in "Software Engineering" struggled with MVC Controller logic.</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
                <div className="p-2 h-fit rounded-full bg-[color:var(--status-info-bg)] text-[color:var(--status-info)] dark:bg-muted dark:text-[color:var(--status-info)]">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Calibration Complete</p>
                  <p className="text-xs text-muted-foreground">Prompt strategy for "Database Systems" has been successfully refined based on your grading style.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
