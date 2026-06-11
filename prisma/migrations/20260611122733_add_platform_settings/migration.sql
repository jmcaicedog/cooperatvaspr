-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "comingSoonEnabled" BOOLEAN NOT NULL DEFAULT false,
    "comingSoonMessage" TEXT NOT NULL DEFAULT 'Proximamente estaremos al aire.',
    "comingSoonLaunchAt" TIMESTAMP(3),
    "homeShowEvents" BOOLEAN NOT NULL DEFAULT true,
    "homeShowTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "homeShowBlog" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
