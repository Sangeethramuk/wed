1. Protocol P1 — Standalone Workflow Document

What P1 Is
P1 is the Accuracy Assurance Loop. It is not a single check — it is a three-layer detection system that runs at different points in the grading cycle. Each layer catches a different category of error. Together they ensure that errors made by the AI, errors made by the instructor, and errors made by the rubric are all detected, diagnosed, and routed to the appropriate fix.

The Three Fixes Available To P1
Before defining the layers, the fixes need to be precisely defined because every detection routes to one of these.
Fix 1 — Rubric Correction
Used when the error source is the rubric itself — ambiguous descriptor, overlapping criteria, disproportionate weight. Action: flag the specific criterion to the instructor with a suggested correction. Rubric updated before next cycle. Sends rubric edit signal to Module 3.
Fix 2 — AI Recalibration
Used when the AI scored incorrectly despite a clean rubric and a correct instructor judgment. Action: override record captured with structured reason. Sent to Module 3 as highest priority learning signal. Confidence engine recalibrated before next cycle.
Fix 3 — Instructor Realignment
Used when the instructor scored incorrectly — either through fatigue, confirmation bias, or unconscious rubric drift. Action: deviation flagged for review. Double-blind delta surfaced. Instructor shown their own pattern with a non-accusatory framing. Sent to Module 3 as calibration drift signal.
Fix 4 — System Integrity Escalation

Used when neither the rubric, the AI, nor the instructor is the source — the system itself behaved incorrectly. Non-determinism, silent delivery failure, DPDP breach. Action: automatic escalation to platform engineering team. Instructor informed and protected. Resolution committed within 24 hours.

Layer 1 — Preventive Detection
When it runs: Before Phase A of Experience 2 — before the AI evaluates any submission.
What it checks:

Rubric health score from the previous cycle — criteria flagged as Needs Attention in the last Experience 4
Calibration delta from Phase 2.5 — if the delta was large last cycle, flag before this cycle begins
Historical override rate per criterion — criteria with over 30% override rate in previous sessions flagged proactively
Ambiguity flags generated during Experience 1 normalization — any unresolved flags from rubric setup

Who triggers it: System runs automatically when the instructor confirms the batch is ready for evaluation.
Detection mechanism: Rubric health check runs against the stored rubric version. Flags generated per criterion with severity — Warning or Critical.
What the instructor sees: A rubric risk report before evaluation starts. Not a blocker — evaluation can proceed. But the instructor is informed before they enter the grading desk.
Routing:

Warning level → Fix 1 suggested but not mandatory. Instructor can proceed and address in Experience 4.
Critical level → Fix 1 strongly recommended. System asks instructor to confirm they want to proceed without addressing the flagged criterion.

What gets logged: Rubric risk report — which criteria flagged, severity level, instructor decision to proceed or address. Timestamped. Sent to audit trail.
What gets sent to Module 3: Rubric risk report. Instructor decision. Pre-evaluation rubric state.

Layer 2 — Live Detection
When it runs: During Phase B of Experience 2 — inside the Instructor Supervision session.
What it checks:

Double-blind grade divergence — instructor's independent grade vs AI grade on sampled submissions
Real-time override rate per criterion — running count as the session progresses
Confirmation bias signal — instructor approving everything without meaningful review time
Fatigue signal — decision speed increasing over time without corresponding confidence increase

Who triggers it: System selects submissions for double-blind sampling before the session starts. System monitors override patterns continuously during the session.
Sampling logic (defined precisely below in item 2):

Submissions selected based on three signals — historical anomaly, low confidence flag, random baseline
Instructor evaluates selected submissions before seeing AI score
System compares both grades after instructor submits their independent score

Detection mechanism:
For double-blind divergence:

Minor divergence — instructor grade within 1 level of AI grade → logged, no alert
Significant divergence — instructor grade 2 levels from AI grade → logged, pattern tracked
Critical divergence — instructor grade 3 or more levels from AI grade → Fix 2 or Fix 3 triggered depending on direction and pattern

For override rate monitoring:

Under 15% overall → healthy, no alert
15% to 30% overall → Watch alert surfaced at end of session
Over 30% overall → Pattern detection alert surfaced mid-session
Over 30% on a specific criterion → Fix 1 triggered — rubric ambiguity flagged

