export function getMigrationUrl(databaseUrl, directUrl) {
  const value = directUrl || databaseUrl;
  if (!value) {
    throw new Error("Configura DATABASE_URL o DIRECT_URL para ejecutar las migraciones.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("La URL de migraciones no es una URL PostgreSQL valida.");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("La URL de migraciones debe usar postgres:// o postgresql://.");
  }

  const isNeonPooler = /^ep-[a-z0-9-]+-pooler\..+\.neon\.tech$/i.test(url.hostname);
  if (isNeonPooler && directUrl) {
    throw new Error("DIRECT_URL debe usar la conexion directa de Neon, sin -pooler.");
  }

  if (!isNeonPooler) {
    return value;
  }

  url.hostname = url.hostname.replace(/-pooler(?=\.)/i, "");
  url.searchParams.delete("pgbouncer");
  return url.toString();
}
