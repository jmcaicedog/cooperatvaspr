export const BANNER_SLOTS = ["HERO", "SIDEBAR_TOP", "SIDEBAR_BOTTOM"] as const;

export type BannerSlotKey = (typeof BANNER_SLOTS)[number];

export const BANNER_SLOT_CONFIG: Record<
  BannerSlotKey,
  {
    label: string;
    width: number;
    height: number;
    maxImages: number;
    description: string;
  }
> = {
  HERO: {
    label: "Hero",
    width: 1600,
    height: 600,
    maxImages: 3,
    description: "Banner principal horizontal",
  },
  SIDEBAR_TOP: {
    label: "Sidebar Superior",
    width: 600,
    height: 900,
    maxImages: 3,
    description: "Banner vertical superior",
  },
  SIDEBAR_BOTTOM: {
    label: "Sidebar Inferior",
    width: 600,
    height: 900,
    maxImages: 3,
    description: "Banner vertical inferior",
  },
};
