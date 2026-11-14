import { gradeAnswer, type CustomRubric } from "./grading";
import { demoAnswerFor, hashSeed, simulateOcr, type DemoLevel } from "./demoAnswers";

export { gradeAnswer } from "./grading";

export type Language = "en" | "de";
export type SubmissionStatus = "processing" | "needs_review" | "published";
export type FlagDecision = "pending" | "confirmed" | "dismissed";
export type ConfidenceLevel = "low" | "medium" | "high";
export type DifficultyLevel = "easy" | "medium" | "difficult";
export type HelpKind = "hint" | "example" | "teacher";

export interface StudentRecord {
  id: string;
  name: string;
  initials: string;
  grade: string;
  age: number;
  color: string;
}

export interface QuestionDefinition {
  id: string;
  prompt: string;
  maxScore: number;
  topicKey: string;
  topicLabel: string;
  keyTerms: string[];
  sampleAnswer: string;
  modelAnswer: string;
  positiveFeedback: string;
  supportFeedback: string;
  /** Enhancement stage: set only on questions written by the teacher. */
  custom?: boolean;
  difficulty?: DifficultyLevel;
  rubric?: CustomRubric;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questions: Record<Language, QuestionDefinition[]>;
}

export interface AnswerRecord {
  questionId: string;
  sourceText: string;
  extractedText: string;
  ocrConfidence: number;
  verified: boolean;
  aiScore: number;
  teacherScore: number;
  aiFeedback: string;
  teacherFeedback: string;
  confidence: ConfidenceLevel;
  aiMatchedTerms?: string[];
  aiMissingTerms?: string[];
  aiRationale?: string;
  /** Words the simulated OCR was unsure about; cleared as the teacher corrects them. */
  ocrUncertain?: string[];
  /** "ai": the mark still mirrors the AI suggestion. "teacher": the teacher set the mark or verified the
   *  answer, so it is teacher-approved and never changes automatically, even if it equals the AI mark. */
  markSource?: "ai" | "teacher";
  /** Same rule for the feedback text. */
  feedbackSource?: "ai" | "teacher";
  /** The answer text changed after the mark was teacher-approved and the AI now suggests a different mark. */
  suggestionChanged?: boolean;
  /** Every change the teacher made to this mark, oldest first. The AI suggestion (aiScore) is never overwritten by it. */
  markHistory?: MarkChange[];
}

export interface MarkChange { at: string; from: number; to: number; aiScore: number; by: "teacher" | "accept-ai" | "keep-own" }

export interface AttentionFlag {
  id: string;
  topicKey: string;
  title: string;
  description: string;
  severity: "High" | "Watch";
  decision: FlagDecision;
}

export interface SubmissionRecord {
  id: string;
  studentId: string;
  assessmentId: string;
  language: Language;
  fileName: string;
  uploadedAt: string;
  status: SubmissionStatus;
  answers: AnswerRecord[];
  learningGaps: string[];
  learningGapDecisions?: Record<string, FlagDecision>;
  flags: AttentionFlag[];
  publishedAt?: string;
  notificationSeen: boolean;
  /** Each role dismisses its own "new result" notice. Falls back to notificationSeen in older records. */
  seenBy?: { student: boolean; parent: boolean };
  questionIds?: string[];
  templateId?: string;
  confidenceRatings?: Record<string, ConfidenceLevel>;
  /** The assignment this upload answers. One submission per assignment. */
  assignmentId?: string;
  /** Present while a published result is reopened for correction. Holds the version that was shared,
   *  so cancelling the correction puts it back exactly. */
  reopened?: { at: string; reason: string; previous: PublishedSnapshot };
  /** Earlier shared versions of this result, oldest first. */
  revisions?: RevisionRecord[];
  /** The latest publication corrected an earlier shared version. */
  resultUpdated?: boolean;
  /** A personal message from the teacher for the whole assessment, shared with the result (optional). */
  overallFeedback?: string;
  /** Teacher-approved summary shown to the student in its own sections (used by the predefined demo result). */
  resultHighlights?: { weakness: string; recurringError: string; support: string };
  /** Predefined demonstration record (not made from an uploaded paper in this session). */
  demo?: boolean;
  /** Who sent the work. The teacher can upload a scan for a student; then no confidence ratings exist. */
  uploadedBy?: "student" | "teacher";
  /** Enhancement stage (optional): each time the parent marked this result as read, with an optional
   *  short note for the teacher. A read counts for the version shared at that time. */
  parentReads?: ParentReadRecord[];
}

export interface ParentReadRecord { at: string; note?: string; teacherSeenAt?: string }

/** Enhancement stage (optional): the parent ticked "We practised this" for a topic. */
export interface PracticeLogEntry { id: string; studentId: string; topicKey: string; at: string }

export type PublishedSnapshot = Pick<SubmissionRecord, "answers" | "learningGaps" | "learningGapDecisions" | "flags" | "publishedAt" | "notificationSeen" | "seenBy" | "resultUpdated" | "overallFeedback">;

export interface RevisionRecord {
  publishedAt: string;
  score: number;
  maxScore: number;
  reopenedAt: string;
  reason: string;
}

/** Which kinds of help a student may ask for on one assignment. Missing = everything allowed. */
export interface HelpSettings { hints: boolean; examples: boolean; teacher: boolean }

export interface AssignmentRecord {
  id?: string;
  studentId: string;
  assessmentId: string;
  templateId?: string;
  /** Enhancement stage (all optional; older records simply don't have them). */
  assignedAt?: string;
  dueDate?: string;
  help?: HelpSettings;
}

export type DifficultyTarget = Record<DifficultyLevel, number>;

export interface AssessmentTemplateRecord {
  id: string;
  title: string;
  assessmentId: string;
  questionIds: string[];
  createdAt: string;
  /** Enhancement stage (optional): the difficulty mix the teacher aimed for, and difficulty levels the
   *  teacher changed for this template. Built-in levels are used for any question not listed. */
  targets?: DifficultyTarget;
  difficultyOverrides?: Record<string, DifficultyLevel>;
  /** Create Assessment page (optional): a short description, the language chosen, and the learning objectives (topic keys). */
  description?: string;
  language?: Language;
  objectives?: string[];
}

export interface HelpRequestRecord {
  id: string;
  studentId: string;
  assignmentId: string;
  assessmentId: string;
  questionId: string;
  language: Language;
  kind: HelpKind;
  message: string;
  createdAt: string;
  status: "open" | "answered";
  response?: string;
  responseAt?: string;
  /** False while the student has not yet opened a teacher reply. */
  responseSeen?: boolean;
  /** Enhancement stage (optional). Hints have two levels: 1 = small hint, 2 = bigger hint (missing = 1). */
  level?: 1 | 2;
  /** The student's answer to "Did this help?" (missing = not answered). */
  helpful?: boolean;
  /** For "Ask my teacher": what the student already tried. */
  tried?: string;
}

export interface AssessmentAppData {
  version: 1 | 2 | 3 | 4 | 5;
  students: StudentRecord[];
  assessments: AssessmentDefinition[];
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];
  templates: AssessmentTemplateRecord[];
  helpRequests: HelpRequestRecord[];
  /** Enhancement stage (optional; older saved data has none). */
  practiceLog?: PracticeLogEntry[];
  /** Enhancement stage (optional): questions written by the teacher. */
  customQuestions?: CustomQuestionRecord[];
  /** Flagged students (optional, teacher-only): the teacher's decisions, notes and support given per student. */
  supportCases?: SupportCaseRecord[];
  /** Messages for students, created by teacher actions (sharing a result, replying, sending a note). Optional. */
  notifications?: StudentNotificationRecord[];
  /** Set once the four demo notifications were added, so they are never added again (even if read or removed). */
  demoNotificationsSeeded?: number;
  /** Set once the predefined 72% demo result (and its question, template and assignment) was added. */
  demoResultSeeded?: number;
}

export type NotificationKind = "result" | "result-updated" | "reply" | "feedback" | "practice" | "review-topic" | "support";
/** One message in a student's notification list. Only student-safe text: never AI analysis or teacher-only notes. */
export interface StudentNotificationRecord {
  id: string;
  studentId: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  submissionId?: string;
  assessmentId?: string;
  topicKey?: string;
  helpRequestId?: string;
  /** The same action never creates the same notification twice. */
  key: string;
  /** Predefined demonstration notification shipped with the demo (not created by a teacher action in this session). */
  demo?: boolean;
  /** Shown type, when it differs from the kind's default wording (demo notifications). */
  label?: string;
  /** Shown topic, when it isn't one of the question topics (for example "Fractions"). */
  topicLabel?: string;
  grade?: number;
  /** Where opening it leads. Only existing pages: My results, one result, Get help (optionally on a topic). */
  action?: { label: string; to: "results" | "result" | "practice" | "help"; submissionId?: string; assessmentId?: string; topicKey?: string };
}

/** The four predefined demo notifications for the demo student (Omar). Added once; never to other students. */
export function demoStudentNotifications(): StudentNotificationRecord[] {
  const base = { studentId: DEMO_STUDENT_ID, demo: true };
  return [
    { ...base, id: "demo-note-grade", key: "demo:grade", kind: "result", label: "Grade", grade: 72, title: "New assessment result!", message: "Your teacher has published your assessment results. You received 72%. Open your results to see how you did.", createdAt: "2026-11-10T15:00:00.000Z", submissionId: DEMO_RESULT_ID, assessmentId: "fractions", action: { label: "Open Results", to: "result", submissionId: DEMO_RESULT_ID } },
    { ...base, id: "demo-note-weakness", key: "demo:weakness", kind: "practice", label: "Learning Recommendation", topicLabel: "Fractions", assessmentId: "fractions", topicKey: "fraction-comparison", title: "Let's practise fractions!", message: "Your results show that fractions are a topic you can improve. Let's practise comparing fractions together.", createdAt: "2026-11-11T09:30:00.000Z", action: { label: "Practise Fractions", to: "practice", assessmentId: "fractions", topicKey: "fraction-comparison" } },
    { ...base, id: "demo-note-tip", key: "demo:tip", kind: "feedback", label: "Teacher Feedback", topicLabel: "Incorrect comparison of fractions", assessmentId: "fractions", topicKey: "fraction-comparison", title: "A little tip for you!", message: "Remember to compare fractions carefully. Think about whether the fractions have the same denominator before comparing them.", createdAt: "2026-11-12T11:15:00.000Z", readAt: "2026-11-12T17:40:00.000Z", action: { label: "Review Fractions", to: "result", submissionId: "demo-omar-fractions" } },
    { ...base, id: "demo-note-support", key: "demo:support", kind: "support", label: "Additional Support", topicLabel: "Fractions", title: "Your teacher is here to help!", message: "Your teacher recommends some extra practice with fractions. Don't worry – you can improve with practice!", createdAt: "2026-11-13T08:45:00.000Z", action: { label: "Get Help", to: "help" } },
  ];
}

/** Support given to a student, recorded by the teacher. `demo` marks simulated records shipped with the demo. */
export type SupportKind = "reteach" | "practice" | "visual" | "one-to-one" | "monitor" | "other";
export interface SupportActionRecord { id: string; at: string; kind: SupportKind; topicKey?: string; note: string; demo?: boolean }
export interface SupportNoteRecord { id: string; at: string; text: string; demo?: boolean }
export type SupportDecision = "confirmed" | "dismissed" | "resolved" | "reopened";
export interface SupportCaseRecord {
  studentId: string;
  /** The teacher's latest decision about the flag; undefined until the teacher decides. */
  decision?: Exclude<SupportDecision, "reopened">;
  decidedAt?: string;
  /** Why the flag was dismissed or resolved. */
  reason?: string;
  history: { at: string; decision: SupportDecision; reason?: string; demo?: boolean }[];
  notes: SupportNoteRecord[];
  actions: SupportActionRecord[];
  demo?: boolean;
}

/** Simulated support records so the demo can show "support given" and before/after comparisons.
 *  They are labelled as demo data everywhere they appear and are not real teacher interventions. */
export function demoSupportCases(): SupportCaseRecord[] {
  return [
    { studentId: "tarek", demo: true, decision: "confirmed", decidedAt: "2026-10-16T09:00:00.000Z",
      history: [{ at: "2026-10-16T09:00:00.000Z", decision: "confirmed", demo: true }],
      notes: [{ id: "demo-note-tarek", at: "2026-10-16T09:05:00.000Z", text: "Simulated demo note: mixes up which fraction is bigger.", demo: true }],
      actions: [{ id: "demo-support-tarek", at: "2026-10-20T10:00:00.000Z", kind: "practice", topicKey: "fraction-comparison", note: "Simulated demo record: three short practice tasks on comparing fractions with fraction strips.", demo: true }] },
    { studentId: "omar", demo: true,
      history: [],
      notes: [],
      actions: [{ id: "demo-support-omar", at: "2026-10-01T10:00:00.000Z", kind: "visual", topicKey: "plant-vocabulary", note: "Simulated demo record: labelled plant diagram used to revise the parts of a plant.", demo: true }] },
  ];
}

/** A teacher-written question. Only "ready" questions that pass validation are added to their assessment,
 *  so a question without valid marking criteria never reaches templates, uploads or grading. */
export interface CustomQuestionRecord {
  id: string;
  assessmentId: string;
  language: Language;
  status: "draft" | "ready";
  createdAt: string;
  updatedAt?: string;
  question: QuestionDefinition;
}

const difficultyByQuestionId: Record<string, DifficultyLevel> = {
  "plant-parts": "easy", pollination: "medium", "seed-dispersal": "difficult", "plant-needs": "easy",
  "fraction-meaning": "easy", "compare-fractions": "medium", "fraction-model": "easy", "equivalent-fractions": "difficult",
  "water-cycle": "medium", "measure-weather": "easy", "weather-patterns": "difficult",
  "length-measure": "easy", "data-graph": "medium", "time-conversion": "difficult",
  // Added in the enhancement stage, so each assessment has 2 easy, 2 medium and 2 difficult questions.
  "life-cycle": "medium", "dark-cupboard": "difficult",
  "fraction-of-set": "medium", "add-fractions": "difficult",
  "rain-gauge": "easy", "puddle-sun": "medium", "thunder-lightning": "difficult",
  "perimeter": "medium", "grams-kilograms": "easy", "film-length": "difficult",
};

/** Questions added in the enhancement stage. Demo records dated before then were written without them. */
export const ADDED_QUESTION_IDS = new Set(["life-cycle", "dark-cupboard", "fraction-of-set", "add-fractions", "rain-gauge", "puddle-sun", "thunder-lightning", "perimeter", "grams-kilograms", "film-length"]);

export function getQuestionDifficulty(questionId: string): DifficultyLevel {
  return difficultyByQuestionId[questionId] ?? "medium";
}

