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
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Categorías del blog</h1>
        <p className="mt-1 text-sm text-zinc-500">{categories.length} categoría(s)</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
