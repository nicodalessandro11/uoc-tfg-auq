// Mock API responses for all endpoints

// GET /api/cities
export const mockCitiesResponse = [
  { id: 1, name: "Barcelona" },
  { id: 2, name: "Madrid" },
]

// GET /api/geographical-levels
export const mockGeographicalLevelsResponse = [
  { id: 1, name: "City", level: "city" },
  { id: 2, name: "Districts", level: "district" },
  { id: 3, name: "Neighborhoods", level: "neighborhood" },
]

// GET /api/cities/1/districts
export const mockBarcelonaDistrictsResponse = [
  {
    id: 1,
    name: "Ciutat Vella",
    district_code: 1,
    city_id: 1,
    population: 100000,
    avg_income: 30000,
    surface: 4.5,
    disposable_income: 22000,
  },
  {
    id: 2,
    name: "Eixample",
    district_code: 2,
    city_id: 1,
    population: 200000,
    avg_income: 40000,
    surface: 7.5,
    disposable_income: 28000,
  },
  {
    id: 3,
    name: "Sants-Montjuïc",
    district_code: 3,
    city_id: 1,
    population: 150000,
    avg_income: 35000,
    surface: 8.2,
    disposable_income: 25000,
  },
  {
    id: 4,
    name: "Les Corts",
    district_code: 4,
    city_id: 1,
    population: 80000,
    avg_income: 50000,
    surface: 6.0,
    disposable_income: 35000,
  },
  {
    id: 5,
    name: "Sarrià-Sant Gervasi",
    district_code: 5,
    city_id: 1,
    population: 120000,
    avg_income: 60000,
    surface: 20.0,
    disposable_income: 42000,
  },
  {
    id: 6,
    name: "Gràcia",
    district_code: 6,
    city_id: 1,
    population: 130000,
    avg_income: 45000,
    surface: 4.2,
    disposable_income: 32000,
  },
  {
    id: 7,
    name: "Horta-Guinardó",
    district_code: 7,
    city_id: 1,
    population: 160000,
    avg_income: 38000,
    surface: 12.0,
    disposable_income: 27000,
  },
  {
    id: 8,
    name: "Nou Barris",
    district_code: 8,
    city_id: 1,
    population: 180000,
    avg_income: 28000,
    surface: 8.0,
    disposable_income: 20000,
  },
  {
    id: 9,
    name: "Sant Andreu",
    district_code: 9,
    city_id: 1,
    population: 170000,
    avg_income: 32000,
    surface: 7.0,
    disposable_income: 23000,
  },
  {
    id: 10,
    name: "Sant Martí",
    district_code: 10,
    city_id: 1,
    population: 220000,
    avg_income: 36000,
    surface: 10.0,
    disposable_income: 26000,
  },
]

// GET /api/cities/2/districts
export const mockMadridDistrictsResponse = [
  {
    id: 11,
    name: "Centro",
    district_code: 1,
    city_id: 2,
    population: 150000,
    avg_income: 35000,
    surface: 5.2,
    disposable_income: 24000,
  },
  {
    id: 12,
    name: "Arganzuela",
    district_code: 2,
    city_id: 2,
    population: 120000,
    avg_income: 32000,
    surface: 6.1,
    disposable_income: 22000,
  },
  {
    id: 13,
    name: "Retiro",
    district_code: 3,
    city_id: 2,
    population: 130000,
    avg_income: 38000,
    surface: 5.4,
    disposable_income: 26000,
  },
  {
    id: 14,
    name: "Salamanca",
    district_code: 4,
    city_id: 2,
    population: 140000,
    avg_income: 45000,
    surface: 5.3,
    disposable_income: 30000,
  },
  {
    id: 15,
    name: "Chamartín",
    district_code: 5,
    city_id: 2,
    population: 135000,
    avg_income: 42000,
    surface: 5.8,
    disposable_income: 28000,
  },
]