const scienceQuestions: Record<Language, QuestionDefinition[]> = {
  en: [
    { id: "plant-parts", prompt: "Name two parts of a plant and describe what one does.", maxScore: 4, topicKey: "plant-vocabulary", topicLabel: "Plant vocabulary", keyTerms: ["root", "stem", "leaf", "flower"], sampleAnswer: "The roots take in water and the stem holds the plant up. Leaves make food.", modelAnswer: "Roots take in water; the stem supports the plant; leaves make food; flowers help make seeds.", positiveFeedback: "You named plant parts and explained their jobs clearly.", supportFeedback: "Try naming a root, stem, leaf, or flower, then tell what that part does." },
    { id: "pollination", prompt: "Explain how pollination helps a plant reproduce.", maxScore: 4, topicKey: "plant-vocabulary", topicLabel: "Plant vocabulary", keyTerms: ["pollen", "flower", "seeds", "bees"], sampleAnswer: "Bees carry pollen from one flower to another, and then the plant can make seeds.", modelAnswer: "Pollinators move pollen between flowers so the plant can make seeds.", positiveFeedback: "You connected pollen moving between flowers to seed production.", supportFeedback: "Remember: pollination moves pollen between flowers and helps seeds form." },
    { id: "seed-dispersal", prompt: "Describe one way seeds travel away from a plant.", maxScore: 4, topicKey: "seed-dispersal", topicLabel: "Seed dispersal", keyTerms: ["seeds", "wind", "animals", "travel"], sampleAnswer: "The wind can carry light seeds away from the parent plant.", modelAnswer: "Wind, water, or animals can carry seeds away from the parent plant.", positiveFeedback: "You described how seeds travel away from the parent plant.", supportFeedback: "Think about wind, water, or animals carrying seeds to a new place." },
    { id: "plant-needs", prompt: "What does a plant need to grow well?", maxScore: 4, topicKey: "plant-needs", topicLabel: "Plant needs", keyTerms: ["water", "sunlight", "air", "soil"], sampleAnswer: "Plants need water, sunlight, air, and nutrients from soil to grow.", modelAnswer: "Most plants need water, sunlight, air, and nutrients from soil.", positiveFeedback: "You remembered the main things a plant needs to grow.", supportFeedback: "Check your answer for water, sunlight, air, and nutrients from soil." },
    { id: "life-cycle", prompt: "Put these stages of a bean plant’s life in order: flower, seed, adult plant, seedling.", maxScore: 4, topicKey: "plant-life-cycle", topicLabel: "Plant life cycle", keyTerms: ["seed", "seedling", "adult plant", "flower"], sampleAnswer: "First a seed, then a seedling, then an adult plant, and then a flower.", modelAnswer: "Seed → seedling → adult plant → flower (which makes new seeds).", positiveFeedback: "You put every stage of the life cycle in the right order.", supportFeedback: "Start with what you plant in the soil, then think about what grows from it." },
    { id: "dark-cupboard", prompt: "A plant is kept in a dark cupboard for two weeks. Why does it start to die?", maxScore: 4, topicKey: "plant-needs", topicLabel: "Plant needs", keyTerms: ["light", "leaves", "food", "dark"], sampleAnswer: "The leaves need light to make food, so without light the plant runs out of food.", modelAnswer: "There is no light, and leaves need light to make the plant’s food, so the plant runs out of energy.", positiveFeedback: "You explained that leaves need light to make food.", supportFeedback: "Think about what is missing in the cupboard and what the leaves do with it." },
  ],
  de: [
    { id: "plant-parts", prompt: "Nenne zwei Teile einer Pflanze und erkläre die Aufgabe eines Teils.", maxScore: 4, topicKey: "plant-vocabulary", topicLabel: "Pflanzenwortschatz", keyTerms: ["wurzel", "stängel", "blatt", "blüte"], sampleAnswer: "Die Wurzel nimmt Wasser auf und der Stängel hält die Pflanze. Blätter machen Nahrung.", modelAnswer: "Die Wurzel nimmt Wasser auf, der Stängel stützt die Pflanze, Blätter bilden Nahrung und Blüten helfen bei der Samenbildung.", positiveFeedback: "Du hast Pflanzenteile genannt und ihre Aufgaben gut erklärt.", supportFeedback: "Nenne eine Wurzel, einen Stängel, ein Blatt oder eine Blüte und erkläre die Aufgabe." },
    { id: "pollination", prompt: "Erkläre, wie Bestäubung einer Pflanze bei der Fortpflanzung hilft.", maxScore: 4, topicKey: "plant-vocabulary", topicLabel: "Pflanzenwortschatz", keyTerms: ["pollen", "blüte", "samen", "bienen"], sampleAnswer: "Bienen tragen Pollen von einer Blüte zur nächsten. Dann kann die Pflanze Samen bilden.", modelAnswer: "Bestäuber übertragen Pollen zwischen Blüten, damit die Pflanze Samen bilden kann.", positiveFeedback: "Du hast Pollenübertragung und Samenbildung miteinander verbunden.", supportFeedback: "Merke: Bei der Bestäubung wird Pollen zwischen Blüten übertragen und Samen können entstehen." },
    { id: "seed-dispersal", prompt: "Beschreibe eine Möglichkeit, wie Samen von einer Pflanze wegkommen.", maxScore: 4, topicKey: "seed-dispersal", topicLabel: "Samenverbreitung", keyTerms: ["samen", "wind", "tiere", "verbreiten"], sampleAnswer: "Der Wind kann leichte Samen von der Mutterpflanze wegtragen.", modelAnswer: "Wind, Wasser oder Tiere können Samen von der Mutterpflanze wegtragen.", positiveFeedback: "Du hast erklärt, wie Samen von der Mutterpflanze wegkommen.", supportFeedback: "Überlege, wie Wind, Wasser oder Tiere Samen an einen neuen Ort bringen." },
    { id: "plant-needs", prompt: "Was braucht eine Pflanze, um gut zu wachsen?", maxScore: 4, topicKey: "plant-needs", topicLabel: "Pflanzenbedarf", keyTerms: ["wasser", "sonnenlicht", "luft", "boden"], sampleAnswer: "Pflanzen brauchen Wasser, Sonnenlicht, Luft und Nährstoffe aus dem Boden.", modelAnswer: "Die meisten Pflanzen brauchen Wasser, Sonnenlicht, Luft und Nährstoffe aus dem Boden.", positiveFeedback: "Du hast die wichtigsten Dinge genannt, die eine Pflanze zum Wachsen braucht.", supportFeedback: "Prüfe, ob Wasser, Sonnenlicht, Luft und Nährstoffe aus dem Boden vorkommen." },
    { id: "life-cycle", prompt: "Bringe die Stadien im Leben einer Bohnenpflanze in die richtige Reihenfolge: Blüte, Samen, ausgewachsene Pflanze, Keimling.", maxScore: 4, topicKey: "plant-life-cycle", topicLabel: "Lebenszyklus der Pflanze", keyTerms: ["samen", "keimling", "pflanze", "blüte"], sampleAnswer: "Zuerst ein Samen, dann ein Keimling, dann eine ausgewachsene Pflanze und dann eine Blüte.", modelAnswer: "Samen → Keimling → ausgewachsene Pflanze → Blüte (die neue Samen bildet).", positiveFeedback: "Du hast alle Stadien des Lebenszyklus richtig geordnet.", supportFeedback: "Beginne mit dem, was man in die Erde steckt, und überlege, was daraus wächst." },
    { id: "dark-cupboard", prompt: "Eine Pflanze steht zwei Wochen in einem dunklen Schrank. Warum geht sie langsam ein?", maxScore: 4, topicKey: "plant-needs", topicLabel: "Pflanzenbedarf", keyTerms: ["licht", "blätter", "nahrung", "dunkel"], sampleAnswer: "Die Blätter brauchen Licht, um Nahrung zu machen. Ohne Licht hat die Pflanze keine Nahrung.", modelAnswer: "Es gibt kein Licht, und die Blätter brauchen Licht, um Nahrung für die Pflanze zu bilden. Deshalb fehlt ihr Energie.", positiveFeedback: "Du hast erklärt, dass Blätter Licht brauchen, um Nahrung zu bilden.", supportFeedback: "Überlege, was im Schrank fehlt und was die Blätter damit machen." },
  ],
};

const fractionQuestions: Record<Language, QuestionDefinition[]> = {
  en: [
    { id: "fraction-meaning", prompt: "What does the fraction 3/4 mean?", maxScore: 4, topicKey: "fraction-meaning", topicLabel: "Understanding fractions", keyTerms: ["three", "parts", "four", "equal"], sampleAnswer: "It means three equal parts out of four equal parts.", modelAnswer: "Three of four equal-sized parts make up the whole.", positiveFeedback: "You explained the numerator and denominator using equal parts.", supportFeedback: "The top number counts parts; the bottom number tells how many equal parts make the whole." },
    { id: "compare-fractions", prompt: "Which is larger, 1/2 or 1/4? Explain why.", maxScore: 4, topicKey: "fraction-comparison", topicLabel: "Comparing fractions", keyTerms: ["one half", "larger", "same", "whole"], sampleAnswer: "One half is larger. If a whole is split into the same size pieces, one half is more than one quarter.", modelAnswer: "One half is larger because dividing the same whole into two equal parts makes each part larger than dividing it into four.", positiveFeedback: "You compared the size of the pieces in the same whole.", supportFeedback: "Draw the same whole twice: split one into two equal parts and one into four." },
    { id: "fraction-model", prompt: "A pizza has 8 equal slices. You eat 2. What fraction did you eat?", maxScore: 4, topicKey: "fraction-model", topicLabel: "Fraction models", keyTerms: ["two", "eight", "2/8", "slices"], sampleAnswer: "I ate two slices out of eight, so I ate 2/8 of the pizza.", modelAnswer: "2/8, because 2 of the 8 equal slices were eaten.", positiveFeedback: "You matched the number eaten with the total number of equal slices.", supportFeedback: "Put the slices eaten on top and all equal slices on the bottom." },
    { id: "equivalent-fractions", prompt: "Give a fraction equal to 1/2 and explain how you know.", maxScore: 4, topicKey: "equivalent-fractions", topicLabel: "Equivalent fractions", keyTerms: ["2/4", "equal", "same", "half"], sampleAnswer: "2/4 is equal to 1/2 because both show the same half of a whole.", modelAnswer: "2/4 is equivalent to 1/2 because multiplying the top and bottom by 2 keeps the value the same.", positiveFeedback: "You gave an equivalent fraction and explained that it has the same value.", supportFeedback: "Try multiplying both the top and bottom of 1/2 by the same number." },
    { id: "fraction-of-set", prompt: "There are 12 apples. 1/3 of them are red. How many apples are red? Show how you know.", maxScore: 4, topicKey: "fraction-of-amount", topicLabel: "Fractions of an amount", keyTerms: ["4", "12", "3 groups", "share"], sampleAnswer: "4 apples are red, because 12 divided into 3 equal groups gives 4 in each group.", modelAnswer: "4, because 1/3 of 12 means sharing 12 into 3 equal groups: 12 ÷ 3 = 4.", positiveFeedback: "You found one third of 12 by sharing into equal groups.", supportFeedback: "Share the 12 apples into 3 equal groups and count one group." },
    { id: "add-fractions", prompt: "Mia eats 1/5 of a cake and Ben eats 2/5. What fraction of the cake did they eat together? Explain.", maxScore: 4, topicKey: "fraction-addition", topicLabel: "Adding fractions", keyTerms: ["3/5", "fifths", "add", "same"], sampleAnswer: "Together they ate 3/5, because 1 + 2 = 3 and the fifths stay the same.", modelAnswer: "3/5: the pieces are all fifths, so add the top numbers (1 + 2 = 3) and keep the denominator 5.", positiveFeedback: "You added the fifths and kept the denominator the same.", supportFeedback: "The pieces are all fifths. Count how many fifths were eaten in total." },
  ],
  de: [
    { id: "fraction-meaning", prompt: "Was bedeutet der Bruch 3/4?", maxScore: 4, topicKey: "fraction-meaning", topicLabel: "Brüche verstehen", keyTerms: ["drei", "teile", "vier", "gleich"], sampleAnswer: "Es bedeutet drei gleich große Teile von vier gleich großen Teilen.", modelAnswer: "Drei von vier gleich großen Teilen bilden das Ganze.", positiveFeedback: "Du hast Zähler und Nenner mit gleich großen Teilen erklärt.", supportFeedback: "Der Zähler zählt die Teile. Der Nenner sagt, in wie viele gleich große Teile das Ganze geteilt ist." },
    { id: "compare-fractions", prompt: "Welcher Bruch ist größer: 1/2 oder 1/4? Begründe deine Antwort.", maxScore: 4, topicKey: "fraction-comparison", topicLabel: "Brüche vergleichen", keyTerms: ["hälfte", "größer", "gleich", "ganzes"], sampleAnswer: "Eine Hälfte ist größer. Bei demselben Ganzen ist ein Teil von zwei größer als ein Teil von vier.", modelAnswer: "Eine Hälfte ist größer, weil ein Ganzes in zwei gleich große Teile geteilt größere Teile ergibt als eine Teilung in vier.", positiveFeedback: "Du hast die Größe der Teile desselben Ganzen verglichen.", supportFeedback: "Zeichne dasselbe Ganze zweimal: Teile eins in zwei und eins in vier gleich große Teile." },
    { id: "fraction-model", prompt: "Eine Pizza hat 8 gleich große Stücke. Du isst 2. Welchen Bruch hast du gegessen?", maxScore: 4, topicKey: "fraction-model", topicLabel: "Bruchmodelle", keyTerms: ["zwei", "acht", "2/8", "stücke"], sampleAnswer: "Ich habe zwei von acht Stücken gegessen. Das ist 2/8 der Pizza.", modelAnswer: "2/8, weil 2 von 8 gleich großen Stücken gegessen wurden.", positiveFeedback: "Du hast die gegessenen Stücke und alle gleich großen Stücke richtig zugeordnet.", supportFeedback: "Die gegessenen Stücke stehen oben, alle gleich großen Stücke unten." },
    { id: "equivalent-fractions", prompt: "Nenne einen Bruch, der 1/2 entspricht, und erkläre warum.", maxScore: 4, topicKey: "equivalent-fractions", topicLabel: "Gleichwertige Brüche", keyTerms: ["2/4", "gleich", "selbe", "hälfte"], sampleAnswer: "2/4 ist gleich 1/2, weil beide denselben Anteil eines Ganzen zeigen.", modelAnswer: "2/4 entspricht 1/2, weil Zähler und Nenner mit derselben Zahl multipliziert wurden.", positiveFeedback: "Du hast einen gleichwertigen Bruch genannt und den gleichen Wert erklärt.", supportFeedback: "Multipliziere Zähler und Nenner von 1/2 mit derselben Zahl." },
    { id: "fraction-of-set", prompt: "Es gibt 12 Äpfel. 1/3 davon ist rot. Wie viele Äpfel sind rot? Zeige, wie du es weißt.", maxScore: 4, topicKey: "fraction-of-amount", topicLabel: "Bruchteile von Mengen", keyTerms: ["4", "12", "3 gruppen", "verteilen"], sampleAnswer: "4 Äpfel sind rot, weil 12 geteilt durch 3 gleich 4 ist.", modelAnswer: "4, denn 1/3 von 12 bedeutet, 12 auf 3 gleiche Gruppen zu verteilen: 12 : 3 = 4.", positiveFeedback: "Du hast ein Drittel von 12 durch gleiches Verteilen gefunden.", supportFeedback: "Verteile die 12 Äpfel auf 3 gleiche Gruppen und zähle eine Gruppe." },
    { id: "add-fractions", prompt: "Mia isst 1/5 von einem Kuchen und Ben isst 2/5. Welchen Bruchteil haben sie zusammen gegessen? Erkläre.", maxScore: 4, topicKey: "fraction-addition", topicLabel: "Brüche addieren", keyTerms: ["3/5", "fünftel", "addieren", "gleich"], sampleAnswer: "Zusammen haben sie 3/5 gegessen, weil 1 + 2 = 3 ist und die Fünftel gleich bleiben.", modelAnswer: "3/5: Alle Stücke sind Fünftel, also addiert man die Zähler (1 + 2 = 3) und der Nenner 5 bleibt.", positiveFeedback: "Du hast die Fünftel addiert und den Nenner gleich gelassen.", supportFeedback: "Alle Stücke sind Fünftel. Zähle, wie viele Fünftel zusammen gegessen wurden." },
  ],
};

