import { API_BASE } from "./api";

type Gender = "male" | "female" | "";

type ThemePreference = "dark" | "light";

type Profile = {
  full_name?: string;
  avatar_url?: string;
  gender?: Gender;
  theme_preference?: ThemePreference;
  attendance_target?: number;
  study_start?: string;
  study_end?: string;
  goals?: string;
  target_exam_title?: string;
};

type Subject = {
  id: string;
  name: string;
  color: string;
  attendance_target?: number;
};

async function withAuthHeaders(init: RequestInit = {}): Promise<RequestInit> {
  const token = localStorage.getItem("ff_token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

export const settingsService = {
  async getProfile(): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE}?action=getProfile`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { data: null, error: json?.message ?? res.statusText };
      return { data: (json?.data?.profile ?? null) as Profile | null, error: null };
    } catch (e: unknown) {
      return { data: null, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async updateProfile(payload: Profile): Promise<{ error: string | null }> {
    try {
      const res = await fetch(
        `${API_BASE}?action=updateProfile`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { error: json?.message ?? res.statusText };
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  },

  async getSubjects(): Promise<{ data: Subject[]; error: string | null }> {
    try {
      const res = await fetch(
        `${API_BASE}?action=getSubjects`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { data: [], error: json?.message ?? res.statusText };
      return { data: (json?.data?.subjects ?? []) as Subject[], error: null };
    } catch (e: unknown) {
      return { data: [], error: e instanceof Error ? e.message : String(e) };
    }
  },

  async addSubject(payload: Omit<Subject, "id">): Promise<{ error: string | null }> {
    try {
      const res = await fetch(
        `${API_BASE}?action=addSubject`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { error: json?.message ?? res.statusText };
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  },

  async updateSubject(subjectId: string, payload: Partial<Omit<Subject, "id">>): Promise<{ error: string | null }> {
    try {
      const res = await fetch(
        `${API_BASE}?action=updateSubject`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subjectId, payload }),
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { error: json?.message ?? res.statusText };
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  },

  async deleteSubject(subjectId: string): Promise<{ error: string | null }> {
    try {
      const res = await fetch(
        `${API_BASE}?action=deleteSubject`,
        await withAuthHeaders({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subjectId }),
        }),
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { error: json?.message ?? res.statusText };
      return { error: null };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  },
};

