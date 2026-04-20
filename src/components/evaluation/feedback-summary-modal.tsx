"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  Send
} from "lucide-react"

interface CriterionFeedback {
  id: number
  label: string
  score: number
  maxPoints: number
  feedback: string
  isOverridden: boolean
  aiScore: number
}

interface FeedbackSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (overallFeedback: string) => void
  studentName: string
  criteria: CriterionFeedback[]
  totalScore: number
  maxScore: number
}

export function FeedbackSummaryModal({
  isOpen,
  onClose,
  onSubmit,
  studentName,
  criteria,
  totalScore,
  maxScore
}: FeedbackSummaryModalProps) {
  const [overallFeedback, setOverallFeedback] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isStructuring, setIsStructuring] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)

  const percentage = Math.round((totalScore / maxScore) * 100)

  const getPerformanceLevel = (pct: number) => {
    if (pct >= 90) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" }
    if (pct >= 75) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" }
    if (pct >= 60) return { label: "Satisfactory", color: "text-amber-600", bg: "bg-amber-50" }
    return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" }
  }

  const performance = getPerformanceLevel(percentage)

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recording not supported in this browser")
      return
    }
    
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognitionAPI()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('')
      setOverallFeedback(prev => prev + ' ' + transcript)
    }
    
    recognitionRef.current.start()
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleStructureFeedback = async () => {
    setIsStructuring(true)
    // Simulate AI structuring
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const structured = `## Overall Assessment

${overallFeedback}

## Key Strengths
- Good understanding of core concepts
- Clear presentation of ideas

## Areas for Development
- Consider expanding on implementation details
- Add more concrete examples to support arguments

## Next Steps
Review the feedback for each criterion above and focus on the specific areas mentioned.`
    
    setOverallFeedback(structured)
    setIsStructuring(false)
  }

  const handleGetSuggestions = () => {
    const newSuggestions = [
      "Consider mentioning specific examples from the student's work",
      "Acknowledge the strong technical implementation",
      "Suggest concrete resources for improvement",
      "Encourage continued practice with design patterns"
    ]
    setSuggestions(newSuggestions)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background"
        >
          {/* Header */}
          <div className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight">Final Feedback Summary</h2>
                  <p className="text-[10px] text-muted-foreground">{studentName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-2xl font-black tracking-tighter">{percentage}</span>
                  <span className="text-sm font-bold text-muted-foreground/50">/ 100</span>
                </div>
                <Badge className={`${performance.bg} ${performance.color} border-0 text-[9px] font-black tracking-wider`}>
                  {performance.label}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100vh-64px)] flex">
            {/* Left Panel - Criteria Summary */}
            <div className="w-[45%] border-r border-border bg-muted/20">
              <div className="p-4 border-b border-border bg-white">
                <h3 className="eyebrow text-muted-foreground">
                  Criterion Feedback ({criteria.length})
                </h3>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-4 space-y-3">
                  {criteria.map((criterion) => (
                    <Card key={criterion.id} className="p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold tracking-tight">{criterion.label}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] font-black">
                              {criterion.score.toFixed(1)} / {criterion.maxPoints} pts
                            </Badge>
                            {criterion.isOverridden && (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[8px] font-black">
                                Overridden from {criterion.aiScore}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {criterion.feedback ? (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {criterion.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                          <AlertCircle className="h-3 w-3" />
                          <span>No feedback provided</span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Overall Feedback */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-border">
                <h3 className="eyebrow text-muted-foreground">
                  Overall Feedback
                </h3>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Provide a comprehensive summary of the student's performance
                </p>
              </div>
              
              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="flex-1 relative">
                  <Textarea
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    placeholder="Enter your overall feedback here... You can:\n• Record voice feedback\n• Use AI to structure your thoughts\n• Get AI suggestions for improvement areas"
                    className="h-full min-h-[300px] resize-none text-sm leading-relaxed p-4"
                  />
                  
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 bg-white border border-primary/20 rounded-lg p-4 shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <span className="eyebrow text-primary">AI Suggestions</span>
                      </div>
                      <ul className="space-y-1.5">
                        {suggestions.map((suggestion, idx) => (
                          <li 
                            key={idx} 
                            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted/50 p-1.5 rounded transition-colors"
                            onClick={() => {
                              setOverallFeedback(prev => prev + '\n• ' + suggestion)
                              setSuggestions([])
                            }}
                          >
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`h-9 gap-2 ${isRecording ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          <span className="eyebrow">Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span className="eyebrow">Record</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStructureFeedback}
                      disabled={isStructuring || !overallFeedback.trim()}
                      className="h-9 gap-2"
                    >
                      {isStructuring ? (
                        <>
                          <div className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="eyebrow">Structuring...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span className="eyebrow">AI Structure</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGetSuggestions}
                      className="h-9 gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="eyebrow">Get Suggestions</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => onSubmit(overallFeedback)}
                    disabled={!overallFeedback.trim()}
                    className="h-9 px-6 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span className="eyebrow">Submit Feedback</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
