// Student notifications: created only by teacher actions, saved with the rest of the data, one list per student.
// Pure functions: they return new data and never change what they are given.

import {
  getAssessment,
  getStudent,
  getTopicLabel,
  type AssessmentAppData,
  type HelpRequestRecord,
  type NotificationKind,
  type StudentNotificationRecord,
  type SubmissionRecord,
} from "./assessmentData";

export const NOTIFICATION_WORDS: Record<NotificationKind, string> = {
  result: "New result",
  "result-updated": "Result updated",
  reply: "Reply to your question",
  feedback: "Message from your teacher",
  practice: "Practice idea",
  "review-topic": "Topic to look at again",
  support: "Extra help",
};

/** Kinds a teacher can send by hand (the others come from sharing results and replying to questions). */
export const SENDABLE_KINDS: NotificationKind[] = ["feedback", "practice", "review-topic"];

export interface NotificationResult { data: AssessmentAppData; record?: StudentNotificationRecord; duplicate: boolean }

/** Adds a notification unless one with the same key already exists. The key names the action, so repeating it adds nothing. */
export function addNotification(data: AssessmentAppData, draft: Omit<StudentNotificationRecord, "id" | "createdAt"> & { createdAt?: string }): NotificationResult {
  const list = data.notifications ?? [];
  const existing = list.find((item) => item.key === draft.key && item.studentId === draft.studentId);
  if (existing) return { data, record: existing, duplicate: true };
  if (!data.students.some((student) => student.id === draft.studentId)) return { data, duplicate: false };
  const createdAt = draft.createdAt ?? new Date().toISOString();
  const record: StudentNotificationRecord = { ...draft, id: `note-${draft.studentId}-${createdAt}-${list.length}`, createdAt };
  return { data: { ...data, notifications: [record, ...list] }, record, duplicate: false };
}

/** The notification for a result that was just shared (or shared again after a correction). */
export function resultNotification(data: AssessmentAppData, submission: SubmissionRecord) {
  const assessment = getAssessment(data, submission.assessmentId);
  const practise = (submission.learningGaps ?? []).filter((topic) => submission.learningGapDecisions?.[topic] === "confirmed").map((topic) => getTopicLabel(data, topic));
  const updated = Boolean(submission.resultUpdated);
  return {
    studentId: submission.studentId,
    kind: (updated ? "result-updated" : "result") as NotificationKind,
    title: updated ? "Your teacher updated a result" : "Your teacher shared a new result",
    message: `${assessment.title}: your marks and your teacher’s feedback are ready.${practise.length ? ` Things to keep practising: ${practise.join(", ")}.` : ""}${submission.overallFeedback?.trim() ? " There is a message for you too." : ""}`,
    submissionId: submission.id,
    assessmentId: submission.assessmentId,
    key: `result:${submission.id}:${submission.publishedAt ?? ""}`,
  };
}

export function replyNotification(request: HelpRequestRecord) {
  return {
    studentId: request.studentId,
    kind: "reply" as NotificationKind,
    title: "Your teacher replied",
    message: request.response ?? "",
    helpRequestId: request.id,
    assessmentId: request.assessmentId,
    key: `reply:${request.id}:${request.responseAt ?? ""}`,
  };
}

/** A note the teacher writes: a comment, a practice idea or a topic to look at again. */
export function teacherNotification(data: AssessmentAppData, input: { studentId: string; kind: NotificationKind; message: string; topicKey?: string; assessmentId?: string; submissionId?: string }) {
  const topic = input.topicKey ? getTopicLabel(data, input.topicKey) : undefined;
  const title = input.kind === "practice" ? `Practice idea${topic ? `: ${topic}` : ""}` : input.kind === "review-topic" ? `Look at ${topic ? topic.toLowerCase() : "this topic"} again` : "A message from your teacher";
  const message = input.message.trim();
  return { ...input, message, title, key: `${input.kind}:${input.studentId}:${input.topicKey ?? ""}:${input.submissionId ?? input.assessmentId ?? ""}:${message.toLocaleLowerCase()}` };
}

