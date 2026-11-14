// Stage 4: page addresses (hash routes) without a router package.
// The address describes the page; the demo role is chosen with the role switch and kept for the tab.
// An address for another role never switches the role: it leads to the current role's Home instead.

export type Role = "Teacher" | "Student" | "Parent";
export const ROLES: Role[] = ["Teacher", "Student", "Parent"];

/** Page name (as shown in the sidebar) → address segment. Home has no segment. */
export const PAGE_SLUGS: Record<Role, Record<string, string>> = {
  Teacher: { Home: "", "Review submissions": "review", Students: "students", "Flagged students": "flagged", "Create assessment": "create", "Help requests": "help", "Learning insights": "insights" },
  Student: { Home: "", "My work": "work", "My results": "results", "Get help": "help" },
  Parent: { Home: "", Results: "results", "Teacher feedback": "feedback", "Practise at home": "practise" },
};

/** Pages whose address can name one record. */
export const DETAIL_PAGES: Record<Role, string[]> = {
  Teacher: ["Review submissions", "Students", "Flagged students"],
  Student: ["My results"],
  Parent: ["Teacher feedback"],
};

export const CREATE_TABS = ["new", "saved", "questions", "questions/new"] as const;
export type CreateTab = (typeof CREATE_TABS)[number];

export interface Route {
  role: Role;
  page: string;
  /** A submission (review, results, feedback) or a student (profile). */
  id?: string;
  /** Review: "q1", "q2"… or "summary". Create assessment: a tab. */
  sub?: string;
  /** Search text on Review submissions and Students. */
  query?: string;
}

export function formatRoute(route: Route): string {
  const slug = PAGE_SLUGS[route.role][route.page] ?? "";
  const parts = [route.role.toLowerCase(), slug, route.id ? encodeURIComponent(route.id) : "", route.sub ?? ""].filter(Boolean);
  const path = `#/${parts.join("/")}`;
  return route.query ? `${path}?q=${encodeURIComponent(route.query)}` : path;
}

/** Reads an address. Returns undefined when it isn't a Brightpath address at all (empty, "#main"…). */
export function parseRoute(hash: string): (Route & { known: boolean }) | undefined {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith("/")) return undefined;
  const [pathPart, queryPart = ""] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean).map((segment) => { try { return decodeURIComponent(segment); } catch { return segment; } });
  const role = ROLES.find((item) => item.toLowerCase() === segments[0]);
  if (!role) return undefined;
  const query = new URLSearchParams(queryPart).get("q") ?? undefined;
  const pageSlug = segments[1] ?? "";
  const page = Object.entries(PAGE_SLUGS[role]).find(([, slug]) => slug === pageSlug)?.[0];
  if (!page) return { role, page: "Home", known: false };
  if (page === "Create assessment") {
    const sub = segments.slice(2).join("/");
    if (!sub) return { role, page, known: true };
    return (CREATE_TABS as readonly string[]).includes(sub) ? { role, page, sub, known: true } : { role, page, known: false };
  }
  const id = DETAIL_PAGES[role].includes(page) ? segments[2] : undefined;
  const sub = page === "Review submissions" && id ? segments[3] : undefined;
  const extra = segments.length > (id ? (sub ? 4 : 3) : 2) || (sub !== undefined && !/^(q[1-9][0-9]?|summary)$/.test(sub));
  return { role, page, id, sub, query: query || undefined, known: !extra };
}

export type GuardResult =
  | { kind: "ok"; route: Route }
  /** Wrong role or unknown page: go to the current role's Home and replace the address. */
  | { kind: "redirect"; route: Route }
  /** Right role and page, but the record doesn't exist or isn't visible to this role. */
  | { kind: "not-found"; route: Route };

/** `canSee(page, id)` must answer for the current role only, e.g. a student may only open their own shared
 *  results. Hidden and missing records get the same "not found", so nothing about them is revealed. */
export function guardRoute(parsed: (Route & { known: boolean }) | undefined, currentRole: Role, canSee: (page: string, id: string) => boolean): GuardResult {
  const home: Route = { role: currentRole, page: "Home" };
  if (!parsed) return { kind: "redirect", route: home };
  if (parsed.role !== currentRole) return { kind: "redirect", route: home };
  if (!parsed.known) return { kind: "redirect", route: home };
  const { known: _known, ...route } = parsed;
  if (route.id && !canSee(route.page, route.id)) return { kind: "not-found", route };
  return { kind: "ok", route };
}