// GET /api/districts/1/neighborhoods
export const mockCiutatVellaNeighborhoodsResponse = [
  {
    id: 101,
    name: "El Raval",
    neighbourhood_code: 1,
    district_id: 1,
    city_id: 1,
    population: 50000,
    avg_income: 25000,
    surface: 1.1,
    disposable_income: 18000,
  },
  {
    id: 102,
    name: "Gothic Quarter",
    neighbourhood_code: 2,
    district_id: 1,
    city_id: 1,
    population: 50000,
    avg_income: 35000,
    surface: 0.8,
    disposable_income: 24000,
  },
]

// GET /api/districts/2/neighborhoods
export const mockEixampleNeighborhoodsResponse = [
  {
    id: 201,
    name: "La Nova Esquerra de l'Eixample",
    neighbourhood_code: 1,
    district_id: 2,
    city_id: 1,
    population: 100000,
    avg_income: 45000,
    surface: 1.3,
    disposable_income: 30000,
  },
  {
    id: 202,
    name: "La Dreta de l'Eixample",
    neighbourhood_code: 2,
    district_id: 2,
    city_id: 1,
    population: 100000,
    avg_income: 50000,
    surface: 1.5,
    disposable_income: 35000,
  },
]

// GET /api/districts/11/neighborhoods
export const mockCentroNeighborhoodsResponse = [
  {
    id: 1101,
    name: "Sol",
    neighbourhood_code: 1,
    district_id: 11,
    city_id: 2,
    population: 30000,
    avg_income: 40000,
    surface: 1.0,
    disposable_income: 28000,
  },
  {
    id: 1102,
    name: "Embajadores",
    neighbourhood_code: 2,
    district_id: 11,
    city_id: 2,
    population: 40000,
    avg_income: 30000,
    surface: 1.2,
    disposable_income: 21000,
  },
]

// GET /api/districts/12/neighborhoods
export const mockArganzuelaNeighborhoodsResponse = [
  {
    id: 1201,
    name: "Imperial",
    neighbourhood_code: 1,
    district_id: 12,
    city_id: 2,
    population: 50000,
    avg_income: 32000,
    surface: 1.4,
    disposable_income: 23000,
  },
  {
    id: 1202,
    name: "Acacias",
    neighbourhood_code: 2,
    district_id: 12,
    city_id: 2,
    population: 45000,
    avg_income: 34000,
    surface: 1.3,
    disposable_income: 24000,
  },
]

