ALTER TABLE "PlatformSettings"
ADD COLUMN "contactFormEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "contactEmail" TEXT NOT NULL DEFAULT 'hola@cooperativas.pr',
ADD COLUMN "contactLocation" TEXT NOT NULL DEFAULT 'Puerto Rico',
ADD COLUMN "contactHours" TEXT NOT NULL DEFAULT 'Lunes a viernes, 9am – 5pm AST',
ADD COLUMN "contactTitle" TEXT NOT NULL DEFAULT 'Contacto',
ADD COLUMN "contactIntro" TEXT NOT NULL DEFAULT '¿Tienes preguntas o deseas registrar tu cooperativa?';
