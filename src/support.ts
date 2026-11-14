// Flagged students and learning insights: one set of rules and numbers used by Home, Learning insights,
// Flagged students and the student profile, so a student never gets contradictory information.
// Pure functions: they read the app data and never change it.
//
// Evidence rule: only SHARED results count. Their marks were approved by the teacher before sharing.
// Work that is waiting for review (AI-suggested or not yet shared marks) is never confirmed evidence; it is
// only shown as "waiting for your review", with a separate preview of what it could change.
// A flag means a student may need support. It is not a diagnosis, and the teacher decides every step.

import {
  getAssessment,
  getSubmissionProgress,
  getSubmissionQuestions,
  getTopicLabel,
  type AssessmentAppData,
  type Language,
  type SubmissionRecord,
  type SupportActionRecord,
  type SupportCaseRecord,
  type SupportKind,
} from "./assessmentData";
import { findWrongIdeas } from "./grading";

/** A shared result below this percentage counts as a low result. */
export const LOW_RESULT = 60;
/** A topic below this percentage, across 2+ assessments, is a serious topic weakness. */
export const WEAK_TOPIC = 50;
/** At or above this percentage, a result or topic counts as secure. */
export const SECURE = 75;
/** A rise of at least this many points after support counts as improvement. */
export const IMPROVED_BY = 15;
/** A drop of at least this many points below the earlier average counts as falling. */
export const FALL_BY = 20;
/** Flags reflect current evidence: low marks, wrong ideas and incomplete answers count from the most recent shared results. */
export const RECENT_RESULTS = 4;

export type SignalKind = "low-results" | "topic" | "wrong-idea" | "falling" | "several-topics" | "incomplete" | "no-improvement";
export interface Evidence { submissionId: string; questionId?: string }
export interface SupportSignal { kind: SignalKind; weight: number; topicKey?: string; title: string; detail: string; evidence: Evidence[] }
export type SupportPriority = "high" | "attention" | "monitoring";
export type SupportStatus = "new" | "reviewed" | "support" | "improving" | "resolved" | "dismissed";

export const PRIORITY_WORDS: Record<SupportPriority, { label: string; tone: string; text: string }> = {
  high: { label: "High priority", tone: "bad", text: "Strong evidence of persistent difficulties. Worth prompt attention." },
  attention: { label: "Needs attention", tone: "warn", text: "Repeated weaknesses that are worth addressing." },
  monitoring: { label: "Monitoring", tone: "info", text: "An early concern to keep an eye on." },
};
export const STATUS_WORDS: Record<SupportStatus, string> = {
  new: "New", reviewed: "Reviewed by you", support: "Support given", improving: "Improving", resolved: "Resolved", dismissed: "Dismissed",
};
export const SUPPORT_KIND_WORDS: Record<SupportKind, string> = {
  reteach: "Re-taught the concept", practice: "Targeted practice", visual: "Visual example", "one-to-one": "One-to-one support", monitor: "Watching the next assessment", other: "Other support",
};

/** One answer from a result, with its topic and the teacher's mark. */
export interface AnswerRow {
  submissionId: string; assessmentId: string; subject: string; language: Language; at: string; shared: boolean;
  questionId: string; topicKey: string; score: number; max: number; wrongIdeas: string[];
}

const percent = (score: number, max: number) => max ? Math.round((score / max) * 100) : 0;
export const rowsPercent = (rows: Pick<AnswerRow, "score" | "max">[]) => percent(rows.reduce((sum, row) => sum + row.score, 0), rows.reduce((sum, row) => sum + row.max, 0));
/** When the work was done: results are ordered by upload date. */
const whenDone = (submission: SubmissionRecord) => submission.uploadedAt;
const isShared = (submission: SubmissionRecord) => submission.status === "published";
/** Reviewed-but-not-shared work: it has marks, but they are not confirmed evidence yet. */
const isWaiting = (submission: SubmissionRecord) => submission.status === "needs_review" && submission.answers.length > 0;

export function resultsFor(data: AssessmentAppData, studentId: string, includeWaiting = false) {
  return data.submissions.filter((item) => item.studentId === studentId && (isShared(item) || (includeWaiting && isWaiting(item)))).sort((a, b) => whenDone(a).localeCompare(whenDone(b)));
}