// GET /api/cities/1/geojson?level=district
export const mockBarcelonaDistrictsGeoJsonResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "Ciutat Vella",
        district_code: 1,
        city_id: 1,
        population: 100000,
        avg_income: 30000,
        surface: 4.5,
        disposable_income: 22000,
        level: "district",
        index: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.14, 41.37],
            [2.16, 41.37],
            [2.16, 41.39],
            [2.14, 41.39],
            [2.14, 41.37],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "Eixample",
        district_code: 2,
        city_id: 1,
        population: 200000,
        avg_income: 40000,
        surface: 7.5,
        disposable_income: 28000,
        level: "district",
        index: 1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.16, 41.38],
            [2.18, 41.38],
            [2.18, 41.4],
            [2.16, 41.4],
            [2.16, 41.38],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "Sants-Montjuïc",
        district_code: 3,
        city_id: 1,
        population: 150000,
        avg_income: 35000,
        surface: 8.2,
        disposable_income: 25000,
        level: "district",
        index: 2,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.13, 41.36],
            [2.15, 41.36],
            [2.15, 41.38],
            [2.13, 41.38],
            [2.13, 41.36],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 4,
        name: "Les Corts",
        district_code: 4,
        city_id: 1,
        population: 80000,
        avg_income: 50000,
        surface: 6.0,
        disposable_income: 35000,
        level: "district",
        index: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.11, 41.38],
            [2.13, 41.38],
            [2.13, 41.4],
            [2.11, 41.4],
            [2.11, 41.38],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 5,
        name: "Sarrià-Sant Gervasi",
        district_code: 5,
        city_id: 1,
        population: 120000,
        avg_income: 60000,
        surface: 20.0,
        disposable_income: 42000,
        level: "district",
        index: 4,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.1, 41.4],
            [2.12, 41.4],
            [2.12, 41.42],
            [2.1, 41.42],
            [2.1, 41.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 6,
        name: "Gràcia",
        district_code: 6,
        city_id: 1,
        population: 130000,
        avg_income: 45000,
        surface: 4.2,
        disposable_income: 32000,
        level: "district",
        index: 5,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.14, 41.4],
            [2.16, 41.4],
            [2.16, 41.42],
            [2.14, 41.42],
            [2.14, 41.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 7,
        name: "Horta-Guinardó",
        district_code: 7,
        city_id: 1,
        population: 160000,
        avg_income: 38000,
        surface: 12.0,
        disposable_income: 27000,
        level: "district",
        index: 6,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.16, 41.41],
            [2.18, 41.41],
            [2.18, 41.43],
            [2.16, 41.43],
            [2.16, 41.41],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 8,
        name: "Nou Barris",
        district_code: 8,
        city_id: 1,
        population: 180000,
        avg_income: 28000,
        surface: 8.0,
        disposable_income: 20000,
        level: "district",
        index: 7,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.17, 41.43],
            [2.19, 41.43],
            [2.19, 41.45],
            [2.17, 41.45],
            [2.17, 41.43],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 9,
        name: "Sant Andreu",
        district_code: 9,
        city_id: 1,
        population: 170000,
        avg_income: 32000,
        surface: 7.0,
        disposable_income: 23000,
        level: "district",
        index: 8,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.19, 41.42],
            [2.21, 41.42],
            [2.21, 41.44],
            [2.19, 41.44],
            [2.19, 41.42],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 10,
        name: "Sant Martí",
        district_code: 10,
        city_id: 1,
        population: 220000,
        avg_income: 36000,
        surface: 10.0,
        disposable_income: 26000,
        level: "district",
        index: 9,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.19, 41.39],
            [2.21, 41.39],
            [2.21, 41.41],
            [2.19, 41.41],
            [2.19, 41.39],
          ],
        ],
      },
    },
  ],
}

// GET /api/cities/1/geojson?level=neighborhood
export const mockBarcelonaNeighborhoodsGeoJsonResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 101,
        name: "El Raval",
        neighbourhood_code: 1,
        district_id: 1,
        city_id: 1,
        population: 50000,
        avg_income: 25000,
        surface: 1.1,
        disposable_income: 18000,
        level: "neighborhood",
        index: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.145, 41.375],
            [2.155, 41.375],
            [2.155, 41.385],
            [2.145, 41.385],
            [2.145, 41.375],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 102,
        name: "Gothic Quarter",
        neighbourhood_code: 2,
        district_id: 1,
        city_id: 1,
        population: 50000,
        avg_income: 35000,
        surface: 0.8,
        disposable_income: 24000,
        level: "neighborhood",
        index: 1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.155, 41.375],
            [2.165, 41.375],
            [2.165, 41.385],
            [2.155, 41.385],
            [2.155, 41.375],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 201,
        name: "La Nova Esquerra de l'Eixample",
        neighbourhood_code: 1,
        district_id: 2,
        city_id: 1,
        population: 100000,
        avg_income: 45000,
        surface: 1.3,
        disposable_income: 30000,
        level: "neighborhood",
        index: 2,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.165, 41.385],
            [2.175, 41.385],
            [2.175, 41.395],
            [2.165, 41.395],
            [2.165, 41.385],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 202,
        name: "La Dreta de l'Eixample",
        neighbourhood_code: 2,
        district_id: 2,
        city_id: 1,
        population: 100000,
        avg_income: 50000,
        surface: 1.5,
        disposable_income: 35000,
        level: "neighborhood",
        index: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.175, 41.385],
            [2.185, 41.385],
            [2.185, 41.395],
            [2.175, 41.395],
            [2.175, 41.385],
          ],
        ],
      },
    },
  ],
}

