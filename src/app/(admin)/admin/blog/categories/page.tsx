import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { CategoryManager } from "./CategoryManager";

export default async function CategoriesPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-sm">Esta vista requiere iniciar sesión con un usuario PLATFORM_ADMIN.</p>
      </section>
    );
  }

  const categories = await db.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: "#d7e4dd", background: "linear-gradient(135deg, #f6fbf8 0%, #eff7f3 100%)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "#0f2c24" }}>Categorías del blog</h1>
        <p className="mt-1 text-sm" style={{ color: "#4e6d62" }}>{categories.length} categoría(s)</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