For confirmation bias signal:

Average time per submission under 30 seconds for Strong and Clear confidence → acceptable
Average time per submission under 10 seconds across all confidence bands → confirmation bias alert triggered
Bulk approval of more than 20 submissions with zero drill-downs → mandatory random sample preview triggered

What the instructor sees:

Double-blind submissions presented without AI score — independent grading interface
After independent grade submitted — AI score revealed with delta shown
Pattern detection alerts mid-session if thresholds crossed — framed around rubric not instructor
Confirmation bias alert if decision speed crosses threshold — "You are moving quickly through this batch. A quick spot check can catch errors before they finalize."

Routing:

Double-blind critical divergence → Fix 2 if AI was consistently wrong, Fix 3 if instructor was consistently wrong
High override rate on specific criterion → Fix 1
Confirmation bias detected → Slow-down prompt, mandatory spot check on random sample
Fatigue signal → Optional break suggestion, smart sequencing adjustment

What gets logged: Every double-blind pair — submission ID, AI score, instructor independent score, delta, timestamp. Override rate snapshots at 25%, 50%, 75%, and 100% of batch. All alerts triggered and instructor responses to each alert.
What gets sent to Module 3: Double-blind delta records. Override rate snapshots. Alert trigger and response records. Confirmation bias flags if triggered.

Layer 3 — Post-Session Detection
When it runs: After Experience 3 is complete — after all grades are finalized and released.
What it checks:

Grade distribution anomalies across student groups — sections, historical cohort comparisons
Criteria where the instructor's final scores clustered at one level across the entire batch — may indicate rubric collapse
Confidence-override correlation across the full session — were low confidence scores overridden more than high confidence scores as expected, or was there no correlation
Replay evaluation determinism check — re-run a random sample of submissions to verify identical output
DPDP compliance completeness — every AI processing event logged with required fields

Who triggers it: System runs automatically after session closure is confirmed in Experience 4.
Detection mechanism:
For grade distribution:

Compare final grade distribution per criterion against historical distribution for this assignment type
Compare Section A vs Section B vs Section C distributions
Flag if any group scores more than 10% below the batch average on any criterion

For rubric collapse:

If more than 60% of submissions received the same level on a criterion → rubric collapse flag
Either the criterion is too easy, too hard, or too vague to discriminate between performance levels

For confidence-override correlation:

Expected pattern — low confidence overridden more than high confidence
If high confidence overridden at same rate as low confidence → calibration failure signal
If no overrides at all across entire batch → rubber-stamping signal

For replay determinism:

System selects 3 to 5 submissions randomly from the batch
Re-runs evaluation with identical parameters
Compares output score per criterion — must match exactly
Any mismatch triggers Fix 4 — System Integrity Escalation

What the instructor sees:

Bias detection report with structured three-option response path per flag
Rubric collapse alert per criterion with explanation and Fix 1 routing
Calibration failure signal with Fix 2 routing suggestion
Rubber-stamping signal with Fix 3 routing suggestion
Replay determinism result — confirmation or escalation
DPDP compliance completeness confirmation

Routing:

Bias flag → Structured response path — confirm, investigate, or escalate
Rubric collapse → Fix 1 — rubric descriptor review in Experience 4
Calibration failure → Fix 2 — AI recalibration signal sent to Module 3
Rubber-stamping → Fix 3 — instructor engagement pattern flagged, sent to Module 3
Non-determinism → Fix 4 — system integrity escalation
DPDP gap → Fix 4 — compliance escalation

What gets logged: Full post-session detection report. Every flag, every routing decision, every instructor response. Timestamped. Immutable audit entry created.
What gets sent to Module 3: Post-session detection report. Bias flags and resolutions. Rubric collapse signals. Calibration failure signals. Rubber-stamping patterns. Determinism confirmation or failure record.

P1 Summary Table
LayerWhenWhat It CatchesWho ActsFix RoutedLayer 1 PreventiveBefore evaluationRubric risk, calibration debt, unresolved ambiguityInstructor decides to proceed or fixFix 1Layer 2 LiveDuring supervisionAI errors, instructor errors, confirmation bias, fatigueSystem alerts, instructor respondsFix 1, 2, or 3Layer 3 Post-SessionAfter finalizationBias, rubric collapse, calibration failure, rubber-stamping, non-determinism, DPDP gapsSystem flags, instructor resolves, admin escalates if neededFix 1, 2, 3, or 4


