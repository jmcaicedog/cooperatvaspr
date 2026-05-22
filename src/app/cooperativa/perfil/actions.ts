"use server";

import { ChangeRequestStatus, ChangeSeverity, ReviewStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireCoopAdminOrPlatform } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { sanitizeBasicHtml, richTextPayloadSchema } from "@/lib/validators/rich-text";
import { cooperativeCreateSchema } from "@/lib/validators/cooperative";

export type ProfileActionState = {
  ok: boolean;
  message: string;
};

function toOptionalValue(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateCooperativeProfileAction(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const actor = await requireCoopAdminOrPlatform();

  const cooperativeIdFromForm = toOptionalValue(formData.get("cooperativeId"));
  if (!cooperativeIdFromForm) {
    return { ok: false, message: "Cooperativa inválida." };
  }

  if (actor.role === UserRole.COOP_ADMIN && actor.cooperativeId !== cooperativeIdFromForm) {
    return { ok: false, message: "No puedes editar otra cooperativa." };
  }

  const cooperative = await db.cooperative.findUnique({
    where: { id: cooperativeIdFromForm },
    select: {
      id: true,
      name: true,
      municipalityCode: true,
      slogan: true,
      descriptionText: true,
      descriptionRich: true,
    },
  });

  if (!cooperative) {
    return { ok: false, message: "Cooperativa no encontrada." };
  }

  const parsedCore = cooperativeCreateSchema.safeParse({
    name: formData.get("name"),
    municipalityCode: formData.get("municipalityCode"),
    slogan: formData.get("slogan"),
    descriptionText: formData.get("descriptionText"),
  });

  if (!parsedCore.success) {
    return {
      ok: false,
      message: parsedCore.error.issues[0]?.message ?? "Formulario inválido.",
    };
  }

  const parsedRich = richTextPayloadSchema.safeParse({
    html: formData.get("descriptionRichHtml") ?? "",
    text: formData.get("descriptionRichText") ?? "",
  });

  if (!parsedRich.success) {
    return {
      ok: false,
      message: parsedRich.error.issues[0]?.message ?? "Descripción enriquecida inválida.",
    };
  }

  const newData = {
    name: parsedCore.data.name,
    municipalityCode: parsedCore.data.municipalityCode,
    slogan: parsedCore.data.slogan || null,
    descriptionText: parsedCore.data.descriptionText || null,
    descriptionRich: {
      html: sanitizeBasicHtml(parsedRich.data.html),
      text: parsedRich.data.text,
    },
  };

  const isMajorChange =
    newData.name !== cooperative.name || newData.municipalityCode !== cooperative.municipalityCode;

  if (actor.role === UserRole.PLATFORM_ADMIN || !isMajorChange) {
    await db.cooperative.update({
      where: { id: cooperative.id },
      data: {
        ...newData,
        reviewStatus: ReviewStatus.APPROVED,
        updatedById: actor.userId,
      },
    });

    await db.cooperativeChangeRequest.create({
      data: {
        cooperativeId: cooperative.id,
        requestedById: actor.userId,
        reviewedById: actor.role === UserRole.PLATFORM_ADMIN ? actor.userId : null,
        severity: isMajorChange ? ChangeSeverity.MAJOR : ChangeSeverity.MINOR,
        status:
          actor.role === UserRole.PLATFORM_ADMIN
            ? ChangeRequestStatus.APPROVED
            : ChangeRequestStatus.AUTO_PUBLISHED,
        payload: newData,
        notes:
          actor.role === UserRole.PLATFORM_ADMIN
            ? "Ajuste aplicado por administrador de plataforma"
            : "Cambio menor autopublicado",
        reviewedAt: actor.role === UserRole.PLATFORM_ADMIN ? new Date() : null,
      },
    });

    revalidatePath("/cooperativa/perfil");
    revalidatePath("/admin/cooperatives");

    return {
      ok: true,
      message:
        actor.role === UserRole.PLATFORM_ADMIN
          ? "Cambios aplicados inmediatamente."
          : "Cambios menores aplicados y publicados automáticamente.",
    };
  }

  await db.cooperativeChangeRequest.create({
    data: {
      cooperativeId: cooperative.id,
      requestedById: actor.userId,
      severity: ChangeSeverity.MAJOR,
      status: ChangeRequestStatus.PENDING,
      payload: newData,
      notes: "Cambio mayor enviado a revisión",
    },
  });

  await db.cooperative.update({
    where: { id: cooperative.id },
    data: {
      reviewStatus: ReviewStatus.PENDING,
      updatedById: actor.userId,
    },
  });

  revalidatePath("/cooperativa/perfil");
  revalidatePath("/admin/reviews");

  return {
    ok: true,
    message: "Cambio mayor enviado a aprobación de la plataforma.",
  };
}

export async function reviewChangeRequestAction(
  requestId: string,
  decision: "approve" | "reject"
): Promise<void> {
  const actor = await requireCoopAdminOrPlatform();
  if (actor.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error("Solo plataforma puede revisar cambios.");
  }

  const request = await db.cooperativeChangeRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      cooperativeId: true,
      payload: true,
    },
  });

  if (!request || request.status !== ChangeRequestStatus.PENDING) {
    throw new Error("Solicitud inválida o ya procesada.");
  }

  if (decision === "approve") {
    const payload = request.payload as {
      name: string;
      municipalityCode: string;
      slogan: string | null;
      descriptionText: string | null;
      descriptionRich: { html: string; text: string };
    };

    await db.cooperative.update({
      where: { id: request.cooperativeId },
      data: {
        name: payload.name,
        municipalityCode: payload.municipalityCode,
        slogan: payload.slogan,
        descriptionText: payload.descriptionText,
        descriptionRich: payload.descriptionRich,
        reviewStatus: ReviewStatus.APPROVED,
        updatedById: actor.userId,
      },
    });

    await db.cooperativeChangeRequest.update({
      where: { id: request.id },
      data: {
        status: ChangeRequestStatus.APPROVED,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    });
  } else {
    await db.cooperativeChangeRequest.update({
      where: { id: request.id },
      data: {
        status: ChangeRequestStatus.REJECTED,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
        notes: "Cambio rechazado por plataforma",
      },
    });
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/cooperativa/perfil");
}
