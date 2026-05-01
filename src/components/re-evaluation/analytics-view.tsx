"use client"

import { useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Target
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ReEvalAnalytics() {
  const stats = [
    { label: 'Portfolio Approval', value: '32%', sub: 'Across 3 courses', icon: Target, accent: '#1F4E8C' },
    { label: 'Avg. Portfolio Delta', value: '+1.4', sub: 'Dept-wide average', icon: TrendingUp, accent: '#3B82F6' },
    { label: 'SLA Compliance', value: '92%', sub: 'Target: 95%', icon: Clock, accent: '#10B981' },
    { label: 'Total Volume', value: '42', sub: 'Active disputes', icon: BarChart3, accent: '#8B5CF6' },
  ]

  const courseFriction = [
    { id: 'DSA', label: 'Data Structures', count: 24, pct: 57, color: '#EF4444', trend: 'up' },
    { id: 'OS', label: 'Operating Systems', count: 12, pct: 28, color: '#F59E0B', trend: 'stable' },
    { id: 'DBMS', label: 'Databases', count: 6, pct: 15, color: '#10B981', trend: 'down' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${s.accent}10` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.accent }} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{s.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Friction */}
        <Card className="lg:col-span-2 border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Portfolio Friction Heatmap</h3>
                <p className="text-xs text-slate-500">Cross-course comparison of dispute volume</p>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100 uppercase tracking-widest">
                All Courses
              </div>
            </div>

            <div className="space-y-6">
              {courseFriction.map((c) => (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.id}</span>
                      <span className="text-slate-500 font-medium">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{c.count} Cases</span>
                      <span className="text-slate-400 font-medium">{c.pct}% of Load</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E8C] bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Target className="h-4 w-4 shrink-0" />
                <span>Auditor's Insight: DSA accounts for 57% of your workload. Consider auditing the DSA Rubric to reduce departmental overhead.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Breakdown */}
        <Card className="border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Resolution Breakdown</h3>
            <div className="space-y-6">
              {[
                { label: 'Upticked', value: '45%', color: '#10B981', sub: 'Score increased' },
                { label: 'Upheld', value: '52%', color: '#64748B', sub: 'Original score kept' },
                { label: 'Reduced', value: '3%', color: '#EF4444', sub: 'Score decreased' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: item.value, backgroundColor: item.color }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Resolved Today</span>
                  <span className="text-xs font-bold text-slate-900">14 / 20</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Student Sentiment</span>
                  <span className="text-xs font-bold text-emerald-600">Improving</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