export interface StudentNotificationView extends StudentNotificationRecord { legacy?: boolean }

/** Everything in one student's list, newest first. Results and replies saved before notifications existed
 *  still appear (as before), unless a saved notification already covers them. Never another student's. */
export function notificationsFor(data: AssessmentAppData, studentId: string): StudentNotificationView[] {
  const saved = (data.notifications ?? []).filter((item) => item.studentId === studentId);
  const coveredResults = new Set(saved.filter((item) => item.submissionId && (item.kind === "result" || item.kind === "result-updated")).map((item) => `${item.submissionId}`));
  const coveredReplies = new Set(saved.filter((item) => item.helpRequestId).map((item) => item.helpRequestId));
  const legacyResults: StudentNotificationView[] = data.submissions
    .filter((item) => item.studentId === studentId && item.status === "published" && !coveredResults.has(item.id) && !(item.seenBy?.student ?? item.notificationSeen))
    .map((item) => ({ ...resultNotification(data, item), id: `legacy-result-${item.id}`, createdAt: item.publishedAt ?? item.uploadedAt, legacy: true }));
  const legacyReplies: StudentNotificationView[] = data.helpRequests
    .filter((item) => item.studentId === studentId && item.kind === "teacher" && item.status === "answered" && item.responseSeen === false && !coveredReplies.has(item.id))
    .map((item) => ({ ...replyNotification(item), id: `legacy-reply-${item.id}`, createdAt: item.responseAt ?? item.createdAt, legacy: true }));
  // A saved result notice counts as read once the student has opened that result.
  const savedViews = saved.map((item) => {
    if (!item.readAt && item.helpRequestId && data.helpRequests.some((request) => request.id === item.helpRequestId && request.responseSeen === true)) return { ...item, readAt: item.createdAt };
    if (item.readAt || !item.submissionId || (item.kind !== "result" && item.kind !== "result-updated")) return item;
    const submission = data.submissions.find((entry) => entry.id === item.submissionId);
    // Hidden again (reopened): the notice stays but can't be opened until it is shared again.
    return submission && submission.status === "published" && submission.seenBy?.student && item.key === `result:${submission.id}:${submission.publishedAt ?? ""}` ? { ...item, readAt: item.createdAt } : item;
  });
  return [...savedViews, ...legacyResults, ...legacyReplies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const unreadCount = (list: StudentNotificationView[]) => list.filter((item) => !item.readAt).length;

/** Marks notifications as read (all of one student's, or the given ones). Legacy items update their source record. */
export function markNotificationsRead(data: AssessmentAppData, studentId: string, ids?: string[], now = new Date().toISOString()): AssessmentAppData {
  const views = notificationsFor(data, studentId).filter((item) => !item.readAt && (!ids || ids.includes(item.id)));
  if (!views.length) return data;
  const savedIds = new Set(views.filter((item) => !item.legacy).map((item) => item.id));
  const resultIds = new Set(views.filter((item) => item.submissionId && (item.kind === "result" || item.kind === "result-updated")).map((item) => item.submissionId!));
  const replyIds = new Set(views.filter((item) => item.helpRequestId).map((item) => item.helpRequestId!));
  return {
    ...data,
    notifications: (data.notifications ?? []).map((item) => savedIds.has(item.id) ? { ...item, readAt: now } : item),
    submissions: data.submissions.map((item) => resultIds.has(item.id) && item.studentId === studentId ? { ...item, seenBy: { student: true, parent: item.seenBy?.parent ?? item.notificationSeen }, notificationSeen: true } : item),
    helpRequests: data.helpRequests.map((item) => replyIds.has(item.id) && item.studentId === studentId ? { ...item, responseSeen: true } : item),
  };
}

/** Teacher view: what was sent to a student, newest first. */
export function sentTo(data: AssessmentAppData, studentId: string) {
  return (data.notifications ?? []).filter((item) => item.studentId === studentId && !item.demo).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const studentName = (data: AssessmentAppData, studentId: string) => getStudent(data, studentId).name;
