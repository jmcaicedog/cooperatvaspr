import type { MetadataRoute } from "next";

const SITE_URL = "https://cooperativas.pr";

const PUBLIC_PAGES = [
  "/",
  "/quienes-somos",
  "/servicios",
  "/eventos",
  "/blog",
  "/contacto",
  "/privacidad",
  "/terminos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
