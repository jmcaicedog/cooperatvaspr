import { SocialPlatform } from "@prisma/client";

export const socialPlatformOptions: SocialPlatform[] = [
  SocialPlatform.FACEBOOK,
  SocialPlatform.INSTAGRAM,
  SocialPlatform.X,
  SocialPlatform.LINKEDIN,
  SocialPlatform.YOUTUBE,
  SocialPlatform.TIKTOK,
  SocialPlatform.OTHER,
];

export const socialPlatformLabels: Record<SocialPlatform, string> = {
  [SocialPlatform.FACEBOOK]: "Facebook",
  [SocialPlatform.INSTAGRAM]: "Instagram",
  [SocialPlatform.X]: "X / Twitter",
  [SocialPlatform.LINKEDIN]: "LinkedIn",
  [SocialPlatform.YOUTUBE]: "YouTube",
  [SocialPlatform.TIKTOK]: "TikTok",
  [SocialPlatform.OTHER]: "Otra",
};

export function normalizeSocialUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
  return hasScheme ? trimmed : `https://${trimmed}`;
}