const weatherQuestions: Record<Language, QuestionDefinition[]> = {
  en: [
    { id: "water-cycle", prompt: "Describe how water can move from a puddle into a cloud and back to Earth.", maxScore: 4, topicKey: "water-cycle", topicLabel: "Water cycle", keyTerms: ["water", "sun", "clouds", "rain"], sampleAnswer: "The sun warms water, and water vapor rises into clouds. It later falls as rain.", modelAnswer: "The sun warms water so it evaporates, forms clouds, and later falls as rain.", positiveFeedback: "You connected warming, clouds, and rainfall in the water cycle.", supportFeedback: "Start with the sun warming water. What forms in the sky before rain falls?" },
    { id: "measure-weather", prompt: "How could you measure and record the temperature for a weather report?", maxScore: 4, topicKey: "weather-observation", topicLabel: "Weather observations", keyTerms: ["temperature", "thermometer", "record", "forecast"], sampleAnswer: "Use a thermometer to measure the temperature, record the number, and include it in the forecast.", modelAnswer: "Read the thermometer, record the temperature with a unit, and use it in the forecast.", positiveFeedback: "You described a tool, a measurement, and how to use the result.", supportFeedback: "Name a tool for temperature, then explain how you would write down its reading." },
    { id: "weather-patterns", prompt: "Why can dark clouds be a clue that rain may be coming?", maxScore: 4, topicKey: "weather-patterns", topicLabel: "Weather patterns", keyTerms: ["clouds", "cool", "water droplets", "rain"], sampleAnswer: "Clouds can cool as they rise. Water droplets collect and may become heavy enough to fall as rain.", modelAnswer: "Rising air cools, droplets gather in clouds, and heavy droplets can fall as rain.", positiveFeedback: "You linked cooling and water droplets to possible rainfall.", supportFeedback: "Think about what happens to water droplets when air cools and they gather in a cloud." },
    { id: "rain-gauge", prompt: "Which tool measures how much rain has fallen, and how do you use it?", maxScore: 4, topicKey: "weather-observation", topicLabel: "Weather observations", keyTerms: ["rain gauge", "collect", "read", "millimeters"], sampleAnswer: "A rain gauge collects the rain, and you read the water level on its scale in millimeters.", modelAnswer: "A rain gauge: it collects falling rain, and you read the water level on its scale (in millimeters).", positiveFeedback: "You named the rain gauge and explained how to read it.", supportFeedback: "Name the tool that catches rain, then say how you find out how much fell." },
    { id: "puddle-sun", prompt: "Why does a puddle dry up faster on a sunny day than on a cloudy day?", maxScore: 4, topicKey: "water-cycle", topicLabel: "Water cycle", keyTerms: ["sun", "warm", "evaporate", "air"], sampleAnswer: "The sun heats the puddle, so the water evaporates and rises into the air faster.", modelAnswer: "The sun warms the water, and warm water evaporates into the air more quickly.", positiveFeedback: "You linked the sun’s heat to faster evaporation.", supportFeedback: "Think about what the sun does to the water, and where the water goes." },
    { id: "thunder-lightning", prompt: "In a storm, why do we see lightning before we hear thunder?", maxScore: 4, topicKey: "weather-patterns", topicLabel: "Weather patterns", keyTerms: ["light", "sound", "faster", "slower"], sampleAnswer: "Light travels much faster than sound, so the flash reaches us before the thunder.", modelAnswer: "Light travels much faster than sound, so we see the flash before the sound of the thunder reaches us.", positiveFeedback: "You compared the speed of light and sound.", supportFeedback: "Think about speed: does light or sound reach you first?" },
  ],
  de: [
    { id: "water-cycle", prompt: "Beschreibe, wie Wasser aus einer Pfütze in eine Wolke und zurück zur Erde gelangt.", maxScore: 4, topicKey: "water-cycle", topicLabel: "Wasserkreislauf", keyTerms: ["wasser", "sonne", "wolken", "regen"], sampleAnswer: "Die Sonne erwärmt Wasser. Wasserdampf steigt auf und bildet Wolken. Später fällt Regen.", modelAnswer: "Die Sonne erwärmt Wasser, es verdunstet, bildet Wolken und fällt später als Regen.", positiveFeedback: "Du hast Erwärmung, Wolken und Regen im Wasserkreislauf verbunden.", supportFeedback: "Die Sonne erwärmt Wasser. Was bildet sich am Himmel, bevor es regnet?" },
    { id: "measure-weather", prompt: "Wie kannst du die Temperatur für einen Wetterbericht messen und notieren?", maxScore: 4, topicKey: "weather-observation", topicLabel: "Wetterbeobachtung", keyTerms: ["temperatur", "thermometer", "notieren", "vorhersage"], sampleAnswer: "Mit einem Thermometer messe ich die Temperatur, notiere den Wert und ergänze damit die Vorhersage.", modelAnswer: "Lies das Thermometer ab, notiere die Temperatur mit Einheit und nutze sie für die Vorhersage.", positiveFeedback: "Du hast Werkzeug, Messwert und Verwendung des Ergebnisses erklärt.", supportFeedback: "Nenne ein Werkzeug für die Temperatur und erkläre, wie du den Wert aufschreibst." },
    { id: "weather-patterns", prompt: "Warum können dunkle Wolken ein Hinweis auf möglichen Regen sein?", maxScore: 4, topicKey: "weather-patterns", topicLabel: "Wetterlagen", keyTerms: ["wolken", "abkühlen", "wassertropfen", "regen"], sampleAnswer: "Wolken können beim Aufsteigen abkühlen. Wassertropfen sammeln sich und fallen als Regen, wenn sie schwer genug sind.", modelAnswer: "Aufsteigende Luft kühlt ab, Tropfen sammeln sich in Wolken und schwere Tropfen können als Regen fallen.", positiveFeedback: "Du hast Abkühlung und Wassertropfen mit möglichem Regen verbunden.", supportFeedback: "Überlege, was mit Wassertropfen geschieht, wenn Luft abkühlt und sie sich in einer Wolke sammeln." },
    { id: "rain-gauge", prompt: "Mit welchem Gerät misst man, wie viel Regen gefallen ist, und wie benutzt man es?", maxScore: 4, topicKey: "weather-observation", topicLabel: "Wetterbeobachtung", keyTerms: ["regenmesser", "sammeln", "ablesen", "millimeter"], sampleAnswer: "Ein Regenmesser sammelt den Regen, und man liest die Höhe auf der Skala in Millimetern ab.", modelAnswer: "Ein Regenmesser: Er sammelt den Regen, und man liest den Wasserstand auf der Skala (in Millimetern) ab.", positiveFeedback: "Du hast den Regenmesser genannt und erklärt, wie man ihn abliest.", supportFeedback: "Nenne das Gerät, das Regen auffängt, und sage, wie man herausfindet, wie viel gefallen ist." },
    { id: "puddle-sun", prompt: "Warum trocknet eine Pfütze an einem sonnigen Tag schneller als an einem bewölkten Tag?", maxScore: 4, topicKey: "water-cycle", topicLabel: "Wasserkreislauf", keyTerms: ["sonne", "warm", "verdunsten", "luft"], sampleAnswer: "Die Sonne erwärmt die Pfütze, darum verdunstet das Wasser schneller und steigt in die Luft.", modelAnswer: "Die Sonne erwärmt das Wasser, und warmes Wasser verdunstet schneller in die Luft.", positiveFeedback: "Du hast die Wärme der Sonne mit schnellerem Verdunsten verbunden.", supportFeedback: "Überlege, was die Sonne mit dem Wasser macht und wohin das Wasser geht." },
    { id: "thunder-lightning", prompt: "Warum sehen wir bei einem Gewitter zuerst den Blitz und hören erst danach den Donner?", maxScore: 4, topicKey: "weather-patterns", topicLabel: "Wetterlagen", keyTerms: ["licht", "schall", "schneller", "langsamer"], sampleAnswer: "Licht ist viel schneller als Schall, darum sehen wir den Blitz, bevor wir den Donner hören.", modelAnswer: "Licht ist viel schneller als Schall, deshalb sehen wir den Blitz, bevor der Donner bei uns ankommt.", positiveFeedback: "Du hast die Geschwindigkeit von Licht und Schall verglichen.", supportFeedback: "Denke an die Geschwindigkeit: Kommt Licht oder Schall zuerst bei dir an?" },
  ],
};

const measurementQuestions: Record<Language, QuestionDefinition[]> = {
  en: [
    { id: "length-measure", prompt: "How many centimeters are in one meter, and how do the lengths compare?", maxScore: 4, topicKey: "measurement-units", topicLabel: "Measurement units", keyTerms: ["100", "centimeters", "meter", "same length"], sampleAnswer: "100 centimeters make 1 meter, so both measure the same length.", modelAnswer: "One meter equals 100 centimeters; they describe the same length in different units.", positiveFeedback: "You gave the conversion and explained that the length does not change.", supportFeedback: "Remember the number of centimeters in a meter, then compare the two labels for the same object." },
    { id: "data-graph", prompt: "What can a bar graph help you compare across several categories?", maxScore: 4, topicKey: "reading-data", topicLabel: "Reading data", keyTerms: ["bar graph", "categories", "compare", "most"], sampleAnswer: "A bar graph shows categories so we can compare them and see which has the most.", modelAnswer: "Bar heights let us compare categories and identify the greatest or smallest amount.", positiveFeedback: "You explained how bars make category comparisons visible.", supportFeedback: "Look at the bar heights. How can they help you find the biggest amount?" },
    { id: "time-conversion", prompt: "How many minutes are in two hours? Explain your thinking.", maxScore: 4, topicKey: "time-conversion", topicLabel: "Time conversion", keyTerms: ["60", "minutes", "hour", "120"], sampleAnswer: "There are 60 minutes in one hour, so two hours have 120 minutes.", modelAnswer: "Two groups of 60 minutes equal 120 minutes.", positiveFeedback: "You used 60 minutes per hour and doubled it correctly.", supportFeedback: "Start with 60 minutes in one hour. What is 60 plus 60?" },
    { id: "perimeter", prompt: "A rectangle is 5 cm long and 3 cm wide. What is its perimeter?", maxScore: 4, topicKey: "perimeter", topicLabel: "Perimeter", keyTerms: ["16", "sides", "add", "around"], sampleAnswer: "The perimeter is 16 cm, because you add all four sides: 5 + 3 + 5 + 3 = 16.", modelAnswer: "16 cm: the perimeter is the distance around, 5 + 3 + 5 + 3 = 16.", positiveFeedback: "You added all four sides to find the perimeter.", supportFeedback: "The perimeter is the distance all the way around. Add every side." },
    { id: "grams-kilograms", prompt: "A bag of flour weighs 2 kg. How many grams is that?", maxScore: 4, topicKey: "measurement-units", topicLabel: "Measurement units", keyTerms: ["2000", "1000", "grams", "kilogram"], sampleAnswer: "2 kg is 2000 grams, because 1 kg is 1000 grams.", modelAnswer: "2000 g, because 1 kg = 1000 g and 2 × 1000 = 2000.", positiveFeedback: "You used 1000 grams per kilogram correctly.", supportFeedback: "Remember how many grams make one kilogram, then use it twice." },
    { id: "film-length", prompt: "A film starts at 3:15 and ends at 4:45. How long is the film?", maxScore: 4, topicKey: "time-conversion", topicLabel: "Time conversion", keyTerms: ["1 hour", "30 minutes", "90", "4:15"], sampleAnswer: "The film is 1 hour and 30 minutes long: 3:15 to 4:15 is one hour, then 30 more minutes to 4:45.", modelAnswer: "1 hour 30 minutes (90 minutes): 3:15 → 4:15 is one hour, 4:15 → 4:45 is 30 minutes.", positiveFeedback: "You counted on from the start time in clear steps.", supportFeedback: "Count on from 3:15: first to 4:15, then to 4:45." },
  ],
  de: [
    { id: "length-measure", prompt: "Wie viele Zentimeter hat ein Meter, und wie vergleichen sich die Längen?", maxScore: 4, topicKey: "measurement-units", topicLabel: "Maßeinheiten", keyTerms: ["100", "zentimeter", "meter", "gleich lang"], sampleAnswer: "100 Zentimeter sind 1 Meter. Beide beschreiben dieselbe Länge.", modelAnswer: "Ein Meter entspricht 100 Zentimetern; beide Einheiten beschreiben dieselbe Länge.", positiveFeedback: "Du hast die Umrechnung genannt und erklärt, dass die Länge gleich bleibt.", supportFeedback: "Merke dir die Zentimeter in einem Meter und vergleiche beide Angaben für denselben Gegenstand." },
    { id: "data-graph", prompt: "Was kannst du mit einem Balkendiagramm in mehreren Kategorien vergleichen?", maxScore: 4, topicKey: "reading-data", topicLabel: "Daten lesen", keyTerms: ["balkendiagramm", "kategorien", "vergleichen", "meisten"], sampleAnswer: "Ein Balkendiagramm zeigt Kategorien. Wir können sie vergleichen und sehen, wo es am meisten gibt.", modelAnswer: "Die Balkenhöhen lassen uns Kategorien vergleichen und den größten oder kleinsten Wert erkennen.", positiveFeedback: "Du hast erklärt, wie Balken einen Vergleich sichtbar machen.", supportFeedback: "Vergleiche die Balkenhöhen. Wie findest du damit den größten Wert?" },
    { id: "time-conversion", prompt: "Wie viele Minuten sind zwei Stunden? Erkläre deinen Rechenweg.", maxScore: 4, topicKey: "time-conversion", topicLabel: "Zeit umrechnen", keyTerms: ["60", "minuten", "stunde", "120"], sampleAnswer: "Eine Stunde hat 60 Minuten. Zwei Stunden haben also 120 Minuten.", modelAnswer: "Zwei Gruppen mit je 60 Minuten ergeben 120 Minuten.", positiveFeedback: "Du hast 60 Minuten pro Stunde verwendet und richtig verdoppelt.", supportFeedback: "Eine Stunde hat 60 Minuten. Was ergibt 60 plus 60?" },
    { id: "perimeter", prompt: "Ein Rechteck ist 5 cm lang und 3 cm breit. Wie groß ist sein Umfang?", maxScore: 4, topicKey: "perimeter", topicLabel: "Umfang", keyTerms: ["16", "seiten", "addieren", "rundherum"], sampleAnswer: "Der Umfang ist 16 cm, weil man alle vier Seiten addiert: 5 + 3 + 5 + 3 = 16.", modelAnswer: "16 cm: Der Umfang ist der Weg rundherum, 5 + 3 + 5 + 3 = 16.", positiveFeedback: "Du hast alle vier Seiten addiert, um den Umfang zu finden.", supportFeedback: "Der Umfang ist der Weg einmal rundherum. Addiere jede Seite." },
    { id: "grams-kilograms", prompt: "Eine Tüte Mehl wiegt 2 kg. Wie viele Gramm sind das?", maxScore: 4, topicKey: "measurement-units", topicLabel: "Maßeinheiten", keyTerms: ["2000", "1000", "gramm", "kilogramm"], sampleAnswer: "2 kg sind 2000 Gramm, weil 1 kg 1000 Gramm sind.", modelAnswer: "2000 g, denn 1 kg = 1000 g und 2 · 1000 = 2000.", positiveFeedback: "Du hast 1000 Gramm pro Kilogramm richtig verwendet.", supportFeedback: "Erinnere dich, wie viele Gramm ein Kilogramm hat, und nimm es zweimal." },
    { id: "film-length", prompt: "Ein Film beginnt um 3:15 Uhr und endet um 4:45 Uhr. Wie lange dauert der Film?", maxScore: 4, topicKey: "time-conversion", topicLabel: "Zeit umrechnen", keyTerms: ["1 stunde", "30 minuten", "90", "4:15"], sampleAnswer: "Der Film dauert 1 Stunde und 30 Minuten: von 3:15 bis 4:15 ist eine Stunde, dann noch 30 Minuten bis 4:45.", modelAnswer: "1 Stunde 30 Minuten (90 Minuten): 3:15 → 4:15 ist eine Stunde, 4:15 → 4:45 sind 30 Minuten.", positiveFeedback: "Du hast von der Anfangszeit in klaren Schritten weitergezählt.", supportFeedback: "Zähle von 3:15 weiter: zuerst bis 4:15, dann bis 4:45." },
  ],
};