export function waitingFor(data: AssessmentAppData, studentId: string) {
  return data.submissions.filter((item) => item.studentId === studentId && isWaiting(item)).sort((a, b) => whenDone(a).localeCompare(whenDone(b)));
}

export function answerRows(data: AssessmentAppData, submissions: SubmissionRecord[]): AnswerRow[] {
  return submissions.flatMap((submission) => {
    const assessment = getAssessment(data, submission.assessmentId);
    return getSubmissionQuestions(data, submission).flatMap((question) => {
      const answer = submission.answers.find((item) => item.questionId === question.id);
      if (!answer) return [];
      // A wrong idea only counts where the teacher's own mark agrees the answer isn't fully right.
      const wrongIdeas = answer.teacherScore < question.maxScore ? findWrongIdeas(question, answer.extractedText || answer.sourceText || "") : [];
      return [{ submissionId: submission.id, assessmentId: submission.assessmentId, subject: assessment.subject, language: submission.language, at: whenDone(submission), shared: isShared(submission), questionId: question.id, topicKey: question.topicKey, score: answer.teacherScore, max: question.maxScore, wrongIdeas }];
    });
  });
}

/** A topic gap counts for a shared result only when the teacher confirmed it. */
const gapConfirmed = (submission: SubmissionRecord, topicKey: string) => submission.learningGaps.includes(topicKey) && (isShared(submission) ? (submission.learningGapDecisions?.[topicKey] ?? "confirmed") === "confirmed" : (submission.learningGapDecisions?.[topicKey] ?? "pending") !== "dismissed");

export interface TopicState { topicKey: string; label: string; percent: number; answers: number; results: number; latestPercent: number; firstPercent: number; recurringGap: number; open: boolean; rows: AnswerRow[] }

/** Each topic for one student: overall %, first and latest result in it, how often a gap was confirmed. */
export function topicStates(data: AssessmentAppData, submissions: SubmissionRecord[], rows = answerRows(data, submissions)): TopicState[] {
  const byTopic = new Map<string, AnswerRow[]>();
  rows.forEach((row) => byTopic.set(row.topicKey, [...(byTopic.get(row.topicKey) ?? []), row]));
  return [...byTopic.entries()].map(([topicKey, topicRows]) => {
    const ids = [...new Set(topicRows.map((row) => row.submissionId))];
    const first = topicRows.filter((row) => row.submissionId === ids[0]);
    const latest = topicRows.filter((row) => row.submissionId === ids[ids.length - 1]);
    const latestPercent = rowsPercent(latest);
    return { topicKey, label: getTopicLabel(data, topicKey), percent: rowsPercent(topicRows), answers: topicRows.length, results: ids.length, latestPercent, firstPercent: rowsPercent(first),
      recurringGap: submissions.filter((item) => ids.includes(item.id) && gapConfirmed(item, topicKey)).length,
      // Still a concern now: the latest result in this topic is not secure, or the teacher confirmed a gap in it.
      open: latestPercent < SECURE || submissions.some((item) => item.id === ids[ids.length - 1] && gapConfirmed(item, topicKey)), rows: topicRows };
  }).sort((a, b) => a.percent - b.percent || a.label.localeCompare(b.label));
}

export interface ActionOutcome {
  action: SupportActionRecord; topicLabel: string;
  before?: number; after?: number; beforeResults: number; afterResults: number; waitingAfter: number;
  wrongIdeasBefore: string[]; wrongIdeasStill: string[]; gapStillOpen?: boolean;
  outcome: "no-evidence" | "improved" | "not-yet";
  summary: string;
}

