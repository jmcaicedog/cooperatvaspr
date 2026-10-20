import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const municipalities = [
  ["adjuntas", "Adjuntas"],
  ["aguada", "Aguada"],
  ["aguadilla", "Aguadilla"],
  ["aguas-buenas", "Aguas Buenas"],
  ["aibonito", "Aibonito"],
  ["anasco", "Añasco"],
  ["arecibo", "Arecibo"],
  ["arroyo", "Arroyo"],
  ["barceloneta", "Barceloneta"],
  ["barranquitas", "Barranquitas"],
  ["bayamon", "Bayamón"],
  ["cabo-rojo", "Cabo Rojo"],
  ["caguas", "Caguas"],
  ["camuy", "Camuy"],
  ["canovanas", "Canóvanas"],
  ["carolina", "Carolina"],
  ["catano", "Cataño"],
  ["cayey", "Cayey"],
  ["ceiba", "Ceiba"],
  ["ciales", "Ciales"],
  ["cidra", "Cidra"],
  ["coamo", "Coamo"],
  ["comerio", "Comerío"],
  ["corozal", "Corozal"],
  ["culebra", "Culebra"],
  ["dorado", "Dorado"],
  ["fajardo", "Fajardo"],
  ["florida", "Florida"],
  ["guanica", "Guánica"],
  ["guayama", "Guayama"],
  ["guayanilla", "Guayanilla"],
  ["guaynabo", "Guaynabo"],
  ["gurabo", "Gurabo"],
  ["hatillo", "Hatillo"],
  ["hormigueros", "Hormigueros"],
  ["humacao", "Humacao"],
  ["isabela", "Isabela"],
  ["jayuya", "Jayuya"],
  ["juana-diaz", "Juana Díaz"],
  ["juncos", "Juncos"],
  ["lajas", "Lajas"],
  ["lares", "Lares"],
  ["las-marias", "Las Marías"],
  ["las-piedras", "Las Piedras"],
  ["loaiza", "Loíza"],
  ["luquillo", "Luquillo"],
  ["manati", "Manatí"],
  ["maricao", "Maricao"],
  ["maunabo", "Maunabo"],
  ["mayaguez", "Mayaguez"],
  ["moca", "Moca"],
  ["morovis", "Morovis"],
  ["naguabo", "Naguabo"],
  ["naranjito", "Naranjito"],
  ["orocovis", "Orocovis"],
  ["patillas", "Patillas"],
  ["penuelas", "Peñuelas"],
  ["ponce", "Ponce"],
  ["quebradillas", "Quebradillas"],
  ["rincon", "Rincón"],
  ["rio-grande", "Río Grande"],
  ["sabana-grande", "Sabana Grande"],
  ["salinas", "Salinas"],
  ["san-german", "San Germán"],
  ["san-juan", "San Juan"],
  ["san-lorenzo", "San Lorenzo"],
  ["san-sebastian", "San Sebastián"],
  ["santa-isabel", "Santa Isabel"],
  ["toa-alta", "Toa Alta"],
  ["toa-baja", "Toa Baja"],
  ["trujillo-alto", "Trujillo Alto"],
  ["utuado", "Utuado"],
  ["vega-alta", "Vega Alta"],
  ["vega-baja", "Vega Baja"],
  ["vieques", "Vieques"],
  ["villalba", "Villalba"],
  ["yabucoa", "Yabucoa"],
  ["yauco", "Yauco"],
];

async function main() {
  for (const [code, name] of municipalities) {
    await prisma.municipality.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  console.info(`Municipios cargados: ${municipalities.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });