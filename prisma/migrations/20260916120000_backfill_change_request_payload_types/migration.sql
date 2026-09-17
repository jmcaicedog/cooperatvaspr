-- Normaliza los tipos heredados guardados en payloads JSON de solicitudes de cambio,
-- que no se migraron junto al enum "CooperativeType" en 20260915120000.
UPDATE "CooperativeChangeRequest" AS cr
SET "payload" = jsonb_set(
  cr."payload",
  '{cooperativeTypes}',
  COALESCE(
    (
      SELECT jsonb_agg(DISTINCT mapped)
      FROM (
        SELECT CASE value
          WHEN 'MOVIMIENTO_COOPERATIVO' THEN 'ORGANISMOS_CENTRALES'
          ELSE value
        END AS mapped
        FROM jsonb_array_elements_text(cr."payload" -> 'cooperativeTypes') AS value
      ) AS normalized
      WHERE mapped IN (
        'AHORRO_CREDITO',
        'ORGANISMOS_CENTRALES',
        'TRABAJO_ASOCIADO',
        'CONSUMIDORES_USUARIOS',
        'MIXTAS',
        'VIVIENDA',
        'ENERGIA',
        'SEGUROS',
        'JUVENILES'
      )
    ),
    '[]'::jsonb
  )
)
WHERE jsonb_typeof(cr."payload" -> 'cooperativeTypes') = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(cr."payload" -> 'cooperativeTypes') AS value
    WHERE value NOT IN (
      'AHORRO_CREDITO',
      'ORGANISMOS_CENTRALES',
      'TRABAJO_ASOCIADO',
      'CONSUMIDORES_USUARIOS',
      'MIXTAS',
      'VIVIENDA',
      'ENERGIA',
      'SEGUROS',
      'JUVENILES'
    )
  );