export const DEMO_STUDENT_ID = "omar";
export const DEMO_PARENT_CHILD_ID = DEMO_STUDENT_ID;
export const STORAGE_KEY = "brightpath-ms3-assessment-v1";
export const CURRENT_VERSION = 5;
/** Before saved data is upgraded, the untouched original is copied to STORAGE_KEY + "-backup-v<old version>". */
export const BACKUP_KEY_PREFIX = STORAGE_KEY + "-backup-v";
/** Restoring first copies the data it replaces to STORAGE_KEY + "-before-restore-<time>". */
export const BEFORE_RESTORE_PREFIX = STORAGE_KEY + "-before-restore-";
/** Stage 4: a demo reset keeps the replaced data under this prefix. It starts with BEFORE_RESTORE_PREFIX, so the
 *  existing backup list and restore accept it unchanged; the panel only labels it "Before reset". */
export const BEFORE_RESET_PREFIX = BEFORE_RESTORE_PREFIX + "reset-";

/** Builds one answer record: what the child wrote, what the simulated OCR read, and the AI suggestion for the OCR text. */
function makeAssessmentAnswer(question: QuestionDefinition, language: Language, sourceText: string, verified: boolean, confidence: ConfidenceLevel, seed: number, withOcrSlip: boolean): AnswerRecord {
  const ocr = withOcrSlip && !verified ? simulateOcr(sourceText, seed) : { text: sourceText, uncertain: [] as string[], confidence: verified ? 97 : 93 + (seed % 6) };
  const grade = gradeAnswer(question, ocr.text, language);
  return {
    questionId: question.id,
    sourceText,
    extractedText: ocr.text,
    ocrConfidence: ocr.confidence,
    verified,
    aiScore: grade.score,
    teacherScore: grade.score,
    aiFeedback: grade.feedback,
    teacherFeedback: grade.feedback,
    confidence,
    aiMatchedTerms: grade.matchedTerms,
    aiMissingTerms: grade.missingTerms,
    aiRationale: grade.rationale,
    ocrUncertain: ocr.uncertain,
    markSource: verified ? "teacher" : "ai",
    feedbackSource: verified ? "teacher" : "ai",
  };
}

/** Re-runs the simulated grader for new answer text.
 *  A mark or comment the teacher has set or verified is never changed here. It only follows the new
 *  suggestion while it is still the untouched AI default. If a teacher-approved mark now differs from
 *  the suggestion, the answer is tagged so the review screen can ask the teacher to look again. */
export function applyExtractedText(question: QuestionDefinition, language: Language, answer: AnswerRecord, text: string, verified: boolean): AnswerRecord {
  const grade = gradeAnswer(question, text, language);
  const markApproved = answer.markSource === "teacher";
  const feedbackApproved = answer.feedbackSource === "teacher";
  const next: AnswerRecord = {
    ...answer,
    extractedText: text,
    verified,
    aiScore: grade.score,
    aiFeedback: grade.feedback,
    aiMatchedTerms: grade.matchedTerms,
    aiMissingTerms: grade.missingTerms,
    aiRationale: grade.rationale,
    teacherScore: markApproved ? answer.teacherScore : grade.score,
    teacherFeedback: feedbackApproved ? answer.teacherFeedback : grade.feedback,
    suggestionChanged: markApproved && grade.score !== answer.teacherScore,
    ocrUncertain: (answer.ocrUncertain ?? []).filter((word) => text.includes(word)),
  };
  return verified ? approveAnswer(next) : next;
}

/** Verifying an answer makes its current mark and comment teacher-approved. */
export function approveAnswer(answer: AnswerRecord): AnswerRecord {
  return { ...answer, verified: true, markSource: "teacher", feedbackSource: "teacher" };
}

function seedFlag(id: string, topicKey: string, title: string, description: string, decision: AttentionFlag["decision"]): AttentionFlag {
  return { id, topicKey, title, description, severity: "High", decision };
}

const plants: AssessmentDefinition = { id: "plants", title: "Science: Plants & Life Cycles", subject: "Science", grade: "Grade 4", dueDate: "2026-11-18", questions: scienceQuestions };
const fractions: AssessmentDefinition = { id: "fractions", title: "Math: Fractions in Everyday Life", subject: "Math", grade: "Grade 4", dueDate: "2026-11-20", questions: fractionQuestions };
const weather: AssessmentDefinition = { id: "weather", title: "Science: Weather & Water", subject: "Science", grade: "Grade 4", dueDate: "2026-11-25", questions: weatherQuestions };
const measurement: AssessmentDefinition = { id: "measurement", title: "Math: Measurement & Data", subject: "Math", grade: "Grade 4", dueDate: "2026-11-27", questions: measurementQuestions };
const demoAssessments = [plants, fractions, weather, measurement];

function seedSubmission(args: {
  id: string;
  studentId: string;
  assessmentId: string;
  language: Language;
  fileName: string;
  uploadedAt: string;
  status?: SubmissionStatus;
  verified?: boolean;
  publishedAt?: string;
  levels?: DemoLevel[];
  confidence?: ConfidenceLevel[];
  flags?: AttentionFlag[];
  gapDecisions?: Record<string, FlagDecision>;
  /** Shifts which wording of each synthetic answer is used, so repeat assessments read differently. */
  variant?: number;
  /** Answer all six questions, including the ones added in the enhancement stage. */
  fullAssessment?: boolean;
  /** The assignment this work was sent for (so the student's assignment shows as sent). */
  assignmentId?: string;
}): SubmissionRecord {
  const assessment = demoAssessments.find((item) => item.id === args.assessmentId) ?? plants;
  // Older demo records only answer the questions that existed then; newer ones answer the full assessment.
  const questions = assessment.questions[args.language].filter((question) => args.fullAssessment || !ADDED_QUESTION_IDS.has(question.id));
  const verified = args.verified ?? false;
  const answers = questions.map((question, index) => {
    const level = args.levels?.[index] ?? "strong";
    const confidence = args.confidence?.[index] ?? "medium";
    const seed = hashSeed(args.id) + index;
    const text = demoAnswerFor(question.id, args.language, level, seed + (args.variant ?? 0)) ?? question.sampleAnswer;
    // Roughly every third unverified answer carries an OCR slip for the teacher to correct.
    return makeAssessmentAnswer(question, args.language, text, verified, confidence, seed, seed % 3 === 0);
  });
  const gaps = [...new Set(questions.filter((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    return answer !== undefined && answer.teacherScore / question.maxScore < 0.75;
  }).map((question) => question.topicKey))];
  const status = args.status ?? "needs_review";
  const decisions = Object.fromEntries(gaps.map((topic) => [topic, args.gapDecisions?.[topic] ?? (status === "published" ? "confirmed" : "pending")]));
  return {
    id: args.id,
    studentId: args.studentId,
    assessmentId: args.assessmentId,
    language: args.language,
    fileName: args.fileName,
    uploadedAt: args.uploadedAt,
    status,
    answers,
    learningGaps: gaps,
    learningGapDecisions: decisions,
    flags: args.flags ?? [],
    publishedAt: args.publishedAt,
    notificationSeen: true,
    seenBy: { student: true, parent: true },
    questionIds: questions.map((question) => question.id),
    ...(args.assignmentId ? { assignmentId: args.assignmentId } : {}),
  };
}

function makeHelpRequest(args: Omit<HelpRequestRecord, "createdAt"> & { createdAt: string }): HelpRequestRecord {
  return args;
}

/** The predefined demo result: Omar's 72% fractions check. Built from the grade and the topic: six built-in
 *  fraction questions plus one 1-mark comparing question (18 of 25 marks = 72%), with comparing fractions as the
 *  recurring error and a confirmed support flag. It is labelled as demo data everywhere it appears. */
export const DEMO_RESULT_ID = "demo-result-fractions";
export function demoFractionsCheck(assessments: AssessmentDefinition[]) {
  const custom: CustomQuestionRecord = { id: "demo-q-compare-thirds", assessmentId: "fractions", language: "en", status: "ready", createdAt: "2026-11-01T09:00:00.000Z",
    question: buildCustomQuestion({ assessmentId: "fractions", language: "en", topicKey: "fraction-comparison", topicLabel: "Comparing fractions", difficulty: "easy", maxScore: 1,
      prompt: "Which fraction is larger: 2/3 or 2/5?", modelAnswer: "2/3 is larger.", sampleAnswer: "2/3 is larger.",
      rubric: { criteria: [{ id: "c1", label: "Chooses 2/3", marks: 1, ideas: ["2/3"] }], wrongIdeas: [{ label: "the fraction with the bigger bottom number is chosen", ideas: ["2/5 is larger", "2/5 is bigger"], cap: 0 }] } }, "demo-q-compare-thirds") };
  const fractions = assessments.find((item) => item.id === "fractions")!;
  const questions = [...fractions.questions.en.filter((question) => !question.custom), custom.question];
  // Teacher marks chosen for 18 / 25; texts written to match them. Comparing fractions is where marks were lost.
  const plan: Record<string, { text: string; mark: number }> = {
    "fraction-meaning": { text: "3/4 means the whole is cut into 4 equal parts and we take 3 of the parts.", mark: 4 },
    "compare-fractions": { text: "1/4 is bigger because 4 is bigger than 2.", mark: 1 },
    "fraction-model": { text: "2 of the 8 slices, so 2/8 of the pizza. That is the same as 1/4.", mark: 4 },
    "equivalent-fractions": { text: "2/4 is equal to 1/2 because 2 is half of 4.", mark: 4 },
    "fraction-of-set": { text: "1/3 of 12 is 4, because 12 divided by 3 is 4. So 4 apples are red.", mark: 4 },
    "add-fractions": { text: "1/5 + 2/5 = 3/10 of the cake.", mark: 1 },
    "demo-q-compare-thirds": { text: "2/5 is larger because 5 is bigger.", mark: 0 },
  };
  const at = "2026-11-10T15:00:00.000Z";
  const answers: AnswerRecord[] = questions.map((question) => {
    const { text, mark } = plan[question.id];
    const grade = gradeAnswer(question, text, "en");
    return { questionId: question.id, sourceText: text, extractedText: text, ocrConfidence: 96, verified: true, aiScore: grade.score, teacherScore: mark, aiFeedback: grade.feedback,
      teacherFeedback: mark === question.maxScore ? question.positiveFeedback : grade.feedback, confidence: question.topicKey === "fraction-comparison" ? "high" : "medium",
      aiMatchedTerms: grade.matchedTerms, aiMissingTerms: grade.missingTerms, aiRationale: grade.rationale, markSource: "teacher", feedbackSource: "teacher",
      ...(mark !== grade.score ? { markHistory: [{ at, from: grade.score, to: mark, aiScore: grade.score, by: "teacher" as const }] } : {}) };
  });
  const template: AssessmentTemplateRecord = { id: "template-fractions-check", title: "Fractions check", assessmentId: "fractions", questionIds: questions.map((question) => question.id), createdAt: "2026-11-01T09:00:00.000Z", description: "Demo example: a short fractions check.", language: "en", objectives: ["fraction-comparison"] };
  const assignment: AssignmentRecord = { id: "assignment-omar-fractions-check", studentId: DEMO_STUDENT_ID, assessmentId: "fractions", templateId: template.id, assignedAt: "2026-11-02T09:00:00.000Z", dueDate: "2026-11-09" };
  const gaps = ["fraction-comparison", "fraction-addition"];
  const submission: SubmissionRecord = {
    id: DEMO_RESULT_ID, studentId: DEMO_STUDENT_ID, assessmentId: "fractions", language: "en", fileName: "Demo sample (no uploaded paper)", uploadedAt: "2026-11-08T16:00:00.000Z", status: "published", publishedAt: at,
    answers, questionIds: questions.map((question) => question.id), templateId: template.id, assignmentId: assignment.id,
    learningGaps: gaps, learningGapDecisions: Object.fromEntries(gaps.map((topic) => [topic, "confirmed"])),
    flags: [{ id: `${DEMO_RESULT_ID}-support`, topicKey: "fraction-comparison", title: "Requires additional support in fractions", description: "Comparing fractions was wrong in two answers in this check (the larger bottom number was taken as the larger fraction).", severity: "High", decision: "confirmed" }],
    notificationSeen: false, seenBy: { student: false, parent: true }, demo: true,
    overallFeedback: "Well done on fractions of a whole and of a group, Omar! Next, let’s practise comparing fractions together. I’ll help you.",
    resultHighlights: { weakness: "Fractions", recurringError: "Incorrect comparison of fractions", support: "Requires additional support in fractions" },
  };
  return { custom, template, assignment, submission };
}

