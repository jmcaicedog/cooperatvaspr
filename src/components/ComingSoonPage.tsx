"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function calculateCountdown(targetIso: string | null): CountdownParts | null {
  if (!targetIso) return null;

  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;

  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, finished: false };
}

function CountdownCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3 text-center sm:px-5"
      style={{ borderColor: "rgba(255,255,255,0.22)", backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <p className="text-2xl font-bold text-white sm:text-3xl">{String(value).padStart(2, "0")}</p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-white/70">{label}</p>
    </div>
  );
}

export function ComingSoonPage({ message, launchAtIso }: { message: string; launchAtIso: string | null }) {
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (!launchAtIso) return;

    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [launchAtIso]);

  const countdown = useMemo(() => {
    void nowTick;
    return calculateCountdown(launchAtIso);
  }, [launchAtIso, nowTick]);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "radial-gradient(circle at 20% 20%, #0f5a46 0%, #06392d 40%, #02261d 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl rounded-3xl border px-6 py-10 text-center sm:px-10 sm:py-12" style={{ borderColor: "rgba(255,255,255,0.22)", backgroundColor: "rgba(2, 38, 29, 0.5)", backdropFilter: "blur(6px)" }}>
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/brand/logo-mark.svg"
            alt="cooperativas.pr"
            width={132}
            height={72}
            priority
          />
          <div className="mt-4">
            <Image
              src="/brand/logo-verde.svg"
              alt="cooperativas.pr"
              width={190}
              height={20}
              priority
            />
          </div>
        </div>

        <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{message}</p>

        {countdown ? (
          <div className="mt-8">
            {countdown.finished ? (
              <p className="text-lg font-semibold text-[#9dd4bd]">La espera termino. Ya estamos al aire.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CountdownCard label="Dias" value={countdown.days} />
                <CountdownCard label="Horas" value={countdown.hours} />
                <CountdownCard label="Minutos" value={countdown.minutes} />
                <CountdownCard label="Segundos" value={countdown.seconds} />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-8 text-sm text-white/70">Muy pronto compartiremos todo el directorio en linea.</p>
        )}

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--verde-cooperativo)", color: "var(--verde-impulso)" }}
          >
            Acceso administrativo
          </Link>
        </div>
      </section>
    </main>
  );
}
