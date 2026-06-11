import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ComingSoonPage } from "@/components/ComingSoonPage";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPlatformSettings();

  if (settings.comingSoonEnabled) {
    return (
      <ComingSoonPage
        message={settings.comingSoonMessage}
        launchAtIso={settings.comingSoonLaunchAt ? settings.comingSoonLaunchAt.toISOString() : null}
      />
    );
  }

  return (
    <>
      <SiteHeader showEventsLink={settings.homeShowEvents} showBlogLink={settings.homeShowBlog} />
      <main className="flex-1">{children}</main>
      <SiteFooter showEventsLink={settings.homeShowEvents} showBlogLink={settings.homeShowBlog} />
    </>
  );
}
