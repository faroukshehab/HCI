// Pure, testable helpers for the enhancement stage. Nothing here changes marks, gaps, flags or
// what is shared: these functions only read teacher-approved data and summarise it.
import { getAssessment, getQuestionDifficulty, getSubmissionProgress, getSubmissionQuestions, getTopicLabel, type SubmissionRecord, type AssessmentAppData, type AssessmentTemplateRecord, type ConfidenceLevel, type DifficultyLevel, type DifficultyTarget, type HelpRequestRecord, type HelpSettings, type QuestionDefinition } from "./assessmentData";

// ---------------------------------------------------------------------------
// Student Confidence vs. Answer
// ---------------------------------------------------------------------------

/** Right = full marks, partly = some marks, not yet = no marks. Kept separate on purpose. */
export type AnswerOutcome = "right" | "partly" | "notyet";
export const OUTCOMES: AnswerOutcome[] = ["right", "partly", "notyet"];
export const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["high", "medium", "low"];

export function answerOutcome(score: number, maxScore: number): AnswerOutcome {
  if (maxScore > 0 && score >= maxScore) return "right";
  return score > 0 ? "partly" : "notyet";
}

export interface ConfidenceRow {
  submissionId: string;
  studentId: string;
  assessmentId: string;
  questionId: string;
  topicKey: string;
  confidence: ConfidenceLevel;
  outcome: AnswerOutcome;
  score: number;
  maxScore: number;
  /** Only shared (published) results count for class-wide patterns. */
  shared: boolean;
}

/** One row per answered question, using the teacher's current mark. Scans still being read are skipped. */
export function confidenceRows(data: AssessmentAppData, filter: { studentId?: string; sharedOnly?: boolean; submissionIds?: string[] } = {}): ConfidenceRow[] {
  return data.submissions
    // Work the teacher uploaded for a student has no confidence ratings, so it is left out.
    .filter((submission) => submission.status !== "processing" && submission.answers.length > 0 && submission.uploadedBy !== "teacher")
    .filter((submission) => !filter.studentId || submission.studentId === filter.studentId)
    .filter((submission) => !filter.sharedOnly || submission.status === "published")
    .filter((submission) => !filter.submissionIds || filter.submissionIds.includes(submission.id))
    .flatMap((submission) => getSubmissionQuestions(data, submission).flatMap((question) => {
      const answer = submission.answers.find((item) => item.questionId === question.id);
      if (!answer) return [];
      return [{
        submissionId: submission.id,
        studentId: submission.studentId,
        assessmentId: submission.assessmentId,
        questionId: question.id,
        topicKey: question.topicKey,
        confidence: answer.confidence ?? "medium",
        outcome: answerOutcome(answer.teacherScore, question.maxScore),
        score: answer.teacherScore,
        maxScore: question.maxScore,
        shared: submission.status === "published",
      }];
    }));
}

export type ConfidenceGrid = Record<ConfidenceLevel, Record<AnswerOutcome, number>>;

export function confidenceGrid(rows: ConfidenceRow[]): ConfidenceGrid {
  const grid = Object.fromEntries(CONFIDENCE_LEVELS.map((level) => [level, { right: 0, partly: 0, notyet: 0 }])) as ConfidenceGrid;
  rows.forEach((row) => { grid[row.confidence][row.outcome] += 1; });
  return grid;
}

/** "Sure but not fully right" and "Right but not sure". Indicators for the teacher, never a diagnosis. */
export type PatternKind = "sure-not-right" | "unsure-right";

export function rowMatches(kind: PatternKind, row: Pick<ConfidenceRow, "confidence" | "outcome">) {
  return kind === "sure-not-right" ? row.confidence === "high" && row.outcome !== "right" : row.confidence === "low" && row.outcome === "right";
}

/** A pattern is only reported when the same signal appears in at least two answers from at least two
 *  different assessments. One answer, or several answers in one assessment, is never a pattern. */
export const PATTERN_RULE = { minAnswers: 2, minAssessments: 2 } as const;

