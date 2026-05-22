import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const municipalities = [
  ["adjuntas", "Adjuntas"],
  ["aguada", "Aguada"],
  ["aguadilla", "Aguadilla"],
  ["aguas-buenas", "Aguas Buenas"],
  ["aibonito", "Aibonito"],
  ["anasco", "Anasco"],
  ["arecibo", "Arecibo"],
  ["arroyo", "Arroyo"],
  ["barceloneta", "Barceloneta"],
  ["barranquitas", "Barranquitas"],
  ["bayamon", "Bayamon"],
  ["cabo-rojo", "Cabo Rojo"],
  ["caguas", "Caguas"],
  ["camuy", "Camuy"],
  ["canovanas", "Canovanas"],
  ["carolina", "Carolina"],
  ["catano", "Catano"],
  ["cayey", "Cayey"],
  ["ceiba", "Ceiba"],
  ["ciales", "Ciales"],
  ["cidra", "Cidra"],
  ["coamo", "Coamo"],
  ["comerio", "Comerio"],
  ["corozal", "Corozal"],
  ["culebra", "Culebra"],
  ["dorado", "Dorado"],
  ["fajardo", "Fajardo"],
  ["florida", "Florida"],
  ["guanica", "Guanica"],
  ["guayama", "Guayama"],
  ["guayanilla", "Guayanilla"],
  ["guaynabo", "Guaynabo"],
  ["gurabo", "Gurabo"],
  ["hatillo", "Hatillo"],
  ["hormigueros", "Hormigueros"],
  ["humacao", "Humacao"],
  ["isabela", "Isabela"],
  ["jayuya", "Jayuya"],
  ["juana-diaz", "Juana Diaz"],
  ["juncos", "Juncos"],
  ["lajas", "Lajas"],
  ["lares", "Lares"],
  ["las-marias", "Las Marias"],
  ["las-piedras", "Las Piedras"],
  ["loaiza", "Loaiza"],
  ["luquillo", "Luquillo"],
  ["manati", "Manati"],
  ["maricao", "Maricao"],
  ["maunabo", "Maunabo"],
  ["mayaguez", "Mayaguez"],
  ["moca", "Moca"],
  ["morovis", "Morovis"],
  ["naguabo", "Naguabo"],
  ["naranjito", "Naranjito"],
  ["orocovis", "Orocovis"],
  ["patillas", "Patillas"],
  ["penuelas", "Penuelas"],
  ["ponce", "Ponce"],
  ["quebradillas", "Quebradillas"],
  ["rincon", "Rincon"],
  ["rio-grande", "Rio Grande"],
  ["sabana-grande", "Sabana Grande"],
  ["salinas", "Salinas"],
  ["san-german", "San German"],
  ["san-juan", "San Juan"],
  ["san-lorenzo", "San Lorenzo"],
  ["san-sebastian", "San Sebastian"],
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