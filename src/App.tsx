import { createElement, useEffect, useRef, useState } from "react";
import {
  DEMO_STUDENT_ID,
  DEMO_PARENT_CHILD_ID,
  analyzeSubmission,
  applyExtractedText,
  approveAnswer,
  cancelReopen,
  getAssignmentSubmission,
  publishSubmission,
  reopenSubmission,
  validateExamFile,
  validateExamFiles,
  filesLabel,
  MAX_FILES,
  ACCEPTED_FILE_TYPES,
  listBackups,
  restoreBackup,
  BEFORE_RESTORE_PREFIX,
  BEFORE_RESET_PREFIX,
  resetDemoData,
  getAssessment,
  getLearningSignals,
  getPublishBlockers,
  getTopicLabel,
  reconcileLearningSignals,
  getQuestion,
  getStudent,
  getSubmissionMaxScore,
  getSubmissionProgress,
  getSubmissionQuestions,
  getSubmissionScore,
  getQuestionDifficulty,
  gradeAnswer,
  readAssessmentData,
  storeAssessmentData,
  type AnswerRecord,
  type AssessmentDefinition,
  type CustomQuestionRecord,
  type CustomQuestionDraft,
  CUSTOM_MAX_MARKS,
  buildCustomQuestion,
  validateCustomQuestion,
  withCustomQuestions,
  type AssignmentRecord,
  type DifficultyLevel,
  type DifficultyTarget,
  type HelpSettings,
  type AssessmentTemplateRecord,
  type AssessmentAppData,
  type AttentionFlag,
  type ConfidenceLevel,
  type HelpKind,
  type HelpRequestRecord,
  type Language,
  type QuestionDefinition,
  type SubmissionRecord,
} from "./assessmentData";
import { BALANCE_PRESETS, CONFIDENCE_LEVELS, DIFFICULTY_LEVELS, OUTCOMES, PATTERN_RULE, answerOutcome, assignmentState, balanceSuggestions, currentParentRead, languagesFor, questionBank, helpByQuestion, helpForQuestion, parentProgress, type ParentTopicStatus, ladderState, stepAllowed, stepOf, LADDER, type LadderStep, classAverage, difficultyCounts, difficultyOf, isBalanced, targetCounts, templateDuplicates, type BalancePreset, type BalanceSuggestion, confidenceGrid, confidencePatterns, confidenceRows, rowMatches, singleSignals, studentConfidenceSummary, type AnswerOutcome, type ConfidencePattern, type ConfidenceRow } from "./insights";
import { getHelpText, getSelfCheck } from "./helpContent";
import { NOTIFICATION_WORDS, SENDABLE_KINDS, addNotification, markNotificationsRead, notificationsFor, replyNotification, resultNotification, sentTo, teacherNotification, unreadCount, type StudentNotificationView } from "./notifications";
import { answerChecks, markBreakdown, needsAttention, openChecks, reviewProgress, type AnswerCheck } from "./review";
import { LOW_RESULT, PRIORITY_WORDS, SECURE, STATUS_WORDS, SUPPORT_KIND_WORDS, WEAK_TOPIC, classOverview, classWrongIdeas, flaggedStudents, studentSupport, topicInsights, type Evidence, type Recommendation, type SupportPriority, type SupportStatus, type TopicInsight } from "./support";
import type { MarkChange, NotificationKind, SupportCaseRecord, SupportKind } from "./assessmentData";
import { formatRoute, guardRoute, parseRoute, type CreateTab, type Role, type Route } from "./routes";
import { matchesSearch } from "./search";
import { ACTIVITY_MINUTES, getHomeActivity } from "./homeActivities";

type IconName = "home" | "inbox" | "sparkles" | "users" | "file" | "settings" | "bell" | "search" | "arrow" | "check" | "clock" | "trend" | "alert" | "book" | "chevron" | "scan" | "help" | "chart" | "upload" | "calendar" | "eye" | "plus" | "close";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  inbox: <><path d="M4 4h16v16H4z"/><path d="M4 14h4l2 3h4l2-3h4"/></>,
  sparkles: <><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z"/><path d="m6 14 .8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14ZM18 13l.7 1.8 1.8.7-1.8.7L18 18l-.7-1.8-1.8-.7 1.8-.7L18 13Z"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 4.5a3 3 0 0 1 0 5.8M17 14c2.7.3 4 2.2 4 5"/></>,
  file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  trend: <><path d="M3 17 9 11l4 4 8-9"/><path d="M16 6h5v5"/></>,
  alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
  book: <><path d="M4 5c3-1 5 0 8 2v14c-3-2-5-3-8-2V5ZM20 5c-3-1-5 0-8 2v14c3-2 5-3 8-2V5Z"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  scan: <><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 2M12 17h.01"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 14v6h14v-6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Button({ children, className = "", onClick, title, disabled = false, type = "button", "aria-label": ariaLabel, "aria-expanded": ariaExpanded }: { children: React.ReactNode; className?: string; onClick?: () => void; title?: string; disabled?: boolean; type?: "button" | "submit"; "aria-label"?: string; "aria-expanded"?: boolean }) {
  return createElement("button", { className, onClick, title, disabled, type, "aria-label": ariaLabel, "aria-expanded": ariaExpanded }, children);
}

function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return createElement("h1", { className }, children);
}

const navByRole: Record<string, { label: string; icon: IconName }[]> = {
  Teacher: [
    { label: "Home", icon: "home" },
    { label: "Review submissions", icon: "inbox" },
    { label: "Students", icon: "users" },
    { label: "Flagged students", icon: "alert" },
    { label: "Create assessment", icon: "plus" },
    { label: "Help requests", icon: "help" },
    { label: "Learning insights", icon: "chart" },
  ],
  Student: [
    { label: "Home", icon: "home" },
    { label: "My work", icon: "upload" },
    { label: "My results", icon: "trend" },
    { label: "Get help", icon: "help" },
  ],
  Parent: [
    { label: "Home", icon: "home" },
    { label: "Results", icon: "trend" },
    { label: "Teacher feedback", icon: "book" },
    { label: "Practise at home", icon: "sparkles" },
  ],
};

function Logo() {
  return <div className="logo-wrap"><div className="logo-mark" aria-hidden="true"><span/><span/><span/></div><strong>Brightpath</strong></div>;
}

function Avatar({ initials, color = "violet" }: { initials: string; color?: string }) {
  return <span className={`avatar avatar-${color}`} aria-hidden="true">{initials}</span>;
}

function Sidebar({ active, setActive, role, setRole, counts, onOpenHelp }: { active: string; setActive: (v: string) => void; role: string; setRole: (v: string) => void; counts: Record<string, number>; onOpenHelp: () => void }) {
  return (
    <aside className="sidebar">
      <Logo/>
      <p className="school-line">Greenwood Academy · Grade 4B</p>
      <nav aria-label="Main">{navByRole[role].map((item) => <Button className={`nav-item ${active === item.label ? "active" : ""}`} key={item.label} onClick={() => setActive(item.label)}><Icon name={item.icon}/><span>{item.label}</span>{counts[item.label] ? <em aria-label={`${counts[item.label]} waiting`}>{counts[item.label]}</em> : null}</Button>)}</nav>
      <div className="sidebar-bottom">
        <Button className="demo-link" onClick={onOpenHelp}><Icon name="help" size={16}/> How the demo works</Button>
        <div className="role-switch" role="group" aria-label="Demo role"><small>View as</small><div>{["Teacher", "Student", "Parent"].map((item) => <Button key={item} className={role === item ? "selected" : ""} onClick={() => setRole(item)}>{item}</Button>)}</div></div>
      </div>
    </aside>
  );
}

type TopbarNotification = { id: string; title: string; detail: string; kind: "review" | "help" | "result" | "note"; targetId?: string; read?: boolean; type?: string; message?: string; view?: StudentNotificationView; actionLabel?: string; demo?: boolean };
type Crumb = { label: string; onClick?: () => void };

function Topbar({ role, crumbs, notifications, notificationsOpen, onNotificationsToggle, onSelectNotification, onMarkAllRead, onMarkRead }: { role: string; crumbs: Crumb[]; notifications: TopbarNotification[]; notificationsOpen: boolean; onNotificationsToggle: () => void; onSelectNotification: (item: TopbarNotification) => void; onMarkAllRead?: () => void; onMarkRead?: (item: TopbarNotification) => void }) {
  // Students keep read notifications in the list (marked as read); the badge counts only unread ones.
  const unread = notifications.filter((item) => !item.read).length;
  const user = role === "Teacher" ? { initials: "RA", name: "Ms. Raghda" } : role === "Student" ? { initials: "OH", name: "Omar" } : { initials: "NA", name: "Nadia" };
  return <header className="topbar">
    <nav className="crumbs" aria-label="Breadcrumb"><ol>{crumbs.map((crumb, index) => <li key={index}>{crumb.onClick && index < crumbs.length - 1 ? <button type="button" onClick={crumb.onClick}>{crumb.label}</button> : <span aria-current={index === crumbs.length - 1 ? "page" : undefined}>{crumb.label}</span>}</li>)}</ol></nav>
    <div className="top-actions">
      <div className="notification-wrap"><Button className="icon-button notification" title="Notifications" aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} aria-expanded={notificationsOpen} onClick={onNotificationsToggle}><Icon name="bell"/>{unread > 0 && <span>{unread}</span>}</Button>
        {notificationsOpen && <div className="notification-panel"><div className="notification-heading"><strong>{role === "Teacher" ? "Needs your attention" : role === "Student" ? "Your notifications" : "Updates about Omar"}</strong>{onMarkAllRead && unread > 0 && <button type="button" className="mark-read-button" onClick={onMarkAllRead}>Mark all as read</button>}</div>{notifications.length ? <ul className="notification-list">{notifications.map((item) => <li key={item.id} className={`notification-entry ${item.read ? "is-read" : "is-unread"}`}>
          <Button className="notification-item" onClick={() => onSelectNotification(item)}><span className={`notification-dot ${item.kind} ${item.read ? "read" : ""}`} aria-hidden="true"/><span>{item.type && <em className="notification-type">{item.type}{item.demo && <span className="demo-badge" title="A sample notification that comes with the demo">Demo example</span>}{!item.read && <b className="sr-only"> · unread</b>}</em>}<strong>{item.title}</strong>{item.message && <span className="notification-message">{item.message}</span>}<small>{item.detail}</small>{item.actionLabel && <span className="notification-action">{item.actionLabel} →</span>}</span><Icon name="chevron" size={16}/></Button>
          {onMarkRead && !item.read && <button type="button" className="mark-one-read" onClick={() => onMarkRead(item)} aria-label={`Mark “${item.title}” as read`}>Mark as read</button>}
        </li>)}</ul> : <p className="notification-empty">{role === "Teacher" ? "Nothing needs your attention." : role === "Student" ? "No messages yet! When your teacher shares your marks or sends you a note, you’ll find it here." : "You’re all caught up."}</p>}</div>}
      </div>
      <div className="user-mini"><Avatar initials={user.initials}/><span>{user.name}</span></div>
    </div>
  </header>;
}

function ScoreRing({ score, size = "normal" }: { score: number; size?: "normal" | "large" }) {
  return <div className={`score-ring ${size}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties} role="img" aria-label={`${score}%`}><span><strong>{score}</strong><small>%</small></span></div>;
}

const STATE_READING = "Reading scan";
const STATE_CHECK_TEXT = "Check scanned text";
const STATE_REVIEW = "Needs review";
const STATE_CHOOSE = "Choose a mark";
const STATE_READY = "Ready to publish";
const STATE_SHARED = "Shared";

function queueState(data: AssessmentAppData, submission: SubmissionRecord) {
  if (submission.status === "published") return STATE_SHARED;
  if (submission.status === "processing" || submission.answers.length === 0) return STATE_READING;
  if (submission.answers.some((answer) => answer.suggestionChanged)) return STATE_CHOOSE;
  if (!submission.answers.every((answer) => answer.verified)) return submission.answers.some((answer) => answer.verified) ? STATE_REVIEW : STATE_CHECK_TEXT;
  return getPublishBlockers(data, submission).length ? STATE_REVIEW : STATE_READY;
}

function stateTone(state: string) {
  return state === STATE_READY || state === STATE_SHARED ? "ok" : state === STATE_READING ? "info" : "warn";
}

function shortTitle(title: string) {
  return title.split(": ")[1] ?? title;
}

function PageHead({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return <header className="page-head"><div><Title>{title}</Title>{sub && <p>{sub}</p>}</div>{children && <div className="page-head-actions">{children}</div>}</header>;
}

function SearchBox({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return <label className="search-box"><Icon name="search" size={17}/><span className="sr-only">{label}</span><input type="search" value={value} placeholder={label} onChange={(event) => onChange(event.target.value)}/></label>;
}

const quickReplies: Record<Language, string[]> = {
  en: ["Try drawing it first. ", "Look at your notes on this topic. ", "You were close! ", "Good question. Let’s talk about it in class tomorrow."],
  de: ["Versuch, es zuerst zu zeichnen. ", "Schau in deinen Notizen zu diesem Thema nach. ", "Du warst nah dran! ", "Gute Frage. Wir sprechen morgen im Unterricht darüber."],
};
const ladderWords: Record<LadderStep, string> = { hint1: "Small hint", hint2: "Bigger hint", example: "Example", teacher: "Asked you" };

function HelpInboxItem({ request, studentName, question, before, onReply }: { request: HelpRequestRecord; studentName: string; question: string; before: HelpRequestRecord[]; onReply: (id: string, response: string) => void }) {
  const [draft, setDraft] = useState(request.response ?? "");
  return <article className="help-inbox-item">
    <div className="help-inbox-meta"><strong>{studentName}</strong><span className="muted small">{dateLabel(request.createdAt)} · {request.language === "de" ? "German" : "English"}</span></div>
    <p className="help-question">{question}</p>
    {before.length > 0 && <p className="help-ladder-used"><span className="muted small">Help seen first:</span> {before.map((item) => <span key={item.id} className={`pill ${item.helpful === false ? "warn" : item.helpful ? "ok" : ""}`}>{ladderWords[stepOf(item)]}{item.helpful === false ? " · didn’t help" : item.helpful ? " · helped" : ""}</span>)}</p>}
    {request.tried && <p className="help-tried"><small>Already tried</small>“{request.tried}”</p>}
    {request.message && <p className="help-message">“{request.message}”</p>}
    {request.status === "open" ? <div className="help-reply-form">
      <div className="quick-replies" role="group" aria-label="Reply starters">{quickReplies[request.language].map((text) => <Button key={text} className="chip-button" onClick={() => setDraft((current) => (current ? current.trimEnd() + " " : "") + text)}>{text.trim()}</Button>)}</div>
      <label className="sr-only" htmlFor={`help-reply-${request.id}`}>Reply to {studentName}</label><textarea id={`help-reply-${request.id}`} className="input" lang={request.language} value={draft} onChange={(event)=>setDraft(event.target.value)} placeholder="Write a reply"/><Button className="primary-button" disabled={!draft.trim()} onClick={()=>onReply(request.id, draft.trim())}>Send reply</Button></div>
      : <p className="help-reply"><small>Your reply</small>{request.response}</p>}
  </article>;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function dueDateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(value + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function dueDateCopy(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Date needs review · " + value;
  const day = new Date(value + "T23:59:59");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (day < today ? "Past due · " : "Due ") + dueDateLabel(value);
}

/** A due date the teacher set when assigning wins over the assessment's default date. */
function assignmentDue(data: AssessmentAppData, assignment: AssignmentRecord) {
  return assignment.dueDate ?? getAssessment(data, assignment.assessmentId).dueDate;
}

function dueDateOrder(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

// ---- Confidence vs. answer (teacher views) ----
const outcomeWords: Record<AnswerOutcome, string> = { right: "Right", partly: "Partly right", notyet: "Not yet right" };

/** Counts of how sure the student felt against how the answer was marked. Highlighted cells are
 *  indicators worth a conversation, never a diagnosis. */
function ConfidenceGridTable({ rows, caption }: { rows: ConfidenceRow[]; caption: string }) {
  const grid = confidenceGrid(rows);
  const tone = (level: ConfidenceLevel, outcome: AnswerOutcome) => rowMatches("sure-not-right", { confidence: level, outcome }) ? "warn" : rowMatches("unsure-right", { confidence: level, outcome }) ? "info" : "";
  return <table className="conf-grid">
    <caption className="sr-only">{caption}</caption>
    <thead><tr><th scope="col"><span className="sr-only">Student felt</span></th>{OUTCOMES.map((outcome) => <th scope="col" key={outcome}>{outcomeWords[outcome]}</th>)}</tr></thead>
    <tbody>{CONFIDENCE_LEVELS.map((level) => <tr key={level}><th scope="row">{confidenceWords[level]}</th>{OUTCOMES.map((outcome) => { const count = grid[level][outcome]; return <td key={outcome} className={count ? tone(level, outcome) : "empty"}>{count}</td>; })}</tr>)}</tbody>
  </table>;
}

function patternText(pattern: ConfidencePattern, firstName: string) {
  return pattern.kind === "sure-not-right"
    ? `${firstName} felt very sure but wasn’t fully right in ${pattern.answers} answers across ${pattern.assessments} assessments.`
    : `${firstName} was right but not sure in ${pattern.answers} answers across ${pattern.assessments} assessments.`;
}

/** One short, neutral sentence for the teacher. Indicators only, never a diagnosis. */
function confidenceInsight(kind: "sure-not-right" | "unsure-right" | "fits", level: ConfidenceLevel, outcome: AnswerOutcome) {
  if (kind === "sure-not-right") return "Felt sure but not fully right. Worth asking how they worked it out.";
  if (kind === "unsure-right") return "Right but not sure. A word of encouragement may help.";
  if (level === "low" && outcome !== "right") return "Not sure, and not fully right: they knew this was hard.";
  return "Confidence fits the mark.";
}

const PATTERN_NOTE = `A pattern needs the same signal in at least ${PATTERN_RULE.minAnswers} answers from ${PATTERN_RULE.minAssessments} different assessments. These are indicators to talk about with the student, not a diagnosis, and they never change marks, gaps or flags.`;

function topicSummaries(data: AssessmentAppData) {
  const topics = new Map<string, { key: string; label: string; studentIds: Set<string>; attempts: number; reviewed: number; pending: number }>();
  data.submissions.forEach((submission) => {
    getSubmissionQuestions(data, submission).forEach((question) => {
      const answer = submission.answers.find((item) => item.questionId === question.id);
      if (!answer || answer.teacherScore / question.maxScore >= 0.75) return;
      const current = topics.get(question.topicKey) ?? { key: question.topicKey, label: getTopicLabel(data, question.topicKey), studentIds: new Set<string>(), attempts: 0, reviewed: 0, pending: 0 };
      current.studentIds.add(submission.studentId);
      current.attempts += 1;
      if (submission.status === "published") current.reviewed += 1;
      else current.pending += 1;
      topics.set(question.topicKey, current);
    });
  });
  return [...topics.values()].sort((a, b) => b.studentIds.size - a.studentIds.size || b.attempts - a.attempts);
}

function SubmissionRow({ data, submission, onReview }: { data: AssessmentAppData; submission: SubmissionRecord; onReview: (id: string) => void }) {
  const student = getStudent(data, submission.studentId);
  const assessment = getAssessment(data, submission.assessmentId);
  const state = queueState(data, submission);
  const percent = getSubmissionProgress(data, submission);
  // The number is always the teacher's current mark. It says whether that mark is still a draft
  // (some marks follow the AI suggestion), fully approved by the teacher, or already shared.
  const allApproved = submission.answers.length > 0 && submission.answers.every((answer) => answer.markSource === "teacher");
  const scoreLabel = submission.status === "processing" || submission.answers.length === 0 ? "—" : submission.status === "published" ? `Shared ${percent}%` : allApproved ? `Approved ${percent}%` : `Draft ${percent}%`;
  const pendingFlags = submission.flags.filter((flag) => flag.decision === "pending").length;
  const note = submission.reopened ? "Reopened" : pendingFlags ? "Flag to decide" : "";
  return <Button className="student-row" onClick={() => onReview(submission.id)}>
    <Avatar initials={student.initials} color={student.color}/>
    <span className="student-info"><strong>{student.name}</strong><small>{assessment.subject} · {shortTitle(assessment.title)}</small></span>
    <span className="row-state"><span className={"pill " + stateTone(state)}>{state}</span>{note && <small className={submission.reopened ? "row-note" : "row-note flag"}><Icon name={submission.reopened ? "clock" : "alert"} size={13}/> {note}</small>}</span>
    <span className="row-score" title={submission.status === "published" ? "Teacher-approved and visible to the student" : allApproved ? "All marks approved by you, not shared yet" : "Includes marks that still follow the AI suggestion"}>{scoreLabel}</span>
    <Icon name="chevron" size={18}/>
  </Button>;
}

function TeacherHome({ data, onReview, onOpen }: { data: AssessmentAppData; onReview: (id: string) => void; onOpen: (page: string) => void }) {
  const queue = data.submissions.filter((submission) => submission.status !== "published").sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const toReview = queue.filter((submission) => queueState(data, submission) !== STATE_READY);
  const ready = queue.length - toReview.length;
  const next = toReview.find((submission) => queueState(data, submission) !== STATE_READING) ?? queue.find((submission) => queueState(data, submission) === STATE_READY);
  const nextState = next ? queueState(data, next) : "";
  const openHelp = data.helpRequests.filter((request) => request.kind === "teacher" && request.status === "open").length;
  const topics = topicSummaries(data).length;
  const support = classOverview(data);
  const pendingDecisions = queue.reduce((count, submission) => count + submission.flags.filter((flag) => flag.decision === "pending").length + (submission.learningGaps ?? []).filter((topic) => (submission.learningGapDecisions?.[topic] ?? "pending") === "pending").length, 0);
  const recentActivity = [...data.submissions].sort((a, b) => (b.publishedAt ?? b.uploadedAt).localeCompare(a.publishedAt ?? a.uploadedAt)).slice(0, 4);
  const hour = new Date().getHours();
  const shortcuts: { page: string; icon: IconName; status: string }[] = [
    { page: "Review submissions", icon: "inbox", status: toReview.length ? `${toReview.length} to review${ready ? ` · ${ready} ready` : ""}` : ready ? `${ready} ready to share` : "All caught up" },
    { page: "Students", icon: "users", status: `${data.students.length} in Grade 4B` },
    { page: "Create assessment", icon: "plus", status: `${data.templates.length} saved template${data.templates.length === 1 ? "" : "s"}` },
    { page: "Help requests", icon: "help", status: openHelp ? `${openHelp} waiting for a reply` : "No open requests" },
    { page: "Flagged students", icon: "alert", status: support.needSupport ? [support.high ? `${support.high} high priority` : "", support.attention ? `${support.attention} need${support.attention === 1 ? "s" : ""} attention` : "", support.monitoring ? `${support.monitoring} monitoring` : ""].filter(Boolean).join(" · ") : "No student flagged" },
    { page: "Learning insights", icon: "chart", status: pendingDecisions ? `${pendingDecisions} decisions pending` : `${topics} topics to look at` },
  ];
  return <div className="page">
    <PageHead title={`${hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, Raghda`}/>
    {next ? <div className="next-up"><span className="next-up-icon"><Icon name={nextState === STATE_READY ? "check" : "inbox"}/></span><div><small>Next up</small><strong>{getStudent(data, next.studentId).name} · {shortTitle(getAssessment(data, next.assessmentId).title)}</strong><span>{nextState}</span></div><Button className="primary-button" onClick={() => onReview(next.id)}>{nextState === STATE_READY ? "Open and share" : "Continue review"}</Button></div>
      : <div className="next-up"><span className="next-up-icon done"><Icon name="check"/></span><div><strong>Nothing is waiting for you</strong><span>New submissions appear here.</span></div></div>}
    <nav className="shortcut-grid" aria-label="Shortcuts">{shortcuts.map((item) => <Button key={item.page} className="shortcut" onClick={() => onOpen(item.page)}><span className="shortcut-icon"><Icon name={item.icon} size={20}/></span><strong>{item.page}</strong><small>{item.status}</small></Button>)}</nav>
    <section className="card card-flush" aria-labelledby="recent-title">
      <div className="card-head"><h2 id="recent-title" className="section-title">Recent activity</h2></div>
      <ul className="list">{recentActivity.map((submission) => <li key={submission.id}><Button className="list-row activity-row" onClick={() => onReview(submission.id)}><span className={"activity-dot " + (submission.status === "published" ? "ok" : "brand")}><Icon name={submission.status === "published" ? "check" : "scan"} size={14}/></span><span className="row-main"><strong>{getStudent(data, submission.studentId).name} · {shortTitle(getAssessment(data, submission.assessmentId).title)}</strong><small>{submission.status === "published" ? (submission.resultUpdated ? "Corrected result shared" : "Result shared") : submission.reopened ? "Reopened for correction" : "Submitted · " + queueState(data, submission).toLocaleLowerCase()}</small></span><small className="muted">{dateLabel(submission.publishedAt ?? submission.uploadedAt)}</small></Button></li>)}{recentActivity.length === 0 && <li className="empty">No assessment activity yet.</li>}</ul>
    </section>
  </div>;
}

/** Teacher: upload a scan or photos of a student's paper (for example collected on paper in class).
 *  The file isn't read: as for student uploads, the simulated scan uses a sample answer. */
function TeacherUploadDialog({ data, onUpload, onClose }: { data: AssessmentAppData; onUpload: (fileName: string, language: Language, assignmentId: string) => void; onClose: () => void }) {
  const open = data.assignments.filter((assignment) => !getAssignmentSubmission(data, assignment));
  const studentIds = [...new Set(open.map((assignment) => assignment.studentId))];
  const [studentId, setStudentId] = useState(studentIds[0] ?? "");
  const forStudent = open.filter((assignment) => assignment.studentId === studentId);
  const [assignmentId, setAssignmentId] = useState(forStudent[0]?.id ?? "");
  const [language, setLanguage] = useState<Language>("en");
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fired = useRef(false);
  const chooseStudent = (id: string) => { setStudentId(id); setAssignmentId(open.find((assignment) => assignment.studentId === id)?.id ?? ""); };
  const pick = (event: React.ChangeEvent<HTMLInputElement>) => { const list = [...(event.target.files ?? [])]; event.target.value = ""; if (!list.length) return; const problem = validateExamFiles(list); if (problem) { setFiles([]); setError(problem); return; } setError(""); setFiles(list.map((file) => ({ name: file.name, size: file.size }))); };
  const send = () => {
    if (fired.current) return;
    if (!assignmentId) { setError("Choose a student and an assessment."); return; }
    if (!files.length) { setError("Choose the scanned pages first, or use a sample (demo)."); return; }
    fired.current = true; setBusy(true);
    onUpload(filesLabel(files), language, assignmentId);
    onClose();
  };
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="confirm-dialog teacher-upload" role="dialog" aria-modal="true" aria-labelledby="teacher-upload-title">
      <h2 id="teacher-upload-title">Upload a student’s work</h2>
      {open.length === 0 ? <p className="muted">Every assignment already has work. Assign an assessment first.</p> : <>
        <div className="field-row"><label className="field">Student<select value={studentId} onChange={(event) => chooseStudent(event.target.value)}>{studentIds.map((id) => <option key={id} value={id}>{getStudent(data, id).name}</option>)}</select></label>
          <label className="field">Assessment<select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>{forStudent.map((assignment) => { const template = assignment.templateId ? data.templates.find((item) => item.id === assignment.templateId) : undefined; return <option key={assignment.id} value={assignment.id}>{getAssessment(data, assignment.assessmentId).title}{template ? ` · ${template.title}` : ""}</option>; })}</select></label></div>
        <label className="field">Language of the answers<select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="en">English</option><option value="de">German (Deutsch)</option></select></label>
        <label className={`upload-dropzone ${files.length ? "has-file" : ""}`} htmlFor="teacher-exam-file"><Icon name={files.length ? "check" : "upload"} size={24}/><strong>{files.length ? filesLabel(files) : "Choose scans or photos"}</strong><span>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} · ${fileSizeLabel(files.reduce((sum, file) => sum + file.size, 0))}` : `PDF, JPG or PNG · up to 20 MB each · up to ${MAX_FILES} pages`}</span><input id="teacher-exam-file" type="file" multiple accept={ACCEPTED_FILE_TYPES.join(",")} onChange={pick}/></label>
        {error && <p className="file-error" role="alert"><Icon name="alert" size={16}/>{error}</p>}
        <p className="muted small">Demo: the file isn’t read. A simulated scan uses a sample answer, and you check the text before grading. Confidence ratings aren’t collected when you upload.</p>
      </>}
      <div className="dialog-actions"><Button className="text-button" onClick={() => { setError(""); setFiles([{ name: `Sample ${language === "en" ? "English" : "German"} scan (demo)`, size: 0 }]); }}>Use a sample (demo)</Button><Button className="secondary-button" onClick={onClose}>Cancel</Button><Button className="primary-button" disabled={busy || open.length === 0} onClick={send}>{busy ? "Uploading…" : "Upload"}</Button></div>
    </section>
  </div>;
}