/** Before and after a piece of support, from shared results only. Never claims improvement without a later result. */
export function actionOutcome(data: AssessmentAppData, studentId: string, action: SupportActionRecord): ActionOutcome {
  const shared = resultsFor(data, studentId);
  const rows = answerRows(data, shared).filter((row) => !action.topicKey || row.topicKey === action.topicKey);
  const beforeRows = rows.filter((row) => row.at < action.at);
  const afterRows = rows.filter((row) => row.at > action.at);
  const waitingAfter = waitingFor(data, studentId).filter((item) => whenDone(item) > action.at && (!action.topicKey || getSubmissionQuestions(data, item).some((question) => question.topicKey === action.topicKey))).length;
  const before = beforeRows.length ? rowsPercent(beforeRows) : undefined;
  const after = afterRows.length ? rowsPercent(afterRows) : undefined;
  const wrongIdeasBefore = [...new Set(beforeRows.flatMap((row) => row.wrongIdeas))];
  const wrongIdeasStill = [...new Set(afterRows.flatMap((row) => row.wrongIdeas))].filter((idea) => wrongIdeasBefore.includes(idea));
  const latestAfter = afterRows.length ? shared.filter((item) => item.id === afterRows[afterRows.length - 1].submissionId)[0] : undefined;
  const gapStillOpen = latestAfter && action.topicKey ? gapConfirmed(latestAfter, action.topicKey) : undefined;
  const topicLabel = action.topicKey ? getTopicLabel(data, action.topicKey) : "Overall";
  let outcome: ActionOutcome["outcome"] = "no-evidence";
  // Improvement needs a real rise: at least IMPROVED_BY points, or from below secure to secure. Staying level is not improvement.
  if (after !== undefined) outcome = (before !== undefined ? after >= before + IMPROVED_BY || (before < SECURE && after >= SECURE) : after >= SECURE) ? "improved" : "not-yet";
  const summary = outcome === "no-evidence"
    ? `Not enough evidence yet: no shared result in ${topicLabel.toLowerCase()} since then${waitingAfter ? ` (${waitingAfter} waiting for your review)` : ""}.`
    : outcome === "improved"
      ? `${topicLabel}: ${before === undefined ? "" : `${before}% before → `}${after}% after.${wrongIdeasStill.length ? " The same wrong idea still appears." : ""}`
      : `${topicLabel}: ${before === undefined ? "" : `${before}% before → `}${after}% after. No clear improvement yet.${wrongIdeasStill.length ? " The same wrong idea still appears." : ""}${gapStillOpen ? " The gap is still open." : ""}`;
  return { action, topicLabel, before, after, beforeResults: new Set(beforeRows.map((row) => row.submissionId)).size, afterResults: new Set(afterRows.map((row) => row.submissionId)).size, waitingAfter, wrongIdeasBefore, wrongIdeasStill, gapStillOpen, outcome, summary };
}

export interface Recommendation { id: string; text: string; because: string; kind: SupportKind; topicKey?: string; evidence: Evidence[] }

export interface StudentSupport {
  studentId: string;
  results: { id: string; at: string; percent: number; assessmentId: string; language: Language }[];
  average?: number;
  topics: TopicState[];
  signals: SupportSignal[];
  score: number;
  priority?: SupportPriority;
  status?: SupportStatus;
  /** True when a dismissed or resolved flag came back because of evidence shared after that decision. */
  newEvidenceSinceDecision: boolean;
  /** True when support was given and the current evidence no longer raises a concern: the teacher may resolve. */
  evidenceCleared: boolean;
  /** One low result with nothing else: shown as a note, never a flag. */
  isolatedLow?: { submissionId: string; percent: number };
  waiting: SubmissionRecord[];
  /** What the priority would be if the waiting results were shared exactly as marked now. */
  waitingPreview?: SupportPriority;
  outcomes: ActionOutcome[];
  recommendations: Recommendation[];
  caseRecord?: SupportCaseRecord;
  weakestTopics: TopicState[];
  strongestTopics: TopicState[];
  wrongIdeas: { label: string; topicKey: string; count: number; evidence: Evidence[] }[];
}

export function priorityFor(score: number): SupportPriority | undefined {
  return score >= 4 ? "high" : score >= 2 ? "attention" : score >= 1 ? "monitoring" : undefined;
}

