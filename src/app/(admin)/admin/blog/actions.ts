"use server";

import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  destroyCloudinaryImage,
  extractCloudinaryPublicIdFromUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { normalizeRichTextValue, richTextPayloadSchema } from "@/lib/validators/rich-text";
import { toSlug } from "@/lib/validators/cooperative";

export type BlogActionState = {
  ok: boolean;
  message: string;
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio").max(80),
  slug: z.string().trim().min(2).max(80).optional(),
});

const postBaseSchema = z.object({
  title: z.string().trim().min(2, "El título es obligatorio").max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureUniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const slug = toSlug(base);
  let suffix = 0;
  for (;;) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await db.blogPost.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix++;
  }
}

async function ensureUniqueCategorySlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const slug = toSlug(base);
  let suffix = 0;
  for (;;) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await db.blogCategory.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix++;
  }
}

function revalidatePublicBlogPaths(slug?: string | null): void {
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

// ─── Categorías ──────────────────────────────────────────────────────────────

export async function createCategoryAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, slug: rawSlug } = parsed.data;
  const slug = await ensureUniqueCategorySlug(rawSlug ?? name);

  await db.blogCategory.create({ data: { name, slug } });

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Categoría creada" };
}

export async function updateCategoryAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, slug: rawSlug } = parsed.data;
  const slug = await ensureUniqueCategorySlug(rawSlug ?? name, id);

  await db.blogCategory.update({ where: { id }, data: { name, slug } });

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Categoría actualizada" };
}

export async function deleteCategoryAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const postCount = await db.blogPost.count({ where: { categoryId: id } });
  if (postCount > 0) {
    return {
      ok: false,
      message: `No se puede eliminar: tiene ${postCount} artículo(s) asociado(s).`,
    };
  }

  await db.blogCategory.delete({ where: { id } });

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Categoría eliminada" };
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const auth = await requirePlatformAdmin();

  const parsed = postBaseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || "",
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { title, slug: rawSlug, excerpt, categoryId } = parsed.data;
  const slug = await ensureUniqueSlug(rawSlug ?? title);

  await db.blogPost.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      status: "DRAFT",
      categoryId,
      authorId: auth.userId,
    },
  });

  revalidatePath("/admin/blog");
  return { ok: true, message: "Artículo creado" };
}

export async function updatePostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const parsed = postBaseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || "",
    categoryId: formData.get("categoryId"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const richParsed = richTextPayloadSchema.safeParse({
    html: formData.get("bodyHtml") ?? "",
    text: formData.get("bodyText") ?? "",
  });

  if (!richParsed.success) {
    return { ok: false, message: "Contenido inválido" };
  }

  const { title, slug: rawSlug, excerpt, categoryId } = parsed.data;
  const slug = await ensureUniqueSlug(rawSlug ?? title, id);
  const normalizedRich = normalizeRichTextValue(richParsed.data);

  const previous = await db.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!previous) {
    return { ok: false, message: "Artículo no encontrado" };
  }

  await db.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      bodyHtml: normalizedRich.html || null,
      bodyText: normalizedRich.text || null,
      categoryId,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePublicBlogPaths(previous.slug);
  if (previous.slug !== slug) {
    revalidatePublicBlogPaths(slug);
  }
  return { ok: true, message: "Artículo guardado" };
}

export async function publishPostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const post = await db.blogPost.findUnique({
    where: { id },
    select: { status: true, slug: true },
  });
  if (!post) return { ok: false, message: "Artículo no encontrado" };

  const newStatus: PostStatus =
    post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await db.blogPost.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePublicBlogPaths(post.slug);
  return {
    ok: true,
    message: newStatus === "PUBLISHED" ? "Artículo publicado" : "Artículo despublicado",
  };
}

export async function archivePostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const post = await db.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!post) return { ok: false, message: "Artículo no encontrado" };

  await db.blogPost.update({
    where: { id },
    data: { status: "ARCHIVED", publishedAt: null },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePublicBlogPaths(post.slug);
  return { ok: true, message: "Artículo archivado" };
}

export async function deletePostAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requirePlatformAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

  const post = await db.blogPost.findUnique({
    where: { id },
    select: { coverImageUrl: true, slug: true },
  });
  if (!post) return { ok: false, message: "Artículo no encontrado" };

  if (post.coverImageUrl) {
    const publicId = extractCloudinaryPublicIdFromUrl(post.coverImageUrl);
    if (publicId) await destroyCloudinaryImage(publicId);
  }

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/admin/blog");
  revalidatePublicBlogPaths(post.slug ?? undefined);
  redirect("/admin/blog");
}

export async function uploadPostCoverAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  try {
    await requirePlatformAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

    const file = formData.get("cover");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "Selecciona una imagen" };
    }

    const post = await db.blogPost.findUnique({
      where: { id },
      select: { coverImageUrl: true, slug: true },
    });
    if (!post) return { ok: false, message: "Artículo no encontrado" };

    if (post.coverImageUrl) {
      const publicId = extractCloudinaryPublicIdFromUrl(post.coverImageUrl);
      if (publicId) await destroyCloudinaryImage(publicId);
    }

    const result = await uploadImageToCloudinary(file, {
      folder: "blog/covers",
      maxBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    await db.blogPost.update({
      where: { id },
      data: { coverImageUrl: result.secureUrl },
    });

    revalidatePath(`/admin/blog/${id}`);
    revalidatePublicBlogPaths(post.slug);
    return { ok: true, message: "Imagen de portada actualizada" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo subir la imagen.",
    };
  }
}

export async function removePostCoverAction(
  _prev: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  try {
    await requirePlatformAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { ok: false, message: "ID inválido" };

    const post = await db.blogPost.findUnique({
      where: { id },
      select: { coverImageUrl: true, slug: true },
    });
    if (!post || !post.coverImageUrl) return { ok: false, message: "No hay imagen" };

    const publicId = extractCloudinaryPublicIdFromUrl(post.coverImageUrl);
    if (publicId) await destroyCloudinaryImage(publicId);

    await db.blogPost.update({
      where: { id },
      data: { coverImageUrl: null },
    });

    revalidatePath(`/admin/blog/${id}`);
    revalidatePublicBlogPaths(post.slug);
    return { ok: true, message: "Imagen eliminada" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo eliminar la imagen.",
    };
  }
}
