"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type BannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
};

export function HeroBanner({ banners }: { banners: BannerItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "1600/600" }}>
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover transition-opacity duration-700"
        priority
        sizes="100vw"
      />
      {/* Clickable overlay when banner has a URL */}
      {banner.targetUrl && (
        <Link
          href={banner.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-[1]"
          aria-label={banner.title}
        />
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                backgroundColor: i === current ? "var(--verde-cooperativo)" : "rgba(255,255,255,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarBanner({ banners }: { banners: BannerItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  const content = (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "600/900" }}>
      <Image
        src={banner.imageUrl}
        alt={banner.title}
        fill
        className="object-cover transition-opacity duration-700"
        sizes="(max-width: 1024px) 100vw, 300px"
      />
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                backgroundColor: i === current ? "var(--verde-cooperativo)" : "rgba(255,255,255,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (banner.targetUrl) {
    return (
      <Link
        href={banner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-95 transition-opacity"
        title={banner.title}
      >
        {content}
      </Link>
    );
  }

  return content;
}
