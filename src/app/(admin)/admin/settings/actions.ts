"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

const contactSettingsSchema = z.object({
  contactEmail: z.string().trim().email().max(254),
  contactLocation: z.string().trim().min(1).max(180),
  contactHours: z.string().trim().min(1).max(180),
  contactTitle: z.string().trim().min(1).max(120),
  contactIntro: z.string().trim().min(1).max(500),
});

export async function updatePlatformSettingsAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const comingSoonEnabled = parseBoolean(formData, "comingSoonEnabled");
  const homeShowEvents = parseBoolean(formData, "homeShowEvents");
  const homeShowTestimonials = parseBoolean(formData, "homeShowTestimonials");
  const homeShowBlog = parseBoolean(formData, "homeShowBlog");
  const contactFormEnabled = parseBoolean(formData, "contactFormEnabled");

  const rawMessage = formData.get("comingSoonMessage");
  const comingSoonMessage = typeof rawMessage === "string" ? rawMessage.trim() : "";
  const parsedContactSettings = contactSettingsSchema.safeParse({
    contactEmail: formData.get("contactEmail") ?? "",
    contactLocation: formData.get("contactLocation") ?? "",
    contactHours: formData.get("contactHours") ?? "",
    contactTitle: formData.get("contactTitle") ?? "",
    contactIntro: formData.get("contactIntro") ?? "",
  });

  if (!parsedContactSettings.success) {
    redirect("/admin/settings?error=invalid_contact_settings");
  }

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
      contactFormEnabled,
      ...parsedContactSettings.data,
    },
    update: {
      comingSoonEnabled,
      comingSoonMessage: comingSoonMessage || DEFAULT_COMING_SOON_MESSAGE,
      comingSoonLaunchAt,
      homeShowEvents,
      homeShowTestimonials,
      homeShowBlog,
      contactFormEnabled,
      ...parsedContactSettings.data,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/eventos", "page");
  revalidatePath("/blog", "page");
  revalidatePath("/contacto", "page");

  redirect("/admin/settings?saved=1");
}