2. Double-Blind Sampling Logic — Precise Rule Set

Why Not 100% Double-Blind
If every submission requires independent instructor grading before seeing the AI score the system saves no time and the value proposition collapses. The goal is targeted sampling — catch errors where they are most likely to occur, not everywhere equally.

The Three Selection Triggers
Trigger 1 — Historical Anomaly
A submission is selected for double-blind if the student's predicted score based on historical performance deviates significantly from the AI's assigned score.
Precise rule:

System retrieves the student's average score on this assignment type from Module 3 historical data
If the AI assigned score deviates by 2 or more levels from the student's historical average on any criterion → selected for double-blind
Example: Student has averaged Level 3 on Problem Solving across 4 previous assignments. AI assigns Level 1 this time. Deviation of 2 levels → double-blind triggered.
Rationale: Either the student had a genuine bad performance, the AI made an error, or the rubric changed significantly. Human judgment required before this score finalizes.

Trigger 2 — Low Confidence Flag
Any submission where at least one criterion has a Weak (0.70) or Minimal (0.60) confidence score is automatically selected for double-blind on those specific criteria only — not the full submission.
Precise rule:

Weak confidence (0.70) → double-blind on that criterion only
Minimal confidence (0.60) → double-blind on that criterion plus the adjacent criterion in the rubric
If 3 or more criteria in a single submission have Weak or Minimal confidence → full submission double-blind
Rationale: Low confidence means the AI itself is uncertain. The instructor's independent judgment is the most valuable input in this case.

Trigger 3 — Random Baseline
A fixed percentage of submissions are selected randomly regardless of confidence or historical data. This is the calibration baseline.
Precise rule:

Default random sample rate — 10% of the batch
Minimum 3 submissions per batch regardless of batch size — ensures even small batches have a calibration check
Maximum 15 submissions per batch regardless of batch size — prevents the random sample from becoming a significant time burden on large batches
Selection is random but stratified — at least one submission from the top third, middle third, and bottom third of AI-assigned scores
Rationale: Without a random baseline the system only checks anomalies and low-confidence cases. A random sample catches errors in cases the system was confident about — the most dangerous category.


Combined Sampling Logic
A submission can be selected by one, two, or all three triggers. The double-blind treatment is the same regardless of how many triggers fired — but the post-session analysis records which triggers fired for each sampled submission.
Priority order if batch is very large and sampling needs to be capped:

Historical anomaly submissions — always included
Full submission low confidence — always included
Criterion-level low confidence — included up to cap
Random baseline — fills remaining capacity up to cap


What The Instructor Sees In Double-Blind Mode

Submission opens with AI score hidden — a neutral placeholder shows where the score would be
Instructor grades independently per criterion — same interface as a manual grade
Instructor submits their independent grade
AI score is revealed immediately alongside instructor's grade
Delta is shown per criterion — color coded: green for match, yellow for minor divergence, red for significant divergence
Instructor can then override either their own grade or accept the AI grade — with a logged reason either way


What Gets Logged Per Double-Blind Event

Submission ID and student ID
Which triggers fired — historical anomaly, low confidence, random baseline
Instructor independent grade per criterion
AI grade per criterion
Delta per criterion
Instructor final decision — accepted AI grade, kept own grade, or chose a third value
Reason if divergence was significant
Timestamp of independent grade submission and final decision


3. Appeal Loop Termination Condition

The Problem
Phase 5 appeals can re-trigger Phase 3 evaluation. New evaluation produces new scores. New scores can generate new appeals. Without a termination condition this loop can cycle indefinitely — creating an infinite dispute process that destroys grading efficiency and institutional trust.