export interface ConfidencePattern {
  kind: PatternKind;
  studentId: string;
  topicKey: string;
  /** Answers showing the signal. */
  answers: number;
  /** Different assessments those answers come from. */
  assessments: number;
  /** All answers this student gave in this topic (the evidence base). */
  topicAnswers: number;
}

export function confidencePatterns(rows: ConfidenceRow[]): ConfidencePattern[] {
  const groups = new Map<string, ConfidenceRow[]>();
  rows.forEach((row) => { const key = `${row.studentId}|${row.topicKey}`; groups.set(key, [...(groups.get(key) ?? []), row]); });
  const patterns: ConfidencePattern[] = [];
  groups.forEach((group) => {
    (["sure-not-right", "unsure-right"] as PatternKind[]).forEach((kind) => {
      const matching = group.filter((row) => rowMatches(kind, row));
      const assessments = new Set(matching.map((row) => row.submissionId)).size;
      if (matching.length >= PATTERN_RULE.minAnswers && assessments >= PATTERN_RULE.minAssessments) {
        patterns.push({ kind, studentId: group[0].studentId, topicKey: group[0].topicKey, answers: matching.length, assessments, topicAnswers: group.length });
      }
    });
  });
  return patterns.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "sure-not-right" ? -1 : 1) || b.answers - a.answers);
}

/** Single signals that are not (yet) a pattern, so the teacher can see why nothing is reported. */
export function singleSignals(rows: ConfidenceRow[]) {
  const patterns = confidencePatterns(rows);
  return rows.filter((row) => (["sure-not-right", "unsure-right"] as PatternKind[]).some((kind) => rowMatches(kind, row)
    && !patterns.some((pattern) => pattern.kind === kind && pattern.studentId === row.studentId && pattern.topicKey === row.topicKey))).length;
}

/** Child-facing summary of one shared result. Only encouraging statements; nothing is called a mistake. */
export function studentConfidenceSummary(rows: ConfidenceRow[]) {
  return {
    sureAndRight: rows.filter((row) => row.confidence === "high" && row.outcome === "right").length,
    unsureButRight: rows.filter((row) => row.confidence !== "high" && row.outcome === "right").length,
    toLookAgain: rows.filter((row) => row.outcome !== "right").length,
  };
}

// ---------------------------------------------------------------------------
// Difficulty Balancer and Template Builder
// ---------------------------------------------------------------------------

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium", "difficult"];
export type BalancePreset = "gentle" | "balanced" | "challenging";
/** Ratios of easy : medium : difficult. They are scaled to the number of selected questions. */
export const BALANCE_PRESETS: Record<BalancePreset, DifficultyTarget> = {
  gentle: { easy: 3, medium: 2, difficult: 1 },
  balanced: { easy: 1, medium: 1, difficult: 1 },
  challenging: { easy: 1, medium: 2, difficult: 3 },
};

/** The teacher's level for this template if they changed it; otherwise the level chosen when a teacher wrote
 *  the question (pass the questions so it can be found); otherwise the built-in level. */
export function difficultyOf(questionId: string, overrides: Record<string, DifficultyLevel> = {}, questions: QuestionDefinition[] = []): DifficultyLevel {
  return overrides[questionId] ?? questions.find((question) => question.id === questionId)?.difficulty ?? getQuestionDifficulty(questionId);
}

export function difficultyCounts(questionIds: string[], overrides: Record<string, DifficultyLevel> = {}, questions: QuestionDefinition[] = []): DifficultyTarget {
  const counts: DifficultyTarget = { easy: 0, medium: 0, difficult: 0 };
  questionIds.forEach((id) => { counts[difficultyOf(id, overrides, questions)] += 1; });
  return counts;
}

/** All questions of an assessment once each: English wording where it exists, plus German-only teacher questions. */
export function questionBank(assessment: { questions: Record<"en" | "de", QuestionDefinition[]> }) {
  return [...assessment.questions.en, ...assessment.questions.de.filter((question) => !assessment.questions.en.some((item) => item.id === question.id))];
}

