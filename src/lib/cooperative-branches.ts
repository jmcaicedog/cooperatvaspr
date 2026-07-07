import { Prisma } from "@prisma/client";

export function isMissingCooperativeBranchStorage(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("cooperativebranch") ||
    message.includes("cooperative branch") ||
    message.includes("does not exist in the current database")
  );
}