// GET /api/cities/2/geojson?level=district
export const mockMadridDistrictsGeoJsonResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 11,
        name: "Centro",
        district_code: 1,
        city_id: 2,
        population: 150000,
        avg_income: 35000,
        surface: 5.2,
        disposable_income: 24000,
        level: "district",
        index: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.71, 40.41],
            [-3.69, 40.41],
            [-3.69, 40.43],
            [-3.71, 40.43],
            [-3.71, 40.41],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 12,
        name: "Arganzuela",
        district_code: 2,
        city_id: 2,
        population: 120000,
        avg_income: 32000,
        surface: 6.1,
        disposable_income: 22000,
        level: "district",
        index: 1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.69, 40.4],
            [-3.67, 40.4],
            [-3.67, 40.42],
            [-3.69, 40.42],
            [-3.69, 40.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 13,
        name: "Retiro",
        district_code: 3,
        city_id: 2,
        population: 130000,
        avg_income: 38000,
        surface: 5.4,
        disposable_income: 26000,
        level: "district",
        index: 2,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.68, 40.42],
            [-3.66, 40.42],
            [-3.66, 40.44],
            [-3.68, 40.44],
            [-3.68, 40.42],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 14,
        name: "Salamanca",
        district_code: 4,
        city_id: 2,
        population: 140000,
        avg_income: 45000,
        surface: 5.3,
        disposable_income: 30000,
        level: "district",
        index: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.67, 40.43],
            [-3.65, 40.43],
            [-3.65, 40.45],
            [-3.67, 40.45],
            [-3.67, 40.43],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 15,
        name: "Chamartín",
        district_code: 5,
        city_id: 2,
        population: 135000,
        avg_income: 42000,
        surface: 5.8,
        disposable_income: 28000,
        level: "district",
        index: 4,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.69, 40.44],
            [-3.67, 40.44],
            [-3.67, 40.46],
            [-3.69, 40.46],
            [-3.69, 40.44],
          ],
        ],
      },
    },
  ],
}

// GET /api/cities/2/geojson?level=neighborhood
export const mockMadridNeighborhoodsGeoJsonResponse = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1101,
        name: "Sol",
        neighbourhood_code: 1,
        district_id: 11,
        city_id: 2,
        population: 30000,
        avg_income: 40000,
        surface: 1.0,
        disposable_income: 28000,
        level: "neighborhood",
        index: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.705, 40.415],
            [-3.695, 40.415],
            [-3.695, 40.425],
            [-3.705, 40.425],
            [-3.705, 40.415],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 1102,
        name: "Embajadores",
        neighbourhood_code: 2,
        district_id: 11,
        city_id: 2,
        population: 40000,
        avg_income: 30000,
        surface: 1.2,
        disposable_income: 21000,
        level: "neighborhood",
        index: 1,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.705, 40.405],
            [-3.695, 40.405],
            [-3.695, 40.415],
            [-3.705, 40.415],
            [-3.705, 40.405],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 1201,
        name: "Imperial",
        neighbourhood_code: 1,
        district_id: 12,
        city_id: 2,
        population: 50000,
        avg_income: 32000,
        surface: 1.4,
        disposable_income: 23000,
        level: "neighborhood",
        index: 2,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.685, 40.405],
            [-3.675, 40.405],
            [-3.675, 40.415],
            [-3.685, 40.415],
            [-3.685, 40.405],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 1202,
        name: "Acacias",
        neighbourhood_code: 2,
        district_id: 12,
        city_id: 2,
        population: 45000,
        avg_income: 34000,
        surface: 1.3,
        disposable_income: 24000,
        level: "neighborhood",
        index: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-3.685, 40.395],
            [-3.675, 40.395],
            [-3.675, 40.405],
            [-3.685, 40.405],
            [-3.685, 40.395],
          ],
        ],
      },
    },
  ],
}

