export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-10">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-zinc-500">Implementación en progreso</p>
        <h1 className="text-4xl font-semibold tracking-tight">Directorio de Cooperativas PR</h1>
        <p className="max-w-2xl text-zinc-600">
          Esta primera fase está enfocada en construir el panel administrativo: esquema de datos,
          catálogo de municipios, gestión de cooperativas y gestión de banners.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Entradas disponibles</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            <a className="font-medium text-zinc-900 underline" href="/admin">
              Ir al panel administrativo
            </a>
          </li>
          <li>
            Ejecuta migraciones con: npm run prisma:migrate
          </li>
          <li>
            Carga municipios con: npm run seed:municipalities
          </li>
        </ul>
      </div>
    </div>
  );
}
