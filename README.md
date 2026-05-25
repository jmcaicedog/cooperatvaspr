This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# cooperatvaspr

## Cloudinary integration (logo y galeria)

Para habilitar carga de logo y galeria en local y en Vercel, configura en `.env` y en variables de entorno del deploy:

- `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`

La eliminación de usuario desde admin también elimina el registro en `neon_auth.user` (mismo proyecto Neon), evitando conflictos al recrear el mismo correo.

Alternativa compatible:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Limites implementados:

- Logo: opcional, `jpg/png/webp`, maximo `2 MB`.
- Galeria: opcional, hasta `5` imagenes por cooperativa, `jpg/png/webp`, maximo `5 MB` por imagen.

Flujo:

- Ruta de cooperativa: `/cooperativa/perfil`.
- El usuario de cooperativa puede subir/reemplazar/quitar logo.
- El usuario de cooperativa puede agregar imagenes a la galeria, marcar principal y eliminar.
- Ruta de admin: `/admin/cooperatives/[id]`.
- El admin de plataforma puede cambiar estas imagenes para cualquier cooperativa.