/** The evidence signals for one student, from the given results (shared only, unless previewing). */
function signalsFor(data: AssessmentAppData, studentId: string, results: SubmissionRecord[], caseRecord?: SupportCaseRecord) {
  const rows = answerRows(data, results);
  const topics = topicStates(data, results, rows);
  const percents = results.map((item) => ({ id: item.id, percent: getSubmissionProgress(data, item) }));
  const recent = percents.slice(-RECENT_RESULTS);
  const recentIds = new Set(recent.map((item) => item.id));
  const recentRows = rows.filter((row) => recentIds.has(row.submissionId));
  const signals: SupportSignal[] = [];
  const low = recent.filter((item) => item.percent < LOW_RESULT);
  // Consistently low (every recent shared result low) weighs more than some low results among good ones.
  if (low.length >= 2) signals.push({ kind: "low-results", weight: low.length === recent.length ? 3 : 2, title: low.length === recent.length ? `Low marks in all ${recent.length} recent results` : `Low marks in ${low.length} of the last ${recent.length} results`, detail: `Below ${LOW_RESULT}% in ${low.length} assessments (${low.map((item) => `${item.percent}%`).join(", ")}).`, evidence: low.map((item) => ({ submissionId: item.id })) });
  // Topic-level severity, independent of the overall average: a serious weakness in one topic is not hidden by good marks elsewhere.
  topics.forEach((topic) => {
    const persistentLow = topic.results >= 2 && topic.percent < WEAK_TOPIC;
    const recurring = topic.recurringGap >= 2;
    if (!topic.open || (!persistentLow && !recurring)) return;
    const evidence = topic.rows.filter((row) => row.score < row.max).map((row) => ({ submissionId: row.submissionId, questionId: row.questionId }));
    signals.push({ kind: "topic", weight: persistentLow ? 3 : 2, topicKey: topic.topicKey,
      title: persistentLow ? `Serious weakness in ${topic.label.toLowerCase()}` : `Repeated gap in ${topic.label.toLowerCase()}`,
      detail: `${topic.percent}% across ${topic.answers} answer${topic.answers === 1 ? "" : "s"} in ${topic.results} assessments${topic.recurringGap ? `; gap confirmed in ${topic.recurringGap} of them` : ""}. Latest: ${topic.latestPercent}%.`, evidence });
  });
  const ideas = new Map<string, AnswerRow[]>();
  recentRows.forEach((row) => row.wrongIdeas.forEach((idea) => ideas.set(idea, [...(ideas.get(idea) ?? []), row])));
  ideas.forEach((ideaRows, idea) => {
    if (new Set(ideaRows.map((row) => row.submissionId)).size < 2) return;
    signals.push({ kind: "wrong-idea", weight: 1, topicKey: ideaRows[0].topicKey, title: "The same wrong idea keeps coming back", detail: `“${idea}” in ${ideaRows.length} answers from ${new Set(ideaRows.map((row) => row.submissionId)).size} assessments.`, evidence: ideaRows.map((row) => ({ submissionId: row.submissionId, questionId: row.questionId })) });
  });
  // Falling needs 3+ results: one low result after good ones is an isolated result, not a trend.
  if (percents.length >= 3) {
    const latest = percents[percents.length - 1];
    const previous = percents[percents.length - 2];
    const earlier = Math.round(percents.slice(0, -1).reduce((sum, item) => sum + item.percent, 0) / (percents.length - 1));
    if (latest.percent <= earlier - FALL_BY && latest.percent < LOW_RESULT && previous.percent < percents[0].percent) signals.push({ kind: "falling", weight: 1, title: "Marks are falling", detail: `Latest ${latest.percent}%, down from an average of ${earlier}% before.`, evidence: [{ submissionId: latest.id }] });
  }
  // Several topics: weak (below 50%) in their latest result, and spread over at least 2 assessments.
  const weakNow = topics.filter((topic) => topic.latestPercent < WEAK_TOPIC);
  const subjects = new Set(weakNow.map((topic) => topic.rows[0].subject));
  const weakAssessments = new Set(weakNow.map((topic) => topic.rows[topic.rows.length - 1].submissionId));
  if (weakAssessments.size >= 2 && (weakNow.length >= 3 || subjects.size >= 2)) signals.push({ kind: "several-topics", weight: 1, title: "Difficulties across several topics", detail: `${weakNow.length} topics below ${WEAK_TOPIC}% in their latest result${subjects.size >= 2 ? `, in ${subjects.size} subjects` : ""}: ${weakNow.map((topic) => topic.label).join(", ")}.`, evidence: weakNow.flatMap((topic) => topic.rows.filter((row) => row.score < row.max).slice(-1).map((row) => ({ submissionId: row.submissionId, questionId: row.questionId }))) });
  const missed = recentRows.filter((row) => row.score / row.max <= 0.25);
  if (missed.length >= 3 && new Set(missed.map((row) => row.submissionId)).size >= 2) signals.push({ kind: "incomplete", weight: 1, title: "Repeated incomplete or misunderstood answers", detail: `${missed.length} answers earned a quarter of the marks or less, across ${new Set(missed.map((row) => row.submissionId)).size} assessments.`, evidence: missed.map((row) => ({ submissionId: row.submissionId, questionId: row.questionId })) });
  const outcomes = (caseRecord?.actions ?? []).map((action) => actionOutcome(data, studentId, action));
  const latestByTopic = new Map<string, ActionOutcome>();
  outcomes.forEach((item) => latestByTopic.set(item.action.topicKey ?? "overall", item));
  latestByTopic.forEach((item) => {
    if (item.outcome !== "not-yet" || ((item.after ?? 100) >= LOW_RESULT && !item.gapStillOpen)) return;
    signals.push({ kind: "no-improvement", weight: (item.after ?? 0) < LOW_RESULT ? 2 : 1, topicKey: item.action.topicKey, title: "No improvement yet after support", detail: `${SUPPORT_KIND_WORDS[item.action.kind]} on ${new Date(item.action.at).toLocaleDateString("en", { month: "short", day: "numeric" })}. ${item.summary}`, evidence: [] });
  });
  return { rows, topics, percents, signals, outcomes, low };
}