export function createDemoData(): AssessmentAppData {
  const students: StudentRecord[] = [
    { id: "omar", name: "Omar Hassan", initials: "OH", grade: "Grade 4B", age: 9, color: "coral" },
    { id: "lina", name: "Lina Adel", initials: "LA", grade: "Grade 4B", age: 9, color: "blue" },
    { id: "youssef", name: "Youssef Ali", initials: "YA", grade: "Grade 4B", age: 10, color: "yellow" },
    { id: "mariam", name: "Mariam Samir", initials: "MS", grade: "Grade 4B", age: 9, color: "violet" },
    { id: "hana", name: "Hana Nabil", initials: "HN", grade: "Grade 4B", age: 9, color: "blue" },
    { id: "kareem", name: "Kareem Fathy", initials: "KF", grade: "Grade 4B", age: 10, color: "coral" },
    { id: "salma", name: "Salma Youssef", initials: "SY", grade: "Grade 4B", age: 9, color: "yellow" },
    { id: "adam", name: "Adam Samir", initials: "AS", grade: "Grade 4B", age: 10, color: "violet" },
    // Added in the enhancement stage (18 students in all).
    { id: "nour", name: "Nour Ibrahim", initials: "NI", grade: "Grade 4B", age: 9, color: "blue" },
    { id: "ziad", name: "Ziad Mostafa", initials: "ZM", grade: "Grade 4B", age: 10, color: "yellow" },
    { id: "laila", name: "Laila Hamdy", initials: "LH", grade: "Grade 4B", age: 9, color: "violet" },
    { id: "tarek", name: "Tarek Saleh", initials: "TS", grade: "Grade 4B", age: 10, color: "coral" },
    { id: "farida", name: "Farida Mansour", initials: "FM", grade: "Grade 4B", age: 9, color: "blue" },
    { id: "yassin", name: "Yassin Adel", initials: "YA", grade: "Grade 4B", age: 10, color: "yellow" },
    { id: "malak", name: "Malak Gamal", initials: "MG", grade: "Grade 4B", age: 9, color: "violet" },
    { id: "hamza", name: "Hamza Fouad", initials: "HF", grade: "Grade 4B", age: 10, color: "coral" },
    { id: "jana", name: "Jana Sherif", initials: "JS", grade: "Grade 4B", age: 9, color: "blue" },
    { id: "ali", name: "Ali Mahmoud", initials: "AM", grade: "Grade 4B", age: 10, color: "yellow" },
  ];
  const templates: AssessmentTemplateRecord[] = [
    { id: "template-fractions-review", title: "Fraction foundations review", assessmentId: "fractions", questionIds: ["fraction-meaning", "compare-fractions", "fraction-model", "equivalent-fractions"], createdAt: "2026-10-01T09:00:00.000Z" },
    { id: "template-plants-short", title: "Plant life quick check", assessmentId: "plants", questionIds: ["plant-parts", "pollination"], createdAt: "2026-10-06T09:00:00.000Z" },
    { id: "template-weather-review", title: "Weather and water review", assessmentId: "weather", questionIds: ["water-cycle", "measure-weather", "weather-patterns"], createdAt: "2026-10-13T09:00:00.000Z" },
  ];
  const assignments: AssignmentRecord[] = [
    { id: "assignment-omar-plants", studentId: "omar", assessmentId: "plants", templateId: "template-plants-short" },
    { id: "assignment-omar-fractions", studentId: "omar", assessmentId: "fractions" },
    { id: "assignment-omar-weather", studentId: "omar", assessmentId: "weather", templateId: "template-weather-review" },
    { id: "assignment-lina-plants", studentId: "lina", assessmentId: "plants" },
    { id: "assignment-lina-fractions", studentId: "lina", assessmentId: "fractions" },
    { id: "assignment-youssef-fractions", studentId: "youssef", assessmentId: "fractions" },
    { id: "assignment-mariam-weather", studentId: "mariam", assessmentId: "weather" },
    { id: "assignment-hana-measurement", studentId: "hana", assessmentId: "measurement" },
    { id: "assignment-kareem-weather", studentId: "kareem", assessmentId: "weather" },
    { id: "assignment-salma-plants", studentId: "salma", assessmentId: "plants" },
    { id: "assignment-adam-fractions", studentId: "adam", assessmentId: "fractions" },
    { id: "assignment-nour-weather", studentId: "nour", assessmentId: "weather", templateId: "template-weather-review" },
    { id: "assignment-ziad-measurement", studentId: "ziad", assessmentId: "measurement" },
    { id: "assignment-laila-plants", studentId: "laila", assessmentId: "plants", templateId: "template-plants-short" },
    { id: "assignment-tarek-fractions", studentId: "tarek", assessmentId: "fractions" },
    { id: "assignment-tarek-plants", studentId: "tarek", assessmentId: "plants", templateId: "template-plants-short" },
    { id: "assignment-farida-measurement", studentId: "farida", assessmentId: "measurement" },
    { id: "assignment-yassin-plants", studentId: "yassin", assessmentId: "plants" },
    { id: "assignment-malak-fractions", studentId: "malak", assessmentId: "fractions", templateId: "template-fractions-review" },
    { id: "assignment-hamza-weather", studentId: "hamza", assessmentId: "weather" },
    { id: "assignment-jana-measurement", studentId: "jana", assessmentId: "measurement" },
    { id: "assignment-ali-weather", studentId: "ali", assessmentId: "weather" },
  ];
  const submissions: SubmissionRecord[] = [
    seedSubmission({ id: "demo-omar-plants-sep", studentId: "omar", assessmentId: "plants", language: "en", fileName: "Omar · Plant life · September.pdf", uploadedAt: "2026-09-21T08:40:00.000Z", publishedAt: "2026-09-23T13:10:00.000Z", status: "published", verified: true, levels: ["developing", "strong", "strong", "strong"], confidence: ["high", "medium", "medium", "high"] }),
    seedSubmission({ id: "demo-omar-plants-oct", studentId: "omar", assessmentId: "plants", language: "en", fileName: "Omar · Plant life · October.pdf", variant: 1, uploadedAt: "2026-10-16T08:40:00.000Z", publishedAt: "2026-10-19T13:10:00.000Z", status: "published", verified: true, levels: ["developing", "strong", "strong", "strong"], confidence: ["high", "medium", "low", "high"], flags: [seedFlag("demo-flag-omar-plants", "plant-vocabulary", "Plant vocabulary needs another look", "The same vocabulary gap appeared in two teacher-approved plant assessments. Review the written answers and discuss next steps with Omar.", "confirmed")] }),
    seedSubmission({ id: "demo-omar-fractions", studentId: "omar", assessmentId: "fractions", language: "de", fileName: "Omar · Brüche · Oktober.pdf", uploadedAt: "2026-10-27T08:30:00.000Z", publishedAt: "2026-10-29T11:15:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong", "strong"], confidence: ["high", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-omar-weather", studentId: "omar", assessmentId: "weather", language: "en", fileName: "Omar · Weather and water · November.pdf", uploadedAt: "2026-11-04T08:30:00.000Z", publishedAt: "2026-11-06T11:15:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong"], confidence: ["high", "low", "high"] }),
    seedSubmission({ id: "demo-omar-plants-review", studentId: "omar", assessmentId: "plants", language: "de", fileName: "Omar · Pflanzen · teacher review.pdf", uploadedAt: "2026-11-10T08:30:00.000Z", levels: ["emerging", "developing", "strong", "strong"], confidence: ["high", "high", "medium", "low"], flags: [seedFlag("demo-flag-omar-pending", "plant-vocabulary", "Plant vocabulary gap may be recurring", "The current answers and earlier shared work point to a possible pattern. Check the evidence before deciding.", "pending")] }),
    seedSubmission({ id: "demo-lina-plants", studentId: "lina", assessmentId: "plants", language: "de", fileName: "Lina · Pflanzen · Oktober.pdf", uploadedAt: "2026-10-08T08:25:00.000Z", publishedAt: "2026-10-10T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "developing", "strong"], confidence: ["high", "high", "low", "medium"], flags: [seedFlag("demo-flag-lina-dismissed", "seed-dispersal", "Seed dispersal may need follow-up", "One answer contains few key ideas. Review the text and compare it with earlier work.", "dismissed")] }),
    seedSubmission({ id: "demo-lina-fractions", studentId: "lina", assessmentId: "fractions", language: "en", fileName: "Lina · Fractions · November.jpg", uploadedAt: "2026-11-09T08:10:00.000Z", levels: ["strong", "developing", "strong", "strong"], confidence: ["high", "high", "medium", "high"], flags: [seedFlag("demo-flag-lina-fractions", "fraction-comparison", "Fraction comparison needs review", "The current response may show a gap in comparing fraction sizes.", "pending")] }),
    seedSubmission({ id: "demo-youssef-fractions-oct", studentId: "youssef", assessmentId: "fractions", language: "en", fileName: "Youssef · Fractions · October.pdf", uploadedAt: "2026-10-12T09:00:00.000Z", publishedAt: "2026-10-14T12:20:00.000Z", status: "published", verified: true, levels: ["developing", "emerging", "developing", "emerging"], confidence: ["medium", "high", "low", "high"], flags: [seedFlag("demo-flag-youssef-confirmed", "fraction-comparison", "Fraction comparison practice recommended", "The reviewed responses show repeated difficulty comparing the size of fractions.", "confirmed")] }),
    seedSubmission({ id: "demo-youssef-fractions-review", studentId: "youssef", assessmentId: "fractions", language: "de", fileName: "Youssef · Brüche · November.pdf", uploadedAt: "2026-11-08T08:10:00.000Z", levels: ["developing", "emerging", "emerging", "developing"], confidence: ["high", "high", "low", "medium"], flags: [seedFlag("demo-flag-youssef-pending", "fraction-comparison", "Fraction comparison may be recurring", "A similar pattern appeared in a shared result. Review the current answer before deciding.", "pending")] }),
    seedSubmission({ id: "demo-mariam-weather", studentId: "mariam", assessmentId: "weather", language: "de", fileName: "Mariam · Wetter · Oktober.pdf", uploadedAt: "2026-10-17T08:05:00.000Z", publishedAt: "2026-10-20T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong"], confidence: ["high", "high", "medium"] }),
    seedSubmission({ id: "demo-mariam-measurement", studentId: "mariam", assessmentId: "measurement", language: "en", fileName: "Mariam · Measurement · November.pdf", uploadedAt: "2026-11-03T08:05:00.000Z", publishedAt: "2026-11-05T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "developing"], confidence: ["high", "medium", "high"] }),
    seedSubmission({ id: "demo-hana-measurement", studentId: "hana", assessmentId: "measurement", language: "de", fileName: "Hana · Messen und Daten · November.pdf", uploadedAt: "2026-11-02T08:20:00.000Z", publishedAt: "2026-11-04T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong"], confidence: ["medium", "high", "low"] }),
    seedSubmission({ id: "demo-kareem-weather", studentId: "kareem", assessmentId: "weather", language: "en", fileName: "Kareem · Weather · November.pdf", uploadedAt: "2026-11-07T08:20:00.000Z", levels: ["emerging", "developing", "emerging"], confidence: ["high", "medium", "low"], flags: [seedFlag("demo-flag-kareem-dismissed", "weather-patterns", "Weather pattern may need review", "A possible concept gap was suggested by this response.", "dismissed")] }),
    seedSubmission({ id: "demo-salma-plants", studentId: "salma", assessmentId: "plants", language: "de", fileName: "Salma · Pflanzen · November.pdf", uploadedAt: "2026-11-06T08:15:00.000Z", levels: ["strong", "developing", "strong", "developing"], confidence: ["high", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-adam-fractions", studentId: "adam", assessmentId: "fractions", language: "en", fileName: "Adam · Fractions · November.pdf", uploadedAt: "2026-11-05T08:25:00.000Z", publishedAt: "2026-11-07T11:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong", "developing"], confidence: ["high", "medium", "high", "low"] }),
    // Earlier history for two original students who had only one assessment (new records; nothing existing changes).
    seedSubmission({ id: "demo-kareem-measurement-oct", studentId: "kareem", assessmentId: "measurement", language: "en", fileName: "Kareem · Measurement · October.pdf", uploadedAt: "2026-10-20T08:20:00.000Z", publishedAt: "2026-10-22T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "strong", "emerging"], confidence: ["high", "medium", "high"] }),
    seedSubmission({ id: "demo-salma-weather-oct", studentId: "salma", assessmentId: "weather", language: "de", fileName: "Salma · Wetter · Oktober.pdf", uploadedAt: "2026-10-22T08:15:00.000Z", publishedAt: "2026-10-24T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "developing"], confidence: ["high", "medium", "low"] }),
    // The ten students added in the enhancement stage: strong (Nour, Jana), average (Ziad, Laila, Malak, Ali),
    // still developing (Tarek, Hamza) and mixed (Farida: strong Science / weak Math; Yassin: the other way round).
    seedSubmission({ id: "demo-nour-plants-oct", studentId: "nour", assessmentId: "plants", language: "en", fileName: "Nour · Plant life · October.pdf", uploadedAt: "2026-10-05T08:10:00.000Z", publishedAt: "2026-10-07T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong", "strong"], confidence: ["high", "high", "high", "medium"] }),
    seedSubmission({ id: "demo-nour-fractions-nov", studentId: "nour", assessmentId: "fractions", language: "de", fileName: "Nour · Brüche · November.pdf", uploadedAt: "2026-11-03T08:10:00.000Z", publishedAt: "2026-11-05T12:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "strong", "strong", "strong", "strong", "developing"], confidence: ["high", "high", "high", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-nour-measurement-nov", studentId: "nour", assessmentId: "measurement", language: "en", fileName: "Nour · Measurement · November.pdf", uploadedAt: "2026-11-09T08:10:00.000Z", publishedAt: "2026-11-11T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong"], confidence: ["high", "high", "medium"] }),
    seedSubmission({ id: "demo-jana-weather-oct", studentId: "jana", assessmentId: "weather", language: "de", fileName: "Jana · Wetter · Oktober.pdf", uploadedAt: "2026-10-14T08:15:00.000Z", publishedAt: "2026-10-16T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "developing"], confidence: ["high", "medium", "high"] }),
    seedSubmission({ id: "demo-jana-fractions-nov", studentId: "jana", assessmentId: "fractions", language: "en", fileName: "Jana · Fractions · November.pdf", uploadedAt: "2026-11-06T08:15:00.000Z", publishedAt: "2026-11-08T12:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "strong", "strong", "developing", "strong", "strong"], confidence: ["high", "high", "medium", "medium", "high", "medium"] }),
    seedSubmission({ id: "demo-ziad-plants-sep", studentId: "ziad", assessmentId: "plants", language: "en", fileName: "Ziad · Plant life · September.pdf", uploadedAt: "2026-09-24T08:20:00.000Z", publishedAt: "2026-09-26T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong", "developing"], confidence: ["medium", "high", "medium", "high"] }),
    seedSubmission({ id: "demo-ziad-weather-oct", studentId: "ziad", assessmentId: "weather", language: "en", fileName: "Ziad · Weather and water · October.pdf", uploadedAt: "2026-10-21T08:20:00.000Z", publishedAt: "2026-10-23T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "strong", "strong"], confidence: ["high", "medium", "medium"] }),
    seedSubmission({ id: "demo-ziad-fractions-nov", studentId: "ziad", assessmentId: "fractions", language: "de", fileName: "Ziad · Brüche · November.pdf", uploadedAt: "2026-11-05T08:20:00.000Z", publishedAt: "2026-11-07T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong", "developing"], confidence: ["high", "high", "medium", "low"], gapDecisions: { "equivalent-fractions": "dismissed" } }),
    seedSubmission({ id: "demo-laila-fractions-oct", studentId: "laila", assessmentId: "fractions", language: "en", fileName: "Laila · Fractions · October.pdf", uploadedAt: "2026-10-09T08:25:00.000Z", publishedAt: "2026-10-12T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "developing", "strong"], confidence: ["medium", "medium", "high", "low"], flags: [seedFlag("demo-flag-laila-dismissed", "fraction-model", "Fraction models may need follow-up", "One answer gave only the fraction without the reason.", "dismissed")] }),
    seedSubmission({ id: "demo-laila-weather-nov", studentId: "laila", assessmentId: "weather", language: "de", fileName: "Laila · Wetter · November.pdf", uploadedAt: "2026-11-04T08:25:00.000Z", publishedAt: "2026-11-06T12:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "strong", "developing", "strong", "strong", "developing"], confidence: ["high", "high", "medium", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-malak-plants-oct", studentId: "malak", assessmentId: "plants", language: "de", fileName: "Malak · Pflanzen · Oktober.pdf", uploadedAt: "2026-10-12T08:30:00.000Z", publishedAt: "2026-10-14T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "strong", "strong", "strong"], confidence: ["low", "medium", "high", "high"] }),
    seedSubmission({ id: "demo-malak-measurement-nov", studentId: "malak", assessmentId: "measurement", language: "en", fileName: "Malak · Measurement · November.pdf", uploadedAt: "2026-11-02T08:30:00.000Z", publishedAt: "2026-11-04T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "developing", "strong"], confidence: ["high", "low", "medium"] }),
    seedSubmission({ id: "demo-ali-measurement-oct", studentId: "ali", assessmentId: "measurement", language: "en", fileName: "Ali · Measurement · October.pdf", uploadedAt: "2026-10-19T08:35:00.000Z", publishedAt: "2026-10-21T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "developing"], confidence: ["high", "high", "high"] }),
    seedSubmission({ id: "demo-ali-plants-nov", studentId: "ali", assessmentId: "plants", language: "en", fileName: "Ali · Plant life · November.pdf", uploadedAt: "2026-11-05T08:35:00.000Z", publishedAt: "2026-11-07T12:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "developing", "strong", "strong", "developing", "strong"], confidence: ["high", "high", "medium", "high", "high", "medium"] }),
    seedSubmission({ id: "demo-tarek-fractions-oct", studentId: "tarek", assessmentId: "fractions", language: "en", fileName: "Tarek · Fractions · October.pdf", uploadedAt: "2026-10-13T08:40:00.000Z", publishedAt: "2026-10-15T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "emerging", "developing", "emerging"], confidence: ["high", "high", "medium", "high"], flags: [seedFlag("demo-flag-tarek-confirmed", "fraction-comparison", "Fraction comparison needs support", "The reviewed answers show difficulty comparing the size of fractions.", "confirmed")] }),
    seedSubmission({ id: "demo-tarek-plants-oct", studentId: "tarek", assessmentId: "plants", language: "en", fileName: "Tarek · Plant life · October.pdf", uploadedAt: "2026-10-27T08:40:00.000Z", publishedAt: "2026-10-29T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "developing", "emerging", "strong"], confidence: ["medium", "high", "high", "medium"] }),
    seedSubmission({ id: "demo-tarek-fractions-review", assignmentId: "assignment-tarek-fractions", studentId: "tarek", assessmentId: "fractions", language: "en", fileName: "Tarek · Fractions · November.pdf", uploadedAt: "2026-11-10T08:40:00.000Z", levels: ["developing", "emerging", "strong", "developing"], confidence: ["high", "high", "medium", "low"], flags: [seedFlag("demo-flag-tarek-pending", "fraction-comparison", "Fraction comparison may be recurring", "A similar gap was teacher-confirmed in a shared result. Compare the answers before deciding.", "pending")] }),
    seedSubmission({ id: "demo-hamza-measurement-oct", studentId: "hamza", assessmentId: "measurement", language: "de", fileName: "Hamza · Messen und Daten · Oktober.pdf", uploadedAt: "2026-10-15T08:45:00.000Z", publishedAt: "2026-10-18T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "emerging", "emerging"], confidence: ["medium", "low", "high"] }),
    seedSubmission({ id: "demo-hamza-weather-review", assignmentId: "assignment-hamza-weather", studentId: "hamza", assessmentId: "weather", language: "de", fileName: "Hamza · Wetter · November.pdf", uploadedAt: "2026-11-11T08:45:00.000Z", levels: ["emerging", "developing", "emerging"], confidence: ["high", "medium", "low"] }),
    seedSubmission({ id: "demo-farida-plants-oct", studentId: "farida", assessmentId: "plants", language: "en", fileName: "Farida · Plant life · October.pdf", uploadedAt: "2026-10-06T08:50:00.000Z", publishedAt: "2026-10-08T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong", "strong"], confidence: ["high", "high", "medium", "high"] }),
    seedSubmission({ id: "demo-farida-fractions-oct", studentId: "farida", assessmentId: "fractions", language: "en", fileName: "Farida · Fractions · October.pdf", uploadedAt: "2026-10-26T08:50:00.000Z", publishedAt: "2026-10-28T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "emerging", "developing", "developing"], confidence: ["low", "medium", "low", "low"] }),
    seedSubmission({ id: "demo-farida-measurement-review", assignmentId: "assignment-farida-measurement", studentId: "farida", assessmentId: "measurement", language: "en", fileName: "Farida · Measurement · November.jpg", uploadedAt: "2026-11-12T08:50:00.000Z", levels: ["developing", "strong", "emerging"], confidence: ["low", "medium", "low"] }),
    seedSubmission({ id: "demo-yassin-fractions-oct", studentId: "yassin", assessmentId: "fractions", language: "de", fileName: "Yassin · Brüche · Oktober.pdf", uploadedAt: "2026-10-08T08:55:00.000Z", publishedAt: "2026-10-10T12:00:00.000Z", status: "published", verified: true, levels: ["strong", "strong", "strong", "strong"], confidence: ["high", "high", "high", "high"] }),
    seedSubmission({ id: "demo-yassin-weather-nov", studentId: "yassin", assessmentId: "weather", language: "en", fileName: "Yassin · Weather and water · November.pdf", uploadedAt: "2026-11-02T08:55:00.000Z", publishedAt: "2026-11-04T12:00:00.000Z", status: "published", verified: true, levels: ["developing", "emerging", "developing"], confidence: ["high", "high", "medium"] }),
    // Recent full six-question assessments (enhancement stage), so every question has some class results.
    seedSubmission({ id: "demo-mariam-plants-nov", studentId: "mariam", assessmentId: "plants", language: "en", fileName: "Mariam · Plant life · November.pdf", uploadedAt: "2026-11-09T08:05:00.000Z", publishedAt: "2026-11-10T12:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "strong", "developing", "strong", "strong", "developing"], confidence: ["high", "high", "medium", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-hana-fractions-nov", studentId: "hana", assessmentId: "fractions", language: "de", fileName: "Hana · Brüche · November.pdf", uploadedAt: "2026-11-09T08:20:00.000Z", publishedAt: "2026-11-10T12:30:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "developing", "strong", "emerging", "developing", "emerging"], confidence: ["high", "high", "high", "medium", "low", "high"] }),
    seedSubmission({ id: "demo-lina-weather-nov", studentId: "lina", assessmentId: "weather", language: "en", fileName: "Lina · Weather and water · November.pdf", uploadedAt: "2026-11-10T08:10:00.000Z", publishedAt: "2026-11-11T11:00:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "developing", "strong", "strong", "developing", "emerging"], confidence: ["high", "medium", "high", "high", "medium", "low"] }),
    seedSubmission({ id: "demo-adam-measurement-nov", studentId: "adam", assessmentId: "measurement", language: "en", fileName: "Adam · Measurement · November.pdf", uploadedAt: "2026-11-10T08:25:00.000Z", publishedAt: "2026-11-11T11:30:00.000Z", status: "published", verified: true, fullAssessment: true, levels: ["strong", "strong", "developing", "developing", "strong", "emerging"], confidence: ["high", "medium", "high", "high", "high", "low"] }),
  ];
  const helpRequests: HelpRequestRecord[] = [
    makeHelpRequest({ id: "demo-help-omar-hint", studentId: "omar", assignmentId: "assignment-omar-plants", assessmentId: "plants", questionId: "plant-parts", language: "en", kind: "hint", level: 1, helpful: true, message: "", createdAt: "2026-11-02T09:10:00.000Z", status: "answered", response: "Think about which part holds a plant upright. What part takes in water?", responseAt: "2026-11-02T09:10:00.000Z" }),
    // Omar climbs the ladder on comparing fractions: small hint, bigger hint, example, then his teacher.
    makeHelpRequest({ id: "demo-help-omar-frac-hint1", studentId: "omar", assignmentId: "assignment-omar-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "en", kind: "hint", level: 1, helpful: false, message: "", createdAt: "2026-11-03T09:02:00.000Z", status: "answered", response: "Imagine two pizzas of the same size. One is shared by 2 people, the other by 4 people.", responseAt: "2026-11-03T09:02:00.000Z" }),
    makeHelpRequest({ id: "demo-help-omar-frac-hint2", studentId: "omar", assignmentId: "assignment-omar-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "en", kind: "hint", level: 2, helpful: false, message: "", createdAt: "2026-11-03T09:06:00.000Z", status: "answered", response: "Who gets the bigger slice: someone sharing with 1 friend, or someone sharing with 3 friends?", responseAt: "2026-11-03T09:06:00.000Z" }),
    makeHelpRequest({ id: "demo-help-omar-example", studentId: "omar", assignmentId: "assignment-omar-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "en", kind: "example", helpful: false, message: "", createdAt: "2026-11-03T09:10:00.000Z", status: "answered", response: "Example: 1/3 is larger than 1/6 because the same whole is split into fewer equal parts.", responseAt: "2026-11-03T09:10:00.000Z" }),
    makeHelpRequest({ id: "demo-help-omar-teacher", studentId: "omar", assignmentId: "assignment-omar-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "de", kind: "teacher", message: "Ich bin unsicher, warum die Hälfte größer ist.", tried: "Ich habe zwei Pizzen gemalt, aber die Stücke sahen gleich aus.", createdAt: "2026-11-06T09:15:00.000Z", status: "answered", response: "Stell dir dieselbe Pizza vor: Bei zwei gleich großen Stücken ist jedes Stück größer als bei vier Stücken.", responseAt: "2026-11-06T11:00:00.000Z" }),
    makeHelpRequest({ id: "demo-help-tarek-hint1", studentId: "tarek", assignmentId: "assignment-tarek-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "en", kind: "hint", level: 1, helpful: false, message: "", createdAt: "2026-11-07T16:00:00.000Z", status: "answered", response: "Imagine two pizzas of the same size. One is shared by 2 people, the other by 4 people.", responseAt: "2026-11-07T16:00:00.000Z" }),
    makeHelpRequest({ id: "demo-help-tarek-hint2", studentId: "tarek", assignmentId: "assignment-tarek-fractions", assessmentId: "fractions", questionId: "compare-fractions", language: "en", kind: "hint", level: 2, helpful: true, message: "", createdAt: "2026-11-07T16:05:00.000Z", status: "answered", response: "Who gets the bigger slice: someone sharing with 1 friend, or someone sharing with 3 friends?", responseAt: "2026-11-07T16:05:00.000Z" }),
    makeHelpRequest({ id: "demo-help-farida-example", studentId: "farida", assignmentId: "assignment-farida-measurement", assessmentId: "measurement", questionId: "time-conversion", language: "en", kind: "example", helpful: true, message: "", createdAt: "2026-11-09T17:00:00.000Z", status: "answered", response: "Example with different units: 1 day has 24 hours, so 2 days have 24 + 24 = 48 hours.", responseAt: "2026-11-09T17:00:00.000Z" }),
    makeHelpRequest({ id: "demo-help-hamza-teacher", studentId: "hamza", assignmentId: "assignment-hamza-weather", assessmentId: "weather", questionId: "water-cycle", language: "de", kind: "teacher", message: "Wohin geht das Wasser aus der Pfütze?", tried: "Ich habe den Hinweis gelesen, aber ich verstehe den Dampf nicht.", createdAt: "2026-11-10T15:30:00.000Z", status: "open" }),
    makeHelpRequest({ id: "demo-help-salma-hint1", studentId: "salma", assignmentId: "assignment-salma-plants", assessmentId: "plants", questionId: "seed-dispersal", language: "de", kind: "hint", level: 1, helpful: false, message: "", createdAt: "2026-11-08T09:05:00.000Z", status: "answered", response: "Stell dir einen Samen vor, der direkt unter seine Mutterpflanze fällt. Warum könnte es schwer sein, dort zu wachsen?", responseAt: "2026-11-08T09:05:00.000Z" }),
    makeHelpRequest({ id: "demo-help-salma-open", studentId: "salma", assignmentId: "assignment-salma-plants", assessmentId: "plants", questionId: "seed-dispersal", language: "de", kind: "teacher", message: "Wie reisen die Samen zur nächsten Pflanze?", tried: "Ich habe im Buch nachgeschaut, aber da steht nur „Verbreitung“.", createdAt: "2026-11-08T09:15:00.000Z", status: "open" }),
  ];
  // Enhancement stage demo: Omar's parent already read the September result and practised plant words once.
  const septemberPlants = submissions.find((submission) => submission.id === "demo-omar-plants-sep");
  if (septemberPlants) septemberPlants.parentReads = [{ at: "2026-09-24T18:30:00.000Z", note: "Thank you! We will read about plants together this weekend.", teacherSeenAt: "2026-09-25T08:00:00.000Z" }];
  const practiceLog: PracticeLogEntry[] = [{ id: "demo-practice-1", studentId: "omar", topicKey: "plant-vocabulary", at: "2026-10-25T17:00:00.000Z" }];
  const check = demoFractionsCheck(demoAssessments);
  return withCustomQuestions({ version: CURRENT_VERSION, students, assessments: demoAssessments, assignments: [...assignments, check.assignment], submissions: [...submissions, check.submission], templates: [...templates, check.template], helpRequests, practiceLog, customQuestions: [check.custom], supportCases: demoSupportCases(), notifications: demoStudentNotifications(), demoNotificationsSeeded: 1, demoResultSeeded: 1 });
}

type SavedAppData = Partial<AssessmentAppData> & { version?: number };

/** When true, nothing is written to storage: the saved data is unreadable, or it could not be backed up first. */
let unreadableSavedState = false;

export interface BackupInfo { key: string; kind: "upgrade" | "before-restore"; fromVersion: number; savedAt: string; bytes: number }

interface StoredBackup { fromVersion?: number; savedAt?: string; data?: string }

function readBackup(key: string): StoredBackup | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as StoredBackup | null;
    return parsed && typeof parsed.data === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function backupKeys() {
  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && (key.startsWith(BACKUP_KEY_PREFIX) || key.startsWith(BEFORE_RESTORE_PREFIX))) keys.push(key);
  }
  return keys;
}

/** Writes a backup under a key that is not in use yet, so no existing backup is ever overwritten. */
function writeNewBackup(baseKey: string, raw: string, fromVersion: number) {
  let key = baseKey;
  for (let n = 2; window.localStorage.getItem(key) !== null; n += 1) key = `${baseKey}-${n}`;
  window.localStorage.setItem(key, JSON.stringify({ fromVersion, savedAt: new Date().toISOString(), data: raw }));
  return readBackup(key)?.data === raw;
}

/** Keeps the untouched saved data before an upgrade. If an identical copy is already kept, nothing is written. */
function backUpOriginal(raw: string, fromVersion: number) {
  try {
    if (backupKeys().some((key) => readBackup(key)?.data === raw)) return true;
    return writeNewBackup(BACKUP_KEY_PREFIX + fromVersion, raw, fromVersion);
  } catch {
    return false;
  }
}

export function listBackups(): BackupInfo[] {
  try {
    return backupKeys().flatMap((key) => {
      const backup = readBackup(key);
      if (!backup?.data) return [];
      let fromVersion = backup.fromVersion ?? 0;
      try { fromVersion = (JSON.parse(backup.data) as { version?: number }).version ?? fromVersion; } catch { /* keep stored value */ }
      return [{ key, kind: key.startsWith(BEFORE_RESTORE_PREFIX) ? "before-restore" as const : "upgrade" as const, fromVersion, savedAt: backup.savedAt ?? "", bytes: backup.data.length }];
    }).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

/** Puts a backup back as the live data. The data being replaced is first kept as a new
 *  "before restore" backup, and the backup itself stays where it is. Reload the page afterwards
 *  so the app reads (and, if needed, upgrades again with a backup) the restored data. */
export function restoreBackup(key: string) {
  try {
    if (!key.startsWith(BACKUP_KEY_PREFIX) && !key.startsWith(BEFORE_RESTORE_PREFIX)) return false;
    const backup = readBackup(key);
    if (!backup?.data) return false;
    JSON.parse(backup.data);
    const live = window.localStorage.getItem(STORAGE_KEY);
    if (live !== null && live !== backup.data && !backupKeys().some((item) => readBackup(item)?.data === live)) {
      let liveVersion = CURRENT_VERSION;
      try { liveVersion = (JSON.parse(live) as { version?: number }).version ?? liveVersion; } catch { /* unreadable live data is still kept */ }
      if (!writeNewBackup(BEFORE_RESTORE_PREFIX + new Date().toISOString().replace(/[:.]/g, "-"), live, liveVersion)) return false;
    }
    window.localStorage.setItem(STORAGE_KEY, backup.data);
    return window.localStorage.getItem(STORAGE_KEY) === backup.data;
  } catch {
    return false;
  }
}

/** Stage 4: "Reset demo data". The current saved data is first kept as a new "Before reset" backup (never
 *  overwriting another key; skipped only when an identical copy is already kept). Then only the main data key is
 *  replaced with fresh demo data. If the backup can't be written, nothing is reset. Reload the page afterwards. */
export function resetDemoData() {
  try {
    const live = window.localStorage.getItem(STORAGE_KEY);
    if (live !== null && !backupKeys().some((key) => readBackup(key)?.data === live)) {
      let liveVersion = CURRENT_VERSION;
      try { liveVersion = (JSON.parse(live) as { version?: number }).version ?? liveVersion; } catch { /* unreadable data is still kept */ }
      if (!writeNewBackup(BEFORE_RESET_PREFIX + new Date().toISOString().replace(/[:.]/g, "-"), live, liveVersion)) return false;
    }
    const fresh = JSON.stringify(createDemoData());
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return window.localStorage.getItem(STORAGE_KEY) === fresh;
  } catch {
    return false;
  }
}

function mergeById<T extends { id: string }>(saved: T[], seeded: T[]) {
  const savedIds = new Set(saved.map((item) => item.id));
  return [...saved, ...seeded.filter((item) => !savedIds.has(item.id))];
}


/** English topic name for teacher-facing summaries, whatever language the exam was written in. */
export function getTopicLabel(data: AssessmentAppData, topicKey: string) {
  for (const assessment of data.assessments) {
    const question = assessment.questions.en.find((item) => item.topicKey === topicKey);
    if (question) return question.topicLabel;
  }
  // A topic a teacher created for a German-only question has no English label.
  for (const assessment of data.assessments) {
    const question = assessment.questions.de.find((item) => item.topicKey === topicKey);
    if (question) return question.topicLabel;
  }
  return topicKey.replace(/-/g, " ");
}

function earlierConfirmedGapCount(data: AssessmentAppData, submission: SubmissionRecord, topicKey: string) {
  return data.submissions.filter((item) => item.studentId === submission.studentId
    && item.id !== submission.id
    && item.status === "published"
    && (item.publishedAt ?? item.uploadedAt) <= submission.uploadedAt
    && item.learningGaps.includes(topicKey)
    && (item.learningGapDecisions ? item.learningGapDecisions[topicKey] === "confirmed" : true)).length;
}

/** How often each low-scoring topic of this submission was already teacher-confirmed in earlier published work. */
export function getLearningSignals(data: AssessmentAppData, submission: SubmissionRecord) {
  const topics = new Map<string, string>();
  getSubmissionQuestions(data, submission).forEach((question) => {
    const answer = submission.answers.find((item) => item.questionId === question.id);
    if (answer && answer.teacherScore / question.maxScore < 0.75) topics.set(question.topicKey, question.topicLabel);
  });
  return [...topics.entries()].map(([topicKey, title]) => {
    const earlierCount = earlierConfirmedGapCount(data, submission, topicKey);
    return { topicKey, title, earlierCount, recurring: earlierCount > 0 };
  });
}

/** Keeps gap suggestions and automatic flags in step with the current teacher marks.
 *  Teacher decisions are kept; only still-pending automatic flags are added or withdrawn. */
export function reconcileLearningSignals(data: AssessmentAppData, submission: SubmissionRecord, changedTopicKey?: string): SubmissionRecord {
  const signals = getLearningSignals(data, submission);
  const learningGaps = signals.map((signal) => signal.topicKey);
  const previous = submission.learningGapDecisions ?? {};
  const learningGapDecisions: Record<string, FlagDecision> = Object.fromEntries(learningGaps.map((topic) => [topic, topic === changedTopicKey ? "pending" : previous[topic] ?? "pending"]));
  const total = submission.answers.reduce((sum, answer) => sum + answer.teacherScore, 0);
  const maximum = getSubmissionMaxScore(data, submission);
  const lowOverall = maximum > 0 && total / maximum <= 0.4;
  const flags = submission.flags.filter((flag) => flag.decision !== "pending" || (flag.topicKey === "overall-progress" ? lowOverall : learningGaps.includes(flag.topicKey)));
  signals.filter((signal) => signal.recurring && !flags.some((flag) => flag.topicKey === signal.topicKey)).forEach((signal) => {
    flags.push({
      id: `${submission.id}-${signal.topicKey}`,
      topicKey: signal.topicKey,
      title: `Possible recurring ${getTopicLabel(data, signal.topicKey).toLowerCase()} gap`,
      description: `A gap in this topic was teacher-confirmed in ${signal.earlierCount} earlier published result${signal.earlierCount === 1 ? "" : "s"}. Compare the answers before deciding whether the pattern continues.`,
      severity: "High",
      decision: "pending",
    });
  });
  if (lowOverall && flags.length === 0) flags.push({ id: `${submission.id}-low-score`, topicKey: "overall-progress", title: "Low overall score needs a teacher check", description: "The simulated grading suggests the student may benefit from a closer teacher review before results are shared.", severity: "Watch", decision: "pending" });
  return { ...submission, learningGaps, learningGapDecisions, flags };
}

const uploadLevelPatterns: DemoLevel[][] = [
  ["strong", "developing", "strong", "strong"],
  ["strong", "strong", "developing", "strong"],
  ["developing", "strong", "strong", "emerging"],
  ["strong", "strong", "strong", "developing"],
];

/** Simulated OCR + grading for a new upload. The file itself is never read: a sample child's
 *  answer stands in for each question, sometimes with an OCR slip for the teacher to correct. */
export function analyzeSubmission(data: AssessmentAppData, submission: SubmissionRecord): SubmissionRecord {
  const questions = getSubmissionQuestions(data, submission);
  const base = hashSeed(submission.id);
  const pattern = uploadLevelPatterns[base % uploadLevelPatterns.length];
  const answers = questions.map((question, index) => {
    const seed = base + index;
    const text = demoAnswerFor(question.id, submission.language, pattern[index % pattern.length], seed) ?? question.sampleAnswer;
    return makeAssessmentAnswer(question, submission.language, text, false, submission.confidenceRatings?.[question.id] ?? "medium", seed, index % 2 === base % 2);
  });
  return reconcileLearningSignals(data, { ...submission, status: "needs_review", answers, learningGaps: [], learningGapDecisions: {}, flags: [] });
}


// ---- Stage 2: publishing, reopening, submissions ----

export interface PublishBlocker { kind: "processing" | "verify" | "changed-mark" | "gap" | "flag"; text: string; questionId?: string }

/** Everything that still stops a result from being shared. Publishing is only possible when this is empty. */
export function getPublishBlockers(data: AssessmentAppData, submission: SubmissionRecord): PublishBlocker[] {
  if (submission.status === "processing" || submission.answers.length === 0) return [{ kind: "processing", text: "The scan is still being read." }];
  const blockers: PublishBlocker[] = [];
  const questions = getSubmissionQuestions(data, submission);
  questions.forEach((question, index) => {
    const answer = submission.answers.find((item) => item.questionId === question.id);
    if (!answer) { blockers.push({ kind: "verify", questionId: question.id, text: `Question ${index + 1}: no answer was read from the scan.` }); return; }
    if (answer.suggestionChanged) blockers.push({ kind: "changed-mark", questionId: question.id, text: `Question ${index + 1}: the answer text changed after you approved ${answer.teacherScore}/${question.maxScore}, and the AI now suggests ${answer.aiScore}/${question.maxScore}. Choose “Keep my mark” or “Use AI suggestion”.` });
    if (!answer.verified) blockers.push({ kind: "verify", questionId: question.id, text: `Question ${index + 1}: check the scanned text against the original and verify it.` });
  });
  (submission.learningGaps ?? []).forEach((topicKey) => {
    const decision = submission.learningGapDecisions?.[topicKey] ?? "pending";
    if (decision === "pending") blockers.push({ kind: "gap", text: `Confirm or dismiss the learning-gap suggestion “${getTopicLabel(data, topicKey)}”.` });
  });
  submission.flags.filter((flag) => flag.decision === "pending").forEach((flag) => blockers.push({ kind: "flag", text: `Confirm or dismiss the red flag “${flag.title}”.` }));
  return blockers;
}

function snapshotOf(submission: SubmissionRecord): PublishedSnapshot {
  const { answers, learningGaps, learningGapDecisions, flags, publishedAt, notificationSeen, seenBy, resultUpdated, overallFeedback } = submission;
  return JSON.parse(JSON.stringify({ answers, learningGaps, learningGapDecisions, flags, publishedAt, notificationSeen, seenBy, resultUpdated, overallFeedback: overallFeedback ?? null })) as PublishedSnapshot;
}

/** Shares a reviewed result. Returns undefined if anything still blocks publishing. */
export function publishSubmission(data: AssessmentAppData, submission: SubmissionRecord, now: string): SubmissionRecord | undefined {
  if (submission.status !== "needs_review" || getPublishBlockers(data, submission).length) return undefined;
  const reopened = submission.reopened;
  const revisions = reopened ? [...(submission.revisions ?? []), {
    publishedAt: reopened.previous.publishedAt ?? reopened.at,
    score: reopened.previous.answers.reduce((sum, answer) => sum + answer.teacherScore, 0),
    maxScore: getSubmissionMaxScore(data, submission),
    reopenedAt: reopened.at,
    reason: reopened.reason,
  }] : submission.revisions;
  return { ...submission, status: "published", publishedAt: now, notificationSeen: false, seenBy: { student: false, parent: false }, reopened: undefined, revisions, resultUpdated: Boolean(reopened) || submission.resultUpdated };
}

/** Takes a shared result back for correction. The student and parent no longer see it until it is shared again. */
export function reopenSubmission(submission: SubmissionRecord, reason: string, now: string): SubmissionRecord | undefined {
  if (submission.status !== "published") return undefined;
  return { ...submission, status: "needs_review", reopened: { at: now, reason: reason.trim(), previous: snapshotOf(submission) } };
}

/** Abandons a correction: the version that was shared before is put back exactly as it was. */
export function cancelReopen(submission: SubmissionRecord): SubmissionRecord | undefined {
  if (submission.status !== "needs_review" || !submission.reopened) return undefined;
  return { ...submission, ...submission.reopened.previous, overallFeedback: submission.reopened.previous.overallFeedback ?? undefined, status: "published", reopened: undefined };
}

/** The student's submission for an assignment, if one was sent. Uploads saved before assignment links
 *  existed are matched by student, assessment and template. Demo history records are never matched. */
export function getAssignmentSubmission(data: AssessmentAppData, assignment: AssignmentRecord) {
  return data.submissions.find((submission) => submission.studentId === assignment.studentId
    && (submission.assignmentId
      ? submission.assignmentId === assignment.id
      : submission.id.startsWith("upload-") && submission.assessmentId === assignment.assessmentId && (submission.templateId ?? "") === (assignment.templateId ?? "")));
}

export const ACCEPTED_FILE_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/pjpeg", "image/png"];

/** Checks a chosen file before it can be sent. Messages are written for a Grade 4 student. */
/** Up to this many photos or pages can be sent together for one assessment. */
export const MAX_FILES = 10;
/** Several pages (photos or PDFs) for one assessment: each file is checked, and the first problem is reported. */
export function validateExamFiles(files: { name: string; type: string; size: number }[]): string | undefined {
  if (files.length === 0) return "Please choose at least one file.";
  if (files.length > MAX_FILES) return `Please choose at most ${MAX_FILES} files (you chose ${files.length}).`;
  for (const file of files) { const problem = validateExamFile(file); if (problem) return problem; }
  return undefined;
}
export const filesLabel = (files: { name: string }[]) => files.length === 1 ? files[0].name : `${files[0].name} + ${files.length - 1} more page${files.length === 2 ? "" : "s"}`;

export function validateExamFile(file: { name: string; type: string; size: number }): string | undefined {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLocaleLowerCase() : "";
  if (!ACCEPTED_FILE_TYPES.includes(extension)) return `“${file.name}” can’t be sent${extension ? ` because it is a ${extension} file` : ""}. Please choose a photo (JPG or PNG) or a PDF of your work.`;
  if (file.type && !ACCEPTED_MIME.includes(file.type)) return `“${file.name}” doesn’t look like a real ${extension.slice(1).toUpperCase()} file. Please take the photo or scan again.`;
  if (file.size === 0) return `“${file.name}” is empty. Please choose the file again.`;
  if (file.size > MAX_FILE_BYTES) return `“${file.name}” is too big (${(file.size / 1024 / 1024).toFixed(1)} MB). Please choose a file smaller than 20 MB.`;
  return undefined;
}

// ---- Saved-data upgrade (v4: rubric grader and realistic demo records; v5: explicit teacher approval, stricter grader) ----
const legacyUnpublishedSeedIds = new Set(["demo-omar-plants-review", "demo-lina-fractions", "demo-youssef-fractions-review", "demo-kareem-weather", "demo-salma-plants"]);
const legacySeedFlagDecisions: Record<string, FlagDecision> = { "demo-flag-kareem-dismissed": "dismissed" };

/** A demo record the teacher never worked on can safely be swapped for its improved version. */
function isUntouchedLegacySeed(submission: SubmissionRecord) {
  if (!submission.id.startsWith("demo-")) return false;
  if (!legacyUnpublishedSeedIds.has(submission.id)) return submission.status === "published";
  return submission.status === "needs_review"
    && submission.answers.every((answer) => !answer.verified && answer.teacherScore === answer.aiScore && answer.teacherFeedback === answer.aiFeedback && answer.extractedText === answer.sourceText)
    && Object.values(submission.learningGapDecisions ?? {}).every((decision) => decision === "pending")
    && submission.flags.every((flag) => flag.decision === (legacySeedFlagDecisions[flag.id] ?? "pending"));
}

function upgradeSavedData(data: AssessmentAppData, demo: AssessmentAppData, fromVersion: number): AssessmentAppData {
  const current = new Set<string>();
  const refreshed = data.submissions.map((submission) => {
    const seed = demo.submissions.find((item) => item.id === submission.id);
    if (seed === submission) { current.add(submission.id); return submission; }
    // Only data from before version 4 still holds the old template-style demo records.
    if (fromVersion < 4 && seed && isUntouchedLegacySeed(submission)) {
      current.add(submission.id);
      const seen = Boolean(submission.notificationSeen);
      return { ...seed, notificationSeen: seen, seenBy: { student: seen, parent: seen } };
    }
    return submission;
  });
  const upgraded: AssessmentAppData = { ...data, submissions: refreshed };
  // Work the teacher has started keeps every teacher decision. Unpublished records get a fresh AI
  // suggestion from the new grader; published records are history and are left exactly as shared.
  upgraded.submissions = refreshed.map((submission) => {
    if (submission.status !== "needs_review" || current.has(submission.id)) return submission;
    const questions = getSubmissionQuestions(upgraded, submission);
    const answers = submission.answers.map((answer) => {
      const question = questions.find((item) => item.id === answer.questionId);
      if (!question) return answer;
      // Refresh the AI suggestion only; verified stays as the teacher left it and approved marks are kept.
      const refreshed = applyExtractedText(question, submission.language, answer, answer.extractedText, false);
      return { ...refreshed, verified: answer.verified };
    });
    return reconcileLearningSignals(upgraded, { ...submission, answers });
  });
  return upgraded;
}

/** Students added to the demo class in the enhancement stage (8 → 18). */
export const ADDED_DEMO_STUDENT_IDS = new Set(["nour", "ziad", "laila", "tarek", "farida", "yassin", "malak", "hamza", "jana", "ali"]);

/** Additive only: adds the demo students that are missing from saved data, plus their own submissions,
 *  assignments and help requests. Nothing that already exists is changed, replaced or removed, and records
 *  of students already in the saved data are never touched. */
export function addMissingDemoStudents(data: AssessmentAppData, demo: AssessmentAppData): { data: AssessmentAppData; added: string[] } {
  const present = new Set(data.students.map((student) => student.id));
  const missing = demo.students.filter((student) => ADDED_DEMO_STUDENT_IDS.has(student.id) && !present.has(student.id));
  if (missing.length === 0) return { data, added: [] };
  const ids = new Set(missing.map((student) => student.id));
  const submissionIds = new Set(data.submissions.map((item) => item.id));
  const assignmentIds = new Set(data.assignments.map((item) => item.id));
  const helpIds = new Set(data.helpRequests.map((item) => item.id));
  return {
    added: [...ids],
    data: {
      ...data,
      students: [...data.students, ...missing],
      submissions: [...data.submissions, ...demo.submissions.filter((item) => ids.has(item.studentId) && !submissionIds.has(item.id))],
      assignments: [...data.assignments, ...demo.assignments.filter((item) => ids.has(item.studentId) && !assignmentIds.has(item.id))],
      helpRequests: [...data.helpRequests, ...demo.helpRequests.filter((item) => ids.has(item.studentId) && !helpIds.has(item.id))],
    },
  };
}

// ---- Teacher-written questions (enhancement stage) ----

export interface CustomQuestionDraft {
  assessmentId: string;
  language: Language;
  topicKey: string;
  topicLabel: string;
  difficulty: DifficultyLevel;
  maxScore: number;
  prompt: string;
  modelAnswer: string;
  sampleAnswer?: string;
  rubric: CustomRubric;
}

export const CUSTOM_MAX_MARKS = 6;

/** Builds the question the grader and every screen use. Feedback wording follows the question's language. */
export function buildCustomQuestion(draft: CustomQuestionDraft, id: string): QuestionDefinition {
  const de = draft.language === "de";
  return {
    id,
    prompt: draft.prompt.trim(),
    maxScore: draft.maxScore,
    topicKey: draft.topicKey,
    topicLabel: draft.topicLabel.trim(),
    keyTerms: draft.rubric.criteria.map((criterion) => criterion.label),
    // The simulated scan of a student's answer uses the teacher's sample answer, or else the expected answer.
    sampleAnswer: draft.sampleAnswer?.trim() || draft.modelAnswer.trim(),
    modelAnswer: draft.modelAnswer.trim(),
    positiveFeedback: de ? "Du hast jeden Teil dieser Frage beantwortet." : "You answered every part of this question.",
    supportFeedback: de ? "Lies die Frage noch einmal und beantworte jeden Teil." : "Read the question again and answer each part.",
    custom: true,
    difficulty: draft.difficulty,
    rubric: { criteria: draft.rubric.criteria.map((criterion) => ({ ...criterion, label: criterion.label.trim(), ideas: criterion.ideas.map((idea) => idea.trim()).filter(Boolean) })), wrongIdeas: (draft.rubric.wrongIdeas ?? []).map((wrong) => ({ ...wrong, label: wrong.label.trim(), ideas: wrong.ideas.map((idea) => idea.trim()).filter(Boolean) })).filter((wrong) => wrong.label || wrong.ideas.length) },
  };
}

/** Every rule a teacher question must pass before it can be used. The grader itself checks the result:
 *  the expected answer must earn full marks and an empty answer must earn nothing. */
export function validateCustomQuestion(question: QuestionDefinition, language: Language) {
  const errors: string[] = [];
  const rubric = question.rubric;
  if (question.prompt.trim().length < 5) errors.push("Write the question text.");
  if (!question.topicKey || !question.topicLabel.trim()) errors.push("Choose or name a topic.");
  if (!Number.isInteger(question.maxScore) || question.maxScore < 1 || question.maxScore > CUSTOM_MAX_MARKS) errors.push(`Maximum marks must be a whole number from 1 to ${CUSTOM_MAX_MARKS}.`);
  if (question.modelAnswer.trim().length < 2) errors.push("Write the expected answer.");
  if (!rubric || rubric.criteria.length === 0) errors.push("Add at least one marking criterion.");
  (rubric?.criteria ?? []).forEach((criterion, index) => {
    const name = `Criterion ${index + 1}`;
    if (!criterion.label.trim()) errors.push(`${name}: describe what earns the marks.`);
    if (!Number.isInteger(criterion.marks) || criterion.marks < 1) errors.push(`${name}: give it at least 1 mark.`);
    const ideas = criterion.ideas.filter((idea) => idea.replace(/[\s/]/g, "").length >= 1);
    if (ideas.length === 0) errors.push(`${name}: add at least one accepted word or phrase.`);
    if (criterion.need !== undefined && (criterion.need < 1 || criterion.need > ideas.length)) errors.push(`${name}: “ideas needed” can’t be more than the ideas listed.`);
  });
  const total = (rubric?.criteria ?? []).reduce((sum, criterion) => sum + (criterion.marks || 0), 0);
  if (rubric && rubric.criteria.length && total !== question.maxScore) errors.push(`The criteria add up to ${total} mark${total === 1 ? "" : "s"}, but the question is worth ${question.maxScore}.`);
  (rubric?.wrongIdeas ?? []).forEach((wrong, index) => {
    if (!wrong.ideas.some((idea) => idea.trim())) errors.push(`Wrong idea ${index + 1}: add the wording that shows it.`);
    if (!Number.isInteger(wrong.cap) || wrong.cap < 0 || wrong.cap >= question.maxScore) errors.push(`Wrong idea ${index + 1}: the mark cap must be below the maximum.`);
  });
  const expectedScore = errors.length ? undefined : gradeAnswer(question, question.modelAnswer, language).score;
  const blankScore = errors.length ? undefined : gradeAnswer(question, "", language).score;
  if (expectedScore !== undefined && expectedScore !== question.maxScore) errors.push(`The expected answer only earns ${expectedScore} of ${question.maxScore} marks with these criteria. Add its wording to the criteria, or change the expected answer.`);
  if (blankScore !== undefined && blankScore !== 0) errors.push("An empty answer would earn marks. Check the criteria.");
  return { errors, valid: errors.length === 0, expectedScore, blankScore };
}

/** Rebuilds each assessment's question lists: the built-in questions, then every ready teacher question that
 *  still passes validation. Safe to call again; it never duplicates or drops built-in questions. */
export function withCustomQuestions(data: AssessmentAppData): AssessmentAppData {
  const usable = (data.customQuestions ?? []).filter((record) => record.status === "ready" && validateCustomQuestion(record.question, record.language).valid);
  return {
    ...data,
    assessments: data.assessments.map((assessment) => ({
      ...assessment,
      questions: Object.fromEntries((["en", "de"] as Language[]).map((language) => [language, [
        ...assessment.questions[language].filter((question) => !question.custom),
        ...usable.filter((record) => record.assessmentId === assessment.id && record.language === language).map((record) => record.question),
      ]])) as Record<Language, QuestionDefinition[]>,
    })),
  };
}

export function readAssessmentData(): AssessmentAppData {
  const demo = createDemoData();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SavedAppData;
      if ((parsed.version === 1 || parsed.version === 2 || parsed.version === 3 || parsed.version === 4 || parsed.version === 5)
        && Array.isArray(parsed.students)
        && Array.isArray(parsed.assessments)
        && Array.isArray(parsed.submissions)
        && Array.isArray(parsed.assignments)) {
        const submissions = parsed.submissions.map((submission) => {
          const assessment = [...(parsed.assessments ?? []), ...demo.assessments].find((item) => item.id === submission.assessmentId);
          const questions = assessment?.questions?.[submission.language] ?? [];
          const answers = submission.answers.map((answer) => {
            const question = questions.find((item) => item.id === answer.questionId);
            const grade = question ? gradeAnswer(question, answer.extractedText ?? answer.sourceText ?? "", submission.language) : undefined;
            return {
              ...answer,
              confidence: answer.confidence ?? submission.confidenceRatings?.[answer.questionId] ?? "medium",
              aiMatchedTerms: answer.aiMatchedTerms ?? grade?.matchedTerms,
              aiMissingTerms: answer.aiMissingTerms ?? grade?.missingTerms,
              aiRationale: answer.aiRationale ?? grade?.rationale,
              // Records saved before override tracking: anything the teacher verified or changed counts as teacher-approved.
              markSource: answer.markSource ?? (answer.verified || answer.teacherScore !== answer.aiScore ? "teacher" : "ai"),
              feedbackSource: answer.feedbackSource ?? (answer.verified || answer.teacherFeedback !== answer.aiFeedback ? "teacher" : "ai"),
            };
          });
          const learningGaps = submission.learningGaps ?? [];
          const gapDecisions = submission.learningGapDecisions ?? Object.fromEntries(learningGaps.map((topic) => [topic, submission.status === "published" ? "confirmed" : "pending"]));
          return {
            ...submission,
            questionIds: submission.questionIds ?? submission.answers.map((answer) => answer.questionId),
            answers,
            learningGaps,
            learningGapDecisions: gapDecisions,
            flags: (submission.flags ?? []).map((flag) => ({ ...flag, decision: flag.decision ?? "pending" })),
            seenBy: submission.seenBy ?? { student: Boolean(submission.notificationSeen), parent: Boolean(submission.notificationSeen) },
          };
        });
        const version = parsed.version ?? 1;
        // Never upgrade saved data in place without first keeping the untouched original.
        if (version < CURRENT_VERSION && !backUpOriginal(saved, version)) unreadableSavedState = true;
        const migratedAssignments = parsed.assignments.map((assignment, index) => ({
          ...assignment,
          id: assignment.id ?? `assignment-migrated-${index}`,
        }));
        const merged: AssessmentAppData = {
          version: CURRENT_VERSION,
          students: version < 3 ? mergeById(parsed.students, demo.students) : parsed.students,
          assessments: version < 3 ? mergeById(parsed.assessments, demo.assessments) : parsed.assessments,
          assignments: version < 3 ? mergeById(migratedAssignments, demo.assignments.map((assignment, index) => ({ ...assignment, id: assignment.id ?? `seed-assignment-${index}` }))) : migratedAssignments,
          submissions: version < 3 ? mergeById(submissions, demo.submissions) : submissions,
          templates: version < 3 ? mergeById(parsed.templates ?? [], demo.templates) : parsed.templates ?? [],
          helpRequests: version < 3 ? mergeById((parsed.helpRequests ?? []).map((request) => ({ ...request, language: request.language ?? "en" })) as HelpRequestRecord[], demo.helpRequests) : (parsed.helpRequests ?? []) as HelpRequestRecord[],
        };
        // Enhancement stage: an optional list, kept as saved. Older data simply has none.
        if (Array.isArray(parsed.practiceLog)) merged.practiceLog = parsed.practiceLog;
        // Optional lists get a fixed position (even when empty), so save → load → save gives the same text.
        merged.customQuestions = Array.isArray(parsed.customQuestions) ? parsed.customQuestions : undefined;
        // Flagged students: kept as saved. Saved data from before this feature gets only the simulated demo
        // records for students it has (an added list; nothing that was saved is changed).
        if (Array.isArray(parsed.supportCases)) merged.supportCases = parsed.supportCases;
        else merged.supportCases = demo.supportCases?.filter((item) => merged.students.some((student) => student.id === item.studentId));
        // Student notifications: kept as saved (older data has none).
        merged.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : undefined;
        // The four demo notifications are added once (only the ones missing, only for the demo student).
        if (parsed.demoNotificationsSeeded === 1) merged.demoNotificationsSeeded = 1;
        else if (merged.students.some((student) => student.id === DEMO_STUDENT_ID)) {
          const have = new Set((merged.notifications ?? []).map((item) => item.id));
          merged.notifications = [...(merged.notifications ?? []), ...demoStudentNotifications().filter((item) => !have.has(item.id))];
          merged.demoNotificationsSeeded = 1;
        }
        // The predefined 72% demo result is added once to saved data that doesn't have it (only for the demo student).
        if (parsed.demoResultSeeded === 1) merged.demoResultSeeded = 1;
        else if (merged.students.some((student) => student.id === DEMO_STUDENT_ID)) {
          const check = demoFractionsCheck(demo.assessments);
          if (!(merged.customQuestions ?? []).some((item) => item.id === check.custom.id)) merged.customQuestions = [...(merged.customQuestions ?? []), check.custom];
          if (!merged.templates.some((item) => item.id === check.template.id)) merged.templates = [...merged.templates, check.template];
          if (!merged.assignments.some((item) => item.id === check.assignment.id)) merged.assignments = [...merged.assignments, check.assignment];
          if (!merged.submissions.some((item) => item.id === check.submission.id)) merged.submissions = [...merged.submissions, check.submission];
          merged.demoResultSeeded = 1;
        }
        // Built-in assessments are not editable in the app, so their wording and rubric always come from the code.
        merged.assessments = [...demo.assessments, ...merged.assessments.filter((item) => !demo.assessments.some((builtIn) => builtIn.id === item.id))];
        // Teacher questions are added back to their assessments (built-in questions always come from the code).
        const upgraded = withCustomQuestions(version < CURRENT_VERSION ? upgradeSavedData(merged, demo, version) : merged);
        // Enhancement stage: add the missing demo students. Saved data of the current version is first kept
        // as a new backup (older versions were already backed up above). If that backup fails, nothing is added.
        const extended = addMissingDemoStudents(upgraded, demo);
        if (extended.added.length === 0) return upgraded;
        if (version === CURRENT_VERSION && !backUpOriginal(saved, version)) return upgraded;
        return extended.data;
      }
      unreadableSavedState = true;
    }
  } catch {
    // Keep unreadable storage intact rather than overwriting it with demo data.
    unreadableSavedState = true;
  }
  return demo;
}

export function storeAssessmentData(data: AssessmentAppData) {
  if (unreadableSavedState) return false;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch { return false; }
}

export function getAssessment(data: AssessmentAppData, assessmentId: string) {
  return data.assessments.find((item) => item.id === assessmentId) ?? data.assessments[0];
}

export function getStudent(data: AssessmentAppData, studentId: string) {
  return data.students.find((item) => item.id === studentId) ?? data.students[0];
}

export function getQuestion(data: AssessmentAppData, submission: SubmissionRecord, questionId: string) {
  return getAssessment(data, submission.assessmentId).questions[submission.language].find((item) => item.id === questionId);
}

export function getSubmissionQuestions(data: AssessmentAppData, submission: SubmissionRecord) {
  const questions = getAssessment(data, submission.assessmentId).questions[submission.language];
  const ids = submission.questionIds ?? submission.answers.map((answer) => answer.questionId);
  // Questions follow the order the teacher chose (older records were saved in question-bank order, so they look the same).
  return ids.flatMap((id) => questions.filter((question) => question.id === id));
}

export function getSubmissionScore(data: AssessmentAppData, submission: SubmissionRecord) {
  return submission.answers.reduce((sum, answer) => sum + answer.teacherScore, 0);
}

export function getSubmissionMaxScore(data: AssessmentAppData, submission: SubmissionRecord) {
  const questions = getSubmissionQuestions(data, submission);
  return questions.reduce((sum, question) => sum + question.maxScore, 0);
}

export function getSubmissionProgress(data: AssessmentAppData, submission: SubmissionRecord) {
  const max = getSubmissionMaxScore(data, submission);
  return max ? Math.round((getSubmissionScore(data, submission) / max) * 100) : 0;
}