/** The languages in which every one of these questions exists (a teacher question has one language). */
export function languagesFor(assessment: { questions: Record<"en" | "de", QuestionDefinition[]> }, questionIds: string[]) {
  return (["en", "de"] as const).filter((language) => questionIds.every((id) => assessment.questions[language].some((question) => question.id === id)));
}

/** Scales a ratio to whole question counts that add up to `total` (largest remainder; ties go to the easier level). */
export function targetCounts(ratio: DifficultyTarget, total: number): DifficultyTarget {
  const sum = DIFFICULTY_LEVELS.reduce((acc, level) => acc + ratio[level], 0) || 1;
  const exact = DIFFICULTY_LEVELS.map((level) => ({ level, value: (ratio[level] * total) / sum }));
  const counts: DifficultyTarget = { easy: 0, medium: 0, difficult: 0 };
  exact.forEach(({ level, value }) => { counts[level] = Math.floor(value); });
  let left = total - DIFFICULTY_LEVELS.reduce((acc, level) => acc + counts[level], 0);
  [...exact].sort((a, b) => (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value))).forEach(({ level }) => { if (left > 0) { counts[level] += 1; left -= 1; } });
  return counts;
}

export function isBalanced(actual: DifficultyTarget, target: DifficultyTarget) {
  return DIFFICULTY_LEVELS.every((level) => actual[level] === target[level]);
}

export interface BalanceSuggestion { kind: "swap" | "add" | "remove"; level?: DifficultyLevel; addId?: string; removeId?: string }

/** Up to three one-click suggestions that move the selection towards the target. A question to add
 *  prefers a topic that is not covered yet; a question to remove prefers a topic that is covered twice. */
export function balanceSuggestions(questions: QuestionDefinition[], selectedIds: string[], target: DifficultyTarget, overrides: Record<string, DifficultyLevel> = {}): BalanceSuggestion[] {
  const actual = difficultyCounts(selectedIds, overrides, questions);
  const selected = questions.filter((question) => selectedIds.includes(question.id));
  const topicCount = (topicKey: string) => selected.filter((question) => question.topicKey === topicKey).length;
  const used = new Set<string>();
  const pickAdd = (level: DifficultyLevel) => questions
    .filter((question) => !selectedIds.includes(question.id) && !used.has(question.id) && difficultyOf(question.id, overrides, questions) === level)
    .sort((a, b) => topicCount(a.topicKey) - topicCount(b.topicKey))[0];
  const pickRemove = (level: DifficultyLevel) => [...selected]
    .filter((question) => !used.has(question.id) && difficultyOf(question.id, overrides, questions) === level)
    .sort((a, b) => topicCount(b.topicKey) - topicCount(a.topicKey) || selected.indexOf(b) - selected.indexOf(a))[0];
  const over = DIFFICULTY_LEVELS.flatMap((level) => Array(Math.max(0, actual[level] - target[level])).fill(level) as DifficultyLevel[]);
  const under = DIFFICULTY_LEVELS.flatMap((level) => Array(Math.max(0, target[level] - actual[level])).fill(level) as DifficultyLevel[]);
  const suggestions: BalanceSuggestion[] = [];
  while (suggestions.length < 3 && (over.length || under.length)) {
    if (over.length && under.length) {
      const remove = pickRemove(over[0]); const add = pickAdd(under[0]);
      if (remove && add) { used.add(remove.id); used.add(add.id); suggestions.push({ kind: "swap", level: under[0], removeId: remove.id, addId: add.id }); over.shift(); under.shift(); continue; }
    }
    if (under.length) { const add = pickAdd(under[0]); under.shift(); if (add) { used.add(add.id); suggestions.push({ kind: "add", level: difficultyOf(add.id, overrides, questions), addId: add.id }); } continue; }
    const remove = pickRemove(over[0]); over.shift(); if (remove) { used.add(remove.id); suggestions.push({ kind: "remove", level: difficultyOf(remove.id, overrides, questions), removeId: remove.id }); }
  }
  return suggestions;
}