function recommendationsFor(data: AssessmentAppData, signals: SupportSignal[], priority?: SupportPriority): Recommendation[] {
  const out: Recommendation[] = [];
  const add = (item: Recommendation) => { if (!out.some((existing) => existing.id === item.id)) out.push(item); };
  signals.forEach((signal) => {
    const topic = signal.topicKey ? getTopicLabel(data, signal.topicKey).toLowerCase() : "";
    if (signal.kind === "wrong-idea") {
      add({ id: `reteach-${signal.topicKey}`, kind: "reteach", topicKey: signal.topicKey, text: `Re-teach ${topic} with a simpler explanation`, because: signal.detail, evidence: signal.evidence });
      add({ id: `visual-${signal.topicKey}`, kind: "visual", topicKey: signal.topicKey, text: `Use a visual example for ${topic}`, because: signal.detail, evidence: signal.evidence });
    }
    if (signal.kind === "topic") add({ id: `practice-${signal.topicKey}`, kind: "practice", topicKey: signal.topicKey, text: `Targeted practice in ${topic}`, because: signal.detail, evidence: signal.evidence });
    if (signal.kind === "no-improvement") add({ id: `different-${signal.topicKey ?? "all"}`, kind: "one-to-one", topicKey: signal.topicKey, text: "Try a different approach, for example a short one-to-one session", because: signal.detail, evidence: [] });
    if (signal.kind === "falling" || signal.kind === "several-topics") add({ id: "monitor", kind: "monitor", text: "Watch the next assessment closely", because: signal.detail, evidence: signal.evidence });
  });
  if (priority === "high" || signals.some((signal) => signal.kind === "low-results")) add({ id: "one-to-one", kind: "one-to-one", text: "Give short individual support", because: signals.filter((signal) => signal.weight >= 2).map((signal) => signal.title).join("; ") || "Several signals together.", evidence: signals.flatMap((signal) => signal.evidence).slice(0, 6) });
  return out;
}

const evidenceClearedFor = (status?: SupportStatus) => status === "improving" || status === "resolved";

