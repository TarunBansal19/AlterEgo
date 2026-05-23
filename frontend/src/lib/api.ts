import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function uploadHeadshot(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/api/upload-headshot", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string; file_id: string };
}

export interface CreateJobReq {
  prompt: string;
  selected_styles: string[];
  headshot_url: string;
  headshot_file_id: string;
}

export async function createJob(body: CreateJobReq) {
  const { data } = await api.post("/api/job", body);
  return data as { job_id: string };
}

export interface Avatar {
  id: string;
  style_name: string;
  imagekit_url: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string | null;
}

export interface Job {
  id: string;
  prompt: string;
  num_avatars: number;
  headshot_url: string | null;
  headshot_deleted: boolean;
  status: "pending" | "processing" | "completed" | "failed";
  avatars: Avatar[];
  created_at: string;
}

export function jobStyleKeys(job: Job): string[] {
  return job.avatars.map((a) => a.style_name);
}

export async function listJobs() {
  const { data } = await api.get("/api/jobs");
  return (data as Job[]).map(normalizeJob);
}

export async function getJob(id: string) {
  const { data } = await api.get(`/api/jobs/${id}`);
  return normalizeJob(data as Job);
}

function normalizeJob(job: Job): Job {
  return {
    ...job,
    avatars: job.avatars.map(normalizeAvatar),
  };
}

function normalizeAvatar(raw: Partial<Avatar> & { style?: string }): Avatar {
  return {
    id: raw.id ?? "",
    style_name: raw.style_name ?? raw.style ?? "",
    imagekit_url: raw.imagekit_url ?? null,
    status: raw.status ?? "pending",
    error_message: raw.error_message,
  };
}

export function parseStreamAvatar(raw: Record<string, unknown>): Avatar {
  return normalizeAvatar({
    id: (raw.avatar_id ?? raw.id) as string,
    style_name: (raw.style_name ?? raw.style) as string,
    imagekit_url: (raw.imagekit_url as string | null) ?? null,
    status: "completed",
    error_message: raw.error_message as string | undefined,
  });
}

export async function openJobStream(jobId: string): Promise<EventSource> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? "";
  return new EventSource(`${API_BASE}/api/jobs/${jobId}/stream?token=${encodeURIComponent(token)}`);
}

export function variantUrl(base: string, variant: "profile" | "banner" | "story") {
  const tr = {
    profile: "w-500,h-500,fo-face",
    banner: "w-1500,h-500,fo-face",
    story: "w-1080,h-1920,fo-face",
  }[variant];
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}tr=${tr}`;
}