// GET /api/indicator-definitions
export const mockIndicatorDefinitionsResponse = [
  { id: 1, name: "Population", unit: "people", description: "Total number of residents", category: "demographics" },
  { id: 2, name: "Surface", unit: "km²", description: "Area in square kilometers", category: "geography" },
  {
    id: 3,
    name: "Average Income",
    unit: "€",
    description: "Average gross taxable income per person",
    category: "economics",
  },
  {
    id: 4,
    name: "Disposable Income",
    unit: "€",
    description: "Disposable income per capita",
    category: "economics",
  },
  {
    id: 5,
    name: "Population Density",
    unit: "people/km²",
    description: "Number of residents per square kilometer",
    category: "demographics",
  },
  {
    id: 6,
    name: "Education Level",
    unit: "%",
    description: "Percentage of population with higher education",
    category: "education",
  },
  {
    id: 7,
    name: "Unemployment Rate",
    unit: "%",
    description: "Percentage of working-age population without employment",
    category: "employment",
  },
]

// GET /api/indicators?geoLevelId=2&geoId=1&year=2023
export const mockCiutatVellaIndicatorsResponse = [
  { id: 1, indicator_def_id: 1, geo_level_id: 2, geo_id: 1, year: 2023, value: 100000 },
  { id: 2, indicator_def_id: 2, geo_level_id: 2, geo_id: 1, year: 2023, value: 4.5 },
  { id: 3, indicator_def_id: 3, geo_level_id: 2, geo_id: 1, year: 2023, value: 30000 },
  { id: 4, indicator_def_id: 4, geo_level_id: 2, geo_id: 1, year: 2023, value: 22000 },
  { id: 5, indicator_def_id: 5, geo_level_id: 2, geo_id: 1, year: 2023, value: 22222 },
  { id: 6, indicator_def_id: 6, geo_level_id: 2, geo_id: 1, year: 2023, value: 35 },
  { id: 7, indicator_def_id: 7, geo_level_id: 2, geo_id: 1, year: 2023, value: 12 },
]

// GET /api/cities/1/indicators?level=district&year=2023
export const mockBarcelonaDistrictIndicatorsResponse = [
  // Ciutat Vella
  { id: 101, indicator_def_id: 1, geo_level_id: 2, geo_id: 1, year: 2023, value: 100000 },
  { id: 102, indicator_def_id: 3, geo_level_id: 2, geo_id: 1, year: 2023, value: 30000 },
  { id: 103, indicator_def_id: 5, geo_level_id: 2, geo_id: 1, year: 2023, value: 22222 },

  // Eixample
  { id: 104, indicator_def_id: 1, geo_level_id: 2, geo_id: 2, year: 2023, value: 200000 },
  { id: 105, indicator_def_id: 3, geo_level_id: 2, geo_id: 2, year: 2023, value: 40000 },
  { id: 106, indicator_def_id: 5, geo_level_id: 2, geo_id: 2, year: 2023, value: 26667 },

  // Sants-Montjuïc
  { id: 107, indicator_def_id: 1, geo_level_id: 2, geo_id: 3, year: 2023, value: 150000 },
  { id: 108, indicator_def_id: 3, geo_level_id: 2, geo_id: 3, year: 2023, value: 35000 },
  { id: 109, indicator_def_id: 5, geo_level_id: 2, geo_id: 3, year: 2023, value: 18293 },

  // Les Corts
  { id: 110, indicator_def_id: 1, geo_level_id: 2, geo_id: 4, year: 2023, value: 80000 },
  { id: 111, indicator_def_id: 3, geo_level_id: 2, geo_id: 4, year: 2023, value: 50000 },
  { id: 112, indicator_def_id: 5, geo_level_id: 2, geo_id: 4, year: 2023, value: 13333 },

  // Sarrià-Sant Gervasi
  { id: 113, indicator_def_id: 1, geo_level_id: 2, geo_id: 5, year: 2023, value: 120000 },
  { id: 114, indicator_def_id: 3, geo_level_id: 2, geo_id: 5, year: 2023, value: 60000 },
  { id: 115, indicator_def_id: 5, geo_level_id: 2, geo_id: 5, year: 2023, value: 6000 },

  // Gràcia
  { id: 116, indicator_def_id: 1, geo_level_id: 2, geo_id: 6, year: 2023, value: 130000 },
  { id: 117, indicator_def_id: 3, geo_level_id: 2, geo_id: 6, year: 2023, value: 45000 },
  { id: 118, indicator_def_id: 5, geo_level_id: 2, geo_id: 6, year: 2023, value: 30952 },

  // Horta-Guinardó
  { id: 119, indicator_def_id: 1, geo_level_id: 2, geo_id: 7, year: 2023, value: 160000 },
  { id: 120, indicator_def_id: 3, geo_level_id: 2, geo_id: 7, year: 2023, value: 38000 },
  { id: 121, indicator_def_id: 5, geo_level_id: 2, geo_id: 7, year: 2023, value: 13333 },

  // Nou Barris
  { id: 122, indicator_def_id: 1, geo_level_id: 2, geo_id: 8, year: 2023, value: 180000 },
  { id: 123, indicator_def_id: 3, geo_level_id: 2, geo_id: 8, year: 2023, value: 28000 },
  { id: 124, indicator_def_id: 5, geo_level_id: 2, geo_id: 8, year: 2023, value: 22500 },

  // Sant Andreu
  { id: 125, indicator_def_id: 1, geo_level_id: 2, geo_id: 9, year: 2023, value: 170000 },
  { id: 126, indicator_def_id: 3, geo_level_id: 2, geo_id: 9, year: 2023, value: 32000 },
  { id: 127, indicator_def_id: 5, geo_level_id: 2, geo_id: 9, year: 2023, value: 24286 },

  // Sant Martí
  { id: 128, indicator_def_id: 1, geo_level_id: 2, geo_id: 10, year: 2023, value: 220000 },
  { id: 129, indicator_def_id: 3, geo_level_id: 2, geo_id: 10, year: 2023, value: 36000 },
  { id: 130, indicator_def_id: 5, geo_level_id: 2, geo_id: 10, year: 2023, value: 22000 },
]