/** Average teacher mark on a question in shared results (any language). */
export function classAverage(data: AssessmentAppData, questionId: string) {
  const marks = data.submissions.filter((submission) => submission.status === "published").flatMap((submission) => {
    const question = getSubmissionQuestions(data, submission).find((item) => item.id === questionId);
    const answer = submission.answers.find((item) => item.questionId === questionId);
    return question && answer ? [answer.teacherScore / question.maxScore] : [];
  });
  return marks.length ? { percent: Math.round((marks.reduce((sum, value) => sum + value, 0) / marks.length) * 100), answers: marks.length } : undefined;
}

/** Warnings only; the teacher can still save. */
export function templateDuplicates(templates: AssessmentTemplateRecord[], draft: { title: string; assessmentId: string; questionIds: string[] }) {
  const key = (ids: string[]) => [...ids].sort().join("|");
  return {
    sameTitle: templates.find((template) => template.title.trim().toLocaleLowerCase() === draft.title.trim().toLocaleLowerCase()),
    sameQuestions: templates.find((template) => template.assessmentId === draft.assessmentId && key(template.questionIds) === key(draft.questionIds)),
  };
}

/** Students who already have this template assigned can't get it twice. */
export function assignmentState(data: AssessmentAppData, templateId: string) {
  return data.students.map((student) => ({ student, assigned: data.assignments.some((assignment) => assignment.studentId === student.id && assignment.templateId === templateId) }));
}

// ---------------------------------------------------------------------------
// Ask for Help ladder
// ---------------------------------------------------------------------------

export type LadderStep = "hint1" | "hint2" | "example" | "teacher";
/** Hints and the example are climbed in order; asking the teacher is always possible (if allowed). */
export const LADDER: LadderStep[] = ["hint1", "hint2", "example", "teacher"];

export function stepOf(request: Pick<HelpRequestRecord, "kind" | "level">): LadderStep {
  if (request.kind === "teacher") return "teacher";
  if (request.kind === "example") return "example";
  return request.level === 2 ? "hint2" : "hint1";
}

export function stepAllowed(step: LadderStep, settings?: HelpSettings) {
  if (!settings) return true;
  return step === "teacher" ? settings.teacher : step === "example" ? settings.examples : settings.hints;
}

/** Help one student asked for on one question, oldest first. When an assignment is given, requests made
 *  for a different assignment are left out; `before` keeps only help asked before that time. */
