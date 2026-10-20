UPDATE "Municipality"
SET "name" = CASE "code"
  WHEN 'anasco' THEN 'Añasco'
  WHEN 'bayamon' THEN 'Bayamón'
  WHEN 'canovanas' THEN 'Canóvanas'
  WHEN 'catano' THEN 'Cataño'
  WHEN 'comerio' THEN 'Comerío'
  WHEN 'guanica' THEN 'Guánica'
  WHEN 'juana-diaz' THEN 'Juana Díaz'
  WHEN 'las-marias' THEN 'Las Marías'
  WHEN 'loaiza' THEN 'Loíza'
  WHEN 'manati' THEN 'Manatí'
  WHEN 'penuelas' THEN 'Peñuelas'
  WHEN 'rincon' THEN 'Rincón'
  WHEN 'rio-grande' THEN 'Río Grande'
  WHEN 'san-german' THEN 'San Germán'
  WHEN 'san-sebastian' THEN 'San Sebastián'
  ELSE "name"
END
WHERE "code" IN (
  'anasco',
  'bayamon',
  'canovanas',
  'catano',
  'comerio',
  'guanica',
  'juana-diaz',
  'las-marias',
  'loaiza',
  'manati',
  'penuelas',
  'rincon',
  'rio-grande',
  'san-german',
  'san-sebastian'
);