function TeacherQueue({ data, searchTerm, onSearch, onReview, onUpload }: { data: AssessmentAppData; searchTerm: string; onSearch: (value: string) => void; onReview: (id: string) => void; onUpload: (fileName: string, language: Language, assignmentId: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"review" | "ready" | "shared">("review");
  const [subFilter, setSubFilter] = useState<"all" | "action" | "ocr">("all");
  const tabs0: ("review" | "ready" | "shared")[] = ["review", "ready", "shared"];
  const tests = {
    review: (state: string) => state !== STATE_SHARED && state !== STATE_READY,
    ready: (state: string) => state === STATE_READY,
    shared: (state: string) => state === STATE_SHARED,
  };
  const subTests = {
    all: () => true,
    action: (state: string) => state !== STATE_READING,
    ocr: (state: string) => state === STATE_CHECK_TEXT || state === STATE_READING,
  };
  const count = (key: keyof typeof tests) => data.submissions.filter((submission) => tests[key](queueState(data, submission))).length;
  // Stage 4: case and accents are ignored ("bruche" finds "Brüche"); every word must match the student, assessment or file.
  const matches = (submission: SubmissionRecord) => matchesSearch(searchTerm, [getStudent(data, submission.studentId).name, getAssessment(data, submission.assessmentId).title, submission.fileName]);
  const searching = searchTerm.trim().length > 0;
  const elsewhere = searching ? tabs0.filter((item) => item !== tab).map((item) => ({ item, n: data.submissions.filter((submission) => tests[item](queueState(data, submission)) && matches(submission)).length })).filter((entry) => entry.n > 0) : [];
  const queue = data.submissions.filter((submission) => { const state = queueState(data, submission); return tests[tab](state) && (tab !== "review" || subTests[subFilter](state)); })
    .filter(matches)
    .sort((a, b) => tab === "shared" ? (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") : b.uploadedAt.localeCompare(a.uploadedAt));
  const tabs: { id: typeof tab; label: string }[] = [{ id: "review", label: "To review" }, { id: "ready", label: "Ready to share" }, { id: "shared", label: "Shared" }];
  return <div className="page">
    <PageHead title="Review submissions"><Button className="secondary-button" onClick={() => setUploading(true)}><Icon name="upload" size={16}/> Upload student work</Button><SearchBox value={searchTerm} onChange={onSearch} label="Search by student or assessment"/></PageHead>
    {uploading && <TeacherUploadDialog data={data} onUpload={onUpload} onClose={() => setUploading(false)}/>}
    <div className="tab-bar"><div className="tabs" role="group" aria-label="Filter submissions">{tabs.map((item) => <Button key={item.id} className={tab === item.id ? "selected" : ""} onClick={() => setTab(item.id)}>{item.label}<span className="count">{count(item.id)}</span></Button>)}</div>
      {tab === "review" && <label className="inline-select">Show<select value={subFilter} onChange={(event) => setSubFilter(event.target.value as typeof subFilter)}><option value="all">All</option><option value="action">Needs a decision</option><option value="ocr">Scanned text to check</option></select></label>}
    </div>
    <section className="card card-flush"><div className="queue-list">{queue.length ? queue.map((submission) => <SubmissionRow key={submission.id} data={data} submission={submission} onReview={onReview}/>) : <div className="empty">{searching ? <span className="no-matches"><strong>No matches for “{searchTerm.trim()}” here.</strong><Button className="secondary-button btn-sm" onClick={() => onSearch("")}>Clear search</Button></span> : tab === "shared" ? "Nothing has been shared yet." : tab === "ready" ? "Nothing is ready to share yet." : "Nothing to review."}</div>}</div></section>
    {elsewhere.length > 0 && <p className="search-elsewhere">Also matching: {elsewhere.map(({ item, n }) => <Button key={item} className="text-button" onClick={() => setTab(item)}>{n} in {tabs.find((entry) => entry.id === item)?.label}</Button>)}</p>}
    {tab === "shared" && <p className="muted small">Shared results are read-only. Open one to reopen it for a correction.</p>}
  </div>;
}

function ClassResultsChart({ data }: { data: AssessmentAppData }) {
  const published = data.submissions.filter((submission) => submission.status === "published").sort((a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? ""));
  const rows = published.slice(-8);
  const average = published.length ? Math.round(published.reduce((sum, item) => sum + getSubmissionProgress(data, item), 0) / published.length) : 0;
  return <section className="card" aria-labelledby="class-results-title">
    <div className="card-head-inline"><h2 id="class-results-title" className="section-title">Shared results</h2><span className="muted">Class average <strong className="text-strong">{average}%</strong> · {published.length} results</span></div>
    {rows.length === 0 ? <p className="empty">No results have been shared yet.</p> : <div className="bar-chart" role="img" aria-label={`Scores of the last ${rows.length} shared results: ${rows.map((row) => `${getStudent(data, row.studentId).name} ${getSubmissionProgress(data, row)}%`).join(", ")}`}>
      <div className="bar-axis" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>
      <div className="bar-plot" aria-hidden="true">{rows.map((row) => { const score = getSubmissionProgress(data, row); const student = getStudent(data, row.studentId); return <div className="bar-col" key={row.id}><div className="bar-track"><span className="bar" style={{ height: `${Math.max(2, score)}%` }}><em>{score}%</em></span></div><small>{student.name.split(" ")[0]}<br/>{dateLabel(row.publishedAt ?? row.uploadedAt)}</small></div>; })}</div>
    </div>}
  </section>;
}

// ---- Flagged students and learning insights (teacher only) ----
// Every number comes from src/support.ts, so Home, Learning insights, Flagged students and the student
// profile always agree. Nothing here is shown to students or parents.

interface SupportHandlers {
  onConfirm: (studentId: string) => void;
  onDismiss: (studentId: string, reason: string) => void;
  onResolve: (studentId: string, reason: string) => void;
  onReopen: (studentId: string) => void;
  onNote: (studentId: string, text: string) => void;
  onSupport: (studentId: string, action: { kind: SupportKind; topicKey?: string; note: string; at: string }) => void;
  onPractice: (studentIds: string[], topicKey: string) => void;
  onReviewAnswer: (submissionId: string, questionId?: string) => void;
  onProfile: (studentId: string) => void;
  onOpenCase: (studentId: string) => void;
  onSend: SendHandler;
  onOpenFlagged: () => void;
}

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

function PriorityPill({ priority }: { priority?: SupportPriority }) {
  return priority ? <span className={`pill ${PRIORITY_WORDS[priority].tone}`}>{PRIORITY_WORDS[priority].label}</span> : <span className="pill">No current concern</span>;
}
function StatusPill({ status }: { status?: SupportStatus }) {
  return status ? <span className={`pill status-pill status-${status}`}>{STATUS_WORDS[status]}</span> : null;
}
function DemoTag() {
  return <span className="pill demo-tag" title="Simulated demo data: not a real teacher record">Simulated demo</span>;
}

/** The answers behind a signal or topic, each with a button to open it in the review. */
function EvidenceList({ data, evidence, onReviewAnswer, limit = 6 }: { data: AssessmentAppData; evidence: Evidence[]; onReviewAnswer: (submissionId: string, questionId?: string) => void; limit?: number }) {
  const unique = [...new Map(evidence.map((item) => [`${item.submissionId}/${item.questionId ?? ""}`, item])).values()];
  if (!unique.length) return null;
  return <ul className="evidence-list">{unique.slice(0, limit).map((item) => {
    const submission = data.submissions.find((entry) => entry.id === item.submissionId);
    if (!submission) return null;
    const questions = getSubmissionQuestions(data, submission);
    const index = questions.findIndex((question) => question.id === item.questionId);
    const question = index >= 0 ? questions[index] : undefined;
    const answer = question ? submission.answers.find((entry) => entry.questionId === question.id) : undefined;
    return <li key={`${item.submissionId}/${item.questionId ?? ""}`}><span className="row-main"><strong>{getStudent(data, submission.studentId).name.split(" ")[0]} · {shortTitle(getAssessment(data, submission.assessmentId).title)}{question ? ` · Q${index + 1}` : ""}</strong><small>{question ? `${shortPrompt(question.prompt)} · ${answer?.teacherScore ?? 0} / ${question.maxScore}` : `${getSubmissionProgress(data, submission)}%`} · {dateLabel(submission.uploadedAt)}{submission.language === "de" ? " · German" : ""}</small></span><Button className="text-button" onClick={() => onReviewAnswer(submission.id, question?.id)}>Review answer</Button></li>;
  })}{unique.length > limit && <li className="muted small">and {unique.length - limit} more</li>}</ul>;
}

function SupportTiles({ overview }: { overview: ReturnType<typeof classOverview> }) {
  return <div className="profile-facts support-tiles">
    <div><strong>{overview.high}</strong><span>High priority</span></div>
    <div><strong>{overview.attention}</strong><span>Needs attention</span></div>
    <div><strong>{overview.monitoring}</strong><span>Monitoring</span></div>
    <div><strong>{overview.improving}</strong><span>Improving</span></div>
  </div>;
}

type FlagFilter = "open" | SupportStatus | "all";
const flagFilterWords: [FlagFilter, string][] = [["open", "Open"], ["new", "New"], ["reviewed", "Reviewed"], ["support", "Support given"], ["improving", "Improving"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "All"]];

function TeacherFlaggedStudents({ data, openId, handlers }: { data: AssessmentAppData; openId: string | null; handlers: SupportHandlers }) {
  const [filter, setFilter] = useState<FlagFilter>("open");
  const overview = classOverview(data);
  if (openId) return <FlagCase data={data} studentId={openId} handlers={handlers}/>;
  const list = flaggedStudents(data);
  const isOpen = (status?: SupportStatus) => status !== "resolved" && status !== "dismissed";
  const shown = list.filter((item) => filter === "all" ? true : filter === "open" ? isOpen(item.status) : item.status === filter);
  const waiting = overview.all.filter((item) => item.waitingPreview);
  const isolated = overview.all.filter((item) => item.isolatedLow && !item.status);
  return <div className="page">
    <PageHead title="Flagged students" sub="Students who may need extra support, based on shared, teacher-approved results. A flag is not a diagnosis, and you decide every step."/>
    <SupportTiles overview={overview}/>
    <div className="chip-filter flag-filter" role="group" aria-label="Show">{flagFilterWords.map(([key, label]) => { const count = key === "all" ? list.length : key === "open" ? list.filter((item) => isOpen(item.status)).length : list.filter((item) => item.status === key).length; return <Button key={key} className={filter === key ? "selected" : ""} onClick={() => setFilter(key)}>{label} <span className="count">{count}</span></Button>; })}</div>
    <section className="card card-flush"><ul className="list flag-list">{shown.map((item) => { const student = getStudent(data, item.studentId); return <li key={item.studentId}><Button className="list-row flag-row" onClick={() => handlers.onOpenCase(item.studentId)}>
      <Avatar initials={student.initials} color={student.color}/>
      <span className="row-main"><strong>{student.name}{item.weakestTopics[0] ? <span className="muted"> · {item.weakestTopics.slice(0, 2).map((topic) => topic.label).join(", ")}</span> : null}</strong><small>{item.signals.length ? item.signals.slice(0, 2).map((signal) => signal.title).join(" · ") : item.evidenceCleared ? "No current concern in the latest results" : "No current signal"}{item.newEvidenceSinceDecision ? " · new evidence since your decision" : ""}</small></span>
      <span className="flag-row-score">{item.average === undefined ? "—" : `${item.average}%`}<small>average</small></span>
      <span className="flag-pills"><PriorityPill priority={item.priority}/><StatusPill status={item.status}/></span>
      <Icon name="chevron" size={18}/>
    </Button></li>; })}{shown.length === 0 && <li className="empty">{filter === "open" ? "No student is flagged right now." : "No students in this group."}</li>}</ul></section>
    {waiting.length > 0 && <section className="card card-flush" aria-labelledby="waiting-title">
      <h2 id="waiting-title" className="section-title card-pad">Waiting for your review</h2>
      <p className="muted small card-pad-x">These results aren’t shared yet, so they don’t count. If you share them as marked now, the flag would change as shown.</p>
      <ul className="list">{waiting.map((item) => { const student = getStudent(data, item.studentId); return <li className="list-row" key={item.studentId}><Avatar initials={student.initials} color={student.color}/><span className="row-main"><strong>{student.name}</strong><small>{item.waiting.length} result{item.waiting.length === 1 ? "" : "s"} waiting · {item.waiting.map((submission) => `${shortTitle(getAssessment(data, submission.assessmentId).title)} ${getSubmissionProgress(data, submission)}% (not shared)`).join(", ")}</small></span><span className="flag-pills"><span className="muted small">Could become</span><PriorityPill priority={item.waitingPreview}/></span><Button className="secondary-button btn-sm" onClick={() => handlers.onReviewAnswer(item.waiting[0].id)}>Review</Button></li>; })}</ul>
    </section>}
    {isolated.length > 0 && <details className="more card"><summary>One low result, not flagged ({isolated.length})</summary><div className="more-body"><p className="muted small">One low mark on its own is not a flag. These students are flagged only if more evidence appears.</p><ul className="list">{isolated.map((item) => { const student = getStudent(data, item.studentId); return <li className="list-row" key={item.studentId}><span className="row-main"><strong>{student.name}</strong><small>{item.isolatedLow!.percent}% in one result · average {item.average}%</small></span><Button className="text-button" onClick={() => handlers.onProfile(item.studentId)}>Open profile</Button></li>; })}</ul></div></details>}
  </div>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function FlagCase({ data, studentId, handlers }: { data: AssessmentAppData; studentId: string; handlers: SupportHandlers }) {
  const support = studentSupport(data, studentId);
  const student = getStudent(data, studentId);
  const firstName = student.name.split(" ")[0];
  const record = support.caseRecord;
  const [mode, setMode] = useState<"dismiss" | "resolve" | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [kind, setKind] = useState<SupportKind>("practice");
  const [topicKey, setTopicKey] = useState(support.weakestTopics[0]?.topicKey ?? "");
  const [supportDate, setSupportDate] = useState(todayIso());
  const [supportNote, setSupportNote] = useState("");
  const [error, setError] = useState("");
  const closed = support.status === "resolved" || support.status === "dismissed";
  const pickRecommendation = (item: Recommendation) => { setKind(item.kind); setTopicKey(item.topicKey ?? ""); setSupportNote(item.text + "."); setShowSupport(true); setError(""); window.setTimeout(() => document.getElementById("support-form")?.scrollIntoView({ block: "center" }), 50); };
  const saveSupport = () => {
    if (!supportNote.trim()) { setError("Describe the support you gave."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(supportDate)) { setError("Choose the date of the support."); return; }
    handlers.onSupport(studentId, { kind, topicKey: topicKey || undefined, note: supportNote.trim(), at: `${supportDate}T12:00:00.000Z` });
    setShowSupport(false); setSupportNote(""); setError("");
  };
  const decide = () => {
    if (!reason.trim()) { setError(mode === "dismiss" ? "Give a reason for dismissing the flag." : "Say what shows the student no longer needs support."); return; }
    if (mode === "dismiss") handlers.onDismiss(studentId, reason.trim()); else handlers.onResolve(studentId, reason.trim());
    setMode(null); setReason(""); setError("");
  };
  return <div className="page flag-case">
    <PageHead title={student.name} sub={<>Support needs from shared results · {support.results.length} shared result{support.results.length === 1 ? "" : "s"} · average {support.average === undefined ? "—" : `${support.average}%`}</>}><Button className="secondary-button" onClick={() => handlers.onProfile(studentId)}>Open profile</Button></PageHead>
    <div className="case-status"><PriorityPill priority={support.priority}/><StatusPill status={support.status}/>{record?.demo && <DemoTag/>}<span className="muted small">{support.priority ? PRIORITY_WORDS[support.priority].text : "The current evidence shows no concern."}</span></div>
    {support.newEvidenceSinceDecision && <p className="pattern-note warn-note" role="status"><Icon name="alert" size={16}/><span><strong>New evidence since your decision.</strong> A result shared after you {record?.decision === "dismissed" ? "dismissed" : "resolved"} this flag shows a concern again.</span></p>}
    {support.evidenceCleared && <p className="pattern-note ok-note" role="status"><Icon name="check" size={16}/><span><strong>The latest shared results no longer show a concern.</strong> You can resolve the flag if you agree.</span></p>}
    {support.waitingPreview && <p className="pattern-note"><Icon name="clock" size={16}/><span>{support.waiting.length} result{support.waiting.length === 1 ? "" : "s"} waiting for your review {support.waiting.length === 1 ? "isn’t" : "aren’t"} counted. Shared as marked now, the flag could become <strong>{PRIORITY_WORDS[support.waitingPreview].label}</strong>. <Button className="text-button" onClick={() => handlers.onReviewAnswer(support.waiting[0].id)}>Review it</Button></span></p>}
    <section className="card decision-card" aria-label="Your decision">
      <div className="decision-actions">
        {!closed && support.priority && record?.decision !== "confirmed" && <Button className="primary-button" onClick={() => handlers.onConfirm(studentId)}><Icon name="check"/> Confirm flag</Button>}
        {!closed && <Button className="secondary-button" aria-expanded={mode === "dismiss"} onClick={() => { setMode(mode === "dismiss" ? null : "dismiss"); setReason(""); setError(""); }}>Dismiss with reason</Button>}
        {!closed && <Button className="secondary-button" aria-expanded={showSupport} onClick={() => { setShowSupport(!showSupport); setError(""); }}><Icon name="plus" size={16}/> Record support</Button>}
        {!closed && <Button className="secondary-button" aria-expanded={mode === "resolve"} onClick={() => { setMode(mode === "resolve" ? null : "resolve"); setReason(""); setError(""); }}>Resolve</Button>}
        {closed && <Button className="secondary-button" onClick={() => handlers.onReopen(studentId)}>Reopen flag</Button>}
        {support.weakestTopics[0] && <Button className="secondary-button" onClick={() => handlers.onPractice([studentId], support.weakestTopics[0].topicKey)}>Assign practice</Button>}
      </div>
      {record?.decision && record.reason && <p className="muted small">{record.decision === "dismissed" ? "Dismissed" : record.decision === "resolved" ? "Resolved" : "Confirmed"} on {dateLabel(record.decidedAt ?? "")}: “{record.reason}”</p>}
      {mode && <div className="decision-form">
        <label className="field">{mode === "dismiss" ? "Why are you dismissing this flag?" : "What shows the student no longer needs support?"}<textarea value={reason} onChange={(event) => { setReason(event.target.value); setError(""); }} placeholder={mode === "dismiss" ? "Was ill on the day of the test." : "Two secure results in fractions since the practice."}/></label>
        {mode === "resolve" && support.priority && <p className="muted small"><Icon name="alert" size={14}/> The current evidence still shows a concern ({PRIORITY_WORDS[support.priority].label.toLowerCase()}). You can still resolve it; it comes back only if new evidence is shared later.</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="dialog-actions"><Button className="text-button" onClick={() => { setMode(null); setError(""); }}>Cancel</Button><Button className="primary-button" onClick={decide}>{mode === "dismiss" ? "Dismiss flag" : "Resolve flag"}</Button></div>
      </div>}
      {showSupport && <div className="decision-form" id="support-form">
        <div className="field-row three"><label className="field">Support<select value={kind} onChange={(event) => setKind(event.target.value as SupportKind)}>{(Object.keys(SUPPORT_KIND_WORDS) as SupportKind[]).map((item) => <option key={item} value={item}>{SUPPORT_KIND_WORDS[item]}</option>)}</select></label>
          <label className="field">Topic<select value={topicKey} onChange={(event) => setTopicKey(event.target.value)}><option value="">Overall</option>{support.topics.map((topic) => <option key={topic.topicKey} value={topic.topicKey}>{topic.label}</option>)}</select></label>
          <label className="field">Date<input type="date" value={supportDate} onChange={(event) => setSupportDate(event.target.value)}/></label></div>
        <label className="field">What you did<textarea value={supportNote} onChange={(event) => { setSupportNote(event.target.value); setError(""); }} placeholder="Ten minutes with fraction strips after class."/></label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <p className="muted small">Later shared results in this topic are compared with the ones before this date.</p>
        <div className="dialog-actions"><Button className="text-button" onClick={() => { setShowSupport(false); setError(""); }}>Cancel</Button><Button className="primary-button" onClick={saveSupport}><Icon name="check"/> Save support</Button></div>
      </div>}
    </section>
    <div className="case-grid">
      <section className="card" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">Why {firstName} is flagged</h2>
        {support.signals.length ? <ul className="signal-list">{support.signals.map((signal, index) => <li key={signal.kind + (signal.topicKey ?? "") + index}><details className="more"><summary><span className="signal-text"><strong>{signal.title}</strong><small>{signal.detail}</small><em>Show the answers</em></span></summary><div className="more-body"><EvidenceList data={data} evidence={signal.evidence} onReviewAnswer={handlers.onReviewAnswer}/>{!signal.evidence.length && <p className="muted small">Based on the support history below.</p>}</div></details></li>)}</ul> : <p className="muted">No current signal in the shared results.</p>}
        <p className="muted small">Only shared, teacher-approved results count. One low result on its own never flags a student.</p>
      </section>
      <section className="card" aria-labelledby="actions-title">
        <h2 id="actions-title" className="section-title">Suggested actions</h2>
        {support.recommendations.length ? <ul className="recommendation-list">{support.recommendations.map((item) => <li key={item.id}><span className="row-main"><strong>{item.text}</strong><small>Because: {item.because}</small></span><span className="rec-actions">{item.kind === "practice" && item.topicKey ? <Button className="secondary-button btn-sm" onClick={() => handlers.onPractice([studentId], item.topicKey!)}>Assign practice</Button> : null}{!closed && <Button className="text-button" onClick={() => pickRecommendation(item)}>Record as support</Button>}</span></li>)}</ul> : <p className="muted">No suggestion right now.</p>}
        <p className="muted small">Suggestions are only offers. You decide what fits {firstName}.</p>
      </section>
    </div>
    <section className="card" aria-labelledby="support-history-title">
      <h2 id="support-history-title" className="section-title">Support given and what changed</h2>
      {support.outcomes.length ? <ul className="outcome-list">{[...support.outcomes].reverse().map((item) => <li key={item.action.id}><span className="row-main"><strong>{SUPPORT_KIND_WORDS[item.action.kind]} · {item.topicLabel} · {dateLabel(item.action.at)}{item.action.demo && <> <DemoTag/></>}</strong><small>{item.action.note}</small><small className={`outcome outcome-${item.outcome}`}>{item.summary}</small></span><span className={`pill ${item.outcome === "improved" ? "ok" : item.outcome === "not-yet" ? "warn" : ""}`}>{item.outcome === "improved" ? "Improved" : item.outcome === "not-yet" ? "No improvement yet" : "Not enough evidence yet"}</span></li>)}</ul> : <p className="muted">No support recorded yet.</p>}
    </section>
    <div className="case-grid">
      <section className="card" aria-labelledby="topics-title">
        <h2 id="topics-title" className="section-title">Topics</h2>
        <ul className="topic-bars">{support.topics.map((topic) => <li key={topic.topicKey}><span className="topic-bar-label">{topic.label}<small>{topic.answers} answer{topic.answers === 1 ? "" : "s"} · {topic.results} result{topic.results === 1 ? "" : "s"}{topic.recurringGap >= 2 ? ` · gap ${topic.recurringGap}×` : ""}</small></span><span className="meter wide" aria-hidden="true"><span className={topic.percent < WEAK_TOPIC ? "low" : topic.percent < SECURE ? "mid" : ""} style={{ width: `${Math.max(2, topic.percent)}%` }}/></span><strong className="parent-score">{topic.percent}%</strong></li>)}</ul>
        {support.wrongIdeas.length > 0 && <><h3 className="subsection-title">Wrong ideas in {firstName}’s answers</h3><ul className="list compact-list">{support.wrongIdeas.map((idea) => <li key={idea.label} className="list-row"><span className="row-main"><strong>{capitalize(idea.label)}</strong><small>{getTopicLabel(data, idea.topicKey)} · {idea.count} answer{idea.count === 1 ? "" : "s"}</small></span><Button className="text-button" onClick={() => handlers.onReviewAnswer(idea.evidence[idea.evidence.length - 1].submissionId, idea.evidence[idea.evidence.length - 1].questionId)}>Review answer</Button></li>)}</ul></>}
      </section>
      <section className="card" aria-labelledby="results-title">
        <h2 id="results-title" className="section-title">Results over time</h2>
        {support.results.length ? <ul className="list compact-list">{support.results.map((result) => <li className="parent-result-row" key={result.id}><span className="row-main"><strong>{shortTitle(getAssessment(data, result.assessmentId).title)}</strong><small>{dateLabel(result.at)}{result.language === "de" ? " · German" : ""}</small></span><span className="meter wide" aria-hidden="true"><span style={{ width: `${Math.max(2, result.percent)}%` }}/></span><strong className="parent-score">{result.percent}%</strong><Button className="text-button" onClick={() => handlers.onReviewAnswer(result.id)}>Open</Button></li>)}</ul> : <p className="muted">No shared results yet.</p>}
        {support.waiting.length > 0 && <p className="muted small">{support.waiting.length} result{support.waiting.length === 1 ? "" : "s"} waiting for your review (not counted).</p>}
      </section>
    </div>
    <section className="card" aria-labelledby="send-title">
      <h2 id="send-title" className="section-title">Message to {firstName}</h2>
      <p className="muted small">Flags, notes and analysis stay with you. If you want {firstName} to act, send a short, kind message: it appears in {firstName}’s notifications.</p>
      <SendToStudent data={data} studentId={studentId} topics={support.topics.map((topic) => topic.topicKey)} defaultTopic={support.weakestTopics[0]?.topicKey} defaultKind="practice" onSend={handlers.onSend}/>
    </section>
    <section className="card" aria-labelledby="notes-title">
      <h2 id="notes-title" className="section-title">Notes <span className="muted small">only you see these</span></h2>
      {record?.notes.length ? <ul className="list compact-list">{[...record.notes].reverse().map((item) => <li key={item.id} className="list-row"><span className="row-main"><strong>{item.text}</strong><small>{dateLabel(item.at)}</small></span>{item.demo && <DemoTag/>}</li>)}</ul> : <p className="muted">No notes yet.</p>}
      <div className="note-form"><label className="field">Add a note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Talked with the parent; practising at home this week."/></label><Button className="secondary-button" disabled={!note.trim()} onClick={() => { handlers.onNote(studentId, note.trim()); setNote(""); }}>Save note</Button></div>
      {record?.history.length ? <details className="more"><summary>Decision history ({record.history.length})</summary><div className="more-body"><ul className="list compact-list">{[...record.history].reverse().map((item, index) => <li key={index} className="list-row"><span className="row-main"><strong>{item.decision === "confirmed" ? "Confirmed" : item.decision === "dismissed" ? "Dismissed" : item.decision === "resolved" ? "Resolved" : "Reopened"}{item.reason ? `: “${item.reason}”` : ""}</strong><small>{dateLabel(item.at)}</small></span>{item.demo && <DemoTag/>}</li>)}</ul></div></details> : null}
    </section>
  </div>;
}

/** On the student profile: the same support picture, short, with a link to the full page. */
function ProfileSupportCard({ data, studentId, onOpenCase }: { data: AssessmentAppData; studentId: string; onOpenCase: (studentId: string) => void }) {
  const support = studentSupport(data, studentId);
  const firstName = getStudent(data, studentId).name.split(" ")[0];
  return <section className="card profile-support" aria-labelledby="profile-support-title">
    <div className="card-head-inline"><h2 id="profile-support-title" className="section-title">Support</h2><span className="case-status"><PriorityPill priority={support.priority}/><StatusPill status={support.status}/>{support.caseRecord?.demo && <DemoTag/>}</span></div>
    {support.signals.length ? <ul className="plain-list">{support.signals.slice(0, 3).map((signal, index) => <li key={index}><strong>{signal.title}.</strong> <span className="muted">{signal.detail}</span></li>)}</ul> : <p className="muted">{support.isolatedLow ? `One low result (${support.isolatedLow.percent}%). Not a flag on its own.` : `No concern in ${firstName}’s shared results.`}</p>}
    <div className="profile-support-grid">
      <div><small>Weakest topics</small><span>{support.weakestTopics.length ? support.weakestTopics.map((topic) => `${topic.label} ${topic.percent}%`).join(", ") : "None below 75%"}</span></div>
      <div><small>Strongest topics</small><span>{support.strongestTopics.length ? support.strongestTopics.map((topic) => `${topic.label} ${topic.percent}%`).join(", ") : "—"}</span></div>
      <div><small>Wrong ideas that came up</small><span>{support.wrongIdeas.length ? support.wrongIdeas.map((idea) => `${idea.label} (${idea.count}×)`).join("; ") : "None found"}</span></div>
      <div><small>Support given</small><span>{support.outcomes.length ? support.outcomes.map((item) => `${SUPPORT_KIND_WORDS[item.action.kind]}: ${item.outcome === "improved" ? "improved" : item.outcome === "not-yet" ? "no improvement yet" : "not enough evidence yet"}`).join("; ") : "None recorded"}</span></div>
    </div>
    {support.waitingPreview && <p className="muted small">{support.waiting.length} result{support.waiting.length === 1 ? "" : "s"} waiting for your review could change this to {PRIORITY_WORDS[support.waitingPreview].label.toLowerCase()}.</p>}
    <Button className="secondary-button btn-sm" onClick={() => onOpenCase(studentId)}>{support.status ? "Open in Flagged students" : "Open support page"}</Button>
  </section>;
}

const trendWords: Record<TopicInsight["trend"], { label: string; tone: string }> = {
  improving: { label: "Improving", tone: "ok" }, falling: { label: "Falling", tone: "warn" }, steady: { label: "Steady", tone: "" }, "not-enough": { label: "Too few answers", tone: "" },
};

function TopicDetail({ data, topic, handlers }: { data: AssessmentAppData; topic: TopicInsight; handlers: SupportHandlers }) {
  const rows = topic.students.map((id) => { const support = studentSupport(data, id); const state = support.topics.find((item) => item.topicKey === topic.topicKey); return { id, support, state }; }).sort((a, b) => (a.state?.percent ?? 100) - (b.state?.percent ?? 100));
  const needing = topic.needSupport;
  const idea = topic.wrongIdeas[0];
  return <div className="topic-detail">
    <div className="case-grid">
      <div>
        <h2 className="subsection-title">Students</h2>
        <ul className="list compact-list">{rows.map(({ id, support, state }) => { const student = getStudent(data, id); return <li className="list-row" key={id}><Avatar initials={student.initials} color={student.color}/><span className="row-main"><strong>{student.name}</strong><small>{state?.percent ?? "—"}% in {state?.answers ?? 0} answer{state?.answers === 1 ? "" : "s"}{support.priority ? ` · ${PRIORITY_WORDS[support.priority].label}` : ""}</small></span>{needing.includes(id) && <span className="pill warn">Below {LOW_RESULT}% or flagged</span>}<Button className="text-button" onClick={() => handlers.onProfile(id)}>Profile</Button></li>; })}</ul>
      </div>
      <div>
        <h2 className="subsection-title">Suggested actions</h2>
        <ul className="recommendation-list">
          {idea && <li><span className="row-main"><strong>Re-teach with a simpler explanation and a visual example</strong><small>Because: “{idea.label}” appeared in answers from {idea.students.length} student{idea.students.length === 1 ? "" : "s"}.</small></span></li>}
          {needing.length > 0 && <li><span className="row-main"><strong>Targeted practice for {needing.length} student{needing.length === 1 ? "" : "s"}</strong><small>Because: {needing.map((id) => getStudent(data, id).name.split(" ")[0]).join(", ")} {needing.length === 1 ? "is" : "are"} below {LOW_RESULT}% in this topic or flagged for it.</small></span><span className="rec-actions"><Button className="secondary-button btn-sm" onClick={() => handlers.onPractice(needing, topic.topicKey)}>Assign practice</Button></span></li>}
          {topic.trend === "falling" && <li><span className="row-main"><strong>Watch the next assessment in this topic</strong><small>Because: recent answers are {Math.abs(topic.trendDelta ?? 0)} points lower than earlier ones.</small></span></li>}
          {!idea && !needing.length && topic.trend !== "falling" && <li className="muted">No action needed right now.</li>}
        </ul>
        <h2 className="subsection-title">Answers behind this</h2>
        <EvidenceList data={data} evidence={topic.evidence} onReviewAnswer={handlers.onReviewAnswer} limit={5}/>
        {!topic.evidence.length && <p className="muted small">Every shared answer in this topic got full marks.</p>}
      </div>
    </div>
  </div>;
}

function TeacherLearningInsights({ data, onReview, handlers }: { data: AssessmentAppData; onReview: (id: string) => void; handlers: SupportHandlers }) {
  const [tab, setTab] = useState<"overview" | "topics" | "students" | "confidence" | "help">("overview");
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const helpRows = helpByQuestion(data);
  const [confidenceFor, setConfidenceFor] = useState("class");
  // Class-wide confidence views only use shared results; unshared work is counted but not analysed.
  const sharedRows = confidenceRows(data, { sharedOnly: true, studentId: confidenceFor === "class" ? undefined : confidenceFor });
  const unsharedCount = confidenceRows(data, { studentId: confidenceFor === "class" ? undefined : confidenceFor }).length - sharedRows.length;
  const patterns = confidencePatterns(confidenceRows(data, { sharedOnly: true }));
  const shownPatterns = confidenceFor === "class" ? patterns : patterns.filter((pattern) => pattern.studentId === confidenceFor);
  const singles = singleSignals(sharedRows);
  const overview = classOverview(data);
  const topics = topicInsights(data);
  const ideas = classWrongIdeas(data);
  const reliable = topics.filter((topic) => topic.answers >= 3);
  const hardest = reliable.slice(0, 3);
  const strongest = [...reliable].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const improving = topics.filter((topic) => topic.trend === "improving").sort((a, b) => (b.trendDelta ?? 0) - (a.trendDelta ?? 0));
  const falling = topics.filter((topic) => topic.trend === "falling").sort((a, b) => (a.trendDelta ?? 0) - (b.trendDelta ?? 0));
  const mostNeed = [...topics].filter((topic) => topic.needSupport.length).sort((a, b) => b.needSupport.length - a.needSupport.length).slice(0, 3);
  const first = flaggedStudents(data).filter((item) => item.priority && item.status !== "resolved" && item.status !== "dismissed").slice(0, 3);
  const waitingStudents = overview.all.filter((item) => item.waitingPreview);
  const sharedResults = data.submissions.filter((submission) => submission.status === "published");
  const sharedCount = sharedResults.length;
  const classAverageAll = sharedCount ? Math.round(sharedResults.reduce((sum, item) => sum + getSubmissionProgress(data, item), 0) / sharedCount) : 0;
  const analysed = overview.withResults;
  const improvingStudents = overview.all.filter((item) => item.results.length >= 2 && item.results[item.results.length - 1].percent - item.results[0].percent >= 10);
  const gapTopics = [...topics].filter((topic) => topic.needSupport.length > 0).sort((a, b) => b.needSupport.length - a.needSupport.length || a.percent - b.percent).slice(0, 5);
  const allIdeas = topics.flatMap((topic) => topic.wrongIdeas.map((idea) => ({ ...idea, topicKey: topic.topicKey, topicLabel: topic.label })));
  const recurringIdeas = allIdeas.filter((idea) => idea.evidence.length >= 2).sort((a, b) => b.students.length - a.students.length || b.evidence.length - a.evidence.length);
  const isolatedIdeas = allIdeas.filter((idea) => idea.evidence.length < 2);
  const attention = flaggedStudents(data).filter((item) => item.priority && item.status !== "resolved" && item.status !== "dismissed");
  // Focus topics: most students needing support first, then the lowest class average (topics with 3+ answers).
  const focus = [...reliable].sort((a, b) => b.needSupport.length - a.needSupport.length || a.percent - b.percent).slice(0, 5);
  const rank = (priority?: SupportPriority) => priority === "high" ? 0 : priority === "attention" ? 1 : priority === "monitoring" ? 2 : 3;
  const byPriority = (a: { priority?: SupportPriority; average?: number }, b: { priority?: SupportPriority; average?: number }) => rank(a.priority) - rank(b.priority) || (a.average ?? 101) - (b.average ?? 101);
  const pendingFlags = data.submissions.reduce((count, submission) => count + submission.flags.filter((flag) => flag.decision === "pending").length, 0);
  const tabs: { id: typeof tab; label: string; count?: number }[] = [{ id: "overview", label: "Overview" }, { id: "topics", label: "Topics", count: topics.length }, { id: "students", label: "Students", count: data.students.length }, { id: "confidence", label: "Confidence", count: patterns.length }, { id: "help", label: "Help asked", count: helpRows.length }];
  const showTopic = (key: string) => { setTab("topics"); setOpenTopic(key); window.setTimeout(() => document.getElementById(`topic-${key}`)?.scrollIntoView({ block: "start" }), 60); };
  const topicLink = (topic: TopicInsight, extra: React.ReactNode) => <li key={topic.topicKey}><Button className="list-row insight-link" onClick={() => showTopic(topic.topicKey)}><span className="row-main"><strong>{topic.label}</strong><small>{extra}</small></span><Icon name="chevron" size={16}/></Button></li>;
  return <div className="page">
    <PageHead title="Learning insights" sub="From shared, teacher-approved results. Patterns to help you plan, not diagnoses."/>
    <div className="tabs" role="group" aria-label="Insight type">{tabs.map((item) => <Button key={item.id} className={tab === item.id ? "selected" : ""} onClick={() => setTab(item.id)}>{item.label}{item.count !== undefined && <span className="count">{item.count}</span>}</Button>)}</div>
    {tab === "overview" && <div className="insight-overview">
      {/* 1. Class performance overview: only metrics the data supports */}
      <section className="card glance" aria-labelledby="glance-title">
        <h2 id="glance-title" className="section-title">Class performance overview</h2>
        <p className="glance-line">{analysed} of {overview.students} students have shared results · class average <strong>{classAverageAll}%</strong> · <strong>{improvingStudents.length} improving</strong> · <strong>{overview.needSupport} may need support</strong>.</p>
        <dl className="glance-tiles">
          <div><dt>Students analysed</dt><dd><strong>{analysed}</strong><small>with at least one shared result</small></dd></div>
          <div><dt>Class average</dt><dd><strong>{classAverageAll}%</strong><small>across {sharedCount} shared results</small></dd></div>
          <div className="tone-ok"><dt>Improving</dt><dd><strong>{improvingStudents.length}</strong><small>latest result 10+ points above their first</small></dd></div>
          <div className="tone-warn"><dt>May need support</dt><dd><strong>{overview.needSupport}</strong><small>{overview.high} high priority · see Flagged students</small></dd></div>
        </dl>
        <p className="muted small">Only shared, teacher-approved results are counted. Analysis is rule-based on your marks, not a diagnosis.</p>
      </section>

      {/* 2. Common learning gaps */}
      <section className="card insight-group" aria-labelledby="gaps-title">
        <header className="group-head"><div><h2 id="gaps-title" className="section-title">Common learning gaps</h2><p className="muted small">Topics where most students are below {LOW_RESULT}% or flagged, most common first.</p></div><Button className="secondary-button btn-sm" onClick={() => setTab("topics")}>All topics</Button></header>
        <table className="focus-table">
          <thead><tr><th scope="col">Topic</th><th scope="col">Students struggling</th><th scope="col">Class average</th><th scope="col">Trend</th></tr></thead>
          <tbody>{gapTopics.map((topic) => <tr key={topic.topicKey}>
            <th scope="row"><button type="button" className="text-button insight-link-inline" onClick={() => showTopic(topic.topicKey)}>{topic.label}</button><small>{topic.subject} · {topic.answers} shared answers · select to see the evidence</small></th>
            <td><strong>{topic.needSupport.length}</strong> <small className="muted">({topic.needSupport.map((id) => getStudent(data, id).name.split(" ")[0]).join(", ")})</small></td>
            <td><span className="topic-cell"><span className="meter" aria-hidden="true"><span className={topic.percent < WEAK_TOPIC ? "low" : topic.percent < SECURE ? "mid" : ""} style={{ width: `${Math.max(2, topic.percent)}%` }}/></span><strong>{topic.percent}%</strong></span></td>
            <td><span className={`pill ${trendWords[topic.trend].tone}`}>{trendWords[topic.trend].label}</span></td>
          </tr>)}</tbody>
        </table>
      </section>

      {/* 3. Recurring mistakes */}
      <section className="card insight-group" aria-labelledby="mistakes-title">
        <header className="group-head"><div><h2 id="mistakes-title" className="section-title">Recurring mistakes</h2><p className="muted small">Known wrong ideas found in shared answers the teacher marked as not fully right.</p></div></header>
        {recurringIdeas.length ? <ul className="list">{recurringIdeas.map((idea) => <li key={idea.label}><Button className="list-row insight-link" onClick={() => showTopic(idea.topicKey)}><span className="row-main"><strong>{capitalize(idea.label)}</strong><small>{idea.topicLabel} · {idea.evidence.length} answer{idea.evidence.length === 1 ? "" : "s"} · {idea.students.length} student{idea.students.length === 1 ? "" : "s"} ({idea.students.map((id) => getStudent(data, id).name.split(" ")[0]).join(", ")})</small></span><span className="pill warn">Recurring</span><Icon name="chevron" size={16}/></Button></li>)}</ul> : <p className="muted small">No wrong idea appears more than once yet.</p>}
        {isolatedIdeas.length > 0 && <p className="muted small">Seen only once (not a pattern yet): {isolatedIdeas.map((idea) => `${idea.label} (${idea.topicLabel})`).join("; ")}.</p>}
      </section>

      {/* 4. Students requiring attention */}
      <section className="card insight-group" aria-labelledby="who-title">
        <header className="group-head"><div><h2 id="who-title" className="section-title">Students requiring attention</h2><p className="muted small">Repeated difficulties or falling marks in shared results. One low mark alone is never listed.</p></div><Button className="secondary-button btn-sm" onClick={handlers.onOpenFlagged}>Open Flagged students</Button></header>
        {attention.length ? <ul className="list attention-list">{attention.map((item) => { const student = getStudent(data, item.studentId); const topic = item.signals.find((signal) => signal.topicKey)?.topicKey; return <li key={item.studentId} className="list-row"><Avatar initials={student.initials} color={student.color}/><span className="row-main"><strong>{student.name}{topic ? <span className="muted"> · {getTopicLabel(data, topic)}</span> : null}</strong><small>{item.signals[0]?.detail}</small></span><PriorityPill priority={item.priority}/><span className="rec-actions"><Button className="text-button" onClick={() => handlers.onProfile(item.studentId)}>Profile</Button><Button className="text-button" onClick={() => handlers.onOpenCase(item.studentId)}>Evidence</Button></span></li>; })}</ul> : <p className="empty">No student needs extra attention right now.</p>}
        {waitingStudents.length > 0 && <p className="muted small">{waitingStudents.map((item) => getStudent(data, item.studentId).name.split(" ")[0]).join(", ")} {waitingStudents.length === 1 ? "has" : "have"} new work waiting for your review that could change this.</p>}
      </section>

      {/* 5. Recommended teaching actions: visually separate from the insights above */}
      <section className="card insight-group recommended" aria-labelledby="actions-title">
        <header className="group-head"><div><h2 id="actions-title" className="section-title">Recommended teaching actions</h2><p className="muted small">Suggestions from the gaps and mistakes above. They are only offers; you decide.</p></div></header>
        <ul className="action-groups">{gapTopics.slice(0, 3).map((topic) => { const idea = topic.wrongIdeas[0]; return <li key={topic.topicKey}><h3 className="subsection-title">{topic.label}</h3><ul className="plain-list">
          {idea && <li><strong>Re-teach with a picture or model.</strong> <span className="muted">Because “{idea.label}” came up in {idea.evidence.length} answer{idea.evidence.length === 1 ? "" : "s"}.</span></li>}
          {topic.needSupport.length > 0 && <li><strong>Targeted practice for {topic.needSupport.length} student{topic.needSupport.length === 1 ? "" : "s"}.</strong> <span className="muted">Because they are below {LOW_RESULT}% or flagged in this topic.</span> <Button className="text-button" onClick={() => handlers.onPractice(topic.needSupport, topic.topicKey)}>Assign practice</Button></li>}
          {topic.trend === "falling" && <li><strong>Check this topic in the next assessment.</strong> <span className="muted">Because recent answers are {Math.abs(topic.trendDelta ?? 0)} points lower.</span></li>}
        </ul></li>; })}{gapTopics.length === 0 && <li className="muted">No action needed right now.</li>}</ul>
      </section>

      <details className="more card"><summary>Results over time (chart)</summary><div className="more-body"><ClassResultsChart data={data}/></div></details>
      {pendingFlags > 0 && <p className="muted small">{pendingFlags} flag{pendingFlags === 1 ? "" : "s"} on individual results still need your decision in Review submissions.</p>}
    </div>}
    {tab === "topics" && <section className="card card-flush">
      <div className="topic-table-head" aria-hidden="true"><span>Topic</span><span>Class</span><span>Below {LOW_RESULT}% or flagged</span><span>Trend</span></div>
      <ul className="list">{topics.map((topic) => <li key={topic.topicKey} id={`topic-${topic.topicKey}`} className={`topic-item ${openTopic === topic.topicKey ? "open" : ""}`}>
        <Button className="topic-row" aria-expanded={openTopic === topic.topicKey} onClick={() => setOpenTopic(openTopic === topic.topicKey ? null : topic.topicKey)}>
          <span className="row-main"><strong>{topic.label}</strong><small>{topic.subject} · {topic.answers} shared answer{topic.answers === 1 ? "" : "s"} · {topic.students.length} student{topic.students.length === 1 ? "" : "s"}{topic.wrongIdeas.length ? ` · ${topic.wrongIdeas.length} wrong idea${topic.wrongIdeas.length === 1 ? "" : "s"}` : ""}</small></span>
          <span className="topic-cell"><span className="meter" aria-hidden="true"><span className={topic.percent < WEAK_TOPIC ? "low" : topic.percent < SECURE ? "mid" : ""} style={{ width: `${Math.max(2, topic.percent)}%` }}/></span><strong>{topic.percent}%</strong></span>
          <span className="topic-cell">{topic.needSupport.length}</span>
          <span className="topic-cell"><span className={`pill ${trendWords[topic.trend].tone}`}>{trendWords[topic.trend].label}</span></span>
        </Button>
        {openTopic === topic.topicKey && <TopicDetail data={data} topic={topic} handlers={handlers}/>}
      </li>)}{topics.length === 0 && <li className="empty">No shared results yet.</li>}</ul>
      <p className="muted small card-pad">Class average from shared answers in each topic. Trend compares the earlier half of those answers with the more recent half (4 answers or more).</p>
    </section>}
    {tab === "students" && <section className="card card-flush"><ul className="list">{overview.all.slice().sort(byPriority).map((item) => { const student = getStudent(data, item.studentId); const change = item.results.length >= 2 ? item.results[item.results.length - 1].percent - item.results[0].percent : undefined; return <li className="list-row student-insight-row" key={item.studentId}>
      <Avatar initials={student.initials} color={student.color}/>
      <span className="row-main"><strong>{student.name}</strong><small>{item.results.length} shared result{item.results.length === 1 ? "" : "s"}{change !== undefined ? ` · ${change >= 0 ? "+" : ""}${change} points since the first` : ""}{item.weakestTopics[0] ? ` · weakest: ${item.weakestTopics[0].label} ${item.weakestTopics[0].percent}%` : ""}</small></span>
      <span className="flag-row-score">{item.average === undefined ? "—" : `${item.average}%`}<small>average</small></span>
      <span className="flag-pills">{item.priority || item.status ? <><PriorityPill priority={item.priority}/><StatusPill status={item.status}/></> : <span className="pill ok">No concern</span>}</span>
      <span className="rec-actions"><Button className="text-button" onClick={() => handlers.onProfile(item.studentId)}>Profile</Button>{item.status && <Button className="text-button" onClick={() => handlers.onOpenCase(item.studentId)}>Flag</Button>}</span>
    </li>; })}</ul></section>}
    {tab === "confidence" && <>
      <section className="card">
        <div className="card-head-inline"><h2 className="section-title">How sure students felt, and how they did</h2><label className="inline-select">Show<select value={confidenceFor} onChange={(event) => setConfidenceFor(event.target.value)}><option value="class">Whole class</option>{data.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label></div>
        {sharedRows.length ? <ConfidenceGridTable rows={sharedRows} caption="Answers by how sure the student felt and how the answer was marked"/> : <p className="muted">No shared results yet.</p>}
        <p className="muted small">{sharedRows.length} answer{sharedRows.length === 1 ? "" : "s"} from shared results{unsharedCount ? ` · ${unsharedCount} not shared yet, so not counted` : ""}. Right = full marks, partly right = some marks.</p>
      </section>
      <section className="card card-flush">
        <h2 className="section-title card-pad">Repeated patterns by topic</h2>
        {shownPatterns.length ? <ul className="list">{shownPatterns.map((pattern) => { const student = getStudent(data, pattern.studentId); const latest = data.submissions.filter((item) => item.studentId === pattern.studentId && item.status === "published").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0]; return <li className="list-row" key={pattern.kind + pattern.studentId + pattern.topicKey}><Avatar initials={student.initials} color={student.color}/><span className="row-main"><strong>{student.name} · {getTopicLabel(data, pattern.topicKey)}</strong><small>{patternText(pattern, student.name.split(" ")[0])} {pattern.topicAnswers} answers in this topic so far.</small></span><span className={`pill ${pattern.kind === "sure-not-right" ? "warn" : "info"}`}>{pattern.kind === "sure-not-right" ? "Worth a conversation" : "Build confidence"}</span>{latest && <Button className="secondary-button btn-sm" onClick={() => onReview(latest.id)}>Open latest</Button>}</li>; })}</ul>
          : <p className="empty">No repeated pattern yet.</p>}
        <p className="muted small card-pad">{singles ? `${singles} single answer${singles === 1 ? "" : "s"} with a confidence signal ${singles === 1 ? "is" : "are"} not shown as a pattern yet. ` : ""}{PATTERN_NOTE}</p>
      </section>
    </>}
    {tab === "help" && <section className="card card-flush">
      <h2 className="section-title card-pad">Questions students asked for help with</h2>
      {helpRows.length ? <ul className="list">{helpRows.map((row) => { const assessment = getAssessment(data, row.assessmentId); const question = questionBank(assessment).find((item) => item.id === row.questionId); return <li className="insight-row" key={row.assessmentId + row.questionId}>
        <div className="insight-main"><strong>{question?.prompt ?? row.questionId}</strong><small>{shortTitle(assessment.title)} · {row.students.size} student{row.students.size === 1 ? "" : "s"}{row.notHelpful ? ` · “didn’t help” ${row.notHelpful}×` : ""}</small>
          <p className="chip-list">{LADDER.filter((step) => row.steps[step]).map((step) => <span className="pill" key={step}>{ladderWords[step]} × {row.steps[step]}</span>)}</p></div>
      </li>; })}</ul> : <p className="empty">No student has asked for help yet.</p>}
      <p className="muted small card-pad">Many requests on one question can mean the question or the topic needs another look in class.</p>
    </section>}
  </div>;
}

function TeacherStudents({ data, searchTerm, onSearch, onReview, onProfile }: { data: AssessmentAppData; searchTerm: string; onSearch: (value: string) => void; onReview: (id: string) => void; onProfile: (studentId: string) => void }) {
  // Stage 4: matches names and the titles of the student's assessments, ignoring case and accents.
  const rows = data.students.filter((student) => matchesSearch(searchTerm, [student.name, ...data.submissions.filter((item) => item.studentId === student.id).map((item) => getAssessment(data, item.assessmentId).title)])).map((student) => {
    const submissions = data.submissions.filter((item) => item.studentId === student.id);
    const published = submissions.filter((item) => item.status === "published");
    const average = published.length ? Math.round(published.reduce((sum, item) => sum + getSubmissionProgress(data, item), 0) / published.length) : undefined;
    const needsReview = submissions.find((item) => item.status !== "published");
    const latestShared = [...published].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];
    return { student, published, average, needsReview, latestShared };
  });
  return <div className="page">
    <PageHead title="Students" sub={`${data.students.length} students in Grade 4B. Select a name to open the profile.`}><SearchBox value={searchTerm} onChange={onSearch} label="Search students"/></PageHead>
    <section className="card card-flush student-table" role="table" aria-label="Students">
      <div className="student-table-row head" role="row"><span role="columnheader">Student</span><span role="columnheader">Shared</span><span role="columnheader">Average</span><span role="columnheader">Status</span><span role="columnheader"><span className="sr-only">Action</span></span></div>
      {rows.map(({ student, published, average, needsReview, latestShared }) => { const state = needsReview ? queueState(data, needsReview) : "Up to date"; return <div className="student-table-row" role="row" key={student.id}>
        <span role="cell" className="student-cell"><Avatar initials={student.initials} color={student.color}/><span><button type="button" className="student-link" onClick={() => onProfile(student.id)}>{student.name}</button><small>Age {student.age}{(() => { const practice = (data.practiceLog ?? []).filter((entry) => entry.studentId === student.id); return practice.length ? ` · practised at home ${practice.length}×` : ""; })()}</small></span></span>
        <span role="cell">{published.length}</span>
        <span role="cell">{average === undefined ? "—" : average + "%"}</span>
        <span role="cell"><span className={`pill ${needsReview ? stateTone(state) : ""}`}>{state}</span></span>
        <span role="cell"><Button className="secondary-button btn-sm" disabled={!needsReview && !latestShared} onClick={() => { const target = needsReview ?? latestShared; if (target) onReview(target.id); }}>{needsReview ? "Review" : latestShared ? "View latest" : "No results yet"}</Button></span>
      </div>; })}
      {rows.length === 0 && <div className="empty"><span className="no-matches"><strong>No students match “{searchTerm.trim()}”.</strong><Button className="secondary-button btn-sm" onClick={() => onSearch("")}>Clear search</Button></span></div>}
    </section>
  </div>;
}

const teacherTopicWords: Record<ParentTopicStatus, { label: string; tone: string }> = {
  "practising": { label: "Confirmed gap", tone: "warn" },
  "improving": { label: "Improving", tone: "info" },
  "doing-well": { label: "Strong", tone: "ok" },
  "on-track": { label: "No concern", tone: "" },
};

/** One student's profile for the teacher: everything here is teacher-only. */
function TeacherStudentProfile({ data, studentId, onReview, onBack, onOpenCase, onSend }: { data: AssessmentAppData; studentId: string; onReview: (id: string) => void; onBack: () => void; onOpenCase: (studentId: string) => void; onSend: SendHandler }) {
  const student = getStudent(data, studentId);
  const firstName = student.name.split(" ")[0];
  const submissions = data.submissions.filter((item) => item.studentId === studentId).sort((a, b) => (b.publishedAt ?? b.uploadedAt).localeCompare(a.publishedAt ?? a.uploadedAt));
  const shared = submissions.filter((item) => item.status === "published");
  const waiting = submissions.filter((item) => item.status !== "published");
  const average = shared.length ? Math.round(shared.reduce((sum, item) => sum + getSubmissionProgress(data, item), 0) / shared.length) : undefined;
  const progress = parentProgress(data, shared);
  const pendingTopics = [...new Set(waiting.flatMap((item) => (item.learningGaps ?? []).filter((topic) => (item.learningGapDecisions?.[topic] ?? "pending") === "pending")))];
  const rows = confidenceRows(data, { studentId, sharedOnly: true });
  const patterns = confidencePatterns(rows);
  const help = data.helpRequests.filter((item) => item.studentId === studentId).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const assignments = data.assignments.filter((item) => item.studentId === studentId);
  const practice = (data.practiceLog ?? []).filter((entry) => entry.studentId === studentId);
  return <div className="page">
    <PageHead title={student.name} sub={`${student.grade} · Age ${student.age}`}><Button className="secondary-button" onClick={onBack}>Back to students</Button></PageHead>
    <div className="profile-facts">
      <div><strong>{shared.length}</strong><span>shared result{shared.length === 1 ? "" : "s"}</span></div>
      <div><strong>{average === undefined ? "—" : `${average}%`}</strong><span>average</span></div>
      <div><strong>{waiting.length}</strong><span>waiting for review</span></div>
      <div><strong>{assignments.filter((item) => !getAssignmentSubmission(data, item)).length}</strong><span>not sent yet</span></div>
    </div>
    <ProfileSupportCard data={data} studentId={studentId} onOpenCase={onOpenCase}/>
    <details className="more card"><summary>Send {firstName} a message</summary><div className="more-body"><SendToStudent data={data} studentId={studentId} topics={studentSupport(data, studentId).topics.map((topic) => topic.topicKey)} defaultTopic={studentSupport(data, studentId).weakestTopics[0]?.topicKey} onSend={onSend}/></div></details>
    {waiting.length > 0 && <section className="card card-flush"><h2 className="section-title card-pad">Waiting for review</h2><ul className="list">{waiting.map((item) => <li className="list-row" key={item.id}><span className="row-main"><strong>{getAssessment(data, item.assessmentId).title}</strong><small>Uploaded {dateLabel(item.uploadedAt)} · {item.language === "de" ? "German" : "English"}</small></span><span className={`pill ${stateTone(queueState(data, item))}`}>{queueState(data, item)}</span><Button className="primary-button btn-sm" onClick={() => onReview(item.id)}>Review</Button></li>)}</ul></section>}
    {progress.length === 0 ? <p className="empty card">No shared results yet.</p> : progress.map((group) => <section className="card subject-card" key={group.subject} aria-labelledby={`profile-${group.subject}`}>
      <div className="card-head-inline"><h2 id={`profile-${group.subject}`} className="section-title">{group.subject}</h2><span className="muted small">{group.points.length} shared result{group.points.length === 1 ? "" : "s"}</span></div>
      {group.points.length > 1 && <ScoreLine points={group.points}/>}
      <ul className="topic-status-list">{(Object.keys(teacherTopicWords) as ParentTopicStatus[]).filter((status) => group.topics.some((topic) => topic.status === status)).map((status) => <li key={status}><span className={`pill ${teacherTopicWords[status].tone}`}>{teacherTopicWords[status].label}</span><span className="row-main"><strong>{group.topics.filter((topic) => topic.status === status).map((topic) => `${topic.label} (${topic.latestPercent}%)`).join(", ")}</strong></span></li>)}</ul>
      <ul className="list">{group.results.map((result) => <li className="parent-result-row" key={result.id}><span className="row-main"><strong>{shortTitle(getAssessment(data, result.assessmentId).title)}</strong><small>Shared {dateLabel(result.at)}{result.corrected ? " · corrected" : ""}</small></span><span className="meter wide" aria-hidden="true"><span style={{ width: `${result.percent}%` }}/></span><strong className="parent-score">{result.percent}%</strong><Button className="text-button" onClick={() => onReview(result.id)}>Open</Button></li>)}</ul>
    </section>)}
    {pendingTopics.length > 0 && <p className="pattern-note"><Icon name="clock" size={16}/><span><strong>Waiting for your decision:</strong> {pendingTopics.map((topic) => getTopicLabel(data, topic)).join(", ")} (from unshared work).</span></p>}
    <details className="more card"><summary>Confidence vs. answer{patterns.length ? ` · ${patterns.length} repeated pattern${patterns.length === 1 ? "" : "s"}` : ""}</summary><div className="more-body">
      {rows.length ? <ConfidenceGridTable rows={rows} caption={`${firstName}’s shared answers by confidence and mark`}/> : <p className="muted">No shared answers yet.</p>}
      {patterns.map((pattern) => <p className="pattern-note" key={pattern.kind + pattern.topicKey}><Icon name="trend" size={16}/><span><strong>{getTopicLabel(data, pattern.topicKey)}:</strong> {patternText(pattern, firstName)}</span></p>)}
      <p className="muted small">{PATTERN_NOTE}</p>
    </div></details>
    <details className="more card"><summary>Help asked ({help.length})</summary><div className="more-body">{help.length ? <ul className="list">{help.map((item) => { const question = getAssessment(data, item.assessmentId).questions[item.language].find((entry) => entry.id === item.questionId); return <li className="list-row" key={item.id}><span className="row-main"><strong>{ladderWords[stepOf(item)]}{item.helpful === false ? " · didn’t help" : item.helpful ? " · helped" : ""}</strong><small>{question?.prompt ?? item.questionId} · {dateLabel(item.createdAt)}</small></span>{item.kind === "teacher" && <span className={`pill ${item.status === "open" ? "warn" : "ok"}`}>{item.status === "open" ? "Waiting for you" : "Answered"}</span>}</li>; })}</ul> : <p className="muted">{firstName} hasn’t asked for help yet.</p>}</div></details>
    <details className="more card"><summary>Assignments ({assignments.length}){practice.length ? ` · home practice ${practice.length}×` : ""}</summary><div className="more-body"><ul className="list">{assignments.map((assignment) => { const template = assignment.templateId ? data.templates.find((item) => item.id === assignment.templateId) : undefined; const sent = getAssignmentSubmission(data, assignment); const off = assignment.help ? (Object.keys(helpSettingWords) as (keyof HelpSettings)[]).filter((key) => !assignment.help![key]).map((key) => helpSettingWords[key].toLocaleLowerCase()) : []; return <li className="list-row" key={assignment.id}><span className="row-main"><strong>{getAssessment(data, assignment.assessmentId).title}{template ? ` · ${template.title}` : ""}</strong><small>{dueDateCopy(assignmentDue(data, assignment))}{off.length ? ` · help off: ${off.join(", ")}` : ""}</small></span><span className={`pill ${sent ? (sent.status === "published" ? "ok" : "warn") : ""}`}>{sent ? (sent.status === "published" ? "Shared" : "Sent · waiting for review") : "Not sent yet"}</span></li>; })}{assignments.length === 0 && <li className="muted">No assignments yet.</li>}</ul></div></details>
  </div>;
}

function TeacherHelpRequests({ data, onReply, onNoteSeen }: { data: AssessmentAppData; onReply: (id: string, response: string) => void; onNoteSeen: (submissionId: string, index: number) => void }) {
  // Short notes parents left when they marked a result as read. Not a chat: the teacher just sees them.
  const notes = data.submissions.flatMap((submission) => (submission.parentReads ?? []).map((read, index) => ({ submission, read, index })).filter(({ read }) => read.note)).sort((a, b) => Number(Boolean(a.read.teacherSeenAt)) - Number(Boolean(b.read.teacherSeenAt)) || b.read.at.localeCompare(a.read.at));
  const newNotes = notes.filter(({ read }) => !read.teacherSeenAt).length;
  const requests = data.helpRequests.filter((request) => request.kind === "teacher").slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const open = requests.filter((request) => request.status === "open");
  const answered = requests.filter((request) => request.status !== "open");
  const render = (request: HelpRequestRecord) => { const question = getAssessment(data, request.assessmentId).questions[request.language].find((item) => item.id === request.questionId); const before = helpForQuestion(data, { studentId: request.studentId, assessmentId: request.assessmentId, questionId: request.questionId, assignmentId: request.assignmentId, before: request.createdAt }).filter((item) => item.kind !== "teacher"); return <HelpInboxItem key={request.id} request={request} studentName={getStudent(data, request.studentId).name} question={question?.prompt ?? "Assessment question"} before={before} onReply={onReply}/>; };
  return <div className="page page-narrow">
    <PageHead title="Help requests" sub={open.length ? `${open.length} waiting for your reply` : "You’ve answered every request."}/>
    {open.length > 0 && <section className="help-inbox-list">{open.map(render)}</section>}
    {answered.length > 0 && <details className="more card"><summary>Answered ({answered.length})</summary><div className="help-inbox-list">{answered.map(render)}</div></details>}
    {requests.length === 0 && <p className="empty card">No student has asked for teacher help yet.</p>}
    {notes.length > 0 && <section className="card card-flush" aria-labelledby="parent-notes-title">
      <h2 id="parent-notes-title" className="section-title card-pad">Notes from parents{newNotes ? <span className="pill brand">{newNotes} new</span> : null}</h2>
      <ul className="list">{notes.map(({ submission, read, index }) => <li className="list-row parent-note" key={submission.id + index}><span className="row-main"><strong>Nadia Hassan · parent of {getStudent(data, submission.studentId).name.split(" ")[0]}</strong><small>About {shortTitle(getAssessment(data, submission.assessmentId).title)} · {dateLabel(read.at)}</small><span className="parent-note-text">“{read.note}”</span></span>{read.teacherSeenAt ? <span className="pill ok">Seen</span> : <Button className="secondary-button btn-sm" onClick={() => onNoteSeen(submission.id, index)}>Mark as seen</Button>}</li>)}</ul>
    </section>}
  </div>;
}

const SUMMARY = "__summary";

function ReviewWorkspace({ data, submission, routeQuestion, onQuestionChange, onBack, onUpdate, onPublish, onReopen, onCancelReopen, onSend, toast }: { onSend: SendHandler; data: AssessmentAppData; submission: SubmissionRecord; routeQuestion?: string; onQuestionChange?: (id: string) => void; onBack: () => void; onUpdate: (id: string, update: (current: SubmissionRecord) => SubmissionRecord) => void; onPublish: (id: string) => void; onReopen: (id: string, reason: string) => void; onCancelReopen: (id: string) => void; toast: (v: string) => void }) {
  const assessment = getAssessment(data, submission.assessmentId);
  const student = getStudent(data, submission.studentId);
  const questions = getSubmissionQuestions(data, submission);
  const [questionId, setQuestionId] = useState(routeQuestion && (routeQuestion === SUMMARY || questions.some((question) => question.id === routeQuestion)) ? routeQuestion : questions[0]?.id ?? "");
  const onSummary = questionId === SUMMARY;
  const selectedQuestion = onSummary ? undefined : questions.find((question) => question.id === questionId) ?? questions[0];
  const answer = selectedQuestion ? submission.answers.find((item) => item.questionId === selectedQuestion.id) : undefined;
  const [extractionDraft, setExtractionDraft] = useState(answer?.extractedText ?? "");
  const [feedbackDraft, setFeedbackDraft] = useState(answer?.teacherFeedback ?? "");
  useEffect(() => { setExtractionDraft(answer?.extractedText ?? ""); setFeedbackDraft(answer?.teacherFeedback ?? ""); }, [submission.id, selectedQuestion?.id, answer?.extractedText, answer?.teacherFeedback]);
  const verifiedCount = submission.answers.filter((item) => item.verified).length;
  const unresolvedFlags = submission.flags.filter((flag) => flag.decision === "pending").length;
  const unresolvedGaps = (submission.learningGaps ?? []).filter((topic) => !["confirmed", "dismissed"].includes(submission.learningGapDecisions?.[topic] ?? "pending")).length;
  // A shared result is read-only. To correct it the teacher reopens it, which takes it back from the student and parent.
  const locked = submission.status === "published";
  const edit = (id: string, update: (current: SubmissionRecord) => SubmissionRecord) => { if (!locked) onUpdate(id, update); };
  const blockers = locked ? [] : getPublishBlockers(data, submission);
  const changedMarks = blockers.filter((item) => item.kind === "changed-mark").length;
  const canPublish = !locked && blockers.length === 0;
  const [dialog, setDialog] = useState<"publish" | "reopen" | "cancel" | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const jumpTo = (id?: string) => { if (id) selectQuestion(id); };
  const signals = getLearningSignals(data, submission);
  const language = submission.language;
  const updateAnswer = (targetId: string, change: (item: AnswerRecord, question: QuestionDefinition) => AnswerRecord) => edit(submission.id, (current) => {
    const question = getSubmissionQuestions(data, current).find((item) => item.id === targetId);
    if (!question) return current;
    let markChanged = false;
    const answers = current.answers.map((item) => {
      if (item.questionId !== targetId) return item;
      const next = change(item, question);
      if (next.teacherScore !== item.teacherScore) markChanged = true;
      return next;
    });
    const next = { ...current, answers };
    // Gap suggestions and automatic flags always follow the current teacher marks.
    return markChanged ? reconcileLearningSignals(data, next, question.topicKey) : next;
  });
  const patchAnswer = (patch: Partial<AnswerRecord>) => { if (answer) updateAnswer(answer.questionId, (item) => ({ ...item, ...patch })); };
  // Edited OCR text is never thrown away: leaving the box or the question saves it, re-runs the
  // simulated grader so the explanation matches the text, and marks the answer as unverified.
  const commitExtraction = (verify = false) => {
    if (!answer || locked) return false;
    const text = extractionDraft;
    const changed = text !== answer.extractedText;
    if (!changed && !verify) return false;
    updateAnswer(answer.questionId, (item, question) => text !== item.extractedText ? applyExtractedText(question, language, item, text, verify) : verify ? approveAnswer(item) : item);
    return changed;
  };
  const textSavedMessage = "Text saved and the AI suggestion re-run. Marks you set or verified are never changed automatically.";
  // The teacher's own mark and comment: once set (or verified) they are teacher-approved and only the teacher can change them.
  // Every mark decision is logged; the AI suggestion (aiScore) itself is never overwritten.
  const decideMark = (score: number, by: MarkChange["by"]) => {
    if (!answer || locked) return;
    const change: MarkChange = { at: new Date().toISOString(), from: answer.teacherScore, to: score, aiScore: answer.aiScore, by };
    const logged = score !== answer.teacherScore || by !== "teacher" || answer.markSource !== "teacher";
    patchAnswer({ teacherScore: score, markSource: "teacher", suggestionChanged: false, ...(logged ? { markHistory: [...(answer.markHistory ?? []), change] } : {}) });
  };
  const setTeacherMark = (score: number) => { if (!answer || !selectedQuestion) return; decideMark(score, "teacher"); toast(`Mark saved: ${score} / ${selectedQuestion.maxScore} for Question ${qIndex + 1}.`); };
  const acceptAiMark = () => { if (!answer) return; decideMark(answer.aiScore, "accept-ai"); toast(`AI-suggested mark accepted: ${answer.aiScore} for Question ${qIndex + 1}.`); };
  const keepOwnMark = () => { if (!answer) return; decideMark(answer.teacherScore, "keep-own"); toast(`Your mark (${answer.teacherScore}) was kept for Question ${qIndex + 1}.`); };
  const saveFeedback = (explicit: boolean) => {
    if (!answer || (!explicit && feedbackDraft === answer.teacherFeedback)) return;
    patchAnswer({ teacherFeedback: feedbackDraft, feedbackSource: "teacher" });
  };
  const selectQuestion = (id: string) => { if (commitExtraction()) toast(textSavedMessage); saveFeedback(false); setQuestionId(id); onQuestionChange?.(id); window.scrollTo({ top: 0 }); };
  // Stage 4: Back/Forward can change the question in the address; drafts are saved first, as with a click.
  useEffect(() => { if (routeQuestion && routeQuestion !== questionId && (routeQuestion === SUMMARY || questions.some((question) => question.id === routeQuestion))) selectQuestion(routeQuestion); }, [routeQuestion]);
  // Leaving the page any way (Back button, sidebar, notification) saves the extracted text and the comment.
  // Stage 4: keyboard shortcuts. Only moving between questions; nothing that marks, verifies, shares or reopens.
  const [showKeys, setShowKeys] = useState(false);
  const keyRef = useRef((_event: KeyboardEvent) => {});
  keyRef.current = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    // While the list is open, Esc (or ?) closes it wherever focus is.
    if (showKeys) { if (event.key === "Escape" || event.key === "?") { event.preventDefault(); setShowKeys(false); } return; }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
    if (dialog || document.querySelector("[role='dialog']")) return;
    const order = [...questions.map((question) => question.id), SUMMARY];
    const position = Math.max(0, order.indexOf(onSummary ? SUMMARY : selectedQuestion?.id ?? order[0]));
    const key = event.key;
    if (key === "j" || key === "J" || key === "]") { event.preventDefault(); if (position < order.length - 1) selectQuestion(order[position + 1]); }
    else if (key === "k" || key === "K" || key === "[") { event.preventDefault(); if (position > 0) selectQuestion(order[position - 1]); }
    else if (key === "s" || key === "S") { event.preventDefault(); selectQuestion(SUMMARY); }
    else if (key === "?") { event.preventDefault(); setShowKeys(true); }
  };
  useEffect(() => { const onKey = (event: KeyboardEvent) => keyRef.current(event); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  const flushRef = useRef(() => {});
  flushRef.current = () => { commitExtraction(); saveFeedback(false); };
  useEffect(() => () => flushRef.current(), []);
  const leaveReview = () => { commitExtraction(); saveFeedback(false); onBack(); };
  const saveDraft = () => {
    commitExtraction();
    saveFeedback(false);
    toast("Draft saved. Nothing is shared until you select Approve & publish.");
  };
  const saveAndVerifyText = () => { commitExtraction(true); toast("Text saved and verified."); };
  const rerunGrade = () => {
    if (!answer) return;
    const text = extractionDraft;
    updateAnswer(answer.questionId, (item, question) => applyExtractedText(question, language, item, text, text === item.extractedText ? item.verified : false));
    toast("Simulated AI suggestion updated for the current text.");
  };
  const updateFlag = (flagId: string, decision: AttentionFlag["decision"]) => { edit(submission.id, (current) => ({ ...current, flags: current.flags.map((flag) => flag.id === flagId ? { ...flag, decision } : flag) })); toast(decision === "confirmed" ? "Red flag confirmed. It is shared with the result as an area to keep practising." : "Red flag dismissed. It won’t be shared."); };
  const updateGapDecision = (topicKey: string, decision: AttentionFlag["decision"]) => { edit(submission.id, (current) => ({ ...current, learningGapDecisions: { ...(current.learningGapDecisions ?? {}), [topicKey]: decision } })); toast(decision === "confirmed" ? `Learning gap confirmed: ${getTopicLabel(data, topicKey)}. It will be shared with the result.` : `Learning gap dismissed: ${getTopicLabel(data, topicKey)}. It won’t be shared.`); };
  const publishedScore = getSubmissionScore(data, submission);
  const maxScore = getSubmissionMaxScore(data, submission);
  const percent = getSubmissionProgress(data, submission);
  const confirmedGaps = (submission.learningGaps ?? []).filter((topic) => submission.learningGapDecisions?.[topic] === "confirmed");
  const dismissedGaps = (submission.learningGaps ?? []).filter((topic) => submission.learningGapDecisions?.[topic] === "dismissed");
  const confirmedFlags = submission.flags.filter((flag) => flag.decision === "confirmed");
  const changedFromAi = submission.answers.filter((item) => item.teacherScore !== item.aiScore).length;
  const ownComments = submission.answers.filter((item) => item.teacherFeedback !== item.aiFeedback).length;
  const parentName = "Nadia Hassan";
  const hasParent = submission.studentId === DEMO_PARENT_CHILD_ID;
  const audience = hasParent ? `${student.name.split(" ")[0]} and their parent (${parentName})` : student.name.split(" ")[0];
  const languageName = submission.language === "en" ? "English" : "German";
  const decisionsLeft = unresolvedGaps + unresolvedFlags;
  const qIndex = selectedQuestion ? questions.indexOf(selectedQuestion) : -1;
  const firstName = student.name.split(" ")[0];
  // Confidence: this submission's answers, plus repeated patterns across this student's shared work and this one.
  const thisRows = confidenceRows(data, { submissionIds: [submission.id] });
  // Help the student asked for on this question before sending the work (for context only).
  const helpUsed = selectedQuestion ? helpForQuestion(data, { studentId: submission.studentId, assessmentId: submission.assessmentId, questionId: selectedQuestion.id, assignmentId: submission.assignmentId, before: submission.uploadedAt }) : [];
  const helpTried = [...helpUsed].reverse().find((item) => item.tried)?.tried;
  const studentPatterns = confidencePatterns(confidenceRows(data, { studentId: submission.studentId }).filter((row) => row.shared || row.submissionId === submission.id))
    .filter((pattern) => thisRows.some((row) => row.topicKey === pattern.topicKey && rowMatches(pattern.kind, row)));
  const progress = reviewProgress(questions, submission, language);
  const checks = selectedQuestion && answer ? answerChecks(selectedQuestion, answer) : [];
  const breakdown = selectedQuestion && answer ? markBreakdown(selectedQuestion, answer) : undefined;
  const differsFromAi = Boolean(answer && answer.teacherScore !== answer.aiScore);
  const [overallDraft, setOverallDraft] = useState(submission.overallFeedback ?? "");
  useEffect(() => { setOverallDraft(submission.overallFeedback ?? ""); }, [submission.id, submission.overallFeedback]);
  const strengths = [...new Set(questions.filter((question) => (submission.answers.find((item) => item.questionId === question.id)?.teacherScore ?? 0) === question.maxScore).map((question) => getTopicLabel(data, question.topicKey)))];
  const toImprove = [...new Set(questions.filter((question) => (submission.answers.find((item) => item.questionId === question.id)?.teacherScore ?? 0) / question.maxScore < 0.75).map((question) => getTopicLabel(data, question.topicKey)))];
  const thisWrongIdeas = questions.flatMap((question) => { const item = submission.answers.find((entry) => entry.questionId === question.id); return item && item.teacherScore < question.maxScore ? markBreakdown(question, item).wrongIdeas : []; });
  const earlierSupport = studentSupport(data, submission.studentId);
  const recurring = [...new Set([...thisWrongIdeas.filter((idea) => earlierSupport.wrongIdeas.some((earlier) => earlier.label === idea)), ...earlierSupport.wrongIdeas.filter((idea) => idea.count >= 2).map((idea) => idea.label)])];
  const markChanges = questions.flatMap((question, index) => (submission.answers.find((item) => item.questionId === question.id)?.markHistory ?? []).map((change) => ({ ...change, index })));
  const suggestedMessage = () => [
    `Well done, ${firstName}!`,
    strengths.length ? `You did really well in ${strengths.slice(0, 2).join(" and ").toLowerCase()}.` : "Thank you for working so carefully.",
    toImprove.length ? `Next, let’s practise ${toImprove.slice(0, 2).join(" and ").toLowerCase()} together.` : "Keep up the great work!",
  ].join(" ");
  const saveOverall = () => { if (locked) return; if (overallDraft === (submission.overallFeedback ?? "")) { toast("Your personal message is already saved."); return; } edit(submission.id, (current) => ({ ...current, overallFeedback: overallDraft.trim() ? overallDraft : undefined })); toast(overallDraft.trim() ? "Personal message saved. It is shared with the result." : "Personal message removed."); };
  const markLabel = !answer ? "" : locked ? "Shared mark" : answer.markSource === "teacher" ? (differsFromAi ? "Changed by you" : "Approved by you") : "AI draft · not approved yet";
  return <div className="review-page">
    <header className="review-head">
      <Button className="icon-button" onClick={leaveReview} aria-label="Back to review submissions" title="Back"><Icon name="arrow" size={18}/></Button>
      <div className="review-title"><Title>{student.name}</Title><p>{assessment.title} · {languageName} · {locked ? `Shared ${submission.publishedAt ? new Date(submission.publishedAt).toLocaleDateString() : ""}` : `Uploaded ${new Date(submission.uploadedAt).toLocaleDateString()}`}</p></div>
      <div className="review-actions">
        {locked ? <>
          <span className="pill ok"><Icon name="check" size={14}/> Shared · read-only</span>
          <Button className="secondary-button" onClick={() => { setReopenReason(""); setDialog("reopen"); }}>Reopen to correct</Button>
        </> : <>
          <button type="button" className={`todo-link ${blockers.length ? "" : "ready"}`} onClick={() => selectQuestion(SUMMARY)}>{blockers.length ? `${blockers.length} thing${blockers.length === 1 ? "" : "s"} to do before sharing` : "Ready to share"}</button>
          {submission.reopened && <Button className="secondary-button" onClick={() => setDialog("cancel")}>Cancel correction</Button>}
          <Button className="secondary-button" onClick={saveDraft}>Save draft</Button>
          <Button className="primary-button" disabled={!canPublish} title={canPublish ? "Review what will be shared, then confirm" : "Open “Summary” to see what is left"} onClick={() => setDialog("publish")}><Icon name="check"/> {submission.reopened ? "Share corrected result" : "Approve & publish"}</Button>
        </>}
      </div>
    </header>
    {!locked && <div className="review-progress" aria-label="Review progress"><span><strong>{progress.reviewed} of {questions.length}</strong> answers checked</span>{progress.attention > 0 && <span className="progress-attention"><Icon name="alert" size={14}/> {progress.attention} need{progress.attention === 1 ? "s" : ""} attention</span>}<span>{decisionsLeft ? `${decisionsLeft} gap or flag decision${decisionsLeft === 1 ? "" : "s"} left` : "Gaps and flags decided"}</span><div className="meter" aria-hidden="true"><span style={{ width: `${Math.round((progress.reviewed / Math.max(1, questions.length)) * 100)}%` }}/></div></div>}
    {locked && <p className="review-banner ok"><Icon name="check" size={16}/> Shared with {audience}. Marks and feedback are locked; reopen to correct a mistake{submission.revisions?.length ? ` · corrected ${submission.revisions.length}×` : ""}.{hasParent && currentParentRead(submission) ? ` Read by ${parentName} on ${new Date(currentParentRead(submission)!.at).toLocaleDateString()}.` : ""}</p>}
    {!locked && submission.reopened && <p className="review-banner warn"><Icon name="alert" size={16}/> Reopened {new Date(submission.reopened.at).toLocaleDateString()}{submission.reopened.reason ? ` — “${submission.reopened.reason}”` : ""}. Hidden from {audience} until you share it again.</p>}
    <div className="review-layout">
      <nav className="question-nav" aria-label="Questions">
        {progress.rows.map(({ question, answer: item, checks: itemChecks }, index) => {
          const approved = item?.markSource === "teacher";
          const changed = Boolean(item && item.markSource === "teacher" && item.teacherScore !== item.aiScore);
          const attention = needsAttention(itemChecks);
          const state = item?.suggestionChanged || attention ? "attention" : item?.verified ? "done" : "todo";
          const status = item?.suggestionChanged ? "Choose a mark" : attention ? `${openChecks(itemChecks.filter((check) => check.kind !== "unverified"))} to check` : item?.verified ? "Checked" : "Not checked";
          return <Button key={question.id} className={`qnav-item ${questionId === question.id || (!onSummary && selectedQuestion?.id === question.id) ? "active" : ""}`} onClick={() => selectQuestion(question.id)}>
            <span className={`q-state ${state}`} aria-hidden="true"><Icon name={state === "attention" ? "alert" : state === "done" ? "check" : "scan"} size={14}/></span>
            <span className="qnav-text"><strong>Question {index + 1}</strong><small>{status}{changed ? " · changed by you" : ""}</small></span>
            <span className="qnav-mark"><strong className={`outcome-${answerOutcome(item?.teacherScore ?? 0, question.maxScore)}`}>{item?.teacherScore ?? 0}/{question.maxScore}<span className="sr-only"> · {outcomeWords[answerOutcome(item?.teacherScore ?? 0, question.maxScore)]}{approved ? "" : " · AI draft"}</span></strong></span>
          </Button>;
        })}
        <Button className={`qnav-item summary ${onSummary ? "active" : ""}`} onClick={() => selectQuestion(SUMMARY)}>
          <span className={`q-state ${locked || blockers.length === 0 ? "done" : "todo"}`} aria-hidden="true"><Icon name={locked || blockers.length === 0 ? "check" : "clock"} size={14}/></span>
          <span className="qnav-text"><strong>Summary</strong><small>{locked ? "Overview and history" : blockers.length ? `${blockers.length} left before sharing` : "Ready to share"}</small></span>
        </Button>
        <div className="qnav-total"><span>{locked ? "Shared mark" : "Your marks"}</span><strong>{publishedScore} / {maxScore} · {percent}%</strong><div className="meter"><span style={{ width: `${percent}%` }}/></div><small>{verifiedCount} of {questions.length} answers verified</small></div>
        <button type="button" className="kbd-hint" onClick={() => setShowKeys(true)}>Keyboard shortcuts <kbd>?</kbd></button>
      </nav>

      {selectedQuestion && answer && breakdown && <section className="answer-review" aria-labelledby="question-title">
        <div className="question-head"><small>Question {qIndex + 1} of {questions.length} · {selectedQuestion.maxScore} marks · {getTopicLabel(data, selectedQuestion.topicKey)}</small><h2 id="question-title" lang={language}>{selectedQuestion.prompt}</h2></div>
        {checks.some((check) => !check.resolved && check.kind !== "unverified") && !locked && <ul className="check-list" aria-label="To check in this answer">{checks.filter((check) => check.kind !== "unverified").map((check) => <li key={check.kind} className={`check-${check.kind} ${check.resolved ? "resolved" : ""}`}><Icon name={check.resolved ? "check" : "alert"} size={15}/><span><strong>{check.kind === "uncertain" ? "Uncertain text" : check.kind === "incomplete" ? "Possibly incomplete" : check.kind === "wrong-idea" ? "Needs your judgement" : "Choose a mark"}</strong> {check.text} <em>{check.resolved ? "Checked by you." : check.fix}</em></span></li>)}</ul>}
        <div className="review-columns">
          <section className="review-col answer-col" aria-labelledby="answer-col-title">
            <header className="col-head"><h3 id="answer-col-title">{firstName}’s answer</h3><span className={`pill ${answer.verified ? "ok" : "warn"}`}>{answer.verified ? "Text verified" : "Not verified yet"}</span></header>
            <figure className="source-pane"><figcaption><span><Icon name="eye" size={16}/> Original work</span><small>Demo sample</small></figcaption><div className="paper"><span className="paper-number">{qIndex + 1}.</span><p lang={language}>{answer.sourceText || "No sample answer is available for this question."}</p></div><small className="pane-note">The uploaded file ({submission.fileName}) isn’t read. A sample answer stands in for it.</small></figure>
            <div className="source-pane"><div className="pane-caption"><label htmlFor="extraction-text"><Icon name="scan" size={16}/> Extracted text</label><small>Simulated OCR · {answer.ocrConfidence ?? 92}% sure</small></div><textarea id="extraction-text" className="editable-extraction" lang={language} value={extractionDraft} readOnly={locked} onChange={(event) => setExtractionDraft(event.target.value)} onBlur={() => { if (commitExtraction()) toast(textSavedMessage); }}/>
              {!locked && answer.ocrUncertain?.length ? <p className="ocr-uncertain"><Icon name="alert" size={14}/><span>Unsure about {answer.ocrUncertain.map((word) => <mark key={word}>{word}</mark>)}. Compare with the original.</span></p> : null}
            </div>
            {!locked && <div className="verification-actions"><Button className="text-button" onClick={rerunGrade}>Re-run simulated AI grade</Button><Button className="primary-button" onClick={saveAndVerifyText}><Icon name="check" size={16}/>{extractionDraft !== answer.extractedText ? "Save correction & verify" : answer.verified ? "Verified · verify again" : "Text is correct · verify"}</Button></div>}
          </section>
          <section className="review-col grade-col" aria-labelledby="grade-col-title">
            <header className="col-head"><h3 id="grade-col-title">Mark and feedback</h3></header>
            <div className="score-card">
              <div><small>AI suggestion</small><span className="ai-hint"><Icon name="sparkles" size={14}/> AI suggests <strong>{answer.aiScore} / {selectedQuestion.maxScore}</strong></span><em>Simulated · only you see this</em></div>
              <div><small>{locked ? "Shared mark" : "Your mark"}</small><strong className={`score-now outcome-${answerOutcome(answer.teacherScore, selectedQuestion.maxScore)}`}>{answer.teacherScore} / {selectedQuestion.maxScore}</strong><em className={answer.markSource === "teacher" ? "src-teacher" : "src-ai"}>{markLabel}</em></div>
            </div>
            {!locked && answer.suggestionChanged && <div className="suggestion-changed" role="status"><p><Icon name="alert" size={16}/> <span><strong>The text changed after you approved this mark.</strong> The AI now suggests {answer.aiScore}; your mark {answer.teacherScore} was kept. Choose one before sharing.</span></p><div><Button className="secondary-button btn-sm" onClick={acceptAiMark}>Use AI suggestion ({answer.aiScore})</Button><Button className="secondary-button btn-sm" onClick={keepOwnMark}>Keep my mark ({answer.teacherScore})</Button></div></div>}
            <div className="mark-editor"><div className="mark-buttons" role="group" aria-label="Set teacher mark">{Array.from({ length: selectedQuestion.maxScore + 1 }, (_, n) => <Button key={n} aria-label={`Set teacher mark to ${n}`} className={answer.teacherScore === n ? "active" : ""} disabled={locked} onClick={() => setTeacherMark(n)}>{n}</Button>)}</div><span className="mark-source">{markLabel}</span></div>
            {!locked && !answer.suggestionChanged && (answer.markSource !== "teacher" || differsFromAi) && <div className="mark-choice">{differsFromAi ? <><span className="muted small">Your mark differs from the AI suggestion.</span><Button className="text-button" onClick={acceptAiMark}>Use AI mark ({answer.aiScore})</Button>{answer.markSource !== "teacher" && <Button className="text-button" onClick={keepOwnMark}>Keep {answer.teacherScore}</Button>}</> : <><span className="muted small">Agree with the AI suggestion?</span><Button className="text-button" onClick={acceptAiMark}>Accept {answer.aiScore} / {selectedQuestion.maxScore}</Button></>}</div>}
            {submission.uploadedBy === "teacher" ? <p className="felt-line muted small">Confidence not collected: you uploaded this work.</p> : (() => { const level = answer.confidence ?? "medium"; const outcome = answerOutcome(answer.teacherScore, selectedQuestion.maxScore); return <p className="felt-line"><span>{firstName} felt</span><span className={`conf-badge ${level}`}>{confidenceWords[level]}</span><span className={`outcome-pill ${outcome}`}>{outcomeWords[outcome]}</span><span className="muted small">context only</span></p>; })()}
            <label className="feedback-label" htmlFor="teacher-feedback">Feedback for {firstName} <span className="mark-source">{locked ? "Shared" : answer.feedbackSource === "teacher" ? "Approved by you" : "AI suggestion · edit before sharing"}</span></label>
            <textarea id="teacher-feedback" className="feedback-textarea" lang={submission.language} value={feedbackDraft} readOnly={locked} onChange={(event) => setFeedbackDraft(event.target.value)} onBlur={() => saveFeedback(false)}/>
            {!locked && <div className="verification-actions"><Button className="text-button" onClick={() => { setFeedbackDraft(answer.aiFeedback ?? ""); patchAnswer({ teacherFeedback: answer.aiFeedback ?? "", feedbackSource: answer.verified ? "teacher" : "ai" }); toast("Suggested feedback put back."); }}><Icon name="sparkles" size={15}/> Use AI suggestion</Button><Button className="secondary-button" onClick={() => { saveFeedback(true); toast(`Feedback for Question ${qIndex + 1} saved.`); }}>Save feedback</Button></div>}
          </section>
        </div>
        <section className="review-secondary" aria-label="More about this answer">
          <details className="more" open={!answer.verified && !locked}><summary>Why the AI suggests {answer.aiScore}</summary><div className="more-body why-mark">
            <p className="muted small">Simulated AI: a rule-based check of the extracted text against the marking criteria. It suggests; you decide.</p>
            <dl className="idea-list">
              <div><dt>Credited</dt><dd>{breakdown.credited.length ? breakdown.credited.map((item) => `${item.label} (${item.earned}/${item.marks})`).join(" · ") : "Nothing credited yet"}</dd></div>
              <div><dt>Missing</dt><dd>{breakdown.missing.length ? breakdown.missing.join(" · ") : "Nothing missing"}</dd></div>
              <div><dt>Incorrect or misunderstood</dt><dd>{breakdown.wrongIdeas.length ? breakdown.wrongIdeas.join(" · ") : "No known wrong idea found"}</dd></div>
              {breakdown.partialNote && <div><dt>Part marks</dt><dd>{breakdown.partialNote}</dd></div>}
            </dl>
            <p className="small">{answer.aiRationale ?? "Re-run the simulated grader to see the ideas it matched."}</p>
          </div></details>
          <details className="more"><summary>Marking guide · expected answer and criteria</summary><div className="more-body">
            <p><strong>Expected answer:</strong> <span lang={language}>{selectedQuestion.modelAnswer}</span></p>
            <ul className="criteria-list">{breakdown.criteria.map((criterion) => <li key={criterion.label}><span>{criterion.label}</span><strong>{criterion.marks} mark{criterion.marks === 1 ? "" : "s"}{criterion.need > 1 ? ` · needs ${criterion.need} ideas${criterion.partial ? ", part marks allowed" : ""}` : ""}</strong></li>)}</ul>
            {breakdown.guideWrongIdeas.length > 0 && <p className="muted small">Known wrong ideas cap the mark: {breakdown.guideWrongIdeas.map((item) => `${item.label} (at most ${item.cap})`).join("; ")}.</p>}
            <p className="muted small">Topic: {getTopicLabel(data, selectedQuestion.topicKey)} · Maximum {selectedQuestion.maxScore} marks</p>
          </div></details>
          <details className="more"><summary>Confidence and help used</summary><div className="more-body">
            {(() => {
              const level = answer.confidence ?? "medium";
              const outcome = answerOutcome(answer.teacherScore, selectedQuestion.maxScore);
              const kind = rowMatches("sure-not-right", { confidence: level, outcome }) ? "sure-not-right" : rowMatches("unsure-right", { confidence: level, outcome }) ? "unsure-right" : "fits";
              const repeated = studentPatterns.find((pattern) => pattern.topicKey === selectedQuestion.topicKey && pattern.kind === kind);
              return <div className={`compare-panel ${kind}`} role="group" aria-label={`How sure ${firstName} felt, compared with the mark`}>
                <div className="compare-cell"><small>{firstName} felt</small><span className={`conf-badge ${level}`}>{confidenceWords[level]}</span></div>
                <span className="compare-vs" aria-hidden="true">vs</span>
                <div className="compare-cell"><small>{locked ? "Shared mark" : "Your mark now"}</small><span className="compare-mark"><strong>{answer.teacherScore} / {selectedQuestion.maxScore}</strong><span className={`outcome-pill ${outcome}`}>{outcomeWords[outcome]}</span></span></div>
                <p className="compare-note">{confidenceInsight(kind, level, outcome)}{repeated ? ` Repeated: ${repeated.answers} answers in ${repeated.assessments} assessments in this topic.` : ""}</p>
              </div>;
            })()}
            <p className="signal-row">{helpUsed.length > 0 ? <span className="signal"><Icon name="help" size={14}/> Help used: <strong>{helpUsed.map((item) => ladderWords[stepOf(item)] + (item.helpful === false ? " (didn’t help)" : item.helpful ? " (helped)" : "")).join(" → ")}</strong></span> : <span className="signal"><Icon name="help" size={14}/> No help used</span>}<span className="muted small">Confidence and help are context only. Neither changes the mark.</span></p>
            {helpTried && <p className="help-tried"><small>{firstName} wrote what they tried</small>“{helpTried}”</p>}
          </div></details>
          <details className="more"><summary>Mark changes ({answer.markHistory?.length ?? 0})</summary><div className="more-body">
            {answer.markHistory?.length ? <ul className="plain-list">{answer.markHistory.map((change, index) => <li key={index}>{dateLabel(change.at)}: {change.from} → {change.to} {change.by === "accept-ai" ? "(AI suggestion accepted)" : change.by === "keep-own" ? "(kept your mark)" : "(set by you)"} · AI suggested {change.aiScore}</li>)}</ul> : <p className="muted small">No changes yet. The AI suggestion ({answer.aiScore}) is always kept, whatever mark you set.</p>}
          </div></details>
        </section>
      </section>}

      {onSummary && <section className="answer-review summary-view" aria-label="Summary">
        <div className="summary-student"><Avatar initials={student.initials} color={student.color}/><div><strong>{student.name}</strong><small>{student.grade} · Age {student.age} · {publishedScore} / {maxScore} marks</small></div><ScoreRing score={percent}/></div>
        {!locked && <section className={`step-card publish-checklist ${blockers.length ? "" : "ready"}`}>
          <header className="step-head"><span className="step-num">1</span><h2 className="step-title">{blockers.length ? "Before you can share" : "Ready to share"}</h2><span className={`pill ${blockers.length ? "warn" : "ok"}`}>{blockers.length ? `${blockers.length} to do` : "All done"}</span></header>
          <ul className="checklist">
            <li className={verifiedCount === questions.length ? "done" : ""}><Icon name={verifiedCount === questions.length ? "check" : "clock"} size={16}/> Verify every answer <strong>{verifiedCount}/{questions.length}</strong></li>
            <li className={changedMarks === 0 ? "done" : ""}><Icon name={changedMarks === 0 ? "check" : "alert"} size={16}/> Choose changed marks <strong>{changedMarks} left</strong></li>
            <li className={unresolvedGaps === 0 ? "done" : ""}><Icon name={unresolvedGaps === 0 ? "check" : "clock"} size={16}/> Decide learning gaps <strong>{unresolvedGaps} left</strong></li>
            <li className={unresolvedFlags === 0 ? "done" : ""}><Icon name={unresolvedFlags === 0 ? "check" : "clock"} size={16}/> Decide flags <strong>{unresolvedFlags} left</strong></li>
          </ul>
          {blockers.length > 0 && <details className="more"><summary>Show each item</summary><ul className="blocker-list more-body">{blockers.map((item, index) => <li key={index} className={item.kind}>{item.questionId ? <button type="button" onClick={() => jumpTo(item.questionId)}>{item.text}</button> : <span>{item.text}</span>}</li>)}</ul></details>}
          <p className="muted small">Nothing is visible to {audience} until you confirm sharing.</p>
        </section>}
        <section className="step-card overall-card" aria-labelledby="overall-title">
          <header className="step-head"><span className="step-num">{locked ? 1 : 2}</span><h2 className="step-title" id="overall-title">Overall performance</h2></header>
          <table className="question-table"><thead><tr><th scope="col">Question</th><th scope="col">Topic</th><th scope="col">Mark</th><th scope="col">Status</th></tr></thead><tbody>{progress.rows.map(({ question, answer: item, checks: itemChecks }, index) => <tr key={question.id}><th scope="row"><button type="button" className="text-button" onClick={() => selectQuestion(question.id)}>Q{index + 1}</button></th><td>{getTopicLabel(data, question.topicKey)}</td><td className="num">{item?.teacherScore ?? 0} / {question.maxScore}{item && item.markSource === "teacher" && item.teacherScore !== item.aiScore ? <small> (AI {item.aiScore})</small> : null}</td><td>{item?.suggestionChanged ? "Choose a mark" : needsAttention(itemChecks) ? "Needs attention" : item?.verified ? "Checked" : "Not checked"}</td></tr>)}</tbody></table>
          <dl className="overall-facts">
            <div><dt>Strengths</dt><dd>{strengths.length ? strengths.join(", ") : "No question fully right yet"}</dd></div>
            <div><dt>To improve</dt><dd>{toImprove.length ? toImprove.join(", ") : "Nothing below 75%"}</dd></div>
            <div><dt>Recurring mistakes</dt><dd>{recurring.length ? recurring.join("; ") : "None found in shared work"}</dd></div>
          </dl>
        </section>

        <section className="step-card">
          <header className="step-head"><span className="step-num">{locked ? 2 : 3}</span><h2 className="step-title">Learning gaps</h2><span className={`pill ${unresolvedGaps ? "warn" : ""}`}>{signals.length ? (unresolvedGaps ? `${unresolvedGaps} to decide` : "Decided") : "None"}</span></header>
          {signals.length ? signals.map((signal) => { const decision = submission.learningGapDecisions?.[signal.topicKey] ?? "pending"; return <div className="decision-row" key={signal.topicKey}>
            <div className="decision-main"><strong>{getTopicLabel(data, signal.topicKey)}</strong><small className="muted">{signal.recurring ? `Teacher-confirmed in ${signal.earlierCount} earlier shared result${signal.earlierCount === 1 ? "" : "s"}.` : "Suggested by a low mark in this assessment only."}</small></div>
            <div className="decision-actions"><Button disabled={locked} className={`secondary-button btn-sm ${decision === "confirmed" ? "selected" : ""}`} onClick={() => updateGapDecision(signal.topicKey, "confirmed")}>Confirm gap</Button><Button disabled={locked} className={`secondary-button btn-sm ${decision === "dismissed" ? "selected" : ""}`} onClick={() => updateGapDecision(signal.topicKey, "dismissed")}>Dismiss</Button></div>
          </div>; }) : <p className="muted">No gaps suggested by your current marks.</p>}
          {signals.length > 0 && <p className="muted small">Only gaps you confirm are shared with the student and parent.</p>}
        </section>

        <section className="step-card">
          <header className="step-head"><span className="step-num">{locked ? 3 : 4}</span><h2 className="step-title">Red flags</h2><span className={`pill ${unresolvedFlags ? "warn" : ""}`}>{submission.flags.length ? (unresolvedFlags ? `${unresolvedFlags} to decide` : "Decided") : "None"}</span></header>
          {submission.flags.length === 0 ? <p className="muted">No flags were raised.</p> : submission.flags.map((flag) => <div className="decision-row" key={flag.id}>
            <div className="decision-main"><strong>{flag.title} <span className={`pill ${flag.severity === "High" ? "bad" : "warn"}`}>{flag.severity === "High" ? "High" : "Watch"}</span></strong><details className="more"><summary>Details</summary><div className="more-body"><p>{flag.description}</p>{flag.decision === "confirmed" && <p>Parents see a confirmed flag in plain language as an area to keep practising.</p>}</div></details></div>
            <div className="decision-actions"><Button disabled={locked} className={`secondary-button btn-sm ${flag.decision === "confirmed" ? "selected" : ""}`} onClick={() => updateFlag(flag.id, "confirmed")}>Confirm</Button><Button disabled={locked} className={`secondary-button btn-sm ${flag.decision === "dismissed" ? "selected" : ""}`} onClick={() => updateFlag(flag.id, "dismissed")}>Dismiss</Button></div>
          </div>)}
        </section>

        <section className="step-card overall-feedback-card" aria-labelledby="overall-feedback-title">
          <header className="step-head"><span className="step-num">{locked ? 4 : 5}</span><h2 className="step-title" id="overall-feedback-title"><label htmlFor="overall-feedback">Personal message for {firstName}</label></h2><span className="mark-source">{locked ? "Shared" : submission.overallFeedback ? "Saved" : "Optional"}</span></header>
          <textarea id="overall-feedback" className="feedback-textarea" lang={submission.language} value={overallDraft} readOnly={locked} onChange={(event) => setOverallDraft(event.target.value)} placeholder={locked ? "No personal message was shared." : "A few kind words about the whole assessment and what to practise next."}/>
          {!locked && <div className="verification-actions"><Button className="text-button" onClick={() => setOverallDraft(suggestedMessage())}><Icon name="sparkles" size={15}/> Suggest wording</Button><Button className="secondary-button" onClick={saveOverall}>Save message</Button></div>}
          <p className="muted small">Shared with the result{hasParent ? " (the parent sees it too)" : ""}. “Suggest wording” uses your marks, not AI; edit it before saving.</p>
        </section>

        <details className="more card"><summary>Confidence vs. answer</summary><div className="more-body confidence-card">
          <p className="muted small">{thisRows.filter((row) => rowMatches("sure-not-right", row)).length} felt sure but weren’t fully right · {thisRows.filter((row) => rowMatches("unsure-right", row)).length} right but unsure</p>
          <table className="confidence-table">
            <thead><tr><th scope="col">Question</th><th scope="col">{firstName} felt</th><th scope="col">Mark</th><th scope="col">Result</th><th scope="col">What it suggests</th></tr></thead>
            <tbody>{questions.map((question, index) => { const item = submission.answers.find((entry) => entry.questionId === question.id); const level = item?.confidence ?? "medium"; const outcome = answerOutcome(item?.teacherScore ?? 0, question.maxScore); const kind = rowMatches("sure-not-right", { confidence: level, outcome }) ? "sure-not-right" : rowMatches("unsure-right", { confidence: level, outcome }) ? "unsure-right" : "fits"; return <tr key={question.id} className={kind}>
              <th scope="row"><button type="button" className="text-button" onClick={() => selectQuestion(question.id)}>Q{index + 1}</button></th>
              <td><span className={`conf-badge ${level}`}>{confidenceWords[level]}</span></td>
              <td className="num">{item?.teacherScore ?? 0} / {question.maxScore}</td>
              <td><span className={`outcome-pill ${outcome}`}>{outcomeWords[outcome]}</span></td>
              <td className="insight">{confidenceInsight(kind, level, outcome)}</td>
            </tr>; })}</tbody>
          </table>
          {studentPatterns.map((pattern) => <p className="pattern-note" key={pattern.kind + pattern.topicKey}><Icon name="trend" size={16}/><span><strong>{getTopicLabel(data, pattern.topicKey)}:</strong> {patternText(pattern, firstName)}</span></p>)}
          <details className="more"><summary>Grid and how patterns are found</summary><div className="more-body">
            <ConfidenceGridTable rows={thisRows} caption={`${firstName}’s answers in this assessment by confidence and mark`}/>
            <p className="muted small">{PATTERN_NOTE}</p>
          </div></details>
        </div></details>

        <details className="more card"><summary>Correction history ({(submission.revisions?.length ?? 0) + markChanges.length})</summary><div className="more-body">
          {markChanges.length ? <><h3 className="subsection-title">Mark changes</h3><ul className="plain-list">{markChanges.map((change, index) => <li key={index}>Q{change.index + 1} · {dateLabel(change.at)}: {change.from} → {change.to} {change.by === "accept-ai" ? "(AI suggestion accepted)" : change.by === "keep-own" ? "(kept your mark)" : "(set by you)"} · AI suggested {change.aiScore}</li>)}</ul></> : <p className="muted small">No mark changes recorded.</p>}
          {(submission.revisions?.length ?? 0) > 0 && <><h3 className="subsection-title">Earlier shared versions</h3><ul className="list">{submission.revisions!.map((revision, index) => <li className="revision-row" key={index}><strong>Shared {new Date(revision.publishedAt).toLocaleDateString()} · {revision.score}/{revision.maxScore}</strong><small>Reopened {new Date(revision.reopenedAt).toLocaleDateString()}{revision.reason ? ` · “${revision.reason}”` : ""}</small></li>)}</ul></>}
        </div></details>

        {locked ? <section className="step-card"><header className="step-head"><h2 className="step-title">Send {firstName} more feedback</h2></header><SendToStudent data={data} studentId={submission.studentId} assessmentId={submission.assessmentId} submissionId={submission.id} topics={questions.map((question) => question.topicKey)} defaultTopic={toImprove.length ? questions.find((question) => getTopicLabel(data, question.topicKey) === toImprove[0])?.topicKey : undefined} onSend={onSend}/></section>
          : <section className={`final-publish ${canPublish ? "ready" : ""}`}><div><strong>{canPublish ? "Everything is checked." : "Finish the items in step 1 to share."}</strong><span className="muted small">You’ll see exactly what {audience} will see before anything is shared.</span></div><Button className="primary-button" disabled={!canPublish} onClick={() => setDialog("publish")}><Icon name="check"/> {submission.reopened ? "Review and share corrected result" : "Review and publish"}</Button></section>}
      </section>}
    </div>
    {showKeys && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setShowKeys(false); }}><section className="confirm-dialog shortcuts-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <h2 id="shortcuts-title">Keyboard shortcuts</h2>
      <dl className="shortcut-list"><div><dt><kbd>J</kbd> or <kbd>]</kbd></dt><dd>Next question</dd></div><div><dt><kbd>K</kbd> or <kbd>[</kbd></dt><dd>Previous question</dd></div><div><dt><kbd>S</kbd></dt><dd>Summary</dd></div><div><dt><kbd>?</kbd></dt><dd>Show or hide this list</dd></div></dl>
      <p className="muted small">They don’t work while you type in a box. Marks, verifying and sharing have no shortcuts, so they always need a click.</p>
      <div className="dialog-actions"><Button className="primary-button" onClick={() => setShowKeys(false)}>Close</Button></div>
    </section></div>}
    {dialog === "publish" && <ConfirmDialog title={submission.reopened ? `Share the corrected result with ${student.name.split(" ")[0]}?` : `Share results with ${student.name}?`} confirmLabel={submission.reopened ? "Share corrected result" : "Share results"} onCancel={() => setDialog(null)} onConfirm={() => { setDialog(null); onPublish(submission.id); }}>
      <p>{audience} will see:</p>
      <ul className="confirm-summary">
        <li><b>Score:</b> {publishedScore} / {maxScore} ({percent}%){submission.reopened ? ` · previously shared: ${submission.reopened.previous.answers.reduce((sum, item) => sum + item.teacherScore, 0)} / ${maxScore}` : ""}</li>
        <li><b>Marks:</b> {questions.length === 1 ? "approved" : questions.length === 2 ? "both approved" : `all ${questions.length} approved`} by you{changedFromAi ? `, ${changedFromAi} different from the AI suggestion` : ", all matching the AI suggestion"}</li>
        <li><b>Feedback:</b> {questions.length} comment{questions.length === 1 ? "" : "s"}{ownComments ? `, ${ownComments} written or edited by you` : ", all as suggested by the AI"}</li>
        <li><b>Topics to practise:</b> {confirmedGaps.length ? confirmedGaps.map((topic) => getTopicLabel(data, topic)).join(", ") : "none"}{dismissedGaps.length ? ` · not shared: ${dismissedGaps.map((topic) => getTopicLabel(data, topic)).join(", ")}` : ""}</li>
        <li><b>Areas you are following up:</b> {confirmedFlags.length ? confirmedFlags.map((flag) => getTopicLabel(data, flag.topicKey)).join(", ") : "none"}</li>
        <li><b>Personal message:</b> {submission.overallFeedback?.trim() ? `“${submission.overallFeedback.trim().slice(0, 90)}${submission.overallFeedback.trim().length > 90 ? "…" : ""}”` : "none"}</li>
        <li><b>Notification:</b> {firstName} {hasParent ? "and their parent are" : "is"} notified that the result is ready.</li>
      </ul>
      <p className="confirm-note">AI suggestions are never shown to them. You can reopen and correct this result later.</p>
    </ConfirmDialog>}
    {dialog === "reopen" && <ConfirmDialog title="Reopen this result to correct it?" confirmLabel="Reopen to correct" onCancel={() => setDialog(null)} onConfirm={() => { setDialog(null); onReopen(submission.id, reopenReason); }}>
      <p>{audience} won’t see this result while you correct it. They are told when you share it again. “Cancel correction” puts back exactly what they saw.</p>
      <label className="field" htmlFor="reopen-reason">What needs correcting? (optional)<textarea id="reopen-reason" className="dialog-textarea" value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} placeholder="Question 2 deserves a higher mark"/></label>
    </ConfirmDialog>}
    {dialog === "cancel" && <ConfirmDialog title="Cancel this correction?" confirmLabel="Put back the shared version" onCancel={() => setDialog(null)} onConfirm={() => { setDialog(null); onCancelReopen(submission.id); }}>
      <p>Your changes since reopening are discarded, and {audience} will see the result exactly as it was shared on {submission.reopened?.previous.publishedAt ? new Date(submission.reopened.previous.publishedAt).toLocaleDateString() : "the earlier date"}.</p>
    </ConfirmDialog>}
  </div>;
}

type SendHandler = (input: { studentId: string; kind: NotificationKind; message: string; topicKey?: string; assessmentId?: string; submissionId?: string }) => boolean;

const sendKindWords: Record<string, string> = { feedback: "Feedback or comment", practice: "Practice recommendation", "review-topic": "Review a topic" };

/** Teacher → one student: a comment, a practice idea or a topic to look at again. Student-friendly wording only;
 *  the teacher writes or edits every word. Shows what was already sent and whether the student read it. */
function SendToStudent({ data, studentId, topics, defaultTopic, defaultKind = "feedback", assessmentId, submissionId, onSend }: { data: AssessmentAppData; studentId: string; topics: string[]; defaultTopic?: string; defaultKind?: NotificationKind; assessmentId?: string; submissionId?: string; onSend: SendHandler }) {
  const firstName = getStudent(data, studentId).name.split(" ")[0];
  const topicList = [...new Set(topics)];
  const [kind, setKind] = useState<NotificationKind>(defaultKind);
  const [topicKey, setTopicKey] = useState(defaultTopic ?? topicList[0] ?? "");
  const wording = (nextKind: NotificationKind, nextTopic: string) => { const label = nextTopic ? getTopicLabel(data, nextTopic).toLowerCase() : "this topic"; return nextKind === "practice" ? `Hi ${firstName}! Let’s practise ${label}. Try the practice ideas in Get help, then tell me how it went.` : nextKind === "review-topic" ? `Hi ${firstName}! Please look at ${label} again before our next lesson. Ask me if anything is unclear.` : ""; };
  const [message, setMessage] = useState(() => wording(defaultKind, defaultTopic ?? topicList[0] ?? ""));
  const [edited, setEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const sendFired = useRef(false);
  const [error, setError] = useState("");
  const change = (nextKind: NotificationKind, nextTopic: string) => { setKind(nextKind); setTopicKey(nextTopic); if (!edited) setMessage(wording(nextKind, nextTopic)); setError(""); };
  const send = () => {
    if (busy || sendFired.current) return;
    if (!message.trim()) { setError(`Write a message for ${firstName} first.`); return; }
    if (kind !== "feedback" && !topicKey) { setError("Choose a topic."); return; }
    setBusy(true); sendFired.current = true;
    const ok = onSend({ studentId, kind, message, topicKey: kind === "feedback" ? undefined : topicKey, assessmentId, submissionId });
    if (ok) { setEdited(false); setMessage(wording(kind, topicKey)); }
    window.setTimeout(() => { setBusy(false); sendFired.current = false; }, 400);
  };
  const sent = sentTo(data, studentId).filter((item) => SENDABLE_KINDS.includes(item.kind)).slice(0, 3);
  return <div className="send-form">
    <div className="field-row"><label className="field">Type<select value={kind} onChange={(event) => change(event.target.value as NotificationKind, topicKey)}>{SENDABLE_KINDS.map((item) => <option key={item} value={item}>{sendKindWords[item]}</option>)}</select></label>
      {kind !== "feedback" && <label className="field">Topic<select value={topicKey} onChange={(event) => change(kind, event.target.value)}>{topicList.map((item) => <option key={item} value={item}>{getTopicLabel(data, item)}</option>)}</select></label>}</div>
    <label className="field">Message to {firstName}<textarea value={message} onChange={(event) => { setMessage(event.target.value); setEdited(true); setError(""); }} placeholder={`Great effort, ${firstName}! …`}/></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="dialog-actions"><span className="muted small">{firstName} sees this in their notifications. Keep it short and kind.</span><Button className="primary-button" disabled={busy} onClick={send}>{busy ? "Sending…" : `Send to ${firstName}`}</Button></div>
    {sent.length > 0 && <ul className="sent-list" aria-label="Recently sent">{sent.map((item) => <li key={item.id}><span>{NOTIFICATION_WORDS[item.kind]} · {dateLabel(item.createdAt)}</span><span className="muted small">“{item.message.slice(0, 60)}{item.message.length > 60 ? "…" : ""}”</span><span className={`pill ${item.readAt ? "ok" : ""}`}>{item.readAt ? "Read" : "Not read yet"}</span></li>)}</ul>}
  </div>;
}

/** Small modal used for every irreversible or visible-to-others action. */
function ConfirmDialog({ title, confirmLabel, onConfirm, onCancel, children }: { title: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; children: React.ReactNode }) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  // A double-click (or a second Enter) must not confirm twice.
  const [busy, setBusy] = useState(false);
  // A ref, not only state: two clicks in the same moment arrive before React re-renders.
  const fired = useRef(false);
  const confirmOnce = () => { if (fired.current) return; fired.current = true; setBusy(true); onConfirm(); };
  // The latest Cancel handler, so the effect below runs once (re-running it would steal focus while typing).
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    // Keep keyboard focus inside the dialog (Tab and Shift+Tab wrap); give it back to the opener on close.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { cancelRef.current(); return; }
      if (event.key !== "Tab") return;
      const box = document.querySelector<HTMLElement>(".confirm-dialog");
      const items = box ? [...box.querySelectorAll<HTMLElement>("button:not([disabled]), textarea, input, select, [href]")] : [];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!box?.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    };
    const restore = () => { if (opener && document.contains(opener)) opener.focus(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); restore(); };
  }, []);
  return <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <h2 id="confirm-title">{title}</h2>
      <div className="confirm-body">{children}</div>
      <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="button" ref={confirmRef} className="primary-button" disabled={busy} aria-busy={busy} onClick={confirmOnce}>{busy ? "Working…" : confirmLabel}</button></div>
    </section>
  </div>;
}

const difficultyWords: Record<DifficultyLevel, string> = { easy: "Easy", medium: "Medium", difficult: "Difficult" };
const difficultyTone: Record<DifficultyLevel, string> = { easy: "ok", medium: "info", difficult: "warn" };
const presetWords: Record<BalancePreset | "custom", string> = { gentle: "Gentle (more easy)", balanced: "Balanced", challenging: "Challenging (more difficult)", custom: "Custom" };
const helpSettingWords: Record<keyof HelpSettings, string> = { hints: "Hints", examples: "Examples", teacher: "Ask the teacher" };
const ALL_HELP: HelpSettings = { hints: true, examples: true, teacher: true };
const shortPrompt = (prompt: string) => prompt.length > 48 ? prompt.slice(0, 46).trimEnd() + "…" : prompt;

/** What a student will see: the questions and marks only, never difficulty, topics or class data. */
function StudentPreview({ assessment, questionIds, title, languages = ["en", "de"] }: { assessment: AssessmentDefinition; questionIds: string[]; title: string; languages?: readonly Language[] }) {
  const [chosen, setLanguage] = useState<Language>("en");
  const language: Language = languages.includes(chosen) ? chosen : languages[0] ?? "en";
  const shown = questionIds.flatMap((id) => assessment.questions[language].filter((question) => question.id === id));
  return <section className="student-preview" aria-label="Student preview">
    <div className="student-preview-bar"><span className="pill brand"><Icon name="eye" size={14}/> Student view</span><label className="inline-select">Language<select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languages.includes("en") && <option value="en">English</option>}{languages.includes("de") && <option value="de">German (Deutsch)</option>}</select></label></div>
    <div className="student-preview-paper student-ui">
      <h3>{assessment.title}</h3>
      <p className="muted">{title.trim() || "Untitled template"} · {shown.length} question{shown.length === 1 ? "" : "s"} · {shown.reduce((sum, question) => sum + question.maxScore, 0)} marks</p>
      <ol className="preview-questions">{shown.map((question) => <li key={question.id}><p>{question.prompt}</p><span className="preview-marks">{question.maxScore} marks</span><span className="answer-lines" aria-hidden="true"/></li>)}</ol>
    </div>
    <p className="muted small">Students don’t see difficulty levels, topics or class averages.</p>
  </section>;
}

