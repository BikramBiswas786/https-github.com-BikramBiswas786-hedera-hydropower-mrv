# MRV Methodology — ACM0002 Alignment

## Applicable Methodology

ACM0002 — Consolidated baseline and monitoring methodology for grid-connected electricity generation from renewable sources (UNFCCC CDM / Verra VCS).

- Applies to run-of-river hydropower plants.
- Includes power density constraints to avoid under-accounting non-CO2 emissions.
- Covers grid-connected clean generation displacing fossil baseline.

## Physics Validation Formula

All submitted readings are validated against the fundamental hydropower equation:

```text
P = ρ · g · Q · H · η
```

Where:

- P = power output (watts).
- ρ = water density (997 kg/m³ at approximately 25 °C).
- g = gravitational acceleration (9.81 m/s²).
- Q = volumetric flow rate (m³/s).
- H = effective head (m).
- η = turbine and generator efficiency (0 < η <= 1.0).

Significant deviation between implied P and reported generatedKwh creates a physics trust penalty and may lead to rejection.

## Baseline Emissions Calculation

Per ACM0002:

```text
BE_y = EG_y × EF_grid
```

Where:

- BE_y = baseline emissions (tCO₂e).
- EG_y = net electricity generated (MWh).
- EF_grid = grid emission factor (tCO₂e/MWh), configured via EF_GRID.

## REC Issuance

```text
RECs_issued = floor(EG_approved / 1000)  (1 REC per MWh)
```

Only APPROVED readings contribute to REC issuance.

## Trust Score Weights

| Check                | Weight | Basis                                        |
|----------------------|--------|----------------------------------------------|
| Physics validation   | 40%    | ACM0002 generation equation                  |
| Temporal consistency | 25%    | Monitoring continuity                        |
| Environmental bounds | 20%    | Operational and water quality parameters     |
| Statistical anomaly  | 15%    | Outlier and drift detection                  |

## Monitoring Report

generateMonitoringReport() includes:

- Total readings submitted.
- Approved / Flagged / Rejected counts.
- Average trust score.
- Total verified generation (MWh).
- Total baseline emissions displaced (tCO₂e).
- Total RECs issued.

## Hedera Guardian Alignment Path

The system is designed to integrate with Hedera Guardian for full Verra VCS policy enforcement and digital MRV.

1. Current: custom MRV engine with ACM0002 calculations.
2. Next: export attestations as Guardian policy artifacts.
3. Production: Guardian policy mapped to Verra VCS schemas.

## References

- UNFCCC ACM0002 methodology: [https://cdm.unfccc.int/methodologies](https://cdm.unfccc.int/methodologies)
- Verra VCS Standard: [https://verra.org/programs/verified-carbon-standard/](https://verra.org/programs/verified-carbon-standard/)
- Hedera Guardian: [https://guardian.hedera.com](https://guardian.hedera.com)