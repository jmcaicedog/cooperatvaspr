import { updatePlatformSettingsAction } from "@/app/(admin)/admin/settings/actions";
import { getPlatformSettings } from "@/lib/platform-settings";

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

function formatDateTimeLocalInput(value: Date | null): string {
  if (!value) return "";

  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function getErrorMessage(code: string | undefined): string | null {
  if (!code) return null;

  if (code === "invalid_date") {
    return "La fecha del contador no es valida.";
  }

  if (code === "missing_countdown") {
    return "Cuando activas Proximamente, debes definir una fecha y hora para el contador.";
  }

  if (code === "message_too_long") {
    return "El mensaje de Proximamente no puede superar 280 caracteres.";
  }

  return "No se pudieron guardar los ajustes.";
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      className="flex items-start justify-between gap-4 rounded-xl border p-4"
      style={{ borderColor: "#d7e4dd", backgroundColor: "#f7fbf9" }}
    >
      <span>
        <span className="block text-sm font-semibold" style={{ color: "#123a2f" }}>
          {label}
        </span>
        <span className="mt-1 block text-xs" style={{ color: "#5f7d72" }}>
          {description}
        </span>
      </span>
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-700"
      />
    </label>
  );
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [settings, params] = await Promise.all([getPlatformSettings(), searchParams]);

  const success = params.saved === "1";
  const error = getErrorMessage(params.error);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5f7d72" }}>
          Configuracion del portal
        </p>
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#0f2c24" }}>Ajustes de visibilidad</h2>
        <p className="mt-1 text-sm" style={{ color: "#4e6d62" }}>
          Controla el modo Proximamente y las secciones activas del home.
        </p>
      </header>

      {success ? (
        <p className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#b8e2ce", backgroundColor: "#ecfbf3", color: "#0f5a46" }}>
          Ajustes guardados correctamente.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#f4c7c3", backgroundColor: "#fff5f5", color: "#8b2d2d" }}>
          {error}
        </p>
      ) : null}

      <form action={updatePlatformSettingsAction} className="space-y-6">
        <div className="space-y-4 rounded-2xl border p-5" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <h3 className="text-lg font-semibold" style={{ color: "#123a2f" }}>Modo Proximamente</h3>

          <ToggleRow
            name="comingSoonEnabled"
            label="Activar modo Proximamente"
            description="Al activarlo, el portal publico mostrara una pagina temporal con contador regresivo."
            defaultChecked={settings.comingSoonEnabled}
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: "#123a2f" }} htmlFor="comingSoonMessage">
              Mensaje editable
            </label>
            <textarea
              id="comingSoonMessage"
              name="comingSoonMessage"
              rows={3}
              maxLength={280}
              defaultValue={settings.comingSoonMessage}
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#c8dad1" }}
              placeholder="Proximamente estaremos al aire."
            />
            <p className="text-xs" style={{ color: "#5f7d72" }}>
              Este texto se mostrara en la pagina de espera.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: "#123a2f" }} htmlFor="comingSoonLaunchAt">
              Fecha y hora del contador regresivo
            </label>
            <input
              id="comingSoonLaunchAt"
              name="comingSoonLaunchAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocalInput(settings.comingSoonLaunchAt)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#c8dad1" }}
            />
            <p className="text-xs" style={{ color: "#5f7d72" }}>
              Si el modo Proximamente esta activo, este valor es obligatorio.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border p-5" style={{ borderColor: "#d7e4dd", backgroundColor: "#ffffff" }}>
          <h3 className="text-lg font-semibold" style={{ color: "#123a2f" }}>Secciones del home</h3>

          <ToggleRow
            name="homeShowEvents"
            label="Mostrar Eventos"
            description="Activa o desactiva la seccion de eventos en el home. Tambien controla el enlace Eventos en el menu."
            defaultChecked={settings.homeShowEvents}
          />

          <ToggleRow
            name="homeShowTestimonials"
            label="Mostrar Testimonios"
            description="Activa o desactiva la seccion de testimonios en el home."
            defaultChecked={settings.homeShowTestimonials}
          />

          <ToggleRow
            name="homeShowBlog"
            label="Mostrar Blog"
            description="Activa o desactiva la seccion del blog en el home. Tambien controla el enlace Blog en el menu."
            defaultChecked={settings.homeShowBlog}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--verde-impulso)" }}
          >
            Guardar configuracion
          </button>
        </div>
      </form>
    </section>
  );
}