// GET /api/cities/1/indicators?level=neighborhood&year=2023
export const mockBarcelonaNeighborhoodIndicatorsResponse = [
  // El Raval
  { id: 201, indicator_def_id: 1, geo_level_id: 3, geo_id: 101, year: 2023, value: 50000 },
  { id: 202, indicator_def_id: 3, geo_level_id: 3, geo_id: 101, year: 2023, value: 25000 },
  { id: 203, indicator_def_id: 5, geo_level_id: 3, geo_id: 101, year: 2023, value: 45455 },

  // Gothic Quarter
  { id: 204, indicator_def_id: 1, geo_level_id: 3, geo_id: 102, year: 2023, value: 50000 },
  { id: 205, indicator_def_id: 3, geo_level_id: 3, geo_id: 102, year: 2023, value: 35000 },
  { id: 206, indicator_def_id: 5, geo_level_id: 3, geo_id: 102, year: 2023, value: 62500 },

  // La Nova Esquerra de l'Eixample
  { id: 207, indicator_def_id: 1, geo_level_id: 3, geo_id: 201, year: 2023, value: 100000 },
  { id: 208, indicator_def_id: 3, geo_level_id: 3, geo_id: 201, year: 2023, value: 45000 },
  { id: 209, indicator_def_id: 5, geo_level_id: 3, geo_id: 201, year: 2023, value: 76923 },

  // La Dreta de l'Eixample
  { id: 210, indicator_def_id: 1, geo_level_id: 3, geo_id: 202, year: 2023, value: 100000 },
  { id: 211, indicator_def_id: 3, geo_level_id: 3, geo_id: 202, year: 2023, value: 50000 },
  { id: 212, indicator_def_id: 5, geo_level_id: 3, geo_id: 202, year: 2023, value: 66667 },
]

