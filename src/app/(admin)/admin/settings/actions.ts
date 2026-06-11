"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  DEFAULT_COMING_SOON_MESSAGE,
  PLATFORM_SETTINGS_SINGLETON_ID,
} from "@/lib/platform-settings";

function parseBoolean(formData: FormData, field: string): boolean {
  return formData.get(field) === "on";
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_date");
  }

  return parsed;
}

export async function updatePlatformSettingsAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const comingSoonEnabled = parseBoolean(formData, "comingSoonEnabled");
  const homeShowEvents = parseBoolean(formData, "homeShowEvents");
  const homeShowTestimonials = parseBoolean(formData, "homeShowTestimonials");
  const homeShowBlog = parseBoolean(formData, "homeShowBlog");

  const rawMessage = formData.get("comingSoonMessage");
  const comingSoonMessage = typeof rawMessage === "string" ? rawMessage.trim() : "";

  let comingSoonLaunchAt: Date | null = null;

  try {
    comingSoonLaunchAt = parseOptionalDate(formData.get("comingSoonLaunchAt"));
  } catch {
    redirect("/admin/settings?error=invalid_date");
  }

  if (comingSoonEnabled && !comingSoonLaunchAt) {
    redirect("/admin/settings?error=missing_countdown");
  }

  if (comingSoonMessage.length > 280) {
    redirect("/admin/settings?error=message_too_long");
  }

  await db.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_SINGLETON_ID },
    create: {
      id: PLATFORM_SETTINGS_SINGLETON_ID,
      comingSoonEnabled,
      comingSoonMessage: comingSoonMessage || DEFAULT_COMING_SOON_MESSAGE,
      comingSoonLaunchAt,
      homeShowEvents,
      homeShowTestimonials,
      homeShowBlog,
    },
    update: {
      comingSoonEnabled,
      comingSoonMessage: comingSoonMessage || DEFAULT_COMING_SOON_MESSAGE,
      comingSoonLaunchAt,
      homeShowEvents,
      homeShowTestimonials,
      homeShowBlog,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/eventos", "page");
  revalidatePath("/blog", "page");

  redirect("/admin/settings?saved=1");
}