/** Everything about one student's support needs. The same numbers appear on every teacher page. */
export function studentSupport(data: AssessmentAppData, studentId: string): StudentSupport {
  const shared = resultsFor(data, studentId);
  const caseRecord = data.supportCases?.find((item) => item.studentId === studentId);
  const { topics, percents, signals, outcomes, low, rows } = signalsFor(data, studentId, shared, caseRecord);
  const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const priority = priorityFor(score);
  const waiting = waitingFor(data, studentId);
  const preview = waiting.length ? priorityFor(signalsFor(data, studentId, resultsFor(data, studentId, true), caseRecord).signals.reduce((sum, signal) => sum + signal.weight, 0)) : undefined;
  const rank = (value?: SupportPriority) => value === "high" ? 3 : value === "attention" ? 2 : value === "monitoring" ? 1 : 0;
  // New evidence after a dismissal or resolution: a shared result done after it that is low or has a confirmed gap.
  const decidedAt = caseRecord?.decidedAt ?? "";
  const newEvidence = Boolean(decidedAt) && shared.some((item) => (item.publishedAt ?? item.uploadedAt) > decidedAt && whenDone(item) > decidedAt && (getSubmissionProgress(data, item) < SECURE || item.learningGaps.some((topic) => gapConfirmed(item, topic))));
  const latestOutcomes = [...new Map(outcomes.map((item) => [item.action.topicKey ?? "overall", item])).values()];
  const improved = latestOutcomes.some((item) => item.outcome === "improved");
  const hasSupport = (caseRecord?.actions.length ?? 0) > 0;
  let status: SupportStatus | undefined;
  let newEvidenceSinceDecision = false;
  if (caseRecord?.decision === "dismissed" || caseRecord?.decision === "resolved") {
    if (priority && newEvidence) { status = "new"; newEvidenceSinceDecision = true; }
    else status = caseRecord.decision;
  } else if (hasSupport) status = improved ? "improving" : priority ? "support" : "improving";
  else if (caseRecord?.decision === "confirmed") status = "reviewed";
  else if (priority) status = "new";
  const evidenceCleared = Boolean(status && status !== "resolved" && status !== "dismissed" && !priority);
  const isolated = !priority && low.length === 1 && !evidenceClearedFor(status) ? { submissionId: low[0].id, percent: low[0].percent } : undefined;
  const ideas = new Map<string, { label: string; topicKey: string; count: number; evidence: Evidence[] }>();
  rows.forEach((row) => row.wrongIdeas.forEach((idea) => { const entry = ideas.get(idea) ?? { label: idea, topicKey: row.topicKey, count: 0, evidence: [] }; entry.count += 1; entry.evidence.push({ submissionId: row.submissionId, questionId: row.questionId }); ideas.set(idea, entry); }));
  return {
    studentId,
    results: percents.map((item) => { const submission = shared.find((entry) => entry.id === item.id)!; return { id: item.id, at: whenDone(submission), percent: item.percent, assessmentId: submission.assessmentId, language: submission.language }; }),
    average: percents.length ? Math.round(percents.reduce((sum, item) => sum + item.percent, 0) / percents.length) : undefined,
    topics, signals: [...signals].sort((a, b) => b.weight - a.weight), score, priority, status, newEvidenceSinceDecision, evidenceCleared,
    isolatedLow: isolated, waiting, waitingPreview: rank(preview) > rank(priority) ? preview : undefined,
    outcomes, recommendations: recommendationsFor(data, signals, priority), caseRecord,
    // Topics behind a signal come first, then other topics below secure.
    weakestTopics: [...topics.filter((topic) => signals.some((signal) => signal.topicKey === topic.topicKey)), ...topics.filter((topic) => topic.percent < SECURE && !signals.some((signal) => signal.topicKey === topic.topicKey))].slice(0, 3),
    strongestTopics: [...topics].filter((topic) => topic.percent >= SECURE).sort((a, b) => b.percent - a.percent).slice(0, 3),
    wrongIdeas: [...ideas.values()].sort((a, b) => b.count - a.count),
  };
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, attention: 1, monitoring: 2, none: 3 };
const STATUS_ORDER: Record<SupportStatus, number> = { new: 0, reviewed: 1, support: 2, improving: 3, resolved: 4, dismissed: 5 };

/** Students who are, or were, flagged: open flags first by priority and evidence, then improving, resolved, dismissed. */
export function flaggedStudents(data: AssessmentAppData) {
  return data.students.map((student) => studentSupport(data, student.id))
    .filter((item) => item.status !== undefined)
    .sort((a, b) => {
      const openA = a.status === "resolved" || a.status === "dismissed" ? 1 : 0, openB = b.status === "resolved" || b.status === "dismissed" ? 1 : 0;
      return openA - openB || PRIORITY_ORDER[a.priority ?? "none"] - PRIORITY_ORDER[b.priority ?? "none"] || b.score - a.score || STATUS_ORDER[a.status!] - STATUS_ORDER[b.status!] || (a.average ?? 100) - (b.average ?? 100);
    });
}

