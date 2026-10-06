import { cache } from "react";

import { db } from "@/lib/db";

export const PLATFORM_SETTINGS_SINGLETON_ID = 1;

export const DEFAULT_COMING_SOON_MESSAGE = "Proximamente estaremos al aire.";
export const DEFAULT_CONTACT_EMAIL = "hola@cooperativas.pr";
export const DEFAULT_CONTACT_LOCATION = "Puerto Rico";
export const DEFAULT_CONTACT_HOURS = "Lunes a viernes, 9am – 5pm AST";
export const DEFAULT_CONTACT_TITLE = "Contacto";
export const DEFAULT_CONTACT_INTRO = "¿Tienes preguntas o deseas registrar tu cooperativa?";

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