// GET /api/feature-definitions
export const mockFeatureDefinitionsResponse = [
  { id: 1, name: "museum", description: "Museums and art galleries" },
  { id: 2, name: "heritage_space", description: "Historical and heritage sites" },
  { id: 3, name: "cultural_center", description: "Cultural and community centers" },
  { id: 4, name: "library", description: "Public libraries" },
  { id: 5, name: "auditorium", description: "Music and performance venues" },
  { id: 6, name: "park_garden", description: "Parks and gardens" },
  { id: 7, name: "educational_center", description: "Schools and educational facilities" },
  { id: 8, name: "cinema", description: "Movie theaters" },
  { id: 9, name: "exhibition_center", description: "Exhibition and conference centers" },
  { id: 10, name: "live_music_venue", description: "Live music venues" },
]

// GET /api/cities/1/point-features
export const mockBarcelonaPointFeaturesResponse = [
  {
    id: 1,
    feature_definition_id: 1,
    name: "Museu Picasso",
    latitude: 41.385,
    longitude: 2.181,
    geo_level_id: 2,
    geo_id: 1, // Ciutat Vella
    properties: {
      exhibitions: 12,
      address: "Carrer Montcada, 15-23",
      website: "www.museupicasso.bcn.cat",
      phone: "+34 932 56 30 00",
    },
  },
  {
    id: 2,
    feature_definition_id: 2,
    name: "Sagrada Familia",
    latitude: 41.404,
    longitude: 2.174,
    geo_level_id: 2,
    geo_id: 2, // Eixample
    properties: {
      visitors: 4500000,
      address: "Carrer de Mallorca, 401",
      website: "www.sagradafamilia.org",
      phone: "+34 932 08 04 14",
    },
  },
  {
    id: 3,
    feature_definition_id: 1,
    name: "Fundació Joan Miró",
    latitude: 41.369,
    longitude: 2.16,
    geo_level_id: 2,
    geo_id: 3, // Sants-Montjuïc
    properties: {
      exhibitions: 8,
      address: "Parc de Montjuïc",
      website: "www.fmirobcn.org",
      phone: "+34 934 43 94 70",
    },
  },
  {
    id: 4,
    feature_definition_id: 6,
    name: "Parc de la Ciutadella",
    latitude: 41.388,
    longitude: 2.187,
    geo_level_id: 2,
    geo_id: 1, // Ciutat Vella
    properties: {
      area: 17.5,
      address: "Passeig de Picasso, 21",
      facilities: ["lake", "zoo", "museum"],
    },
  },
  {
    id: 5,
    feature_definition_id: 7,
    name: "Universitat de Barcelona",
    latitude: 41.386,
    longitude: 2.164,
    geo_level_id: 2,
    geo_id: 2, // Eixample
    properties: {
      students: 60000,
      address: "Gran Via de les Corts Catalanes, 585",
      website: "www.ub.edu",
      founded: 1450,
    },
  },
]

// GET /api/cities/2/point-features
export const mockMadridPointFeaturesResponse = [
  {
    id: 6,
    feature_definition_id: 1,
    name: "Museo del Prado",
    latitude: 40.414,
    longitude: -3.692,
    geo_level_id: 2,
    geo_id: 11, // Centro
    properties: {
      exhibitions: 15,
      address: "Calle de Ruiz de Alarcón, 23",
      website: "www.museodelprado.es",
      phone: "+34 913 30 28 00",
    },
  },
  {
    id: 7,
    feature_definition_id: 3,
    name: "Matadero Madrid",
    latitude: 40.392,
    longitude: -3.696,
    geo_level_id: 2,
    geo_id: 12, // Arganzuela
    properties: {
      events: 120,
      address: "Plaza de Legazpi, 8",
      website: "www.mataderomadrid.org",
      phone: "+34 915 17 73 09",
    },
  },
  {
    id: 8,
    feature_definition_id: 6,
    name: "Parque del Retiro",
    latitude: 40.415,
    longitude: -3.684,
    geo_level_id: 2,
    geo_id: 13, // Retiro
    properties: {
      area: 118,
      address: "Plaza de la Independencia, 7",
      facilities: ["lake", "monument", "gardens"],
    },
  },
  {
    id: 9,
    feature_definition_id: 7,
    name: "Universidad Complutense",
    latitude: 40.446,
    longitude: -3.724,
    geo_level_id: 2,
    geo_id: 15, // Chamartín
    properties: {
      students: 80000,
      address: "Av. Séneca, 2",
      website: "www.ucm.es",
      founded: 1293,
    },
  },
  {
    id: 10,
    feature_definition_id: 8,
    name: "Cine Doré - Filmoteca Española",
    latitude: 40.41,
    longitude: -3.698,
    geo_level_id: 2,
    geo_id: 11, // Centro
    properties: {
      screens: 2,
      address: "Calle de Santa Isabel, 3",
      website: "www.culturaydeporte.gob.es/cultura/areas/cine/mc/fe/cine-dore",
      phone: "+34 913 69 11 25",
    },
  },
]

