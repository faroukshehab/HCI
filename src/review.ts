// Teacher review helpers: the grading checks for one answer and a readable breakdown of the simulated AI mark.
// Pure and read-only: nothing here changes a mark. Publishing is still gated only by getPublishBlockers.

import type { AnswerRecord, Language, QuestionDefinition, SubmissionRecord } from "./assessmentData";
import { findWrongIdeas, rubricGuide } from "./grading";

export type CheckKind = "changed" | "uncertain" | "incomplete" | "wrong-idea" | "unverified";
export interface AnswerCheck { kind: CheckKind; text: string; resolved: boolean; fix: string }

/** OCR below this confidence is treated as uncertain. */
export const OCR_UNSURE = 85;
/** Fewer words than this is treated as a possibly incomplete answer. */
export const SHORT_ANSWER_WORDS = 4;

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** What needs the teacher's eye in this answer. Each check is resolved by the teacher verifying the answer
 *  (or, for a changed suggestion, by choosing a mark), which is exactly what the publish gate requires. */
export function answerChecks(question: QuestionDefinition, answer: AnswerRecord): AnswerCheck[] {
  const checks: AnswerCheck[] = [];
  const text = answer.extractedText || "";
  if (answer.suggestionChanged) checks.push({ kind: "changed", text: `The text changed after you approved the mark. The AI now suggests ${answer.aiScore}; your mark is ${answer.teacherScore}.`, resolved: false, fix: "Accept the AI mark or keep yours." });
  if ((answer.ocrUncertain?.length ?? 0) > 0 || answer.ocrConfidence < OCR_UNSURE) checks.push({ kind: "uncertain", text: answer.ocrUncertain?.length ? `The scan is unsure about: ${answer.ocrUncertain.join(", ")}.` : `The scan is only ${answer.ocrConfidence}% sure of this text.`, resolved: answer.verified, fix: "Compare with the original work, correct the text, then verify it." });
  if (words(text) < SHORT_ANSWER_WORDS) checks.push({ kind: "incomplete", text: text.trim() ? `A very short answer (${words(text)} word${words(text) === 1 ? "" : "s"}). It may be unfinished.` : "No answer text was found.", resolved: answer.verified, fix: "Check the original work for anything the scan missed." });
  const ideas = answer.teacherScore < question.maxScore || answer.aiScore < question.maxScore ? findWrongIdeas(question, text) : [];
  if (ideas.length) checks.push({ kind: "wrong-idea", text: `Possible wrong idea: ${ideas.join("; ")}. The AI suggestion is capped because of it.`, resolved: answer.verified, fix: "Decide whether the answer really says this, then verify." });
  if (!answer.verified) checks.push({ kind: "unverified", text: "You haven’t checked this answer yet.", resolved: false, fix: "Check the text and the mark, then verify." });
  return checks;
}

export const needsAttention = (checks: AnswerCheck[]) => checks.some((check) => !check.resolved && check.kind !== "unverified");
export const openChecks = (checks: AnswerCheck[]) => checks.filter((check) => !check.resolved).length;

export interface MarkBreakdown {
  credited: { label: string; earned: number; marks: number; partial: boolean }[];
  missing: string[];
  wrongIdeas: string[];
  criteria: { label: string; marks: number; partial: boolean; need: number }[];
  guideWrongIdeas: { label: string; cap: number }[];
  partialNote?: string;
}

/** Turns the simulated grader's matched and missing ideas into credited / missing / incorrect lists. */
export function markBreakdown(question: QuestionDefinition, answer: AnswerRecord): MarkBreakdown {
  const guide = rubricGuide(question);
  const credited = (answer.aiMatchedTerms ?? []).map((term) => {
    const match = term.match(/^(.*) \((\d+)\/(\d+)\)$/);
    return match ? { label: match[1], earned: Number(match[2]), marks: Number(match[3]), partial: Number(match[2]) < Number(match[3]) } : { label: term, earned: 0, marks: 0, partial: false };
  });
  const missing = (answer.aiMissingTerms ?? []).filter((term) => !/\(partly\)$/.test(term));
  const wrongIdeas = findWrongIdeas(question, answer.extractedText || "");
  const partials = credited.filter((item) => item.partial);
  return {
    credited, missing, wrongIdeas, criteria: guide.criteria, guideWrongIdeas: guide.wrongIdeas,
    partialNote: partials.length ? `Part marks: ${partials.map((item) => `${item.label} ${item.earned} of ${item.marks}`).join("; ")} (some of the ideas needed were found).` : undefined,
  };
}

/** Review progress for the whole submission: how many answers are checked and how many need attention. */
export function reviewProgress(questions: QuestionDefinition[], submission: SubmissionRecord, language: Language) {
  void language;
  const rows = questions.map((question) => { const answer = submission.answers.find((item) => item.questionId === question.id); return { question, answer, checks: answer ? answerChecks(question, answer) : [] }; });
  return {
    rows,
    reviewed: rows.filter((row) => row.answer?.verified && !row.answer.suggestionChanged).length,
    attention: rows.filter((row) => needsAttention(row.checks)).length,
    open: rows.reduce((sum, row) => sum + openChecks(row.checks), 0),
  };
}