The Termination Rule Set
Rule 1 — Maximum Re-evaluations Per Submission
Any single submission can undergo a maximum of 2 re-evaluations through the appeal process. First re-evaluation triggered by a valid appeal. Second re-evaluation triggered only if the first re-evaluation produced a score that the student can demonstrate was factually incorrect — not just different from their expectation.
After 2 re-evaluations the submission is locked. No further re-evaluations are permitted regardless of further appeals.
Rule 2 — Instructor Final Decision Is Terminal
If the instructor reviews an appeal and makes a deliberate final decision — uphold, reject, or partial adjustment — that decision cannot be appealed again on the same criterion in the same assignment cycle. The instructor's deliberate decision is the terminal event.
Exception: If new material evidence emerges that was not available at the time of the original submission or the appeal review — for example an OCR failure that corrupted the original submission is discovered after the appeal decision — the instructor can voluntarily reopen the criterion. This is instructor-initiated only, not student-initiated.
Rule 3 — AI Pre-Check As First Filter
Before any appeal reaches the instructor it goes through an AI pre-check — Likely Valid, Unlikely Valid, or Needs Instructor Review. An Unlikely Valid appeal that the instructor confirms as rejected does not count as a re-evaluation — it is a filtered dismissal. Only appeals that reach the instructor and trigger a formal review count toward the maximum of 2 re-evaluations per Rule 1.
Rule 4 — Systemic Appeal Handling
If 5 or more students appeal the same criterion on the same assignment within 48 hours this is flagged as a systemic issue — not individual disputes. Systemic appeals are handled as a single batch review by the instructor, not as individual loops. The instructor makes one decision that applies to all affected students simultaneously. This decision is final and cannot generate individual appeals on the same criterion.
Rule 5 — Loop Detection Trigger
If the same submission has re-entered Phase 3 evaluation twice and a third appeal is submitted the system automatically routes it to institutional admin — not the instructor. Admin reviews the full history — original score, appeal 1 outcome, appeal 2 outcome, student's third argument — and makes the final institutional decision. This removes the instructor from an infinite loop and gives the student a genuinely independent review.

Termination Condition Summary Table
SituationTermination TriggerWho DecidesInstructor makes deliberate final decisionTerminal — same criterion cannot be appealed againInstructor2 re-evaluations completedLocked — no further re-evaluations permittedSystem enforcesUnlikely Valid confirmed rejectedFiltered dismissal — does not count as re-evaluationAI pre-check plus instructor confirmation5 or more students appeal same criterionSystemic batch review — one decision for allInstructor makes one final rulingThird appeal on same submissionEscalated to institutional adminAdmin makes final institutional decision

4. CO/PO/OBE Mapping Logic

What Needs To Be Defined
In Experience 1 the system suggests rubric criteria aligned to CO/PO/OBE goals. For this to work reliably the mapping rules must be precise — not just conceptually described.

The Mapping Rules
Rule 1 — Every Criterion Must Map To At Least One CO
When the instructor creates or uploads a rubric criterion the system attempts to map it to a Course Outcome from the uploaded syllabus. If no mapping can be made automatically the system flags the criterion — "This criterion does not appear to map to any Course Outcome in your syllabus. Please assign a CO manually or confirm this criterion is intentional." Instructor must either assign a CO or explicitly mark the criterion as non-CO-mapped with a reason. Unmarked criteria cannot be finalized.
Rationale: NBA/NAAC accreditation requires every assessment to demonstrate measurement of specific learning outcomes. An unmapped criterion is a compliance gap.
Rule 2 — One Criterion Can Map To Multiple COs
A single rubric criterion can address more than one Course Outcome simultaneously. Example: "Clarity of technical explanation" may map to both CO2 (Communication of technical concepts) and CO4 (Application of domain knowledge). The system shows all mapped COs per criterion and allows the instructor to confirm or remove mappings.
Rule 3 — CO Must Map To At Least One PO
Every Course Outcome in the system must link to at least one Program Outcome. This mapping is typically set at the institutional level — not by the individual instructor. If a CO has no PO mapping the system flags it to the institutional admin, not the instructor. The instructor is not responsible for PO mapping — they are responsible for CO mapping only.
Rule 4 — OBE Attainment Is Calculated Automatically
Once CO-to-criterion mapping is complete the system can calculate CO attainment for every student automatically from their criterion scores. If a student scores Level 3 or above on all criteria mapped to CO2 that student has attained CO2 for this assignment. This feeds directly into the institution's OBE attainment report for NBA/NAAC.
Precise attainment threshold:

Level 4 or 5 on a criterion → full attainment of mapped CO
Level 3 on a criterion → partial attainment of mapped CO
Level 1 or 2 on a criterion → non-attainment of mapped CO
Threshold is configurable by the institution — default is Level 3 and above for attainment

Rule 5 — Unmapped Criterion Handling At Evaluation
If a criterion reaches evaluation without a CO mapping — because the instructor explicitly marked it as non-CO-mapped — it is scored normally but excluded from the OBE attainment calculation. It still contributes to the student's total grade. It is flagged in the audit trail as non-CO-mapped with the instructor's reason recorded.
Rule 6 — AI Suggestion Logic For New Criteria
When the instructor types a new criterion name the system suggests CO mappings based on semantic similarity to the CO descriptions in the uploaded syllabus. Top 3 suggestions shown with a confidence score. Instructor selects one, selects multiple, or rejects all and maps manually. AI never auto-assigns a CO mapping — it only suggests.

CO/PO/OBE Mapping Flow
Instructor uploads syllabus + CO + PO documents
        ↓
System parses CO list and PO list from uploaded documents
        ↓
Instructor creates or uploads rubric criteria
        ↓
System suggests CO mapping per criterion — top 3 with confidence score
        ↓
Instructor confirms, adjusts, or manually assigns CO mapping
        ↓
System checks PO mapping for each confirmed CO — flags gaps to admin
        ↓
Rubric finalized with CO mapping complete
        ↓
At evaluation — criterion scores → CO attainment calculated automatically
        ↓
OBE attainment report available for NBA/NAAC export in Experience 4

5. Historical Anomaly Detection Rule

The Precise Rule
What counts as an anomaly:
A student's score on any criterion in the current assignment is an anomaly if it deviates by 2 or more rubric levels from their rolling average on that criterion type across their last 3 comparable assignments.
Precise definition of comparable assignment:

Same assignment type — QnA, creative, research, lab report, code, case study
Same course or same subject area
Same rubric criterion name or semantically similar criterion — determined by Module 3's criterion matching model
Minimum 2 previous comparable assignments required to trigger anomaly detection — if fewer than 2 exist no anomaly flag is generated and the submission goes to random baseline sampling only

The rolling average:

Calculated from the last 3 comparable assignments for that student
Weighted — most recent assignment weighted 50%, second most recent 30%, third most recent 20%
If a student had an anomaly flag in a previous session that was resolved as genuine poor performance — not an AI error — that score is included in the rolling average as a confirmed data point

The deviation threshold:

1 level deviation → normal variation, no flag
2 level deviation → anomaly flag, double-blind triggered on that criterion
3 or more level deviation → anomaly flag, double-blind triggered on full submission, Layer 3 Post-Session bias check also triggered

What the system does with no historical data:

First assignment ever for a student → no anomaly detection possible, goes to random baseline only
First assignment in a new course for a student with history in other courses → Module 3 provides a cross-course baseline if available, otherwise random baseline only
Transfer student with no system history → random baseline only, Module 3 flags as new student for first 3 assignments

What counts as a resolved anomaly:
An anomaly is resolved when the instructor makes a deliberate decision — confirmed as genuine poor performance, confirmed as AI error, or confirmed as OCR failure. Resolved anomalies are logged with their resolution type and used to improve Module 3's anomaly detection threshold over time.

Anomaly Detection Summary Table
DeviationFlag LevelAction1 levelNoneNormal variation, no action2 levelsCriterion anomalyDouble-blind on that criterion only3 or more levelsSubmission anomalyDouble-blind on full submission plus Layer 3 bias checkNo historical dataNo anomaly possibleRandom baseline sampling onlyResolved anomalyConfirmed data pointIncluded in rolling average for future detection

Level 1 Complete — Summary
ItemStatusProtocol P1 — three layers with triggers, detection, routing, fixes✅ CompleteDouble-blind sampling logic — three triggers with precise rules and caps✅ CompleteAppeal loop termination — five rules with terminal conditions✅ CompleteCO/PO/OBE mapping logic — six rules with flow and attainment calculation✅ CompleteHistorical anomaly detection — precise threshold, rolling average, edge cases✅ Complete