// GET /api/point-features?geoLevelId=2&geoId=1
export const mockCiutatVellaPointFeaturesResponse = [
  {
    id: 1,
    feature_definition_id: 1,
    name: "Museu Picasso",
    latitude: 41.385,
    longitude: 2.181,
    geo_level_id: 2,
    geo_id: 1, // Ciutat Vella
    properties: {
      exhibitions: 12,
      address: "Carrer Montcada, 15-23",
      website: "www.museupicasso.bcn.cat",
      phone: "+34 932 56 30 00",
    },
  },
  {
    id: 4,
    feature_definition_id: 6,
    name: "Parc de la Ciutadella",
    latitude: 41.388,
    longitude: 2.187,
    geo_level_id: 2,
    geo_id: 1, // Ciutat Vella
    properties: {
      area: 17.5,
      address: "Passeig de Picasso, 21",
      facilities: ["lake", "zoo", "museum"],
    },
  },
]

// GET /api/cities/1/compare?level=district&area1=1&area2=2&year=2023
export const mockCompareDistrictsResponse = {
  area1: {
    id: 1,
    name: "Ciutat Vella",
    district_code: 1,
    city_id: 1,
    indicators: [
      { id: 1, name: "Population", value: 100000, unit: "people" },
      { id: 2, name: "Surface", value: 4.5, unit: "km²" },
      { id: 3, name: "Average Income", value: 30000, unit: "€" },
      { id: 4, name: "Disposable Income", value: 22000, unit: "€" },
      { id: 5, name: "Population Density", value: 22222, unit: "people/km²" },
      { id: 6, name: "Education Level", value: 35, unit: "%" },
      { id: 7, name: "Unemployment Rate", value: 12, unit: "%" },
    ],
  },
  area2: {
    id: 2,
    name: "Eixample",
    district_code: 2,
    city_id: 1,
    indicators: [
      { id: 1, name: "Population", value: 200000, unit: "people" },
      { id: 2, name: "Surface", value: 7.5, unit: "km²" },
      { id: 3, name: "Average Income", value: 40000, unit: "€" },
      { id: 4, name: "Disposable Income", value: 28000, unit: "€" },
      { id: 5, name: "Population Density", value: 26667, unit: "people/km²" },
      { id: 6, name: "Education Level", value: 45, unit: "%" },
      { id: 7, name: "Unemployment Rate", value: 8, unit: "%" },
    ],
  },
}

// GET /api/cities/1/filter?level=district&minPopulation=100000&maxPopulation=200000&minIncome=30000&maxIncome=50000
export const mockFilterDistrictsResponse = [
  {
    id: 1,
    name: "Ciutat Vella",
    district_code: 1,
    city_id: 1,
    population: 100000,
    avg_income: 30000,
    surface: 4.5,
    disposable_income: 22000,
  },
  {
    id: 3,
    name: "Sants-Montjuïc",
    district_code: 3,
    city_id: 1,
    population: 150000,
    avg_income: 35000,
    surface: 8.2,
    disposable_income: 25000,
  },
  {
    id: 6,
    name: "Gràcia",
    district_code: 6,
    city_id: 1,
    population: 130000,
    avg_income: 45000,
    surface: 4.2,
    disposable_income: 32000,
  },
]
