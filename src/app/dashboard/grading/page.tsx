'use client';

import React from 'react';
import { useGradingStore } from '@/lib/store/grading-store';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Beaker, ShieldAlert, Cpu, GraduationCap, ArrowRight } from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
 f1: ShieldAlert,
 f2: Cpu,
 f3: Beaker,
 f4: Beaker,
};

const badgeColors: Record<string, string> = {
 f1: 'bg-amber-100 text-amber-700 border-amber-200',
 f2: 'bg-blue-100 text-blue-700 border-blue-200',
 f3: 'bg-purple-100 text-purple-700 border-purple-200',
 f4: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function GradingHubPage() {
 const { assignments, selectAssignment } = useGradingStore();
 const router = useRouter();

 const handleSelect = (id: string) => {
 selectAssignment(id);
 router.push(`/dashboard/grading/workspace`);
 };

 return (
 <div className="min-h-screen bg-[#f8f9fa] p-8">
 <div className="max-w-6xl mx-auto">
 <header className="mb-12">
 <div className="flex items-center gap-2 text-muted-foreground mb-4">
 <GraduationCap className="w-5 h-5" />
 <span className="text-sm font-medium tracking-tight ">Academic Evaluation Suite</span>
 </div>
 <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-4">
 Grading Hub Demo <span className="text-slate-400 font-extralight">/ Sandbox</span>
 </h1>
 <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
 Select a narrative case to demonstrate the <strong>Protocol P1</strong> Accuracy Assurance Loop and systemic fixing logic.
 </p>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {Object.values(assignments).map((assignment, index) => {
 const Icon = icons[assignment.targetFix] || Beaker;
 return (
 <motion.div
 key={assignment.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 whileHover={{ y: -4 }}
 >
 <Card className="h-full border border-slate-200/60 transition-all hover:border-slate-300 bg-white shadow-none rounded-xl overflow-hidden flex flex-column">
 <div className="p-6 flex-1">
 <div className="mb-6 flex justify-between items-start">
 <div className={`p-3 rounded-lg ${badgeColors[assignment.targetFix]}`}>
 <Icon className="w-6 h-6" />
 </div>
 <Badge variant="outline" className={`font-mono text-xs tracking-wider ${badgeColors[assignment.targetFix]}`}>
 Fix {assignment.targetFix.toUpperCase()} Logic
 </Badge>
 </div>
 <h3 className="text-xl font-medium text-slate-900 mb-2">{assignment.title}</h3>
 <p className="text-sm text-slate-500 leading-relaxed mb-6">
 {assignment.description}
 </p>
 </div>
 <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100/60">
 <Button 
 onClick={() => handleSelect(assignment.id)}
 className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-6 group"
 >
 Launch Story
 <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </CardFooter>
 </Card>
 </motion.div>
 );
 })}
 </div>

 <footer className="mt-20 pt-8 border-t border-slate-200/60">
 <div className="flex flex-col md:flex-row justify-between gap-8">
 <div className="max-w-xs">
 <h4 className="text-xs font-medium tracking-[0.2em] text-slate-400 mb-4 font-mono">Protocol Compliance</h4>
 <p className="text-xs text-slate-400 leading-relaxed font-mono ">
 All scenarios are designed to trigger P1 Layer 2 (Live Detection) and Layer 3 (Post-Session) events.
 </p>
 </div>
 <div className="flex gap-12">
 <div className="text-center md:text-left">
 <div className="text-2xl font-light text-slate-900">4</div>
 <div className="text-xs font-medium tracking-widest text-slate-400 font-mono">Systemic Fixes</div>
 </div>
 <div className="text-center md:text-left">
 <div className="text-2xl font-light text-slate-900">12++</div>
 <div className="text-xs font-medium tracking-widest text-slate-400 font-mono">Integrity Signals</div>
 </div>
 </div>
 </div>
 </footer>
 </div>
 </div>
 );
}
