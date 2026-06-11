import { cache } from "react";

import { db } from "@/lib/db";

export const PLATFORM_SETTINGS_SINGLETON_ID = 1;

export const DEFAULT_COMING_SOON_MESSAGE = "Proximamente estaremos al aire.";

export const getPlatformSettings = cache(async () => {
  return db.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: PLATFORM_SETTINGS_SINGLETON_ID,
      comingSoonMessage: DEFAULT_COMING_SOON_MESSAGE,
    },
  });
});