function AssignPanel({ data, template, summary, initialSelected = [], onAssign, onClose }: { data: AssessmentAppData; template: AssessmentTemplateRecord; summary?: React.ReactNode; initialSelected?: string[]; onAssign: (templateId: string, studentIds: string[], options: { help: HelpSettings; dueDate?: string }) => void; onClose?: () => void }) {
  const state = assignmentState(data, template.id);
  const available = state.filter((item) => !item.assigned).map((item) => item.student.id);
  const [selected, setSelected] = useState<string[]>(() => initialSelected.filter((id) => available.includes(id)));
  const [help, setHelp] = useState<HelpSettings>(ALL_HELP);
  const [dueDate, setDueDate] = useState("");
  // Assigning puts work in students' lists, so it is confirmed first; the confirm button only works once.
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const assignFired = useRef(false);
  const allChosen = available.length > 0 && selected.length === available.length;
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="assign-panel">
    <fieldset className="assign-students"><legend>Students</legend>
      <div className="assign-students-head"><span className="muted small">{available.length ? `${selected.length} of ${available.length} chosen` : "Everyone already has this template."}</span>{available.length > 0 && <Button className="text-button" onClick={() => setSelected(allChosen ? [] : available)}>{allChosen ? "Clear" : "Select everyone not assigned"}</Button>}</div>
      <div className="assign-student-grid">{state.map(({ student, assigned }) => <label key={student.id} className={`assign-student ${assigned ? "is-assigned" : ""} ${selected.includes(student.id) ? "selected" : ""}`}><input type="checkbox" disabled={assigned} checked={assigned || selected.includes(student.id)} onChange={() => toggle(student.id)}/><span>{student.name}</span>{assigned && <small>Already assigned</small>}</label>)}</div>
    </fieldset>
    <div className="assign-options">
      <fieldset className="help-allowed"><legend>Help students can ask for</legend>{(Object.keys(helpSettingWords) as (keyof HelpSettings)[]).map((key) => <label key={key}><input type="checkbox" checked={help[key]} onChange={() => setHelp((current) => ({ ...current, [key]: !current[key] }))}/> {helpSettingWords[key]}</label>)}</fieldset>
      <label className="field">Due date (optional)<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)}/></label>
    </div>
    {confirming ? <div className="assign-confirm" role="alert">
      <p><strong>Assign “{template.title}” to {selected.length} student{selected.length === 1 ? "" : "s"}?</strong> It appears in their “My work” list{dueDate ? `, due ${new Date(dueDate + "T12:00:00").toLocaleDateString()}` : ""}. {(Object.keys(helpSettingWords) as (keyof HelpSettings)[]).filter((key) => !help[key]).length ? `Turned off: ${(Object.keys(helpSettingWords) as (keyof HelpSettings)[]).filter((key) => !help[key]).map((key) => helpSettingWords[key].toLocaleLowerCase()).join(", ")}.` : "All help is allowed."}</p>
      <p className="muted small">{state.filter((item) => selected.includes(item.student.id)).map((item) => item.student.name).join(", ")}</p>
      {summary}
      <div className="dialog-actions"><Button className="text-button" onClick={() => setConfirming(false)}>Cancel</Button><Button className="primary-button" disabled={busy} onClick={() => { if (busy || assignFired.current) return; assignFired.current = true; setBusy(true); onAssign(template.id, selected, { help, dueDate: dueDate || undefined }); }}><Icon name="check"/> Yes, assign</Button></div>
    </div> : <div className="dialog-actions">{onClose && <Button className="text-button" onClick={onClose}>Cancel</Button>}<Button className="primary-button" disabled={selected.length === 0} onClick={() => setConfirming(true)}><Icon name="check"/> Assign to {selected.length || ""} student{selected.length === 1 ? "" : "s"}</Button></div>}
  </div>;
}