export function helpForQuestion(data: AssessmentAppData, filter: { studentId: string; assessmentId: string; questionId: string; assignmentId?: string; before?: string }) {
  return data.helpRequests
    .filter((request) => request.studentId === filter.studentId && request.assessmentId === filter.assessmentId && request.questionId === filter.questionId)
    .filter((request) => !filter.assignmentId || !request.assignmentId || request.assignmentId === filter.assignmentId)
    .filter((request) => !filter.before || request.createdAt <= filter.before)
    .slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Which ladder steps are used and which can be opened now. A step unlocks once every allowed step
 *  before it has been used; steps the teacher turned off are skipped. */
export function ladderState(requests: HelpRequestRecord[], settings?: HelpSettings) {
  const used = new Set(requests.map(stepOf));
  const climb = (["hint1", "hint2", "example"] as LadderStep[]).filter((step) => stepAllowed(step, settings));
  const unlocked = new Set<LadderStep>();
  for (const step of climb) { unlocked.add(step); if (!used.has(step)) break; }
  if (stepAllowed("teacher", settings)) unlocked.add("teacher");
  const next = climb.find((step) => !used.has(step));
  return { used, unlocked, next };
}

/** Per question: how many students used each kind of help (for the teacher's insights). */
export function helpByQuestion(data: AssessmentAppData) {
  const rows = new Map<string, { assessmentId: string; questionId: string; students: Set<string>; steps: Record<LadderStep, number>; notHelpful: number }>();
  data.helpRequests.forEach((request) => {
    const key = `${request.assessmentId}|${request.questionId}`;
    const row = rows.get(key) ?? { assessmentId: request.assessmentId, questionId: request.questionId, students: new Set<string>(), steps: { hint1: 0, hint2: 0, example: 0, teacher: 0 }, notHelpful: 0 };
    row.students.add(request.studentId);
    row.steps[stepOf(request)] += 1;
    if (request.helpful === false) row.notHelpful += 1;
    rows.set(key, row);
  });
  return [...rows.values()].sort((a, b) => b.students.size - a.students.size || (b.steps.hint1 + b.steps.hint2 + b.steps.example + b.steps.teacher) - (a.steps.hint1 + a.steps.hint2 + a.steps.example + a.steps.teacher));
}

// ---------------------------------------------------------------------------
// Parent experience (only ever called with teacher-checked, shared results)
// ---------------------------------------------------------------------------

/** Parent-friendly topic status. Based only on teacher marks and teacher decisions in shared results. */
export type ParentTopicStatus = "practising" | "improving" | "doing-well" | "on-track";

function topicIsConfirmedGap(submission: SubmissionRecord, topicKey: string) {
  return ((submission.learningGaps ?? []).includes(topicKey) && submission.learningGapDecisions?.[topicKey] === "confirmed")
    || submission.flags.some((flag) => flag.topicKey === topicKey && flag.decision === "confirmed");
}

/** Progress by subject. `approved` must already be filtered to shared, fully checked results. */
export function parentProgress(data: AssessmentAppData, approved: SubmissionRecord[]) {
  const oldestFirst = [...approved].sort((a, b) => (a.publishedAt ?? a.uploadedAt).localeCompare(b.publishedAt ?? b.uploadedAt));
  const subjects = new Map<string, SubmissionRecord[]>();
  oldestFirst.forEach((submission) => { const subject = getAssessment(data, submission.assessmentId).subject; subjects.set(subject, [...(subjects.get(subject) ?? []), submission]); });
  return [...subjects.entries()].map(([subject, results]) => {
    const history = new Map<string, { percent: number; gap: boolean }[]>();
    results.forEach((submission) => {
      const byTopic = new Map<string, { score: number; max: number }>();
      getSubmissionQuestions(data, submission).forEach((question) => {
        const answer = submission.answers.find((item) => item.questionId === question.id);
        const entry = byTopic.get(question.topicKey) ?? { score: 0, max: 0 };
        byTopic.set(question.topicKey, { score: entry.score + (answer?.teacherScore ?? 0), max: entry.max + question.maxScore });
      });
      byTopic.forEach((value, topicKey) => history.set(topicKey, [...(history.get(topicKey) ?? []), { percent: value.max ? Math.round((value.score / value.max) * 100) : 0, gap: topicIsConfirmedGap(submission, topicKey) }]));
    });
    const order: ParentTopicStatus[] = ["practising", "improving", "doing-well", "on-track"];
    const topics = [...history.entries()].map(([topicKey, entries]) => {
      const latest = entries[entries.length - 1];
      const status: ParentTopicStatus = latest.gap ? "practising" : entries.slice(0, -1).some((entry) => entry.gap) ? "improving" : latest.percent >= 75 ? "doing-well" : "on-track";
      return { topicKey, label: getTopicLabel(data, topicKey), status, latestPercent: latest.percent, results: entries.length };
    }).sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.label.localeCompare(b.label));
    // Parent-safe projection: only ids, dates, teacher-approved percentages and the "corrected" marker.
    const points = results.map((submission) => ({ id: submission.id, assessmentId: submission.assessmentId, at: submission.publishedAt ?? submission.uploadedAt, percent: getSubmissionProgress(data, submission), corrected: Boolean(submission.revisions?.length) }));
    return { subject, results: [...points].reverse(), points, topics };
  });
}

/** The parent's latest "read" of the version that is shared now (a correction needs a new read). */
export function currentParentRead(submission: SubmissionRecord) {
  return [...(submission.parentReads ?? [])].reverse().find((read) => read.at >= (submission.publishedAt ?? ""));
}