/** Counts used by Home, Learning insights and Flagged students alike. */
export function classOverview(data: AssessmentAppData) {
  const all = data.students.map((student) => studentSupport(data, student.id));
  const open = all.filter((item) => item.priority && item.status !== "dismissed" && item.status !== "resolved");
  return {
    students: data.students.length,
    withResults: all.filter((item) => item.results.length > 0).length,
    doingWell: all.filter((item) => item.results.length > 0 && !item.priority && (item.average ?? 0) >= SECURE).length,
    needSupport: open.length,
    high: open.filter((item) => item.priority === "high").length,
    attention: open.filter((item) => item.priority === "attention").length,
    monitoring: open.filter((item) => item.priority === "monitoring").length,
    improving: all.filter((item) => item.status === "improving").length,
    newFlags: all.filter((item) => item.status === "new").length,
    all,
  };
}

export interface TopicInsight {
  topicKey: string; label: string; subject: string; percent: number; answers: number;
  students: string[]; needSupport: string[]; trend: "improving" | "falling" | "steady" | "not-enough"; trendDelta?: number;
  wrongIdeas: { label: string; students: string[]; evidence: Evidence[] }[];
  evidence: Evidence[];
}

/** Class view of each topic from shared results: average, who needs support, trend and repeated wrong ideas. */
export function topicInsights(data: AssessmentAppData): TopicInsight[] {
  const supports = new Map(data.students.map((student) => [student.id, studentSupport(data, student.id)]));
  const rows = answerRows(data, data.submissions.filter(isShared));
  const byTopic = new Map<string, AnswerRow[]>();
  rows.forEach((row) => byTopic.set(row.topicKey, [...(byTopic.get(row.topicKey) ?? []), row]));
  return [...byTopic.entries()].map(([topicKey, topicRows]) => {
    const students = [...new Set(topicRows.map((row) => (data.submissions.find((item) => item.id === row.submissionId)!).studentId))];
    const needSupport = students.filter((id) => { const support = supports.get(id)!; const topic = support.topics.find((item) => item.topicKey === topicKey); return support.signals.some((signal) => signal.topicKey === topicKey) || (topic !== undefined && topic.percent < LOW_RESULT); });
    // Trend: the earlier half of the class's shared answers in this topic against the more recent half (4+ answers).
    const ordered = [...topicRows].sort((a, b) => a.at.localeCompare(b.at));
    const half = Math.floor(ordered.length / 2);
    const delta = ordered.length >= 4 ? rowsPercent(ordered.slice(ordered.length - half)) - rowsPercent(ordered.slice(0, half)) : undefined;
    const ideas = new Map<string, { label: string; students: Set<string>; evidence: Evidence[] }>();
    topicRows.forEach((row) => row.wrongIdeas.forEach((idea) => { const entry = ideas.get(idea) ?? { label: idea, students: new Set<string>(), evidence: [] }; entry.students.add(data.submissions.find((item) => item.id === row.submissionId)!.studentId); entry.evidence.push({ submissionId: row.submissionId, questionId: row.questionId }); ideas.set(idea, entry); }));
    return {
      topicKey, label: getTopicLabel(data, topicKey), subject: topicRows[0].subject, percent: rowsPercent(topicRows), answers: topicRows.length, students, needSupport,
      trend: delta === undefined ? "not-enough" : delta >= 10 ? "improving" : delta <= -10 ? "falling" : "steady", trendDelta: delta,
      wrongIdeas: [...ideas.values()].map((entry) => ({ label: entry.label, students: [...entry.students], evidence: entry.evidence })).sort((a, b) => b.students.length - a.students.length),
      evidence: topicRows.filter((row) => row.score < row.max).map((row) => ({ submissionId: row.submissionId, questionId: row.questionId })),
    } satisfies TopicInsight;
  }).sort((a, b) => a.percent - b.percent || b.needSupport.length - a.needSupport.length);
}

/** Wrong ideas seen in shared answers of 2 or more students. */
export function classWrongIdeas(data: AssessmentAppData) {
  return topicInsights(data).flatMap((topic) => topic.wrongIdeas.filter((idea) => idea.students.length >= 2).map((idea) => ({ ...idea, topicKey: topic.topicKey, topicLabel: topic.label }))).sort((a, b) => b.students.length - a.students.length);
}