type CriterionDraft = { id: string; label: string; marks: number; ideasText: string; need: number; partial: boolean };
type WrongIdeaDraft = { label: string; ideasText: string; cap: number };
const NEW_TOPIC = "__new";
const slugify = (value: string) => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const languageWords: Record<Language, string> = { en: "English", de: "German" };

/** "Add a question": the teacher writes the question, its expected answer and its own marking criteria.
 *  It can only be saved as ready (usable in templates and grading) when every validation rule passes. */
function QuestionEditor({ data, initial, usedInTemplates, presetAssessmentId, presetLanguage, onSave, onCancel }: { data: AssessmentAppData; initial?: CustomQuestionRecord; usedInTemplates: number; presetAssessmentId?: string; presetLanguage?: Language; onSave: (record: CustomQuestionRecord) => void; onCancel: () => void }) {
  const original = initial?.question;
  const [id] = useState(() => initial?.id ?? `custom-${Date.now()}`);
  // Opened from an assessment being built, the editor starts on that unit and language.
  const [assessmentId, setAssessmentId] = useState(initial?.assessmentId ?? presetAssessmentId ?? data.assessments[0]?.id ?? "plants");
  const [language, setLanguage] = useState<Language>(initial?.language ?? presetLanguage ?? "en");
  const assessment = getAssessment(data, assessmentId);
  const topics = [...new Map(assessment.questions[language].filter((question) => question.id !== id).map((question) => [question.topicKey, question.topicLabel])).entries()];
  const [topicKey, setTopicKey] = useState(original ? (topics.some(([key]) => key === original.topicKey) ? original.topicKey : NEW_TOPIC) : topics[0]?.[0] ?? NEW_TOPIC);
  const [newTopic, setNewTopic] = useState(original && !topics.some(([key]) => key === original.topicKey) ? original.topicLabel : "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(original?.difficulty ?? "medium");
  const [maxScore, setMaxScore] = useState(original?.maxScore ?? 4);
  const [prompt, setPrompt] = useState(original?.prompt ?? "");
  const [modelAnswer, setModelAnswer] = useState(original?.modelAnswer ?? "");
  const [sampleAnswer, setSampleAnswer] = useState(original && original.sampleAnswer !== original.modelAnswer ? original.sampleAnswer : "");
  const [criteria, setCriteria] = useState<CriterionDraft[]>(original?.rubric?.criteria.map((criterion) => ({ id: criterion.id, label: criterion.label, marks: criterion.marks, ideasText: criterion.ideas.join("\n"), need: criterion.need ?? 1, partial: Boolean(criterion.partial) })) ?? [{ id: "c1", label: "", marks: 2, ideasText: "", need: 1, partial: false }, { id: "c2", label: "", marks: 2, ideasText: "", need: 1, partial: false }]);
  const [wrongIdeas, setWrongIdeas] = useState<WrongIdeaDraft[]>(original?.rubric?.wrongIdeas?.map((wrong) => ({ label: wrong.label, ideasText: wrong.ideas.join("\n"), cap: wrong.cap })) ?? []);
  const [testAnswer, setTestAnswer] = useState("");
  const [preview, setPreview] = useState(false);
  const isNewTopic = topicKey === NEW_TOPIC || !topics.some(([key]) => key === topicKey);
  const topicLabel = isNewTopic ? newTopic : topics.find(([key]) => key === topicKey)?.[1] ?? "";
  const effectiveTopicKey = isNewTopic ? (newTopic.trim() ? `custom-topic-${slugify(newTopic)}` : "") : topicKey;
  const draft: CustomQuestionDraft = { assessmentId, language, topicKey: effectiveTopicKey, topicLabel, difficulty, maxScore, prompt, modelAnswer, sampleAnswer, rubric: {
    criteria: criteria.map((criterion) => ({ id: criterion.id, label: criterion.label, marks: Number(criterion.marks) || 0, ideas: criterion.ideasText.split("\n"), ...(criterion.need > 1 ? { need: criterion.need, partial: criterion.partial } : {}) })),
    wrongIdeas: wrongIdeas.map((wrong) => ({ label: wrong.label, ideas: wrong.ideasText.split("\n"), cap: Number(wrong.cap) })),
  } };
  const question = buildCustomQuestion(draft, id);
  const check = validateCustomQuestion(question, language);
  const total = criteria.reduce((sum, criterion) => sum + (Number(criterion.marks) || 0), 0);
  const test = testAnswer.trim() && criteria.some((criterion) => criterion.ideasText.trim()) ? gradeAnswer(question, testAnswer, language) : undefined;
  const sampleScore = check.valid && sampleAnswer.trim() ? gradeAnswer(question, sampleAnswer, language).score : undefined;
  const changeCriterion = (index: number, patch: Partial<CriterionDraft>) => setCriteria((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
  const changeWrong = (index: number, patch: Partial<WrongIdeaDraft>) => setWrongIdeas((current) => current.map((item, position) => position === index ? { ...item, ...patch } : item));
  const switchSource = (nextAssessment: string, nextLanguage: Language) => { setAssessmentId(nextAssessment); setLanguage(nextLanguage); const nextTopics = getAssessment(data, nextAssessment).questions[nextLanguage]; setTopicKey(nextTopics[0]?.topicKey ?? NEW_TOPIC); };
  const save = (status: "draft" | "ready") => { const now = new Date().toISOString(); onSave({ id, assessmentId, language, status, createdAt: initial?.createdAt ?? now, ...(initial ? { updatedAt: now } : {}), question }); };
  return <div className="question-editor">
    <div className="editor-head"><h2 className="section-title">{initial ? "Edit question" : "Add a question"}</h2><Button className="secondary-button" aria-pressed={preview} onClick={() => setPreview(!preview)}><Icon name={preview ? "arrow" : "eye"} size={16}/> {preview ? "Back to editing" : "Preview as student"}</Button></div>
    {preview ? <section className="student-preview">
      <div className="student-preview-bar"><span className="pill brand"><Icon name="eye" size={14}/> Student view · {languageWords[language]}</span></div>
      <div className="student-preview-paper student-ui" lang={language}><h3>{assessment.title}</h3><ol className="preview-questions"><li><p>{prompt.trim() || "Your question text appears here."}</p><span className="preview-marks">{maxScore} mark{maxScore === 1 ? "" : "s"}</span><span className="answer-lines" aria-hidden="true"/></li></ol></div>
      <p className="muted small">Students see only the question and its marks. Criteria, the expected answer and the difficulty stay with you.</p>
    </section> : <>
    <section className="step-card">
      <header className="step-head"><span className="step-num">1</span><h3>The question</h3></header>
      <div className="field-row"><label className="field">Assessment<select value={assessmentId} onChange={(event) => switchSource(event.target.value, language)}>{data.assessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <fieldset className="field language-choice"><legend>Language</legend><div className="chip-filter">{(["en", "de"] as Language[]).map((item) => <Button key={item} className={language === item ? "selected" : ""} aria-pressed={language === item} onClick={() => switchSource(assessmentId, item)}>{languageWords[item]}</Button>)}</div></fieldset></div>
      <label className="field">Question text<textarea lang={language} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={language === "de" ? "Warum …?" : "Why does …?"}/></label>
      <div className="field-row three"><label className="field">Topic<select value={isNewTopic ? NEW_TOPIC : topicKey} onChange={(event) => setTopicKey(event.target.value)}>{topics.map(([key, label]) => <option key={key} value={key}>{label}</option>)}<option value={NEW_TOPIC}>New topic…</option></select></label>
        {isNewTopic && <label className="field">New topic name<input value={newTopic} onChange={(event) => setNewTopic(event.target.value)} placeholder="Food chains"/></label>}
        <label className="field">Maximum marks<input type="number" min={1} max={CUSTOM_MAX_MARKS} value={maxScore} onChange={(event) => setMaxScore(Math.round(Number(event.target.value)) || 0)}/></label></div>
      <fieldset className="field"><legend>Difficulty</legend><div className="chip-filter">{DIFFICULTY_LEVELS.map((level) => <Button key={level} className={difficulty === level ? "selected" : ""} aria-pressed={difficulty === level} onClick={() => setDifficulty(level)}>{difficultyWords[level]}</Button>)}</div></fieldset>
    </section>
    <section className="step-card">
      <header className="step-head"><span className="step-num">2</span><h3>Answers</h3></header>
      <label className="field">Expected answer<textarea lang={language} value={modelAnswer} onChange={(event) => setModelAnswer(event.target.value)} placeholder="The full answer you would give full marks to."/></label>
      <label className="field">Sample student answer (optional)<textarea lang={language} value={sampleAnswer} onChange={(event) => setSampleAnswer(event.target.value)} placeholder="Used as the simulated scanned answer in this demo."/></label>
      {sampleScore !== undefined && <p className="muted small">With your criteria this sample answer would get {sampleScore} of {maxScore} marks.</p>}
    </section>
    <section className="step-card">
      <header className="step-head"><span className="step-num">3</span><h3>Marking criteria</h3><span className={`pill ${total === maxScore ? "ok" : "warn"}`}>{total} of {maxScore} marks</span></header>
      <p className="muted small">One criterion per mark-earning idea. List accepted words or short phrases, one per line; put alternatives on one line with “ / ” (spaces around the slash), for example “root / roots / Wurzel”. A fraction such as 3/4 is read as written. Words are matched as written, and “not …” in the answer is not credited.</p>
      {criteria.map((criterion, index) => <div className="criterion-row" key={criterion.id}>
        <div className="criterion-top"><label className="field">Criterion {index + 1}<input value={criterion.label} onChange={(event) => changeCriterion(index, { label: event.target.value })} placeholder="Names the tool"/></label><label className="field marks-field">Marks<input type="number" min={1} max={CUSTOM_MAX_MARKS} value={criterion.marks} onChange={(event) => changeCriterion(index, { marks: Math.round(Number(event.target.value)) || 0 })}/></label>{criteria.length > 1 && <Button className="text-button" aria-label={`Remove criterion ${index + 1}`} onClick={() => setCriteria((current) => current.filter((_, position) => position !== index))}>Remove</Button>}</div>
        <label className="field">Accepted words or phrases<textarea lang={language} value={criterion.ideasText} onChange={(event) => changeCriterion(index, { ideasText: event.target.value })} placeholder={"thermometer\ntemperature / degrees"}/></label>
        {criterion.ideasText.split("\n").filter((line) => line.trim()).length > 1 && <div className="criterion-options"><label className="inline-select">Ideas needed for the marks<input type="number" min={1} max={criterion.ideasText.split("\n").filter((line) => line.trim()).length} value={criterion.need} onChange={(event) => changeCriterion(index, { need: Math.max(1, Math.round(Number(event.target.value)) || 1) })}/></label>{criterion.need > 1 && <label className="check-label"><input type="checkbox" checked={criterion.partial} onChange={() => changeCriterion(index, { partial: !criterion.partial })}/> Give part of the marks for some of them</label>}</div>}
      </div>)}
      <Button className="secondary-button" onClick={() => setCriteria((current) => [...current, { id: `c${Date.now()}`, label: "", marks: 1, ideasText: "", need: 1, partial: false }])}><Icon name="plus" size={16}/> Add a criterion</Button>
      <details className="more" open={wrongIdeas.length > 0}><summary>Wrong ideas that cap the mark (optional)</summary><div className="more-body">
        {wrongIdeas.map((wrong, index) => <div className="criterion-row" key={index}>
          <div className="criterion-top"><label className="field">Wrong idea {index + 1}<input value={wrong.label} onChange={(event) => changeWrong(index, { label: event.target.value })} placeholder="Uses the area instead"/></label><label className="field marks-field">Mark cap<input type="number" min={0} max={Math.max(0, maxScore - 1)} value={wrong.cap} onChange={(event) => changeWrong(index, { cap: Math.max(0, Math.round(Number(event.target.value)) || 0) })}/></label><Button className="text-button" onClick={() => setWrongIdeas((current) => current.filter((_, position) => position !== index))}>Remove</Button></div>
          <label className="field">Wording that shows it<textarea lang={language} value={wrong.ideasText} onChange={(event) => changeWrong(index, { ideasText: event.target.value })} placeholder="15 cm"/></label>
        </div>)}
        <Button className="secondary-button btn-sm" onClick={() => setWrongIdeas((current) => [...current, { label: "", ideasText: "", cap: 1 }])}><Icon name="plus" size={14}/> Add a wrong idea</Button>
      </div></details>
    </section>
    </>}
    <section className={`step-card question-check ${check.valid ? "ready" : ""}`}>
      <header className="step-head"><span className="step-num">4</span><h3>Check and save</h3><span className={`pill ${check.valid ? "ok" : "warn"}`}>{check.valid ? "Ready to use" : `${check.errors.length} to fix`}</span></header>
      {check.valid ? <p className="balance-status ok"><Icon name="check" size={16}/> The expected answer earns {check.expectedScore} of {maxScore} marks and an empty answer earns 0.</p> : <ul className="blocker-list">{check.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      <label className="field">Test the marking: type an answer a student might give<textarea lang={language} value={testAnswer} onChange={(event) => setTestAnswer(event.target.value)} placeholder="A partly right answer…"/></label>
      {test && <div className="test-result"><strong>Suggested mark: {test.score} of {maxScore}</strong><p className="muted small">{test.rationale}</p></div>}
      <div className="builder-footer"><Button className="text-button" onClick={onCancel}>Cancel</Button><Button className="secondary-button" disabled={!prompt.trim() || usedInTemplates > 0} title={usedInTemplates ? "This question is used in a template, so it has to stay ready." : undefined} onClick={() => save("draft")}>Save as draft</Button><Button className="primary-button" disabled={!check.valid} onClick={() => save("ready")}><Icon name="check"/> Save question</Button></div>
      {!check.valid && <p className="muted small">A question can only be used in assessments when every check passes. You can keep it as a draft until then.</p>}
    </section>
  </div>;
}

function CustomQuestionsPanel({ data, newOpen, onNewOpen, onSave, onDelete, toast }: { data: AssessmentAppData; newOpen: boolean; onNewOpen: (open: boolean) => void; onSave: (record: CustomQuestionRecord) => void; onDelete: (id: string) => void; toast: (message: string) => void }) {
  const [editingRecord, setEditingRecord] = useState<CustomQuestionRecord | null>(null);
  const [deleting, setDeleting] = useState<CustomQuestionRecord | null>(null);
  // "Add a question" has its own address (#/teacher/create/questions/new); editing a saved one does not.
  const editing: CustomQuestionRecord | "new" | null = newOpen ? "new" : editingRecord;
  const setEditing = (next: CustomQuestionRecord | "new" | null) => { if (next === "new") { setEditingRecord(null); onNewOpen(true); } else { setEditingRecord(next); if (newOpen) onNewOpen(false); } };
  const records = data.customQuestions ?? [];
  const usage = (id: string) => ({ templates: data.templates.filter((template) => template.questionIds.includes(id)).length, answers: data.submissions.filter((submission) => submission.answers.some((answer) => answer.questionId === id)).length });
  if (editing) return <QuestionEditor key={editing === "new" ? "new" : editing.id} data={data} initial={editing === "new" ? undefined : editing} usedInTemplates={editing === "new" ? 0 : usage(editing.id).templates} onSave={(record) => { onSave(record); setEditing(null); }} onCancel={() => setEditing(null)}/>;
  const duplicate = (record: CustomQuestionRecord) => { setEditing({ ...record, id: `custom-${Date.now()}`, status: "draft", createdAt: new Date().toISOString(), updatedAt: undefined, question: { ...record.question, prompt: record.question.prompt } }); toast("Copy opened. Change it and save it as a new question."); };
  return <>
    <section className="card my-questions-head"><div><h2 className="section-title">Your own questions</h2><p className="muted">Write a question with its own marking criteria. Ready questions can be added to any template for their assessment.</p></div><Button className="primary-button" onClick={() => setEditing("new")}><Icon name="plus"/> Add a question</Button></section>
    {records.length ? <section className="card card-flush"><ul className="list">{records.map((record) => { const used = usage(record.id); const ready = record.status === "ready" && validateCustomQuestion(record.question, record.language).valid; const level = record.question.difficulty ?? "medium"; return <li className="list-row custom-q-row" key={record.id}>
      <span className="row-main"><strong>{record.question.prompt}</strong><small>{getAssessment(data, record.assessmentId).title} · {languageWords[record.language]} only · {record.question.topicLabel} · {record.question.maxScore} marks · in {used.templates} template{used.templates === 1 ? "" : "s"}</small></span>
      <span className={`pill ${difficultyTone[level]}`}>{difficultyWords[level]}</span><span className={`pill ${ready ? "ok" : "warn"}`}>{ready ? "Ready" : "Draft"}</span>
      {used.answers ? <Button className="secondary-button btn-sm" title="Students have answered it, so it can’t be changed" onClick={() => duplicate(record)}>Duplicate</Button> : <Button className="secondary-button btn-sm" onClick={() => setEditing(record)}>Edit</Button>}
      {!used.answers && !used.templates && <Button className="text-button" aria-label={`Delete “${record.question.prompt.slice(0, 40)}”`} onClick={() => setDeleting(record)}>Delete</Button>}
    </li>; })}</ul></section> : <p className="empty card">You haven’t written a question yet.</p>}
    {records.some((record) => usage(record.id).templates || usage(record.id).answers) && <p className="muted small">Questions used in a template or answered by students can’t be deleted, so their results stay complete.</p>}
    {deleting && <ConfirmDialog title="Delete this question?" confirmLabel="Delete question" onCancel={() => setDeleting(null)} onConfirm={() => { onDelete(deleting.id); setDeleting(null); }}>
      <p>“{deleting.question.prompt}” will be removed from your questions. It isn’t used in any template or student work. This can’t be undone.</p>
    </ConfirmDialog>}
  </>;
}

type SourceFilter = "all" | "builtin" | "yours";
/** "Assign practice": a new assessment set up for one topic and the students who need it. */
interface CreatePreset { key: string; assessmentId: string; language: Language; topicKey: string; studentIds: string[]; title: string }

/** Create assessment: three steps (details, questions, review and assign) and a summary panel that stays visible.
 *  Reuses the question editor, the Difficulty Balancer helpers, the student preview and the assign panel. */
function TeacherAssessments({ data, practice, tabRoute, onTabRoute, onSaveTemplate, onAssign, onSaveQuestion, onDeleteQuestion, onDeleteTemplate, toast }: { onDeleteQuestion: (id: string) => void; onDeleteTemplate: (id: string) => void; data: AssessmentAppData; practice?: CreatePreset; tabRoute: CreateTab; onTabRoute: (tab: CreateTab) => void; onSaveTemplate: (template: AssessmentTemplateRecord) => void; onAssign: (templateId: string, studentIds: string[], options: { help: HelpSettings; dueDate?: string }, newTemplate?: AssessmentTemplateRecord) => boolean; onSaveQuestion: (record: CustomQuestionRecord) => void; toast: (message: string) => void }) {
  const tab: "new" | "saved" | "questions" = tabRoute === "questions/new" ? "questions" : tabRoute;
  const setTab = (next: "new" | "saved" | "questions") => onTabRoute(next);
  const [draftId, setDraftId] = useState(() => `template-${Date.now()}`);
  const [assessmentId, setAssessmentId] = useState(practice?.assessmentId ?? data.assessments[0]?.id ?? "plants");
  const [language, setLanguage] = useState<Language>(practice?.language ?? "en");
  const [title, setTitle] = useState(practice?.title ?? "");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState<string[]>(practice ? [practice.topicKey] : []);
  // Students chosen for practice are preselected once in the assign panel.
  const [presetStudents, setPresetStudents] = useState<string[]>(practice?.studentIds ?? []);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, DifficultyLevel>>({});
  const [preset, setPreset] = useState<BalancePreset | "custom">("balanced");
  const [custom, setCustom] = useState<DifficultyTarget>({ easy: 2, medium: 2, difficult: 2 });
  const [topicFilter, setTopicFilter] = useState("auto");
  const [levelFilter, setLevelFilter] = useState<DifficultyLevel | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [addingOwn, setAddingOwn] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<AssessmentTemplateRecord | null>(null);
  const assessment = getAssessment(data, assessmentId);
  // The bank is the chosen unit in the chosen language: built-in questions plus the teacher's own ready questions.
  const bank = assessment.questions[language];
  const selected = questionIds.flatMap((id) => bank.filter((question) => question.id === id));
  const topics = [...new Map(bank.map((question) => [question.topicKey, question.topicLabel])).entries()];
  const topicOk = (question: QuestionDefinition) => topicFilter === "auto" ? (objectives.length === 0 || objectives.includes(question.topicKey)) : topicFilter === "all" || question.topicKey === topicFilter;
  const visible = bank.filter((question) => topicOk(question) && (levelFilter === "all" || difficultyOf(question.id, overrides, bank) === levelFilter) && (sourceFilter === "all" || (sourceFilter === "yours") === Boolean(question.custom)));
  const target = preset === "custom" ? custom : targetCounts(BALANCE_PRESETS[preset], questionIds.length);
  const actual = difficultyCounts(questionIds, overrides, bank);
  const balanced = isBalanced(actual, target);
  const suggestionKey = (suggestion: BalanceSuggestion) => `${suggestion.kind}:${suggestion.removeId ?? ""}:${suggestion.addId ?? ""}`;
  const allSuggestions = balanced ? [] : balanceSuggestions(bank, questionIds, target, overrides);
  const suggestions = allSuggestions.filter((suggestion) => !dismissed.includes(suggestionKey(suggestion)));
  const scale = Math.max(1, ...DIFFICULTY_LEVELS.map((level) => Math.max(actual[level], target[level])));
  const otherTemplates = data.templates.filter((template) => template.id !== draftId);
  const duplicates = templateDuplicates(otherTemplates, { title, assessmentId, questionIds });
  const hasDuplicate = Boolean(questionIds.length && ((title.trim() && duplicates.sameTitle) || duplicates.sameQuestions));
  const totalMarks = selected.reduce((sum, question) => sum + question.maxScore, 0);
  const topicCounts = [...selected.reduce((map, question) => map.set(question.topicLabel, (map.get(question.topicLabel) ?? 0) + 1), new Map<string, number>()).entries()];
  const ready = title.trim().length > 0 && questionIds.length > 0;
  const isSaved = data.templates.some((template) => template.id === draftId);
  const shortText = (id?: string) => shortPrompt(bank.find((question) => question.id === id)?.prompt ?? "");
  const buildTemplate = (): AssessmentTemplateRecord => ({ id: draftId, title: title.trim(), assessmentId, questionIds: [...questionIds], createdAt: data.templates.find((template) => template.id === draftId)?.createdAt ?? new Date().toISOString(), targets: target, difficultyOverrides: Object.keys(overrides).length ? { ...overrides } : undefined, description: description.trim() || undefined, language, objectives: objectives.length ? [...objectives] : undefined });
  const resetBuilder = () => { setPresetStudents([]); setDraftId(`template-${Date.now()}`); setTitle(""); setDescription(""); setObjectives([]); setQuestionIds([]); setOverrides({}); setDismissed([]); setShowPreview(false); setConfirmDuplicate(false); setTopicFilter("auto"); setLevelFilter("all"); setSourceFilter("all"); };
  const chooseUnit = (nextId: string) => { setAssessmentId(nextId); setQuestionIds([]); setObjectives([]); setOverrides({}); setDismissed([]); setTopicFilter("auto"); setConfirmDuplicate(false); };
  const chooseLanguage = (next: Language) => {
    const keep = questionIds.filter((id) => getAssessment(data, assessmentId).questions[next].some((question) => question.id === id));
    if (keep.length < questionIds.length) toast(`${questionIds.length - keep.length} question${questionIds.length - keep.length === 1 ? " was" : "s were"} removed: ${questionIds.length - keep.length === 1 ? "it isn’t" : "they aren’t"} available in ${languageWords[next]}.`);
    setLanguage(next); setQuestionIds(keep);
  };
  const toggleObjective = (key: string) => setObjectives((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const addQuestion = (id: string) => { setConfirmDuplicate(false); setQuestionIds((current) => current.includes(id) ? current : [...current, id]); };
  const removeQuestion = (id: string) => { setConfirmDuplicate(false); setQuestionIds((current) => current.filter((item) => item !== id)); };
  const moveQuestion = (id: string, step: -1 | 1) => setQuestionIds((current) => { const index = current.indexOf(id); const to = index + step; if (index < 0 || to < 0 || to >= current.length) return current; const next = [...current]; [next[index], next[to]] = [next[to], next[index]]; return next; });
  const acceptSuggestion = (suggestion: BalanceSuggestion) => { setConfirmDuplicate(false); setQuestionIds((current) => { const at = suggestion.removeId ? current.indexOf(suggestion.removeId) : -1; const without = current.filter((id) => id !== suggestion.removeId); if (!suggestion.addId || without.includes(suggestion.addId)) return without; if (at >= 0) { const next = [...without]; next.splice(at, 0, suggestion.addId); return next; } return [...without, suggestion.addId]; }); };
  const setDifficulty = (id: string, level: DifficultyLevel) => setOverrides((current) => { const next = { ...current }; if (level === difficultyOf(id, {}, bank)) delete next[id]; else next[id] = level; return next; });
  const saveDraft = () => {
    if (!ready) { toast("!Add a title and at least one question first."); return; }
    if (hasDuplicate && !confirmDuplicate) { setConfirmDuplicate(true); return; }
    onSaveTemplate(buildTemplate());
    setConfirmDuplicate(false);
    toast(isSaved ? "Draft updated." : "Draft saved. You’ll find it under Drafts and saved.");
  };
  const assign = (templateId: string, studentIds: string[], options: { help: HelpSettings; dueDate?: string }) => {
    if (onAssign(templateId, studentIds, options, buildTemplate())) { resetBuilder(); setTab("saved"); window.scrollTo({ top: 0 }); }
  };
  // Assigning a template from "Drafts and saved" uses that saved template and leaves the builder alone.
  const assignSaved = (templateId: string, studentIds: string[], options: { help: HelpSettings; dueDate?: string }) => { if (onAssign(templateId, studentIds, options)) setAssigningId(null); };
  // "Edit" (unassigned drafts): the same draft opens in the builder and saving updates it; "Reuse" makes a copy.
  const reuse = (template: AssessmentTemplateRecord, asCopy = true) => {
    const reuseLanguage: Language = template.language ?? (languagesFor(getAssessment(data, template.assessmentId), template.questionIds)[0] ?? "en");
    setDraftId(asCopy ? `template-${Date.now()}` : template.id); setAssessmentId(template.assessmentId); setLanguage(reuseLanguage); setQuestionIds([...template.questionIds]); setOverrides({ ...(template.difficultyOverrides ?? {}) });
    setTitle(asCopy ? `${template.title} (copy)` : template.title); setDescription(template.description ?? ""); setObjectives([...(template.objectives ?? [])]);
    if (template.targets) { setPreset("custom"); setCustom({ ...template.targets }); }
    setDismissed([]); setShowPreview(false); setConfirmDuplicate(false); setTopicFilter("auto"); setLevelFilter("all"); setSourceFilter("all");
    setTab("new"); setPreviewId(null); setAssigningId(null); window.scrollTo({ top: 0, behavior: "smooth" }); toast(asCopy ? "Copy opened. Change it, then save or assign it." : `“${template.title}” opened for editing. Select “Update draft” to save your changes.`);
  };
  const ownQuestionSaved = (record: CustomQuestionRecord) => {
    onSaveQuestion(record);
    setAddingOwn(false);
    const usable = record.status === "ready" && validateCustomQuestion(record.question, record.language).valid;
    if (usable && record.assessmentId === assessmentId && record.language === language) { addQuestion(record.id); toast("Your question was saved and added to this assessment."); }
    else if (usable) toast(`Your question was saved for ${getAssessment(data, record.assessmentId).title} in ${languageWords[record.language]}. It isn’t added here because this assessment is ${shortTitle(assessment.title)} in ${languageWords[language]}.`);
  };
  const addOwnButton = (extra = "") => <Button className={`secondary-button add-own ${extra}`} onClick={() => { setAddingOwn(true); window.scrollTo({ top: 0 }); }}><Icon name="plus" size={16}/> Add your own question</Button>;
  const summary = <div className="assign-summary">
    <p><strong>{title.trim() || "Untitled"}</strong> · {languageWords[language]} · {shortTitle(assessment.title)}</p>
    <ol>{selected.map((question) => <li key={question.id}>{shortPrompt(question.prompt)} <span className="muted">· {question.maxScore} marks · {difficultyWords[difficultyOf(question.id, overrides, bank)].toLocaleLowerCase()}</span></li>)}</ol>
    <p className="muted small">{selected.length} question{selected.length === 1 ? "" : "s"} · {totalMarks} marks · {DIFFICULTY_LEVELS.map((level) => `${actual[level]} ${level}`).join(", ")} · Topics: {topicCounts.map(([label, n]) => `${label} (${n})`).join(", ") || "none"}</p>
  </div>;
  return <div className={tab === "new" && !addingOwn ? "page" : "page page-narrow"}>
    <PageHead title="Create assessment" sub={tab === "new" ? "Build it, check the balance if you like, then save a draft or assign it." : undefined}/>
    <div className="tabs" role="group" aria-label="Create assessment"><Button className={tab === "new" ? "selected" : ""} onClick={() => setTab("new")}>Create</Button><Button className={tab === "saved" ? "selected" : ""} onClick={() => setTab("saved")}>Drafts and saved<span className="count">{data.templates.length}</span></Button><Button className={tab === "questions" ? "selected" : ""} onClick={() => setTab("questions")}>My questions<span className="count">{(data.customQuestions ?? []).length}</span></Button></div>
    {tab === "questions" && <CustomQuestionsPanel data={data} newOpen={tabRoute === "questions/new"} onNewOpen={(open) => onTabRoute(open ? "questions/new" : "questions")} onSave={onSaveQuestion} onDelete={onDeleteQuestion} toast={toast}/>}
    {tab === "new" && addingOwn && <>
      <p className="back-line"><Button className="text-button" onClick={() => setAddingOwn(false)}><Icon name="arrow" size={16}/> Back to “{title.trim() || "your assessment"}”</Button></p>
      <QuestionEditor data={data} usedInTemplates={0} presetAssessmentId={assessmentId} presetLanguage={language} onSave={ownQuestionSaved} onCancel={() => setAddingOwn(false)}/>
    </>}
    {tab === "new" && !addingOwn && practice && presetStudents.length > 0 && <p className="pattern-note" role="status"><Icon name="sparkles" size={16}/><span><strong>Practice for {presetStudents.map((id) => getStudent(data, id).name).join(", ")}</strong> in {getTopicLabel(data, practice.topicKey).toLowerCase()} ({languageWords[practice.language]}). The topic is set as the objective and {presetStudents.length === 1 ? "the student is" : "the students are"} preselected below. Add questions, then assign.</span></p>}
    {tab === "new" && !addingOwn && <div className="create-layout">
      <div className="create-steps">
        <section className="card builder-step" aria-labelledby="step-details">
          <header className="step-head"><span className="step-num">1</span><h2 id="step-details">Details</h2></header>
          <div className="field-row"><label className="field">Title<input value={title} onChange={(event) => { setTitle(event.target.value); setConfirmDuplicate(false); }} placeholder="Plant life check"/></label><label className="field">Unit<select value={assessmentId} onChange={(event) => chooseUnit(event.target.value)}>{data.assessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></div>
          <label className="field">Description (optional)<textarea className="short-textarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short check after our plant lessons."/></label>
          <div className="details-row">
            <fieldset className="field"><legend>Language</legend><div className="chip-filter">{(["en", "de"] as Language[]).map((item) => <Button key={item} className={language === item ? "selected" : ""} aria-pressed={language === item} onClick={() => chooseLanguage(item)}>{languageWords[item]}</Button>)}</div></fieldset>
            <fieldset className="field"><legend>Learning objectives <span className="muted">(topics)</span></legend><div className="chip-filter">{topics.map(([key, label]) => <Button key={key} className={objectives.includes(key) ? "selected" : ""} aria-pressed={objectives.includes(key)} onClick={() => toggleObjective(key)}>{label}</Button>)}</div></fieldset>
          </div>
        </section>
        <section className="card builder-step" aria-labelledby="step-questions">
          <header className="step-head"><span className="step-num">2</span><h2 id="step-questions">Questions</h2><span className="step-head-action">{addOwnButton()}</span></header>
          <div className="builder-filters" role="group" aria-label="Filter questions">
            <label className="inline-select">Topic<select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}><option value="auto">{objectives.length ? "Your objectives" : "All topics"}</option>{objectives.length > 0 && <option value="all">All topics</option>}{topics.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <div className="chip-filter" role="group" aria-label="Difficulty">{(["all", ...DIFFICULTY_LEVELS] as const).map((level) => <Button key={level} className={levelFilter === level ? "selected" : ""} aria-pressed={levelFilter === level} onClick={() => setLevelFilter(level)}>{level === "all" ? "All levels" : difficultyWords[level]}</Button>)}</div>
            <div className="chip-filter" role="group" aria-label="Source">{([["all", "All questions"], ["builtin", "Built-in"], ["yours", "Yours"]] as [SourceFilter, string][]).map(([key, label]) => <Button key={key} className={sourceFilter === key ? "selected" : ""} aria-pressed={sourceFilter === key} onClick={() => setSourceFilter(key)}>{label}</Button>)}</div>
          </div>
          <ul className="bank-list" aria-label="Question bank">{visible.map((question) => { const level = difficultyOf(question.id, overrides, bank); const changed = overrides[question.id] !== undefined; const average = classAverage(data, question.id); const added = questionIds.includes(question.id); return <li key={question.id} className={`bank-row ${added ? "added" : ""}`}>
            <div className="bank-main"><span className="bank-prompt" lang={language}>{question.prompt}</span>
              <span className="bank-meta"><span className={`source-badge ${question.custom ? "yours" : "builtin"}`}>{question.custom ? "Yours" : "Built-in"}</span><span>{question.topicLabel}</span><span>{question.maxScore} marks</span><span>{average ? `Class average ${average.percent}%` : "No shared results yet"}</span></span></div>
            <span className="tq-difficulty"><select aria-label={`Difficulty of “${shortPrompt(question.prompt)}”`} className={`difficulty-select ${difficultyTone[level]}`} value={level} onChange={(event) => setDifficulty(question.id, event.target.value as DifficultyLevel)}>{DIFFICULTY_LEVELS.map((item) => <option key={item} value={item}>{difficultyWords[item]}</option>)}</select>{changed && <small>Changed by you</small>}</span>
            {added ? <Button className="secondary-button btn-sm added-button" aria-label={`Remove “${shortPrompt(question.prompt)}”`} onClick={() => removeQuestion(question.id)}><Icon name="check" size={14}/> Added</Button> : <Button className="primary-button btn-sm" aria-label={`Add “${shortPrompt(question.prompt)}”`} onClick={() => addQuestion(question.id)}><Icon name="plus" size={14}/> Add</Button>}
          </li>; })}</ul>
          {visible.length === 0 && <div className="empty-bank"><p>{sourceFilter === "yours" ? `You haven’t written ${language === "en" ? "an English" : "a German"} question for this unit yet.` : "No questions match these filters."}</p>{addOwnButton("primary")}</div>}
          <details className="more balance-details" open><summary>Difficulty balance <span className="muted">(optional)</span></summary><div className="more-body balance-card">
            <div className="card-head-inline"><span className="muted small">Compare the mix you chose with a target. Suggestions are only offers.</span><label className="inline-select">Target<select value={preset} onChange={(event) => setPreset(event.target.value as BalancePreset | "custom")}>{(Object.keys(presetWords) as (BalancePreset | "custom")[]).map((key) => <option key={key} value={key}>{presetWords[key]}</option>)}</select></label></div>
            {preset === "custom" && <div className="custom-targets">{DIFFICULTY_LEVELS.map((level) => <label key={level} className="field">{difficultyWords[level]} questions<input type="number" min={0} max={bank.length} value={custom[level]} onChange={(event) => setCustom((current) => ({ ...current, [level]: Math.max(0, Math.min(bank.length, Number(event.target.value) || 0)) }))}/></label>)}</div>}
            {questionIds.length === 0 ? <p className="muted">Add questions to see the balance.</p> : <>
              <div className="balance-bars" role="img" aria-label={`Chosen: ${DIFFICULTY_LEVELS.map((level) => `${actual[level]} ${level}`).join(", ")}. Target: ${DIFFICULTY_LEVELS.map((level) => `${target[level]} ${level}`).join(", ")}.`}>
                {DIFFICULTY_LEVELS.map((level) => <div className="balance-row" key={level} aria-hidden="true"><span className="balance-label">{difficultyWords[level]}</span><div className="balance-track"><span className={`balance-fill ${difficultyTone[level]}`} style={{ width: `${(actual[level] / scale) * 100}%` }}/><span className="balance-target" style={{ left: `${(target[level] / scale) * 100}%` }}/></div><span className="balance-count"><strong>{actual[level]}</strong> of {target[level]}</span></div>)}
              </div>
              <p className="balance-legend muted small"><span className="legend-fill"/> Chosen <span className="legend-target"/> Target</p>
              {balanced ? <p className="balance-status ok"><Icon name="check" size={16}/> The chosen questions match the target mix.</p> : <div className="balance-status warn">
                <p><Icon name="alert" size={16}/> To match the target: {DIFFICULTY_LEVELS.flatMap((level) => { const diff = target[level] - actual[level]; return diff === 0 ? [] : [`${Math.abs(diff)} ${diff > 0 ? "more" : "fewer"} ${level}`]; }).join(", ")}.</p>
                {suggestions.length > 0 ? <ul className="suggestion-list">{suggestions.map((suggestion) => <li key={suggestionKey(suggestion)}><span>{suggestion.kind === "swap" ? <>Swap “{shortText(suggestion.removeId)}” for “{shortText(suggestion.addId)}”</> : suggestion.kind === "add" ? <>Add “{shortText(suggestion.addId)}”</> : <>Remove “{shortText(suggestion.removeId)}”</>}{suggestion.level && <span className={`pill ${difficultyTone[suggestion.level]}`}>{suggestion.level}</span>}</span><span className="suggestion-actions"><Button className="secondary-button btn-sm" onClick={() => { acceptSuggestion(suggestion); toast("Suggestion accepted. The question list was updated."); }}>Accept</Button><Button className="text-button" onClick={() => { setDismissed((current) => [...current, suggestionKey(suggestion)]); toast("Suggestion dismissed. Nothing was changed."); }}>Dismiss</Button></span></li>)}</ul>
                  : allSuggestions.length > 0 ? <p className="muted small">You dismissed the suggestions. <Button className="text-button" onClick={() => setDismissed([])}>Show them again</Button></p>
                  : <p className="muted small">No question in this unit can close the gap. Change a difficulty level or the target.</p>}
              </div>}
            </>}
          </div></details>
        </section>
        <section className="card builder-step" aria-labelledby="step-review">
          <header className="step-head"><span className="step-num">3</span><h2 id="step-review">Review and assign</h2>{selected.length > 0 && <span className="step-head-action"><Button className="secondary-button btn-sm" aria-pressed={showPreview} onClick={() => setShowPreview(!showPreview)}><Icon name="eye" size={16}/> {showPreview ? "Hide student preview" : "Preview as student"}</Button></span>}</header>
          {!ready ? <p className="empty-step">{!title.trim() && !questionIds.length ? "Add a title and at least one question to review and assign it." : !title.trim() ? "Add a title in step 1 to continue." : "Add at least one question in step 2 to continue."}</p> : <>
            {showPreview && <StudentPreview assessment={assessment} questionIds={questionIds} title={title} languages={[language]}/>}
            <dl className="review-summary">
              <div><dt>Title</dt><dd>{title.trim()}{description.trim() && <small>{description.trim()}</small>}</dd></div>
              <div><dt>Language</dt><dd>{languageWords[language]} · {shortTitle(assessment.title)}</dd></div>
              <div><dt>Questions</dt><dd><ol>{selected.map((question) => <li key={question.id}>{shortPrompt(question.prompt)} <span className="muted">· {question.maxScore} marks · {difficultyWords[difficultyOf(question.id, overrides, bank)].toLocaleLowerCase()}{question.custom ? " · yours" : ""}</span></li>)}</ol></dd></div>
              <div><dt>Total marks</dt><dd><strong>{totalMarks}</strong></dd></div>
              <div><dt>Topics</dt><dd>{topicCounts.map(([label, n]) => `${label} (${n})`).join(", ")}</dd></div>
              <div><dt>Difficulty</dt><dd>{DIFFICULTY_LEVELS.map((level) => <span key={level} className={`pill ${difficultyTone[level]}`}>{actual[level]} {level}</span>)} {balanced ? <span className="muted small">matches the target</span> : <span className="muted small">target {DIFFICULTY_LEVELS.map((level) => target[level]).join(" / ")}</span>}</dd></div>
            </dl>
            {hasDuplicate && <p className="dup-warning" role="status"><Icon name="alert" size={16}/><span>{duplicates.sameTitle && title.trim() ? `A template called “${duplicates.sameTitle.title}” already exists. ` : ""}{duplicates.sameQuestions ? `“${duplicates.sameQuestions.title}” already has exactly these questions. ` : ""}{confirmDuplicate ? "Select “Save anyway” to keep both." : "You can still save it."}</span></p>}
            <div className="draft-row"><Button className="secondary-button" onClick={saveDraft}>{confirmDuplicate ? "Save anyway" : isSaved ? "Update draft" : "Save as draft"}</Button><span className="muted small">{isSaved ? "Saved as a draft. Assigning it below also keeps it under Drafts and saved." : "Not saved yet."}</span></div>
            <h3 className="subsection-title">Assign to students</h3>
            <AssignPanel key={draftId} data={data} template={buildTemplate()} summary={summary} initialSelected={presetStudents} onAssign={assign}/>
          </>}
        </section>
      </div>
      <aside className="card selected-panel" aria-label="Your assessment">
        <h2 className="section-title">Your assessment</h2>
        <p className="muted small">{selected.length} question{selected.length === 1 ? "" : "s"} · {totalMarks} marks · {languageWords[language]}</p>
        {selected.length === 0 ? <p className="empty-panel">No questions yet. Add them from the bank, or write your own.</p> : <ol className="selected-list">{selected.map((question, index) => <li key={question.id}>
          <span className="sel-num">{index + 1}</span><span className="sel-text"><span>{shortPrompt(question.prompt)}</span><small>{question.maxScore} marks · {difficultyWords[difficultyOf(question.id, overrides, bank)].toLocaleLowerCase()}{question.custom ? " · yours" : ""}</small></span>
          <span className="sel-actions"><button type="button" className="icon-mini" aria-label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => moveQuestion(question.id, -1)}>↑</button><button type="button" className="icon-mini" aria-label={`Move question ${index + 1} down`} disabled={index === selected.length - 1} onClick={() => moveQuestion(question.id, 1)}>↓</button><button type="button" className="icon-mini remove" aria-label={`Remove question ${index + 1}`} onClick={() => removeQuestion(question.id)}>✕</button></span>
        </li>)}</ol>}
        {selected.length > 0 && <div className="panel-mix" aria-label="Difficulty mix">{DIFFICULTY_LEVELS.map((level) => <span key={level} className={`pill ${difficultyTone[level]}`}>{actual[level]} {level}</span>)}</div>}
        {addOwnButton("wide")}
      </aside>
    </div>}
    {deletingTemplate && <ConfirmDialog title={`Delete “${deletingTemplate.title}”?`} confirmLabel="Delete draft" onCancel={() => setDeletingTemplate(null)} onConfirm={() => { onDeleteTemplate(deletingTemplate.id); setDeletingTemplate(null); }}>
      <p>This draft isn’t assigned to anyone, so no student work is affected. Its questions stay in the question bank. This can’t be undone.</p>
    </ConfirmDialog>}
    {tab === "saved" && (data.templates.length===0 ? <p className="empty card">Drafts and assessments you save appear here.</p> : <section className="card card-flush"><ul className="list">{data.templates.map((template)=>{const templateAssessment=getAssessment(data,template.assessmentId);const bank=questionBank(templateAssessment);const templateQuestions=bank.filter((question)=>template.questionIds.includes(question.id));const counts=difficultyCounts(template.questionIds, template.difficultyOverrides, bank);const assignedCount=data.assignments.filter((assignment)=>assignment.templateId===template.id).length;return <li className="saved-template" key={template.id}>
      <div className="saved-template-top"><div className="row-main"><strong>{template.title}</strong><small>{templateAssessment.title} · {templateQuestions.length} questions · {templateQuestions.reduce((sum, question) => sum + question.maxScore, 0)} marks · assigned to {assignedCount} student{assignedCount === 1 ? "" : "s"}</small></div><span className="mix-chips" aria-label={`${counts.easy} easy, ${counts.medium} medium, ${counts.difficult} difficult`}>{DIFFICULTY_LEVELS.map((level) => <span key={level} className={`pill ${difficultyTone[level]}`}>{counts[level]} {level}</span>)}</span></div>
      <div className="saved-template-actions"><Button className="text-button" onClick={()=>{ setPreviewId(previewId===template.id?null:template.id); setAssigningId(null); }} aria-expanded={previewId===template.id}><Icon name="eye" size={16}/> {previewId===template.id?"Hide preview":"Preview as student"}</Button><Button className="secondary-button btn-sm" onClick={()=>reuse(template)}>Reuse</Button>{assignedCount===0&&<Button className="secondary-button btn-sm" onClick={()=>reuse(template,false)}>Edit</Button>}{assignedCount===0&&<Button className="text-button" aria-label={`Delete “${template.title}”`} onClick={()=>setDeletingTemplate(template)}>Delete</Button>}<Button className="primary-button btn-sm" aria-expanded={assigningId===template.id} onClick={()=>{ setAssigningId(assigningId===template.id?null:template.id); setPreviewId(null); }}>Assign</Button></div>
      {previewId===template.id&&<StudentPreview assessment={templateAssessment} questionIds={template.questionIds} title={template.title} languages={languagesFor(templateAssessment, template.questionIds)}/>}
      {assigningId===template.id&&<AssignPanel data={data} template={template} onAssign={assignSaved} onClose={()=>setAssigningId(null)}/>}
    </li>;})}</ul></section>)}
  </div>;
}

function StudentHome({ data, onOpen, onOpenResult, onMarkSeen }: { data: AssessmentAppData; onOpen: (page: string) => void; onOpenResult: (id: string) => void; onMarkSeen: (id: string) => void }) {
  const published = data.submissions.filter((submission) => submission.studentId === DEMO_STUDENT_ID && submission.status === "published").sort((a,b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  // The next assessment is the earliest one Omar has not sent yet.
  const unsent = data.assignments.filter((assignment)=>assignment.studentId===DEMO_STUDENT_ID && !getAssignmentSubmission(data, assignment)).slice().sort((a,b)=>dueDateOrder(assignmentDue(data,a))-dueDateOrder(assignmentDue(data,b)));
  const nextAssignment = unsent[0];
  const nextAssessment = nextAssignment ? getAssessment(data, nextAssignment.assessmentId) : undefined;
  const latest = published[0];
  const notification = published.find((item) => !(item.seenBy?.student ?? item.notificationSeen));
  const newReplies = data.helpRequests.filter((request) => request.studentId === DEMO_STUDENT_ID && request.kind === "teacher" && request.status === "answered" && request.responseSeen === false).length;
  const shortcuts: { page: string; icon: IconName; status: string }[] = [
    { page: "My work", icon: "upload", status: unsent.length ? `${unsent.length} to send` : "All sent" },
    { page: "My results", icon: "trend", status: latest ? `Latest ${getSubmissionProgress(data, latest)}%` : "None yet" },
    { page: "Get help", icon: "help", status: newReplies ? `${newReplies} new repl${newReplies === 1 ? "y" : "ies"}` : "Hints and examples" },
  ];
  return <div className="page page-narrow">
    <PageHead title="Hi Omar"/>
    {notification ? <div className="next-up"><span className="next-up-icon"><Icon name="bell"/></span><div><strong>{notification.resultUpdated ? "Your teacher updated a result" : "Your teacher shared a new result"}</strong><span>{getAssessment(data, notification.assessmentId).title}</span></div><Button className="primary-button" onClick={() => { onMarkSeen(notification.id); onOpenResult(notification.id); }}>See it</Button></div>
      : nextAssessment ? <div className="next-up"><span className="next-up-icon"><Icon name="book"/></span><div><small>Next</small><strong>{nextAssessment.title}</strong><span>{dueDateCopy(assignmentDue(data, nextAssignment))}</span></div><Button className="primary-button" onClick={() => onOpen("My work")}><Icon name="upload"/> Send my work</Button></div>
      : <div className="next-up"><span className="next-up-icon done"><Icon name="check"/></span><div><strong>You’re all caught up!</strong><span>Your teacher will check your work.</span></div></div>}
    {latest && (() => {
      // "How you're doing": only teacher-shared information, in child-friendly words.
      const average = Math.round(published.reduce((sum, item) => sum + getSubmissionProgress(data, item), 0) / published.length);
      const withSummary = published.find((item) => item.resultHighlights);
      const practise = [...new Set(published.slice(0, 2).flatMap((item) => (item.learningGaps ?? []).filter((topic) => item.learningGapDecisions?.[topic] === "confirmed")).map((topic) => getTopicLabel(data, topic)))];
      return <section className="card doing-card" aria-labelledby="doing-title">
        <h2 id="doing-title" className="section-title">How you’re doing</h2>
        <dl className="doing-grid">
          <div><dt>Latest grade</dt><dd><strong>{getSubmissionProgress(data, latest)}%</strong><small>{shortTitle(getAssessment(data, latest.assessmentId).title)} · average {average}%</small></dd></div>
          <div><dt>Something to work on</dt><dd>{withSummary?.resultHighlights?.weakness ?? (practise[0] ?? "Nothing right now. Great!")}{!withSummary && practise.length > 1 ? `, ${practise.slice(1).join(", ")}` : ""}</dd></div>
          {withSummary && <div><dt>A mistake to watch</dt><dd>{withSummary.resultHighlights!.recurringError}</dd></div>}
          {withSummary && <div><dt>Extra help</dt><dd>{withSummary.resultHighlights!.support}</dd></div>}
        </dl>
        <div className="doing-actions"><Button className="secondary-button btn-sm" onClick={() => onOpenResult((withSummary ?? latest).id)}>See my result</Button><Button className="text-button" onClick={() => onOpen("Get help")}>Practise with hints</Button></div>
      </section>;
    })()}
    <nav className="shortcut-grid student-shortcuts" aria-label="Shortcuts">{shortcuts.map((item) => <Button key={item.page} className="shortcut" onClick={() => onOpen(item.page)}><span className="shortcut-icon"><Icon name={item.icon} size={22}/></span><strong>{item.page}</strong><small>{item.status}</small></Button>)}</nav>
  </div>;
}

const confidenceWords: Record<ConfidenceLevel, string> = { low: "Not sure", medium: "A bit sure", high: "Very sure" };
const confidenceFaces: Record<ConfidenceLevel, string> = { high: "😀", medium: "🙂", low: "🤔" };

type ChosenFile = { name: string; type: string; size: number; sample: boolean };

function fileSizeLabel(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StudentAssessments({ data, onUpload, onResults }: { data: AssessmentAppData; onUpload: (fileName: string, language: Language, assignmentId: string, confidenceRatings: Record<string, ConfidenceLevel>) => void; onResults: (id: string) => void }) {
  const assigned = data.assignments.filter((assignment) => assignment.studentId === DEMO_STUDENT_ID);
  const notSent = assigned.filter((assignment) => !getAssignmentSubmission(data, assignment));
  const [dialogFor, setDialogFor] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "preview">("details");
  const [chosenLanguage, setLanguage] = useState<Language>("en");
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceLevel>>({});
  const [chosen, setChosen] = useState<ChosenFile | null>(null);
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);
  const firstFieldRef = useRef<HTMLSelectElement | null>(null);
  const mySubmissions = data.submissions.filter((submission) => submission.studentId === DEMO_STUDENT_ID).sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const selectedAssignment = assigned.find((assignment) => assignment.id === dialogFor);
  const selectedAssessment = getAssessment(data, selectedAssignment?.assessmentId ?? "");
  const builtInIds = selectedAssessment.questions.en.filter((question)=>!question.custom).map((question)=>question.id);
  const assignedQuestions = selectedAssignment?.templateId ? data.templates.find((item)=>item.id===selectedAssignment.templateId)?.questionIds ?? builtInIds : builtInIds;
  // A teacher question exists in one language only, so the student can only choose a language every question has.
  const availableLanguages = languagesFor(selectedAssessment, assignedQuestions);
  const language: Language = availableLanguages.includes(chosenLanguage) ? chosenLanguage : availableLanguages[0] ?? "en";
  const languageQuestions = assignedQuestions.flatMap((id)=>selectedAssessment.questions[language].filter((question)=>question.id===id));
  // Nothing is pre-selected: every question needs the student's own choice before they can go on.
  const allRated = languageQuestions.every((question) => confidenceRatings[question.id] !== undefined);
  const ratedCount = languageQuestions.filter((question) => confidenceRatings[question.id] !== undefined).length;
  const ratings = Object.fromEntries(languageQuestions.map((question)=>[question.id, confidenceRatings[question.id] ?? "medium"])) as Record<string, ConfidenceLevel>;
  const close = () => { setDialogFor(null); setStep("details"); setChosen(null); setFileError(""); setSending(false); };
  const openUpload = (id: string) => { setDialogFor(id); setStep("details"); setChosen(null); setFileError(""); setSending(false); setConfidenceRatings({}); };
  useEffect(() => {
    if (!dialogFor) return;
    firstFieldRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogFor]);
  const fileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (!files.length) return;
    // Several photos or pages can be sent together; every one is checked.
    const problem = validateExamFiles(files);
    if (problem) { setChosen(null); setFileError(problem); return; }
    setFileError("");
    setChosen({ name: filesLabel(files), type: files[0].type, size: files.reduce((sum, file) => sum + file.size, 0), sample: false });
  };
  const useSample = () => { setFileError(""); setChosen({ name: `Sample ${language === "en" ? "English" : "German"} exam scan (demo)`, type: "", size: 0, sample: true }); };
  const send = () => {
    if (!selectedAssignment || !chosen || sending) return;
    setSending(true);
    onUpload(chosen.name, language, selectedAssignment.id ?? "", ratings);
    close();
  };
  const statusFor = (assignmentId?: string) => {
    const assignment = assigned.find((item) => item.id === assignmentId);
    const submission = assignment ? getAssignmentSubmission(data, assignment) : undefined;
    if (!submission) return undefined;
    if (submission.status === "published") return { tone: "ok", label: "Results are ready", submission };
    if (submission.reopened) return { tone: "warn", label: "Your teacher is taking another look", submission };
    if (submission.status === "processing") return { tone: "info", label: "Sent ✓ · reading your work", submission };
    return { tone: "warn", label: "Sent ✓ · waiting for your teacher", submission };
  };
  return <div className="page page-narrow">
    <PageHead title="My work" sub="Send a photo or scan of each finished assessment. Your teacher checks it before you see your marks."/>
    <ul className="work-list">{assigned.map((assignment)=>{const assessment=getAssessment(data,assignment.assessmentId);const template=assignment.templateId?data.templates.find((item)=>item.id===assignment.templateId):undefined;const questionCount=template?.questionIds.length??assessment.questions.en.filter((question)=>!question.custom).length;const status=statusFor(assignment.id);return <li className={`work-card ${status ? "is-sent" : ""}`} key={assignment.id??assignment.assessmentId}>
      <span className="work-icon"><Icon name={status ? "check" : "file"} size={22}/></span>
      <div className="row-main"><strong>{assessment.title}</strong><small>{status ? <span className={`pill ${status.tone}`}>{status.label}</span> : `${dueDateCopy(assignmentDue(data, assignment))} · ${questionCount} question${questionCount === 1 ? "" : "s"}`}</small></div>
      {status ? (status.tone === "ok" ? <Button className="secondary-button" onClick={()=>onResults(status.submission.id)}>See my results</Button> : null) : <Button className="primary-button" onClick={()=>openUpload(assignment.id??"")}><Icon name="upload"/> Send my work</Button>}
    </li>;})}{assigned.length===0&&<li className="empty card">Your teacher hasn’t given you an assessment yet.</li>}</ul>
    {mySubmissions.length > 0 && <details className="more card"><summary>Everything I sent ({mySubmissions.length})</summary><ul className="list more-body">{mySubmissions.map((submission)=>{const assessment=getAssessment(data,submission.assessmentId);const state=submission.status==="published"?"Results shared":submission.reopened?"Your teacher is taking another look":submission.status==="processing"?"Reading your work":"Waiting for your teacher";return <li className="sent-row" key={submission.id}><span className="row-main"><strong>{assessment.title}</strong><small>{submission.language==="en"?"English":"German"} · {submission.fileName}</small></span><span className={`pill ${submission.status==="published"?"ok":submission.status==="processing"?"info":"warn"}`}>{state}</span></li>;})}</ul></details>}
    {dialogFor && selectedAssignment && <div className="modal-backdrop" role="presentation" onClick={(event)=>{if(event.target===event.currentTarget)close();}}><section className="upload-dialog student-ui" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <div className="dialog-heading"><div><small className="step-label">{step === "details" ? "Step 1 of 2" : "Step 2 of 2"}</small><h2 id="upload-title">{step === "details" ? "Send your work" : "Send this to Ms. Raghda?"}</h2></div><Button className="close-button" title="Close" aria-label="Close" onClick={close}><Icon name="close"/></Button></div>
      {step === "details" ? <>
        <div className="field-row"><label className="field" htmlFor="exam-choice">Assessment<select id="exam-choice" ref={firstFieldRef} value={dialogFor} onChange={(event)=>{setDialogFor(event.target.value);setConfidenceRatings({});}}>{notSent.map((assignment)=>{const assessment=getAssessment(data,assignment.assessmentId);const template=assignment.templateId?data.templates.find((item)=>item.id===assignment.templateId):undefined;return <option key={assignment.id} value={assignment.id}>{assessment.title}{template ? ` (${template.title})` : ""}</option>;})}</select></label>
        <label className="field" htmlFor="exam-language">I wrote my answers in<select id="exam-language" value={language} onChange={(event)=>{setLanguage(event.target.value as Language); if (chosen?.sample) setChosen(null);}}>{availableLanguages.includes("en") && <option value="en">English</option>}{availableLanguages.includes("de") && <option value="de">German (Deutsch)</option>}</select></label></div>
        <fieldset className="confidence-input-list"><legend>How sure were you? <span className="muted">{ratedCount} of {languageQuestions.length}</span></legend>{languageQuestions.map((question,index)=><div className="confidence-input" key={question.id} role="radiogroup" aria-label={`How sure were you about question ${index+1}?`}><span><b>Q{index+1}.</b> {question.prompt}</span><div className="face-options">{CONFIDENCE_LEVELS.map((level)=><label key={level} className={`face-option ${confidenceRatings[question.id]===level?"selected":""}`}><input type="radio" name={`confidence-${question.id}`} value={level} checked={confidenceRatings[question.id]===level} onChange={()=>setConfidenceRatings((current)=>({...current,[question.id]:level}))}/><span className="face" aria-hidden="true">{confidenceFaces[level]}</span><span>{confidenceWords[level]}</span></label>)}</div></div>)}</fieldset>
        <label className={`upload-dropzone ${chosen ? "has-file" : ""}`} htmlFor="exam-file"><Icon name={chosen ? "check" : "upload"} size={26}/><strong>{chosen ? chosen.name : "Choose a photo or scan"}</strong><span>{chosen ? (chosen.sample ? "Sample answers will be used (demo)" : `${fileSizeLabel(chosen.size)} · click to choose again`) : "PDF, JPG or PNG · up to 20 MB each · several pages are fine"}</span><input id="exam-file" type="file" multiple accept={ACCEPTED_FILE_TYPES.join(",")} onChange={fileSelected}/></label>
        {fileError && <p className="file-error" role="alert"><Icon name="alert" size={16}/>{fileError}</p>}
        <div className="dialog-actions"><Button className="text-button" onClick={useSample}><Icon name="sparkles"/> Use a sample exam (demo)</Button><Button className="primary-button" disabled={!chosen || !allRated} onClick={()=>setStep("preview")}>Next <Icon name="arrow" size={16}/></Button></div>
        {chosen && !allRated && <p className="hint-line" role="status">Choose how sure you felt for every question to go on.</p>}
      </> : <>
        <dl className="submission-preview">
          <div><dt>Assessment</dt><dd>{selectedAssessment.title}</dd></div>
          <div><dt>Language</dt><dd>{language === "en" ? "English" : "German (Deutsch)"}</dd></div>
          <div><dt>Your work</dt><dd>{chosen?.sample ? `${chosen.name}` : `${chosen?.name} · ${chosen ? fileSizeLabel(chosen.size) : ""}`}</dd></div>
          <div><dt>Questions</dt><dd>{languageQuestions.length}</dd></div>
          <div><dt>How sure you felt</dt><dd><ul>{languageQuestions.map((question, index) => <li key={question.id}>Q{index+1}: {confidenceWords[ratings[question.id]]}</li>)}</ul></dd></div>
        </dl>
        <p className="preview-note"><Icon name="alert" size={16}/> <span><strong>What happens next:</strong> Ms. Raghda checks your work, then shares your marks with you. After you send it, you can’t change it or send it again.</span></p>
        <div className="dialog-actions"><Button className="text-button" onClick={close}>Cancel</Button><Button className="secondary-button" onClick={()=>setStep("details")}>Go back and change</Button><Button className="primary-button" disabled={sending} onClick={send}><Icon name="check"/> Send to my teacher</Button></div>
      </>}
      <small className="storage-note">Demo: your file isn’t read. Sample answers stand in for it, and the submission is saved in this browser.</small>
    </section></div>}
  </div>;
}

/** A shared result's weakness, recurring mistake and extra help, in separate child-friendly sections. */
function ResultHighlights({ submission, onPractise }: { submission: SubmissionRecord; onPractise: () => void }) {
  const h = submission.resultHighlights!;
  return <>
    <section className="card demo-section" aria-labelledby="hl-weakness"><h2 id="hl-weakness" className="section-title">Something to work on: {h.weakness}</h2><p>{h.weakness} is the part where you can grow the most right now. That’s okay: everyone has something to practise!</p></section>
    <section className="card demo-section" aria-labelledby="hl-error"><h2 id="hl-error" className="section-title">A mistake that came back: {h.recurringError}</h2><p>Sometimes you picked the wrong fraction as the bigger one. A tip: if the bottom numbers are different, draw both fractions first. More pieces means each piece is smaller, so 1/4 is smaller than 1/2.</p></section>
    <section className="card demo-section" aria-labelledby="hl-support"><h2 id="hl-support" className="section-title">Extra help for you</h2><p><strong>{h.support}.</strong> Your teacher will help you practise a little more. You can start now with hints and examples.</p><Button className="primary-button" onClick={onPractise}><Icon name="sparkles"/> Practise fractions</Button></section>
  </>;
}

function StudentProgress({ data, openId, onOpen, onPractise }: { data: AssessmentAppData; openId: string | null; onOpen: (id: string | null) => void; onPractise: (assessmentId: string, topicKey: string, questionId?: string) => void }) {
  const results = data.submissions.filter((submission)=>submission.studentId===DEMO_STUDENT_ID && submission.status==="published").sort((a,b)=>(b.publishedAt??"").localeCompare(a.publishedAt??""));
  const open = results.find((submission) => submission.id === openId);
  if (open) {
    const assessment = getAssessment(data, open.assessmentId);
    const percent = getSubmissionProgress(data, open);
    const topics = [...new Set([...open.learningGaps.filter((topic)=>open.learningGapDecisions?.[topic]==="confirmed"),...open.flags.filter((flag)=>flag.decision==="confirmed"&&flag.topicKey!=="overall-progress").map((flag)=>flag.topicKey)])];
    // Only encouraging statements about confidence; nothing calls an answer a mistake.
    const felt = studentConfidenceSummary(confidenceRows(data, { submissionIds: [open.id], sharedOnly: true }));
    const feltLines = [
      felt.sureAndRight ? `You felt very sure and got ${felt.sureAndRight === 1 ? "1 question" : `${felt.sureAndRight} questions`} fully right. Great work!` : "",
      felt.unsureButRight ? `You weren’t sure, but you got ${felt.unsureButRight === 1 ? "1 question" : `${felt.unsureButRight} questions`} fully right. You know more than you think!` : "",
      felt.toLookAgain ? `Your teacher’s comments show the next step for ${felt.toLookAgain === 1 ? "1 question" : `${felt.toLookAgain} questions`}.` : "",
    ].filter(Boolean);
    return <div className="page page-narrow">
      <PageHead title={assessment.title} sub={`Shared ${new Date(open.publishedAt ?? open.uploadedAt).toLocaleDateString()}${open.revisions?.length ? " · updated by your teacher" : ""}`}><Button className="secondary-button" onClick={() => onOpen(null)}>Back to my results</Button></PageHead>
      <section className="card result-summary" aria-label="Your grade"><ScoreRing score={percent} size="large"/><div><strong>Your grade: {percent}%</strong><span>{getSubmissionScore(data,open)} / {getSubmissionMaxScore(data,open)} marks · Checked by your teacher</span></div></section>
      {open.demo && <p className="demo-note" role="note"><span className="demo-badge">Demo example</span> This result comes with the demo so you can see what a result looks like. It wasn’t made from a paper you uploaded.</p>}
      {open.resultHighlights && <ResultHighlights submission={open} onPractise={() => onPractise(open.assessmentId, open.flags.find((flag) => flag.decision === "confirmed")?.topicKey ?? open.learningGaps[0] ?? "")}/>}
      {open.overallFeedback?.trim() && <section className="teacher-message card" aria-label="A message from your teacher"><Icon name="book" size={20}/><div><strong>A message from your teacher</strong><p lang={open.language}>{open.overallFeedback}</p></div></section>}
      {feltLines.length > 0 && <section className="felt-summary" aria-label="How sure you felt"><span className="felt-face" aria-hidden="true">{confidenceFaces.high}</span><ul>{feltLines.map((line) => <li key={line}>{line}</li>)}</ul></section>}
      {topics.length > 0 && <section className="practise-box"><Icon name="sparkles" size={22}/><div><strong>Let’s keep practising</strong><span>{topics.map((topic)=>getTopicLabel(data,topic)).join(" · ")}</span></div></section>}
      <section className="result-questions" aria-label="Questions">{getSubmissionQuestions(data,open).map((question,index)=>{const answer=open.answers.find((item)=>item.questionId===question.id);const full=(answer?.teacherScore??0)===question.maxScore;return <details className="result-question" key={question.id} open={index===0}>
        <summary><span className="result-question-number">{index+1}</span><span className="result-question-prompt">{question.prompt}</span><span className={`pill ${full ? "ok" : "brand"}`}>{answer?.teacherScore} / {question.maxScore}</span></summary>
        <div className="result-question-body">
          <p className="result-student-answer"><small>Your answer</small>{answer?.extractedText}</p>
          {answer?.teacherFeedback && <p className={`result-feedback ${full ? "praise" : "next-step"}`}><small>{full ? "Well done" : "Next step"}</small>{answer.teacherFeedback}</p>}
          {open.uploadedBy !== "teacher" && <p className="result-felt">You felt: {confidenceWords[answer?.confidence ?? "medium"].toLocaleLowerCase()}</p>}
          {!full && !question.custom && <Button className="text-button" onClick={() => onPractise(open.assessmentId, question.topicKey, question.id)}><Icon name="help" size={15}/> Get help with this question</Button>}
        </div>
      </details>;})}</section>
    </div>;
  }
  const chartRows = results.slice(0, 6).reverse();
  return <div className="page page-narrow">
    <PageHead title="My results" sub="Only results your teacher has checked and shared."/>
    {results.length===0 ? <section className="card empty"><strong>Your first result is on its way</strong><p>When your teacher shares your marks, they appear here.</p></section> : <>
      {chartRows.length > 1 && <section className="card"><h2 className="section-title">How you’re doing</h2><div className="growth-bars" role="img" aria-label={chartRows.map((row) => `${dateLabel(row.publishedAt ?? row.uploadedAt)}: ${getSubmissionProgress(data,row)}%`).join(", ")}>{chartRows.map((row,index)=>{const score=getSubmissionProgress(data,row);return <div className="growth-col" key={row.id} aria-hidden="true"><div className="growth-track"><span className={index===chartRows.length-1?"latest":""} style={{height:`${Math.max(4,score)}%`}}><em>{score}%</em></span></div><small>{getAssessment(data,row.assessmentId).subject}<br/>{dateLabel(row.publishedAt ?? row.uploadedAt)}</small></div>;})}</div></section>}
      <ul className="work-list">{results.map((submission)=>{const assessment=getAssessment(data,submission.assessmentId);const unseen=!(submission.seenBy?.student ?? submission.notificationSeen);return <li key={submission.id}><Button className="work-card result-link" onClick={()=>onOpen(submission.id)}><ScoreRing score={getSubmissionProgress(data,submission)}/><span className="row-main"><strong>{assessment.title}</strong><small>Shared {dateLabel(submission.publishedAt ?? submission.uploadedAt)}{submission.revisions?.length ? " · updated" : ""}</small></span>{unseen && <span className="pill brand">New</span>}<Icon name="chevron" size={20}/></Button></li>;})}</ul>
    </>}
  </div>;
}

const stepWords: Record<LadderStep, { title: string; short: string; button: string }> = {
  hint1: { title: "Small hint", short: "A tiny clue to get you started", button: "Show a small hint" },
  hint2: { title: "Bigger hint", short: "A stronger clue", button: "Show a bigger hint" },
  example: { title: "Example", short: "A similar problem, solved. It uses a different question.", button: "Show an example" },
  teacher: { title: "Ask my teacher", short: "A private note to Ms. Raghda", button: "Write to my teacher" },
};

function AskForHelp({ data, focusId, start, onCreateHelp, onRateHelp }: { data: AssessmentAppData; focusId?: string | null; start?: { assessmentId?: string; topicKey?: string; questionId?: string }; onCreateHelp: (request: HelpRequestRecord) => void; onRateHelp: (id: string, helpful: boolean) => void }) {
  const assigned=data.assignments.filter((assignment)=>assignment.studentId===DEMO_STUDENT_ID);
  // Stage 4 fix: opened from a "Your teacher replied" notice, the page starts on the question that was answered.
  const focus=focusId?data.helpRequests.find((request)=>request.id===focusId&&request.studentId===DEMO_STUDENT_ID&&assigned.some((assignment)=>assignment.id===request.assignmentId)):undefined;
  const startAssignment=start?.assessmentId?assigned.find((assignment)=>assignment.assessmentId===start.assessmentId):undefined;
  const startQuestion=startAssignment&&start?.topicKey?getAssessment(data,startAssignment.assessmentId).questions.en.find((question)=>(start.questionId?question.id===start.questionId:question.topicKey===start.topicKey)&&!question.custom&&(!startAssignment.templateId||data.templates.find((template)=>template.id===startAssignment.templateId)?.questionIds.includes(question.id))):undefined;
  const [assignmentId,setAssignmentId]=useState(focus?.assignmentId??startAssignment?.id??assigned[0]?.id??"");
  const [language,setLanguage]=useState<Language>(focus?.language??"en");
  const [questionId,setQuestionId]=useState(focus?.questionId??startQuestion?.id??"");
  const [message,setMessage]=useState("");
  const [tried,setTried]=useState("");
  const [asking,setAsking]=useState(false);
  const selectedAssignment=assigned.find((assignment)=>assignment.id===assignmentId)??assigned[0];
  const assessment=getAssessment(data,selectedAssignment?.assessmentId??"");
  const permittedIds=selectedAssignment?.templateId?data.templates.find((template)=>template.id===selectedAssignment.templateId)?.questionIds:undefined;
  const questions=permittedIds?permittedIds.flatMap((id)=>assessment.questions[language].filter((question)=>question.id===id)):assessment.questions[language].filter((question)=>!question.custom);
  const activeQuestion=questions.find((question)=>question.id===questionId)??questions[0];
  // Teacher-written questions have no written hints or examples yet, so only "Ask my teacher" is offered.
  const hasWrittenHelp=activeQuestion?Boolean(getHelpText(activeQuestion.id,"hint1",language)):true;
  const settings: HelpSettings | undefined=hasWrittenHelp?selectedAssignment?.help:{hints:false,examples:false,teacher:selectedAssignment?.help?.teacher??true};
  const requests=selectedAssignment&&activeQuestion?helpForQuestion(data,{studentId:DEMO_STUDENT_ID,assessmentId:selectedAssignment.assessmentId,questionId:activeQuestion.id,assignmentId:selectedAssignment.id}):[];
  const ladder=ladderState(requests,settings);
  const latestFor=(step: LadderStep)=>[...requests].reverse().find((request)=>stepOf(request)===step);
  const base=()=>({studentId:DEMO_STUDENT_ID,assignmentId:selectedAssignment?.id??"",assessmentId:selectedAssignment?.assessmentId??"",questionId:activeQuestion?.id??"",language,createdAt:new Date().toISOString()});
  const reveal=(step: "hint1"|"hint2"|"example")=>{
    if(!selectedAssignment||!activeQuestion)return;
    const text=getHelpText(activeQuestion.id,step,language);
    if(!text)return;
    const now=new Date().toISOString();
    onCreateHelp({...base(),id:`help-${Date.now()}`,kind:step==="example"?"example":"hint",level:step==="hint2"?2:step==="hint1"?1:undefined,message:"",status:"answered",response:text,responseAt:now});
  };
  const sendToTeacher=()=>{
    if(!selectedAssignment||!activeQuestion||!message.trim())return;
    onCreateHelp({...base(),id:`help-${Date.now()}`,kind:"teacher",message:message.trim(),tried:tried.trim()||undefined,status:"open"});
    setMessage("");setTried("");setAsking(false);
  };
  const others=data.helpRequests.filter((request)=>request.studentId===DEMO_STUDENT_ID&&!requests.some((item)=>item.id===request.id)).slice().sort((a,b)=>(b.responseAt??b.createdAt).localeCompare(a.responseAt??a.createdAt));
  const renderOther=(request: HelpRequestRecord)=>{const question=getAssessment(data,request.assessmentId).questions[request.language].find((item)=>item.id===request.questionId);return <article className="help-answer" key={request.id}>
    <div className="help-answer-head"><strong>{stepWords[stepOf(request)].title}</strong><span className={`pill ${request.status==="open"?"warn":"ok"}`}>{request.status==="open"?"Waiting for your teacher":request.kind==="teacher"?"Your teacher replied":"Ready"}</span></div>
    <p className="muted">{question?.prompt}</p>
    {request.message&&<p className="muted">You wrote: “{request.message}”</p>}
    {request.response&&<p className="help-response"><Icon name={request.kind==="teacher"?"book":"sparkles"} size={18}/><span>{request.response}</span></p>}
  </article>;};
  return <div className="page page-narrow">
    <PageHead title="Get help" sub="Start with a small hint. Each step helps a bit more, but never gives you the answer."/>
    <section className="card help-compose">
      <div className="field-row"><label className="field">Assessment<select value={selectedAssignment?.id??""} onChange={(event)=>{setAssignmentId(event.target.value);setQuestionId("");setAsking(false);}}>{assigned.map((assignment)=>{const template=assignment.templateId?data.templates.find((item)=>item.id===assignment.templateId):undefined;return <option key={assignment.id} value={assignment.id}>{getAssessment(data,assignment.assessmentId).title}{template?` (${template.title})`:""}</option>;})}</select></label><label className="field">Language<select value={language} onChange={(event)=>setLanguage(event.target.value as Language)}><option value="en">English</option><option value="de">German (Deutsch)</option></select></label></div>
      <div className="question-chips" role="group" aria-label="Which question do you need help with?">{questions.map((question,index)=><Button key={question.id} className={`q-chip ${activeQuestion?.id===question.id?"selected":""}`} aria-pressed={activeQuestion?.id===question.id} onClick={()=>{setQuestionId(question.id);setAsking(false);}}>Q{index+1}</Button>)}</div>
      {activeQuestion&&<p className="help-question-text" lang={language}>{activeQuestion.prompt}</p>}
      {activeQuestion&&getSelfCheck(activeQuestion.id,language)&&<details className="more self-check"><summary>Check your answer before you send it</summary><ul className="more-body" lang={language}>{getSelfCheck(activeQuestion.id,language)!.map((line)=><li key={line}><span aria-hidden="true">☐</span> {line}</li>)}</ul></details>}
    </section>
    {activeQuestion&&<ol className="help-ladder" aria-label="Help steps">{LADDER.map((step,index)=>{
      const allowed=stepAllowed(step,settings);const used=ladder.used.has(step);const unlocked=ladder.unlocked.has(step);const request=latestFor(step);
      // The step directly below this one (skipping steps the teacher turned off), for the "Not yet" message.
      const following=LADDER.slice(index+1).find((item)=>item!=="teacher"&&stepAllowed(item,settings));
      return <li key={step} className={`ladder-step ${used?"used":""} ${!allowed?"off":!unlocked?"locked":""}`}>
        <span className="ladder-num" aria-hidden="true">{used&&step!=="teacher"?<Icon name="check" size={16}/>:index+1}</span>
        <div className="ladder-body">
          <div className="ladder-head"><strong>{stepWords[step].title}</strong><small>{allowed?stepWords[step].short:hasWrittenHelp?"Your teacher turned this off for this assessment.":"There’s no written hint for this question yet. You can ask your teacher."}</small></div>
          {step!=="teacher"&&used&&request&&<>
            <p className="help-response"><Icon name={step==="example"?"book":"sparkles"} size={18}/><span>{request.response}</span></p>
            {request.helpful===undefined?<div className="did-help" role="group" aria-label="Did this help?"><span>Did this help?</span><Button className="secondary-button btn-sm" onClick={()=>onRateHelp(request.id,true)}>Yes</Button><Button className="secondary-button btn-sm" onClick={()=>onRateHelp(request.id,false)}>Not yet</Button></div>
              :<p className="did-help-answer">{request.helpful?"Great! Try the question again on your paper.":following?`That’s okay. Try the ${stepWords[following].title.toLocaleLowerCase()} below.`:stepAllowed("teacher",settings)?"That’s okay. You can ask your teacher.":"That’s okay. Talk to your teacher in class."}</p>}
          </>}
          {step!=="teacher"&&!used&&allowed&&(unlocked?<Button className="primary-button" onClick={()=>reveal(step)}>{stepWords[step].button}</Button>:<small className="muted">Opens after the step before.</small>)}
          {step==="teacher"&&allowed&&<>
            {request&&<div className="teacher-note"><span className={`pill ${request.status==="open"?"warn":"ok"}`}>{request.status==="open"?"Waiting for your teacher":"Your teacher replied"}</span><p className="muted">You wrote: “{request.message}”</p>{request.response&&<p className="help-response"><Icon name="book" size={18}/><span>{request.response}</span></p>}</div>}
            {asking?<div className="ask-teacher-form">
              <label className="field">What I already tried (optional)<textarea value={tried} onChange={(event)=>setTried(event.target.value)} placeholder="I drew two pizzas…"/></label>
              <label className="field">What feels confusing?<textarea value={message} onChange={(event)=>setMessage(event.target.value)} placeholder="I don’t understand why…"/></label>
              <div className="dialog-actions"><Button className="text-button" onClick={()=>setAsking(false)}>Cancel</Button><Button className="primary-button" disabled={!message.trim()} onClick={sendToTeacher}>Send to my teacher <Icon name="arrow" size={16}/></Button></div>
            </div>:<Button className="secondary-button" onClick={()=>setAsking(true)}>{request?"Ask another question":stepWords.teacher.button}</Button>}
          </>}
        </div>
      </li>;})}</ol>}
    {others.length>0&&<details className="more card"><summary>Help on other questions ({others.length})</summary><div className="help-history">{others.map(renderOther)}</div></details>}
  </div>;
}

function parentApprovedSubmissions(data: AssessmentAppData) {
  return data.submissions
    .filter((submission) => submission.studentId === DEMO_PARENT_CHILD_ID
      && submission.status === "published"
      && Boolean(submission.publishedAt)
      && submission.answers.length > 0
      && submission.answers.every((answer) => answer.verified)
      && submission.flags.every((flag) => flag.decision !== "pending")
      && (submission.learningGaps ?? []).every((topic) => submission.learningGapDecisions?.[topic] === "confirmed" || submission.learningGapDecisions?.[topic] === "dismissed"))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

function parentLearningGaps(data: AssessmentAppData, submissions: SubmissionRecord[]) {
  const topicLabels = new Map<string, string>();
  data.assessments.forEach((assessment) => assessment.questions.en.forEach((question) => topicLabels.set(question.topicKey, question.topicLabel)));
  const totals = new Map<string, number>();
  submissions.forEach((submission) => (submission.learningGaps ?? []).filter((topicKey) => submission.learningGapDecisions?.[topicKey] === "confirmed").forEach((topicKey) => totals.set(topicKey, (totals.get(topicKey) ?? 0) + 1)));
  return [...totals.entries()].map(([topicKey, count]) => ({ topicKey, label: topicLabels.get(topicKey) ?? topicKey.replace(/-/g, " "), count })).sort((a, b) => b.count - a.count);
}

function parentFollowUps(submissions: SubmissionRecord[]) {
  // Teacher-confirmed flags are shown to parents in plain language, grouped by topic.
  // The teacher-facing title and description (which talk about "evidence" and "deciding") are never shown here.
  return [...submissions.flatMap((submission) => submission.flags.filter((flag) => flag.decision === "confirmed").map((flag) => ({ flag, submission })))
    .reduce((groups, { flag, submission }) => groups.set(flag.topicKey, [...(groups.get(flag.topicKey) ?? []), submission]), new Map<string, SubmissionRecord[]>()).entries()]
    .map(([topicKey, from]) => ({ topicKey, from }));
}

const parentStatusWords: Record<ParentTopicStatus, { label: string; tone: string; text: (firstName: string) => string }> = {
  "practising": { label: "Practising", tone: "warn", text: () => "Ms. Raghda chose this topic to practise." },
  "improving": { label: "Getting better", tone: "info", text: () => "Was a practice topic before and is going better now." },
  "doing-well": { label: "Doing well", tone: "ok", text: () => "Strong marks in the latest checked work." },
  "on-track": { label: "On track", tone: "", text: () => "The teacher has no concerns here." },
};

/** Score over time for one subject. Values come from teacher-checked, shared results only. */
function ScoreLine({ points }: { points: { at: string; percent: number }[] }) {
  const W = 600, H = 150, padX = 56, padY = 24;
  const inset = 40; // keeps the first and last value labels clear of the axis labels
  const x = (index: number) => padX + inset + (points.length === 1 ? (W - 2 * padX - 2 * inset) / 2 : (index * (W - 2 * padX - 2 * inset)) / (points.length - 1));
  const y = (percent: number) => padY + ((100 - percent) / 100) * (H - 2 * padY);
  return <svg className="score-line" viewBox={`0 0 ${W} ${H + 26}`} role="img" aria-label={points.map((point) => `${dateLabel(point.at)}: ${point.percent}%`).join(", ")}>
    {[0, 50, 100].map((grid) => <g key={grid} aria-hidden="true"><line x1={padX} x2={W - padX} y1={y(grid)} y2={y(grid)} className="grid"/><text x={padX - 10} y={y(grid) + 4} textAnchor="end" className="axis">{grid}%</text></g>)}
    <polyline aria-hidden="true" points={points.map((point, index) => `${x(index)},${y(point.percent)}`).join(" ")} className="line"/>
    {points.map((point, index) => <g key={index} aria-hidden="true"><circle cx={x(index)} cy={y(point.percent)} r={6} className="dot"/><text x={x(index)} y={y(point.percent) - 12} textAnchor="middle" className="value">{point.percent}%</text><text x={x(index)} y={H + 18} textAnchor="middle" className="axis">{dateLabel(point.at)}</text></g>)}
  </svg>;
}

function ParentHome({ data, onOpen, onOpenFeedback }: { data: AssessmentAppData; onOpen: (page: string) => void; onOpenFeedback: (id: string) => void }) {
  const child = getStudent(data, DEMO_PARENT_CHILD_ID);
  const firstName = child.name.split(" ")[0];
  const submissions = parentApprovedSubmissions(data);
  const latest = submissions[0];
  const unseen = submissions.filter((submission) => !(submission.seenBy?.parent ?? submission.notificationSeen));
  const gaps = parentLearningGaps(data, submissions);
  const followUps = parentFollowUps(submissions);
  const topics = parentProgress(data, submissions).flatMap((group) => group.topics.map((topic) => ({ ...topic, subject: group.subject })));
  const strengths = topics.filter((topic) => topic.status === "doing-well").slice(0, 3);
  const workingOn = [...topics.filter((topic) => topic.status === "practising"), ...topics.filter((topic) => topic.status === "improving")].slice(0, 3);
  const activityCount = new Set([...gaps.map((gap) => gap.topicKey), ...followUps.map((item) => item.topicKey)]).size;
  const shortcuts: { page: string; icon: IconName; status: string }[] = [
    { page: "Results", icon: "trend", status: submissions.length ? `${submissions.length} shared · by subject` : "None yet" },
    { page: "Teacher feedback", icon: "book", status: latest ? `Latest: ${shortTitle(getAssessment(data, latest.assessmentId).title)}` : "None yet" },
    { page: "Practise at home", icon: "sparkles", status: activityCount ? `${activityCount} activit${activityCount === 1 ? "y" : "ies"} · ~10 min each` : "Nothing right now" },
  ];
  const highlight = unseen[0] ?? latest;
  return <div className="page page-narrow">
    <PageHead title={`${firstName}’s learning`} sub="Only results Ms. Raghda has checked and shared appear here."/>
    {highlight ? <div className="next-up"><span className="next-up-icon"><Icon name={unseen.length ? "bell" : "check"}/></span><div><small>{unseen.length ? `Since your last visit · ${unseen.length} new` : "Latest result"}</small><strong>{getAssessment(data, highlight.assessmentId).title} · {getSubmissionProgress(data, highlight)}%</strong><span>Shared {new Date(highlight.publishedAt ?? highlight.uploadedAt).toLocaleDateString()}{highlight.revisions?.length ? " · corrected by the teacher" : ""}</span></div><Button className="primary-button" onClick={() => onOpenFeedback(highlight.id)}>View feedback</Button></div>
      : <div className="next-up"><span className="next-up-icon"><Icon name="clock"/></span><div><strong>No shared results yet</strong><span>Results appear after the teacher checks and shares them.</span></div></div>}
    {submissions.length > 0 && <section className="card glance" aria-labelledby="glance-title">
      <div className="card-head-inline"><h2 id="glance-title" className="section-title">At a glance</h2><Button className="text-button" onClick={() => onOpen("Results")}>Progress by subject <Icon name="arrow" size={16}/></Button></div>
      <div className="glance-grid">
        <div><h3 className="glance-head ok"><Icon name="check" size={16}/> Doing well</h3>{strengths.length ? <ul>{strengths.map((topic) => <li key={topic.topicKey}><strong>{topic.label}</strong><small>{topic.subject}</small></li>)}</ul> : <p className="muted">Shows up after more checked results.</p>}</div>
        <div><h3 className="glance-head warn"><Icon name="trend" size={16}/> Working on</h3>{workingOn.length ? <ul>{workingOn.map((topic) => <li key={topic.topicKey}><strong>{topic.label}</strong><small>{topic.status === "improving" ? "Getting better" : followUps.some((item) => item.topicKey === topic.topicKey) ? "Ms. Raghda is following up in class" : "A practice topic"}</small></li>)}</ul> : <p className="muted">Nothing to work on right now.</p>}</div>
      </div>
    </section>}
    <nav className="shortcut-grid" aria-label="Shortcuts">{shortcuts.map((item) => <Button key={item.page} className="shortcut" onClick={() => onOpen(item.page)}><span className="shortcut-icon"><Icon name={item.icon} size={20}/></span><strong>{item.page}</strong><small>{item.status}</small></Button>)}</nav>
  </div>;
}

function ParentResults({ data, onOpenFeedback }: { data: AssessmentAppData; onOpenFeedback: (id: string) => void }) {
  const child = getStudent(data, DEMO_PARENT_CHILD_ID);
  const firstName = child.name.split(" ")[0];
  const progress = parentProgress(data, parentApprovedSubmissions(data));
  return <div className="page page-narrow">
    <PageHead title="Results" sub={`Teacher-checked progress for ${firstName}, one subject at a time.`}/>
    {progress.length === 0 ? <p className="empty card">No results have been shared yet.</p> : progress.map(({ subject, results, points, topics }) => {
      const trend = points.length > 1 ? points[points.length - 1].percent - points[0].percent : undefined;
      return <section className="card subject-card" key={subject} aria-labelledby={`subject-${subject}`}>
        <div className="card-head-inline"><h2 id={`subject-${subject}`} className="section-title">{subject}</h2>{trend !== undefined && <span className={`pill ${trend >= 0 ? "ok" : "warn"}`}><Icon name="trend" size={14}/> {trend > 0 ? "+" : ""}{trend} points since {dateLabel(points[0].at)}</span>}</div>
        {points.length > 1 && <ScoreLine points={points}/>}
        <h3 className="subsection-title">Topics</h3>
        <ul className="topic-status-list">{(Object.keys(parentStatusWords) as ParentTopicStatus[]).filter((status) => topics.some((topic) => topic.status === status)).map((status) => { const word = parentStatusWords[status]; return <li key={status}><span className={`pill ${word.tone}`}>{word.label}</span><span className="row-main"><strong>{topics.filter((topic) => topic.status === status).map((topic) => topic.label).join(", ")}</strong><small>{word.text(firstName)}</small></span></li>; })}</ul>
        <h3 className="subsection-title">Results</h3>
        <ul className="list">{results.map((result) => <li className="parent-result-row" key={result.id}><span className="row-main"><strong>{shortTitle(getAssessment(data, result.assessmentId).title)}</strong><small>Shared {dateLabel(result.at)}{result.corrected ? " · corrected by the teacher" : ""}</small></span><span className="meter wide" aria-hidden="true"><span style={{ width: `${result.percent}%` }}/></span><strong className="parent-score">{result.percent}%</strong><Button className="text-button" onClick={() => onOpenFeedback(result.id)}>Feedback</Button></li>)}</ul>
      </section>;
    })}
  </div>;
}

function ParentAck({ submission, onRead }: { submission: SubmissionRecord; onRead: (id: string, note?: string) => void }) {
  const read = currentParentRead(submission);
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState("");
  if (read) return <p className="parent-ack done"><Icon name="check" size={16}/><span>You marked this as read on {new Date(read.at).toLocaleDateString()}.{read.note ? ` Your note: “${read.note}”` : ""}</span></p>;
  return <div className="parent-ack">
    {writing ? <>
      <label className="field">A short note for Ms. Raghda (optional)<textarea maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Thank you! We will practise at home."/></label>
      <div className="dialog-actions"><Button className="text-button" onClick={() => setWriting(false)}>Cancel</Button><Button className="primary-button" onClick={() => onRead(submission.id, note.trim() || undefined)}><Icon name="check" size={16}/> Mark as read{note.trim() ? " and send note" : ""}</Button></div>
    </> : <div className="parent-ack-actions"><Button className="secondary-button" onClick={() => onRead(submission.id)}><Icon name="check" size={16}/> We’ve read this</Button><Button className="text-button" onClick={() => setWriting(true)}>Add a short note</Button><small className="muted">Optional. Ms. Raghda can see that you read it.</small></div>}
  </div>;
}

function ParentFeedback({ data, openId, onRead }: { data: AssessmentAppData; openId: string | null; onRead: (id: string, note?: string) => void }) {
  const submissions = parentApprovedSubmissions(data);
  return <div className="page page-narrow">
    <PageHead title="Teacher feedback" sub="Ms. Raghda’s comments on each checked result."/>
    {submissions.length ? <div className="result-questions">{submissions.map((submission, index) => {
      const assessment = getAssessment(data, submission.assessmentId);
      const questions = getSubmissionQuestions(data, submission);
      const fullMarks = questions.filter((question) => submission.answers.find((answer) => answer.questionId === question.id)?.teacherScore === question.maxScore).length;
      const practise = [...new Set([...(submission.learningGaps ?? []).filter((topic) => submission.learningGapDecisions?.[topic] === "confirmed"), ...submission.flags.filter((flag) => flag.decision === "confirmed" && flag.topicKey !== "overall-progress").map((flag) => flag.topicKey)])];
      return <details className="result-question" key={submission.id} open={openId ? openId === submission.id : index === 0}>
        <summary><span className="result-question-prompt">{assessment.title}<small className="summary-meta">{submission.language === "de" ? "German" : "English"} · Shared {dateLabel(submission.publishedAt ?? submission.uploadedAt)}{submission.revisions?.length ? " · corrected" : ""}{currentParentRead(submission) ? " · read" : ""}</small></span><span className="pill brand">{getSubmissionScore(data, submission)} / {getSubmissionMaxScore(data, submission)}</span></summary>
        <div className="in-short"><span><Icon name="check" size={16}/> Full marks on {fullMarks} of {questions.length} question{questions.length === 1 ? "" : "s"}</span>{practise.length > 0 && <span><Icon name="sparkles" size={16}/> To practise: {practise.map((topic) => getTopicLabel(data, topic)).join(", ")}</span>}</div>
        {submission.overallFeedback?.trim() && <p className="teacher-message-line"><strong>Message from Ms. Raghda:</strong> <span lang={submission.language}>{submission.overallFeedback}</span></p>}
        <ol className="parent-feedback-list">{questions.map((question) => { const answer = submission.answers.find((item) => item.questionId === question.id); return <li key={question.id}><div className="parent-feedback-q"><strong>{question.prompt}</strong><span className="muted small">{answer?.teacherScore} / {question.maxScore}</span></div><p>{answer?.teacherFeedback || "No written comment was shared for this answer."}</p></li>; })}</ol>
        <ParentAck submission={submission} onRead={onRead}/>
      </details>;
    })}</div> : <p className="empty card">Teacher comments appear here after a result is checked and shared.</p>}
  </div>;
}

function ParentPractise({ data, onPractised }: { data: AssessmentAppData; onPractised: (topicKey: string) => void }) {
  const child = getStudent(data, DEMO_PARENT_CHILD_ID);
  const firstName = child.name.split(" ")[0];
  const [language, setLanguage] = useState<Language>("en");
  const submissions = parentApprovedSubmissions(data);
  const gaps = parentLearningGaps(data, submissions);
  const followUps = parentFollowUps(submissions);
  const topicKeys = [...new Set([...gaps.map((gap) => gap.topicKey), ...followUps.map((item) => item.topicKey)])];
  const log = (data.practiceLog ?? []).filter((entry) => entry.studentId === child.id);
  const words = language === "de" ? { need: "Sie brauchen", minutes: `etwa ${ACTIVITY_MINUTES} Minuten` } : { need: "You need", minutes: `about ${ACTIVITY_MINUTES} minutes` };
  return <div className="page page-narrow">
    <PageHead title="Practise at home" sub={`Chosen by Ms. Raghda after checking ${firstName}’s work. Short activities with things you have at home.`}><label className="inline-select">Activity language<select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="en">English</option><option value="de">Deutsch</option></select></label></PageHead>
    {topicKeys.length === 0 && <section className="card"><h2 className="section-title">Nothing to practise right now</h2><p className="muted">Ms. Raghda hasn’t picked a topic for {firstName}. Here is a general idea instead.</p></section>}
    {(topicKeys.length ? topicKeys : ["overall-progress"]).map((topicKey, position) => {
      const activity = getHomeActivity(topicKey, language);
      const gap = gaps.find((item) => item.topicKey === topicKey);
      const followUp = followUps.find((item) => item.topicKey === topicKey);
      const done = log.filter((entry) => entry.topicKey === topicKey).sort((a, b) => b.at.localeCompare(a.at));
      return <section className="card activity-card" key={topicKey} aria-labelledby={`activity-${topicKey}`}>
        <div className="activity-head"><div><h2 id={`activity-${topicKey}`} className="section-title">{topicKey === "overall-progress" ? "Overall progress" : getTopicLabel(data, topicKey)}</h2><small className="muted">{gap ? `Came up in ${gap.count} checked assessment${gap.count === 1 ? "" : "s"}` : followUp ? `Noticed in ${followUp.from.length === 1 ? getAssessment(data, followUp.from[0].assessmentId).title : `${followUp.from.length} assessments`}` : "A general idea"}</small></div>{followUp && <span className="pill warn">Ms. Raghda is following up in class</span>}</div>
        <details className="activity" lang={language} open={position === 0}>
          <summary><strong>{activity.title}</strong> <span className="muted">· {words.minutes}</span></summary>
          <p><strong>{words.need}:</strong> {activity.need}</p>
          <ol>{activity.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </details>
        {topicKeys.length > 0 && <div className="activity-foot"><Button className="secondary-button" onClick={() => onPractised(topicKey)}><Icon name="check" size={16}/> We practised this</Button><small className="muted">{done.length ? `Practised ${done.length}× · last on ${dateLabel(done[0].at)}` : "Not practised yet"}</small></div>}
      </section>;
    })}
  </div>;
}

function BackupPanel() {
  const [backups] = useState(() => listBackups());
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const restore = (key: string) => {
    // The page reloads straight away so the app reads the restored data instead of saving over it.
    if (restoreBackup(key)) window.location.reload();
    else setFailed(true);
  };
  return <div className="backup-panel"><strong>Saved-data backup</strong>{backups.length === 0 ? <p>No backup exists in this browser. A backup is made before saved data is upgraded, restored or reset.</p> : <><p>Before upgrading the data saved in this browser, Brightpath kept an untouched copy in this browser’s local storage (not on a server). Backups are never overwritten.</p>{backups.map((backup) => <div className="backup-row" key={backup.key}><span><b>{backup.key.startsWith(BEFORE_RESET_PREFIX) ? `Before reset (version ${backup.fromVersion})` : backup.kind === "before-restore" ? `Data replaced by a restore (version ${backup.fromVersion})` : `Original data from version ${backup.fromVersion}, before the upgrade`}</b><small>Saved {backup.savedAt ? new Date(backup.savedAt).toLocaleString() : "at an unknown time"} · key <code>{backup.key}</code></small></span>{confirmKey === backup.key ? <span className="backup-confirm"><Button className="primary-button" onClick={() => restore(backup.key)}>Yes, restore and reload</Button><Button className="secondary-button" onClick={() => setConfirmKey(null)}>Cancel</Button></span> : <Button className="secondary-button" onClick={() => { setFailed(false); setConfirmKey(backup.key); }}>Restore…</Button>}</div>)}<p className="backup-note">Restoring replaces the current data with the backup and reloads the page. The data being replaced is first kept as a new backup under a key starting with <code>{BEFORE_RESTORE_PREFIX}</code>, so a restore can itself be undone. Older data is then upgraded again with the same protections.</p>{failed && <p className="backup-error" role="alert">The backup could not be restored. Nothing was changed.</p>}</>}</div>;
}

/** Stage 4: "Reset demo data" with a confirmation. The current data is kept as a "Before reset" backup first. */
function ResetPanel() {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const reset = () => {
    if (!resetDemoData()) { setFailed(true); setConfirming(false); return; }
    // Go to the current role's Home and reload at once, so the app reads the fresh data instead of saving over it.
    const role = window.location.hash.split("/")[1];
    window.history.replaceState(null, "", `#/${role === "student" || role === "parent" ? role : "teacher"}`);
    window.location.reload();
  };
  return <div className="reset-panel">
    <p>Start the demo again with fresh data: 18 students, the built-in questions and templates, no uploads, no teacher questions. Only this browser is affected.</p>
    {confirming ? <div className="reset-confirm" role="alert"><p><strong>Replace the data in this browser with fresh demo data?</strong> A copy of the current data is kept first as “Before reset”, so you can restore it from the backup list.</p><div className="backup-confirm"><Button className="primary-button" onClick={reset}>Yes, reset and reload</Button><Button className="secondary-button" onClick={() => setConfirming(false)}>Cancel</Button></div></div>
      : <Button className="secondary-button" onClick={() => { setFailed(false); setConfirming(true); }}>Reset demo data…</Button>}
    {failed && <p className="backup-error" role="alert">The current data could not be backed up, so nothing was reset.</p>}
  </div>;
}

function DemoHelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="demo-help-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-help-title">
    <div className="dialog-heading"><h2 id="demo-help-title">How the demo works</h2><Button className="close-button" title="Close" aria-label="Close" onClick={onClose}><Icon name="close"/></Button></div>
    <p className="muted">Synthetic classroom records with simulated OCR and grading. No work is sent to an AI service.</p>
    <ol className="demo-steps">
      <li><strong>Student work</strong><span>A chosen file is recorded by name only; its contents are never read. Sample Grade 4 answers (English or German) stand in, with occasional OCR slips to correct.</span></li>
      <li><strong>AI suggestions</strong><span>A simulated grader checks each answer against the question’s rubric and explains what it credited, what it missed and any likely misconception.</span></li>
      <li><strong>Teacher decisions</strong><span>The teacher verifies the text, sets marks and feedback, and confirms or dismisses gaps and flags.</span></li>
      <li><strong>Sharing</strong><span>Students and parents see a result only after the teacher approves and publishes it.</span></li>
    </ol>
    <details className="more"><summary>Saved-data backup</summary><div className="more-body"><BackupPanel/></div></details>
    <details className="more"><summary>Reset demo data</summary><div className="more-body"><ResetPanel/></div></details>
    <div className="dialog-actions"><Button className="primary-button" onClick={onClose}>Got it</Button></div>
  </section></div>;
}

const ROLE_KEY = "brightpath-demo-role";
function storedRole(): Role {
  try { const value = window.sessionStorage.getItem(ROLE_KEY); return value === "Student" || value === "Parent" ? value : "Teacher"; } catch { return "Teacher"; }
}

export default function App() {
  // Stage 4: the demo role is kept for this browser tab (reload keeps it); addresses never change it.
  const [role, setRoleState] = useState<Role>(() => storedRole());
  const setRole = (next: string) => { const value: Role = next === "Student" || next === "Parent" ? next : "Teacher"; setRoleState(value); try { window.sessionStorage.setItem(ROLE_KEY, value); } catch { /* the role simply isn't kept */ } };
  const [reviewQuestion, setReviewQuestion] = useState<string | null>(null);
  const [createTab, setCreateTab] = useState<CreateTab>("new");
  // "Assign practice" from Flagged students or Learning insights opens Create assessment set up for a topic.
  const [createPreset, setCreatePreset] = useState<CreatePreset | null>(null);
  // "Practise Fractions": Get help opens on that assessment and topic.
  const [helpStart, setHelpStart] = useState<{ assessmentId?: string; topicKey?: string; questionId?: string } | null>(null);
  const [notFoundHash, setNotFoundHash] = useState<string | null>(null);
  const [helpFocus, setHelpFocus] = useState<string | null>(null);
  const [active, setActive] = useState("Home");
  const [reviewing, setReviewing] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [data, setDataRaw] = useState<AssessmentAppData>(() => readAssessmentData());
  // Action feedback: a message about a change is shown only after the change was saved in this browser.
  const changing = useRef(false);
  const pendingNotice = useRef<string | null>(null);
  const setData: typeof setDataRaw = (update) => { changing.current = true; setDataRaw(update); };
  const [storageWarning, setStorageWarning] = useState(false);
  const [notice, setNotice] = useState<{ text: string; kind: "ok" | "error" | "info" } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const uploadTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const saved = storeAssessmentData(data);
    setStorageWarning(!saved);
    changing.current = false;
    const message = pendingNotice.current;
    pendingNotice.current = null;
    if (message) showNotice(saved ? { text: message, kind: "ok" } : { text: "That change couldn’t be saved in this browser, so it may be lost when you reload. Nothing was shared.", kind: "error" });
  }, [data]);
  // A reload can interrupt the simulated OCR step. Finish any submission still marked as processing.
  useEffect(() => {
    setData((current) => current.submissions.some((item) => item.status === "processing")
      ? { ...current, submissions: current.submissions.map((item) => item.status === "processing" ? analyzeSubmission(current, item) : item) }
      : current);
  }, []);
  useEffect(() => () => {
    if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);
  const showNotice = (next: { text: string; kind: "ok" | "error" | "info" }) => {
    setNotice(next);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(null), next.kind === "error" ? 6000 : 3200);
  };
  /** Success after a change waits for the save; anything else (a warning, a hint) is shown at once.
   *  A message starting with "!" is a warning: the action could not be completed. */
  const toast = (message: string) => {
    if (message.startsWith("!")) { showNotice({ text: message.slice(1), kind: "error" }); return; }
    if (changing.current) {
      pendingNotice.current = message;
      // If the change turned out to change nothing, there is no save to wait for.
      window.setTimeout(() => { if (pendingNotice.current === message) { pendingNotice.current = null; changing.current = false; showNotice({ text: message, kind: "ok" }); } }, 700);
      return;
    }
    showNotice({ text: message, kind: "info" });
  };
  const updateSubmission = (id: string, update: (current: SubmissionRecord) => SubmissionRecord) => setData((current) => ({ ...current, submissions: current.submissions.map((submission) => submission.id === id ? update(submission) : submission) }));
  const startUpload = (fileName: string, language: Language, assignmentId: string, confidenceRatings: Record<string, ConfidenceLevel>, byTeacher = false) => {
    const assignment = data.assignments.find((item) => item.id === assignmentId);
    if (!assignment) { toast("!That assessment couldn’t be found. Please reload the page."); return; }
    // One submission per assignment, even if the button is pressed twice or two tabs are open.
    if (getAssignmentSubmission(data, assignment)) { toast(byTeacher ? `!${getStudent(data, assignment.studentId).name} already sent work for this assessment.` : "!You already sent your work for this assessment."); return; }
    const template = assignment.templateId ? data.templates.find((item) => item.id === assignment.templateId) : undefined;
    const assessment = getAssessment(data, assignment.assessmentId);
    const submissionId = "upload-" + Date.now();
    const next: SubmissionRecord = { id: submissionId, studentId: assignment.studentId, uploadedBy: byTeacher ? "teacher" : "student", assessmentId: assignment.assessmentId, language, fileName, uploadedAt: new Date().toISOString(), status: "processing", answers: [], learningGaps: [], learningGapDecisions: {}, flags: [], notificationSeen: false, seenBy: { student: false, parent: false }, assignmentId: assignment.id, templateId: template?.id, questionIds: template?.questionIds ?? assessment.questions[language].filter((question) => !question.custom).map((question) => question.id), confidenceRatings };
    setData((current) => current.submissions.some((item) => item.studentId === next.studentId && item.assignmentId === assignment.id) ? current : { ...current, submissions: [next, ...current.submissions] });
    toast(byTeacher ? `Work uploaded for ${getStudent(data, assignment.studentId).name}. The simulated scan is reading it; it appears under To review in a moment.` : "Your work was sent to your teacher.");
    uploadTimer.current = window.setTimeout(() => {
      setData((current) => ({ ...current, submissions: current.submissions.map((item) => item.id === submissionId && item.status === "processing" ? analyzeSubmission(current, item) : item) }));
      if (role === "Teacher") toast("A new submission is ready for review.");
    }, 900);
  };
  const publish = (id: string) => {
    const target = data.submissions.find((item) => item.id === id);
    if (!target) return;
    // Checked again here so nothing can be shared while any blocker (including a changed mark) remains.
    const next = publishSubmission(data, target, new Date().toISOString());
    if (!next) { toast("!This result can’t be shared yet. See “Before you can share”."); return; }
    // Sharing and the student's notification are saved together, so one never exists without the other.
    setData((current) => {
      // Already shared (a second click, another tab): nothing to do.
      if (current.submissions.find((item) => item.id === id)?.status !== "needs_review") return current;
      const withResult = { ...current, submissions: current.submissions.map((item) => item.id === id ? next : item) };
      return addNotification(withResult, resultNotification(withResult, next)).data;
    });
    const name = getStudent(data, target.studentId).name;
    toast(`${target.reopened ? "Corrected result published" : "Results published"} for ${name}. ${name.split(" ")[0]}${target.studentId === DEMO_PARENT_CHILD_ID ? " and their parent have" : " has"} been notified.`);
    setReviewing(false);
    setSelectedSubmissionId(null);
  };
  const reopen = (id: string, reason: string) => {
    const target = data.submissions.find((item) => item.id === id);
    const next = target ? reopenSubmission(target, reason, new Date().toISOString()) : undefined;
    if (!next) return;
    updateSubmission(id, () => next);
    toast("Reopened. The student and parent can’t see this result until you share it again.");
  };
  const cancelCorrection = (id: string) => {
    const target = data.submissions.find((item) => item.id === id);
    const next = target ? cancelReopen(target) : undefined;
    if (!next) return;
    updateSubmission(id, () => next);
    toast("Correction cancelled. The result is shared again exactly as before.");
  };
  const selectedSubmission = data.submissions.find((submission) => submission.id === selectedSubmissionId) ?? null;
  const openReview = (id: string) => { pendingHash.current = null; setSelectedSubmissionId(id); setReviewing(true); setReviewQuestion(null); setNotFoundHash(null); setNotificationsOpen(false); };
  const changeRole = (next: string) => { pendingHash.current = null; setRole(next); setActive("Home"); setReviewing(false); setSelectedSubmissionId(null); setNotificationsOpen(false); setSearchTerm(""); setDetailId(null); setReviewQuestion(null); setCreateTab("new"); setNotFoundHash(null); };
  const setPage = (page: string) => {
    pendingHash.current = null; setCreatePreset(null); setHelpStart(null); setActive(page); setReviewing(false); setSelectedSubmissionId(null); setNotificationsOpen(false); setSearchTerm(""); setDetailId(null); setReviewQuestion(null); setCreateTab("new"); setNotFoundHash(null);
    // Opening the help page shows every teacher reply, so those notices are cleared; it starts on the newest new reply.
    const newestReply = role === "Student" && page === "Get help" ? data.helpRequests.filter((item) => item.studentId === DEMO_STUDENT_ID && item.kind === "teacher" && item.status === "answered" && item.responseSeen === false).sort((a, b) => (b.responseAt ?? "").localeCompare(a.responseAt ?? ""))[0] : undefined;
    setHelpFocus(newestReply?.id ?? null);
    if (role === "Student" && page === "Get help") setData((current) => current.helpRequests.some((item) => item.studentId === DEMO_STUDENT_ID && item.responseSeen === false) ? { ...current, helpRequests: current.helpRequests.map((item) => item.studentId === DEMO_STUDENT_ID && item.responseSeen === false ? { ...item, responseSeen: true } : item) } : current);
  };
  // Students and parents each dismiss their own "new result" notice.
  const markNotificationSeen = (id: string, viewer: "student" | "parent") => updateSubmission(id, (submission) => {
    const seenBy = { student: submission.seenBy?.student ?? submission.notificationSeen, parent: submission.seenBy?.parent ?? submission.notificationSeen, [viewer]: true };
    return { ...submission, seenBy, notificationSeen: seenBy.student };
  });
  // Teacher-written questions: saved in their own list; ready ones that pass validation join their assessment.
  const saveCustomQuestion = (record: CustomQuestionRecord) => {
    setData((current) => withCustomQuestions({ ...current, customQuestions: [record, ...(current.customQuestions ?? []).filter((item) => item.id !== record.id)] }));
    toast(record.status === "ready" ? "Question saved. You can add it to a template now." : "Draft saved. It can’t be used until its marking criteria are complete.");
  };
  const deleteCustomQuestion = (id: string) => {
    const used = data.templates.some((template) => template.questionIds.includes(id)) || data.submissions.some((submission) => submission.answers.some((answer) => answer.questionId === id));
    if (used) { toast("!This question is used in a template or student work, so it can’t be deleted."); return; }
    setData((current) => withCustomQuestions({ ...current, customQuestions: (current.customQuestions ?? []).filter((item) => item.id !== id) }));
    toast("Question deleted.");
  };
  const deleteTemplate = (id: string) => {
    if (data.assignments.some((assignment) => assignment.templateId === id)) { toast("!This template is assigned to students, so it can’t be deleted."); return; }
    setData((current) => ({ ...current, templates: current.templates.filter((item) => item.id !== id) }));
    toast("Draft deleted.");
  };
  // Saving the same draft again updates it instead of adding a copy.
  const saveTemplate = (template: AssessmentTemplateRecord) => setData((current) => ({ ...current, templates: [template, ...current.templates.filter((item) => item.id !== template.id)] }));
  // Assigns a template to several students at once. Students who already have it are skipped, so nobody gets it twice.
  // newTemplate: assigning straight from Create assessment saves the template in the same update.
  const assignTemplate = (templateId: string, studentIds: string[], options: { help: HelpSettings; dueDate?: string }, newTemplate?: AssessmentTemplateRecord) => {
    // A new template is only taken from the builder when it is the one being assigned.
    if (newTemplate && newTemplate.id !== templateId) newTemplate = undefined;
    const template = newTemplate ?? data.templates.find((item) => item.id === templateId);
    if (!template) return false;
    const fresh = studentIds.filter((studentId) => !data.assignments.some((item) => item.studentId === studentId && item.templateId === templateId));
    if (fresh.length === 0) { toast("!Everyone you chose already has this template."); return false; }
    const now = new Date().toISOString();
    setData((current) => ({ ...current, templates: newTemplate ? [newTemplate, ...current.templates.filter((item) => item.id !== newTemplate.id)] : current.templates, assignments: [...fresh.filter((studentId) => !current.assignments.some((item) => item.studentId === studentId && item.templateId === templateId)).map((studentId, index) => ({ id: `assignment-${Date.now()}-${index}`, studentId, assessmentId: template.assessmentId, templateId, assignedAt: now, dueDate: options.dueDate, help: { ...options.help } })), ...current.assignments] }));
    const skipped = studentIds.length - fresh.length;
    toast(`${template.title} assigned to ${fresh.length === 1 ? getStudent(data, fresh[0]).name : `${fresh.length} students`}${skipped ? ` · ${skipped} already had it` : ""}.`);
    return true;
  };
  // ---- Flagged students: the teacher's decisions, notes and support (saved with the rest of the data) ----
  const updateSupportCase = (studentId: string, change: (record: SupportCaseRecord) => SupportCaseRecord, message: string) => {
    setData((current) => {
      const list = current.supportCases ?? [];
      const existing = list.find((item) => item.studentId === studentId) ?? { studentId, history: [], notes: [], actions: [] };
      return { ...current, supportCases: [...list.filter((item) => item.studentId !== studentId), change(existing)] };
    });
    toast(message);
  };
  const decideFlag = (studentId: string, decision: "confirmed" | "dismissed" | "resolved" | "reopened", reason?: string) => {
    const at = new Date().toISOString();
    const name = getStudent(data, studentId).name;
    updateSupportCase(studentId, (record) => ({ ...record, decision: decision === "reopened" ? undefined : decision, decidedAt: decision === "reopened" ? undefined : at, reason: decision === "reopened" ? undefined : reason, history: [...record.history, { at, decision, ...(reason ? { reason } : {}) }] }),
      decision === "confirmed" ? `Flag confirmed for ${name}. Only you see it; you can send ${name.split(" ")[0]} a practice idea below.` : decision === "dismissed" ? `Flag dismissed for ${name}. It comes back only if new evidence is shared.` : decision === "resolved" ? `Flag resolved for ${name}.` : `Flag reopened for ${name}.`);
  };
  const supportHandlers: SupportHandlers = {
    onConfirm: (studentId) => decideFlag(studentId, "confirmed"),
    onDismiss: (studentId, reason) => decideFlag(studentId, "dismissed", reason),
    onResolve: (studentId, reason) => decideFlag(studentId, "resolved", reason),
    onReopen: (studentId) => decideFlag(studentId, "reopened"),
    onNote: (studentId, text) => updateSupportCase(studentId, (record) => ({ ...record, notes: [...record.notes, { id: `note-${Date.now()}`, at: new Date().toISOString(), text }] }), "Note saved. Only you can see it."),
    onSupport: (studentId, action) => updateSupportCase(studentId, (record) => ({ ...record, actions: [...record.actions, { id: `support-${Date.now()}`, ...action }] }), `Support recorded for ${getStudent(data, studentId).name}. Later shared results will show whether it helped.`),
    onPractice: (studentIds, topicKey) => {
      const assessment = data.assessments.find((item) => item.questions.en.some((question) => question.topicKey === topicKey && !question.custom)) ?? data.assessments.find((item) => [...item.questions.en, ...item.questions.de].some((question) => question.topicKey === topicKey));
      if (!assessment) { toast("!No questions found for this topic."); return; }
      // The language the student last used for this unit (German results get German practice).
      const latest = data.submissions.filter((item) => studentIds.includes(item.studentId) && item.assessmentId === assessment.id && item.status === "published").sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
      const label = getTopicLabel(data, topicKey);
      setPage("Create assessment");
      setCreatePreset({ key: `preset-${Date.now()}`, assessmentId: assessment.id, language: latest?.language ?? "en", topicKey, studentIds, title: `Practice: ${label}` });
      toast(`Practice set up for ${studentIds.length === 1 ? getStudent(data, studentIds[0]).name : `${studentIds.length} students`}: ${label}. Choose the questions, then assign.`);
    },
    onReviewAnswer: (submissionId, questionId) => { openReview(submissionId); if (questionId) setReviewQuestion(questionId); window.scrollTo({ top: 0 }); },
    onProfile: (studentId) => { setPage("Students"); setDetailId(studentId); window.scrollTo({ top: 0 }); },
    onOpenCase: (studentId) => { setPage("Flagged students"); setDetailId(studentId); window.scrollTo({ top: 0 }); },
    onSend: (input) => sendToStudent(input),
    onOpenFlagged: () => { setPage("Flagged students"); window.scrollTo({ top: 0 }); },
  };
  // A note from the teacher to one student: a comment, a practice idea or a topic to look at again.
  const sendToStudent = (input: { studentId: string; kind: NotificationKind; message: string; topicKey?: string; assessmentId?: string; submissionId?: string }): boolean => {
    const name = getStudent(data, input.studentId).name;
    if (!input.message.trim()) { toast("!Write a message first."); return false; }
    const draft = teacherNotification(data, input);
    if ((data.notifications ?? []).some((item) => item.key === draft.key && item.studentId === input.studentId)) { toast(`!${name} already has this exact message. Nothing was sent again.`); return false; }
    setData((current) => addNotification(current, draft).data);
    toast(input.kind === "practice" ? `Practice recommendation sent to ${name}.` : input.kind === "review-topic" ? `Request to review a topic sent to ${name}.` : `Feedback sent to ${name}.`);
    return true;
  };
  const replyToHelp = (id: string, response: string) => {
    const request = data.helpRequests.find((item) => item.id === id);
    if (!request || !response.trim()) { toast("!Write a reply first."); return; }
    const responseAt = new Date().toISOString();
    setData((current) => { const answered = { ...request, status: "answered" as const, response, responseAt, responseSeen: false }; return addNotification({ ...current, helpRequests: current.helpRequests.map((item) => item.id === id ? answered : item) }, replyNotification(answered)).data; });
    toast(`Reply sent to ${getStudent(data, request.studentId).name}. They have been notified.`);
  };
  const createHelp = (request: HelpRequestRecord) => {
    setData((current) => ({ ...current, helpRequests: [request, ...current.helpRequests] }));
    if (request.kind === "teacher") toast("Your teacher has received your question.");
  };
  // Parent: "We've read this" (with an optional note) and "We practised this". Nothing else changes.
  const markParentRead = (id: string, note?: string) => {
    updateSubmission(id, (submission) => ({ ...submission, parentReads: [...(submission.parentReads ?? []), { at: new Date().toISOString(), ...(note ? { note } : {}) }] }));
    toast(note ? "Marked as read. Your note was sent to Ms. Raghda." : "Marked as read.");
  };
  const markParentNoteSeen = (id: string, index: number) => updateSubmission(id, (submission) => ({ ...submission, parentReads: (submission.parentReads ?? []).map((read, position) => position === index ? { ...read, teacherSeenAt: new Date().toISOString() } : read) }));
  const logPractice = (topicKey: string) => {
    setData((current) => ({ ...current, practiceLog: [{ id: `practice-${Date.now()}`, studentId: DEMO_PARENT_CHILD_ID, topicKey, at: new Date().toISOString() }, ...(current.practiceLog ?? [])] }));
    toast("Nice! Practice noted.");
  };
  const rateHelp = (id: string, helpful: boolean) => { setData((current) => ({ ...current, helpRequests: current.helpRequests.map((item) => item.id === id ? { ...item, helpful } : item) })); toast(helpful ? "Great! Thanks for telling us." : "Thanks for telling us. Try the next step below."); };
  const reviewQueue = data.submissions.filter((submission) => submission.status !== "published").sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const viewer = role === "Parent" ? "parent" as const : "student" as const;
  const resultNotifications: TopbarNotification[] = data.submissions
    .filter((submission) => submission.studentId === (role === "Parent" ? DEMO_PARENT_CHILD_ID : DEMO_STUDENT_ID) && submission.status === "published" && !(submission.seenBy?.[viewer] ?? submission.notificationSeen))
    .map((submission) => ({ id: "result-" + submission.id, kind: "result" as const, targetId: submission.id, title: role === "Parent" ? (submission.resultUpdated ? "Ms. Raghda corrected one of Omar’s results" : "New result for Omar") : (submission.resultUpdated ? "Your teacher updated a result" : "Your teacher shared a new result"), detail: getAssessment(data, submission.assessmentId).title + " · " + dateLabel(submission.publishedAt ?? submission.uploadedAt) }));
  const replyNotifications: TopbarNotification[] = data.helpRequests
    .filter((request) => request.studentId === DEMO_STUDENT_ID && request.kind === "teacher" && request.status === "answered" && request.responseSeen === false)
    .map((request) => ({ id: "reply-" + request.id, kind: "help" as const, targetId: request.id, title: "Your teacher replied", detail: "Select to read it · " + dateLabel(request.responseAt ?? request.createdAt) }));
  const studentNotes = role === "Student" ? notificationsFor(data, DEMO_STUDENT_ID) : [];
  void replyNotifications;
  const notificationItems: TopbarNotification[] = role === "Teacher"
    ? [
      ...reviewQueue.slice(0, 4).map((submission) => ({ id: "review-" + submission.id, kind: "review" as const, targetId: submission.id, title: getStudent(data, submission.studentId).name + " · " + getAssessment(data, submission.assessmentId).title.split(": ")[1], detail: queueState(data, submission) + " · " + dateLabel(submission.uploadedAt) })),
      ...data.helpRequests.filter((request) => request.kind === "teacher" && request.status === "open").slice(0, 3).map((request) => ({ id: "help-" + request.id, kind: "help" as const, targetId: request.id, title: getStudent(data, request.studentId).name + " asked for help", detail: "Waiting for your reply · " + getAssessment(data, request.assessmentId).title.split(": ")[1] + " · " + dateLabel(request.createdAt) })),
    ]
    : role === "Student" ? studentNotes.map((item) => ({ id: item.id, kind: "note" as const, targetId: item.submissionId ?? item.helpRequestId, title: item.title, type: item.label ?? NOTIFICATION_WORDS[item.kind], message: item.kind === "reply" ? undefined : item.message, read: Boolean(item.readAt), view: item, demo: item.demo, actionLabel: item.action?.label, detail: [item.topicLabel ?? [item.assessmentId ? shortTitle(getAssessment(data, item.assessmentId).title) : "", item.topicKey ? getTopicLabel(data, item.topicKey) : ""].filter(Boolean).join(" · "), item.grade !== undefined ? `${item.grade}%` : "", dateLabel(item.createdAt)].filter(Boolean).join(" · ") })) : resultNotifications.slice(0, 6);
  // Student: one notification, or all of them, marked as read (saved; also clears the matching "new" markers).
  const markStudentRead = (ids?: string[]) => {
    if (!unreadCount(notificationsFor(data, DEMO_STUDENT_ID).filter((item) => !ids || ids.includes(item.id)))) return;
    setData((current) => markNotificationsRead(current, DEMO_STUDENT_ID, ids));
    toast(ids ? "Notification marked as read." : "All notifications marked as read.");
  };
  const markAllRead = () => {
    if (role === "Student") { markStudentRead(); setNotificationsOpen(false); return; }
    setData((current) => ({
      ...current,
      submissions: current.submissions.map((submission) => submission.studentId === (role === "Parent" ? DEMO_PARENT_CHILD_ID : DEMO_STUDENT_ID) && submission.status === "published" && !(submission.seenBy?.[viewer] ?? submission.notificationSeen)
        ? { ...submission, seenBy: { student: submission.seenBy?.student ?? submission.notificationSeen, parent: submission.seenBy?.parent ?? submission.notificationSeen, [viewer]: true }, notificationSeen: viewer === "student" ? true : submission.notificationSeen }
        : submission),
      helpRequests: current.helpRequests,
    }));
    toast("All updates marked as read.");
    setNotificationsOpen(false);
  };
  const selectNotification = (item: TopbarNotification) => {
    if (role === "Student" && item.view) {
      const note = item.view;
      if (!note.readAt) setData((current) => markNotificationsRead(current, DEMO_STUDENT_ID, [note.id]));
      const result = note.submissionId ? data.submissions.find((entry) => entry.id === note.submissionId && entry.status === "published" && entry.studentId === DEMO_STUDENT_ID) : undefined;
      if (note.action) {
        // Demo notifications lead to existing pages only: My results, one shared result, or Get help.
        const target = note.action.submissionId ? data.submissions.find((entry) => entry.id === note.action!.submissionId && entry.status === "published" && entry.studentId === DEMO_STUDENT_ID) : undefined;
        if (note.action.to === "result" && target) { setPage("My results"); setDetailId(target.id); }
        else if (note.action.to === "results" || note.action.to === "result") setPage("My results");
        else { setPage("Get help"); if (note.action.to === "practice") setHelpStart({ assessmentId: note.action.assessmentId, topicKey: note.action.topicKey }); }
        setNotificationsOpen(false);
        return;
      }
      if (note.kind === "reply") { setPage("Get help"); setHelpFocus(note.helpRequestId ?? null); }
      else if (result) { setPage("My results"); setDetailId(result.id); }
      else if (note.kind === "result" || note.kind === "result-updated") { setPage("My results"); toast("!Your teacher is checking this result again. You’ll be told when it’s ready."); }
      else if (note.kind === "practice" || note.kind === "review-topic") setPage("Get help");
      else setPage("Home");
      setNotificationsOpen(false);
      return;
    }
    if (role === "Teacher" && item.kind === "review" && item.targetId) openReview(item.targetId);
    else if (role === "Teacher") setPage("Help requests");
    else if (item.kind === "result" && item.targetId) { markNotificationSeen(item.targetId, viewer); if (role === "Student") { setPage("My results"); setDetailId(item.targetId); } else { setPage("Teacher feedback"); setDetailId(item.targetId); } }
    else if (item.kind === "help") { setPage("Get help"); setHelpFocus(item.targetId ?? null); }
    else setPage("Home");
    setNotificationsOpen(false);
  };
  const goHome = () => setPage("Home");
  // ---- Stage 4: page addresses ----
  // Which records the current role may open by address. Hidden and missing records are treated the same.
  const canSee = (page: string, id: string) => {
    if (role === "Teacher" && page === "Review submissions") return data.submissions.some((item) => item.id === id);
    if (role === "Teacher" && (page === "Students" || page === "Flagged students")) return data.students.some((item) => item.id === id);
    if (role === "Student" && page === "My results") return data.submissions.some((item) => item.id === id && item.studentId === DEMO_STUDENT_ID && item.status === "published");
    if (role === "Parent" && page === "Teacher feedback") return parentApprovedSubmissions(data).some((item) => item.id === id);
    return false;
  };
  const reviewSub = (submission: SubmissionRecord | null) => {
    if (!submission || !reviewQuestion) return undefined;
    if (reviewQuestion === SUMMARY) return "summary";
    const index = getSubmissionQuestions(data, submission).findIndex((question) => question.id === reviewQuestion);
    return index > 0 ? `q${index + 1}` : undefined;
  };
  const currentRoute: Route = role === "Teacher" && reviewing && selectedSubmission
    ? { role, page: "Review submissions", id: selectedSubmission.id, sub: reviewSub(selectedSubmission) }
    : { role, page: active, id: detailId ?? undefined, sub: role === "Teacher" && active === "Create assessment" && createTab !== "new" ? createTab : undefined, query: searchTerm.trim() || undefined };
  const currentHash = notFoundHash ?? formatRoute(currentRoute);
  // One canonical form per page ("q1" is the same page as the review without a question).
  const canonical = (hash: string) => { const parsed = parseRoute(hash); if (!parsed) return ""; const { known: _known, ...route } = parsed; return formatRoute(route.sub === "q1" || route.sub === "new" ? { ...route, sub: undefined } : route); };
  const pendingHash = useRef<string | null>(null);
  const applyRoute = (hash: string) => {
    // Changing the address fires both "popstate" and "hashchange": the second call finds the page already there.
    if (hash === currentHash || canonical(hash) === currentHash) { pendingHash.current = null; return; }
    const result = guardRoute(parseRoute(hash), role, canSee);
    const route = result.route;
    pendingHash.current = result.kind === "redirect" ? formatRoute(route) : hash;
    setNotificationsOpen(false);
    setActive(route.page);
    setSearchTerm(route.query ?? "");
    setCreateTab(route.page === "Create assessment" && route.sub ? route.sub as CreateTab : "new");
    if (result.kind === "not-found") { setReviewing(false); setSelectedSubmissionId(null); setDetailId(null); setReviewQuestion(null); setNotFoundHash(hash); return; }
    setNotFoundHash(null);
    if (role === "Teacher" && route.page === "Review submissions" && route.id) {
      const submission = data.submissions.find((item) => item.id === route.id)!;
      const questions = getSubmissionQuestions(data, submission);
      setSelectedSubmissionId(route.id); setReviewing(true); setDetailId(null);
      setReviewQuestion(route.sub === "summary" ? SUMMARY : route.sub ? questions[Number(route.sub.slice(1)) - 1]?.id ?? null : null);
    } else {
      setReviewing(false); setSelectedSubmissionId(null); setReviewQuestion(null);
      setDetailId(route.id ?? null);
    }
    if (role === "Student" && route.page === "Get help") setData((current) => current.helpRequests.some((item) => item.studentId === DEMO_STUDENT_ID && item.responseSeen === false) ? { ...current, helpRequests: current.helpRequests.map((item) => item.studentId === DEMO_STUDENT_ID && item.responseSeen === false ? { ...item, responseSeen: true } : item) } : current);
    if (result.kind === "redirect") window.history.replaceState(null, "", formatRoute(route));
  };
  const applyRef = useRef(applyRoute);
  applyRef.current = applyRoute;
  // Address → page: on first load, and whenever Back/Forward (or an edited address) changes it.
  useEffect(() => {
    // Only Brightpath addresses ("#/…") are routes; "#main" (the skip link) is left to the browser.
    const onChange = () => { if (window.location.hash.startsWith("#/")) applyRef.current(window.location.hash); };
    onChange();
    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);
    return () => { window.removeEventListener("popstate", onChange); window.removeEventListener("hashchange", onChange); };
  }, []);
  // Page → address. A new page adds a history entry (so Back returns to it); the same page with other search
  // text, or the first address of a visit, replaces the current entry instead.
  useEffect(() => {
    const location = window.location.hash;
    if (location === currentHash) { pendingHash.current = null; return; }
    if (notFoundHash || canonical(location) === currentHash) { pendingHash.current = null; window.history.replaceState(null, "", currentHash); return; }
    // An address is still being applied (first load, Back/Forward): wait for the page instead of writing a new entry.
    // This also holds when React runs effects twice in development.
    if (pendingHash.current && pendingHash.current === location) return;
    const before = parseRoute(location), after = parseRoute(currentHash);
    const sameRecord = before && after && before.role === after.role && before.page === after.page && before.id === after.id && before.sub === after.sub;
    if (!location || sameRecord) window.history.replaceState(null, "", currentHash);
    else window.history.pushState(null, "", currentHash);
  }, [currentHash]);
  let content: React.ReactNode;
  let crumbs: Crumb[] = [{ label: "Home", onClick: goHome }];
  if (active !== "Home") crumbs.push({ label: active, onClick: () => setPage(active) });
  if (notFoundHash) {
    content = <div className="page page-narrow"><section className="card not-found" role="alert"><h1 className="section-title">Not found</h1><p className="muted">This page doesn’t exist, or it isn’t available in this view.</p><Button className="primary-button" onClick={() => setPage(active)}>Go to {active === "Home" ? "Home" : active}</Button></section></div>;
  } else if (role === "Teacher" && reviewing && selectedSubmission) {
    crumbs = [{ label: "Home", onClick: goHome }, { label: "Review submissions", onClick: () => setPage("Review submissions") }, { label: getStudent(data, selectedSubmission.studentId).name }];
    content = <ReviewWorkspace key={selectedSubmission.id} data={data} submission={selectedSubmission} routeQuestion={reviewQuestion ?? undefined} onQuestionChange={setReviewQuestion} onBack={() => setPage("Review submissions")} onUpdate={updateSubmission} onPublish={publish} onReopen={reopen} onCancelReopen={cancelCorrection} onSend={sendToStudent} toast={toast}/>;
  } else if (role === "Teacher" && active === "Home") {
    content = <TeacherHome data={data} onReview={openReview} onOpen={setPage}/>;
  } else if (role === "Teacher" && active === "Review submissions") {
    content = <TeacherQueue data={data} searchTerm={searchTerm} onSearch={setSearchTerm} onReview={openReview} onUpload={(fileName, language, assignmentId) => startUpload(fileName, language, assignmentId, {}, true)}/>;
  } else if (role === "Teacher" && active === "Learning insights") {
    content = <TeacherLearningInsights data={data} onReview={openReview} handlers={supportHandlers}/>;
  } else if (role === "Teacher" && active === "Flagged students") {
    const caseStudent = detailId ? data.students.find((item) => item.id === detailId) : undefined;
    if (caseStudent) crumbs.push({ label: caseStudent.name });
    content = <TeacherFlaggedStudents key={caseStudent?.id ?? "list"} data={data} openId={caseStudent?.id ?? null} handlers={supportHandlers}/>;
  } else if (role === "Teacher" && active === "Students") {
    const profileStudent = detailId ? data.students.find((item) => item.id === detailId) : undefined;
    if (profileStudent) { crumbs.push({ label: profileStudent.name }); content = <TeacherStudentProfile data={data} studentId={profileStudent.id} onReview={openReview} onBack={() => setPage("Students")} onOpenCase={supportHandlers.onOpenCase} onSend={sendToStudent}/>; }
    else content = <TeacherStudents data={data} searchTerm={searchTerm} onSearch={setSearchTerm} onReview={openReview} onProfile={(id) => { setDetailId(id); window.scrollTo({ top: 0 }); }}/>;
  } else if (role === "Teacher" && active === "Create assessment") {
    content = <TeacherAssessments key={createPreset?.key ?? "create"} practice={createPreset ?? undefined} data={data} tabRoute={createTab} onTabRoute={(tab) => { setCreateTab(tab); window.scrollTo({ top: 0 }); }} onSaveTemplate={saveTemplate} onAssign={assignTemplate} onSaveQuestion={saveCustomQuestion} onDeleteQuestion={deleteCustomQuestion} onDeleteTemplate={deleteTemplate} toast={toast}/>;
  } else if (role === "Teacher" && active === "Help requests") {
    content = <TeacherHelpRequests data={data} onReply={replyToHelp} onNoteSeen={markParentNoteSeen}/>;
  } else if (role === "Student" && active === "Home") {
    content = <StudentHome data={data} onOpen={setPage} onOpenResult={(id) => { setPage("My results"); setDetailId(id); }} onMarkSeen={(id) => markNotificationSeen(id, "student")}/>;
  } else if (role === "Student" && active === "My work") {
    content = <StudentAssessments data={data} onUpload={startUpload} onResults={(id) => { setPage("My results"); setDetailId(id); }}/>;
  } else if (role === "Student" && active === "My results") {
    const open = detailId ? data.submissions.find((item) => item.id === detailId && item.status === "published" && item.studentId === DEMO_STUDENT_ID) : undefined;
    if (open) crumbs.push({ label: getAssessment(data, open.assessmentId).title });
    content = <StudentProgress data={data} openId={detailId} onOpen={(id) => { setDetailId(id); window.scrollTo({ top: 0 }); }} onPractise={(assessmentId, topicKey, questionId) => { setPage("Get help"); setHelpStart({ assessmentId, topicKey, questionId }); }}/>;
  } else if (role === "Student" && active === "Get help") {
    content = <AskForHelp key={helpFocus ?? (helpStart ? `start-${helpStart.assessmentId}-${helpStart.topicKey}-${helpStart.questionId ?? ""}` : "help")} data={data} focusId={helpFocus} start={helpStart ?? undefined} onCreateHelp={createHelp} onRateHelp={rateHelp}/>;
  } else if (role === "Parent" && active === "Home") {
    content = <ParentHome data={data} onOpen={setPage} onOpenFeedback={(id) => { setPage("Teacher feedback"); setDetailId(id); }}/>;
  } else if (role === "Parent" && active === "Results") {
    content = <ParentResults data={data} onOpenFeedback={(id) => { setPage("Teacher feedback"); setDetailId(id); }}/>;
  } else if (role === "Parent" && active === "Teacher feedback") {
    content = <ParentFeedback key={detailId ?? "all"} data={data} openId={detailId} onRead={markParentRead}/>;
  } else if (role === "Parent" && active === "Practise at home") {
    content = <ParentPractise data={data} onPractised={logPractice}/>;
  } else {
    content = <div className="empty">This view is not available in the current demo role.</div>;
  }
  if (active === "Home" && !reviewing) crumbs = [{ label: "Home" }];
  const openHelpCount = data.helpRequests.filter((request) => request.kind === "teacher" && request.status === "open").length;
  const counts: Record<string, number> = role === "Teacher" ? { "Review submissions": reviewQueue.filter((submission) => queueState(data, submission) !== STATE_READY).length, "Help requests": openHelpCount, "Flagged students": classOverview(data).newFlags } : {};
  return <div className="app-shell"><a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); const main = document.getElementById("main"); main?.focus(); main?.scrollIntoView(); }}>Skip to content</a><Sidebar active={reviewing ? "Review submissions" : active} setActive={setPage} role={role} setRole={changeRole} counts={counts} onOpenHelp={() => setShowHelp(true)}/><div className="main-shell"><Topbar role={role} crumbs={crumbs} notifications={notificationItems} notificationsOpen={notificationsOpen} onNotificationsToggle={() => setNotificationsOpen((current) => !current)} onSelectNotification={selectNotification} onMarkAllRead={role === "Teacher" ? undefined : markAllRead} onMarkRead={role === "Student" ? (item) => markStudentRead([item.id]) : undefined}/><main id="main" tabIndex={-1} className={`main ${role === "Student" ? "student-ui" : ""} ${reviewing ? "review-main" : ""}`}>{content}</main></div>{storageWarning && <div className="storage-warning" role="status">Brightpath couldn’t safely save changes in this browser. Keep this page open; saved records were left untouched.</div>}{notice && <div className={`toast ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}><span><Icon name={notice.kind === "error" ? "alert" : notice.kind === "ok" ? "check" : "help"} size={16}/></span>{notice.text}</div>}{showHelp && <DemoHelpDialog onClose={() => setShowHelp(false)}/>}</div>;
}
