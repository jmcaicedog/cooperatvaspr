import Link from "next/link";

export default function CooperativaDashboardPage() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Panel de Cooperativa</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Gestiona la información pública de tu cooperativa y envía cambios para publicación cuando
        sea necesario.
      </p>
      <div className="mt-6">
        <Link
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          href="/cooperativa/perfil"
        >
          Editar perfil
        </Link>
      </div>
    </section>
  );
}
