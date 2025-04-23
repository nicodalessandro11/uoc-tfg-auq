export const cities = [
  { id: 1, name: "Barcelona" },
  { id: 2, name: "Madrid" },
]

export const indicatorDefinitions = [
  { id: 1, name: "Population", description: "Total number of residents" },
  { id: 2, name: "Surface", description: "Area in square kilometers" },
  { id: 3, name: "Average gross taxable income per person", description: "Average annual income in euros" },
  { id: 4, name: "Disposable income per capita", description: "Disposable income in euros" },
]

export const granularityLevels = [
  { id: 1, name: "Districts", level: "district" },
  { id: 2, name: "Neighborhoods", level: "neighborhood" },
]

// Barcelona districts
const barcelonaDistricts = [
  {
    id: 1,
    name: "Ciutat Vella",
    cityId: 1,
    population: 100000,
    avgIncome: 30000,
    surface: 4.5,
    disposableIncome: 22000,
  },
  { id: 2, name: "Eixample", cityId: 1, population: 200000, avgIncome: 40000, surface: 7.5, disposableIncome: 28000 },
  {
    id: 3,
    name: "Sants-Montjuïc",
    cityId: 1,
    population: 150000,
    avgIncome: 35000,
    surface: 8.2,
    disposableIncome: 25000,
  },
  { id: 4, name: "Les Corts", cityId: 1, population: 80000, avgIncome: 50000, surface: 6.0, disposableIncome: 35000 },
  {
    id: 5,
    name: "Sarrià-Sant Gervasi",
    cityId: 1,
    population: 120000,
    avgIncome: 60000,
    surface: 20.0,
    disposableIncome: 42000,
  },
  { id: 6, name: "Gràcia", cityId: 1, population: 130000, avgIncome: 45000, surface: 4.2, disposableIncome: 32000 },
  {
    id: 7,
    name: "Horta-Guinardó",
    cityId: 1,
    population: 160000,
    avgIncome: 38000,
    surface: 12.0,
    disposableIncome: 27000,
  },
  { id: 8, name: "Nou Barris", cityId: 1, population: 180000, avgIncome: 28000, surface: 8.0, disposableIncome: 20000 },
  {
    id: 9,
    name: "Sant Andreu",
    cityId: 1,
    population: 170000,
    avgIncome: 32000,
    surface: 7.0,
    disposableIncome: 23000,
  },
  {
    id: 10,
    name: "Sant Martí",
    cityId: 1,
    population: 220000,
    avgIncome: 36000,
    surface: 10.0,
    disposableIncome: 26000,
  },
]

// Barcelona neighborhoods
const barcelonaNeighborhoods = [
  {
    id: 101,
    districtId: 1,
    name: "El Raval",
    cityId: 1,
    population: 50000,
    avgIncome: 25000,
    surface: 1.1,
    disposableIncome: 18000,
  },
  {
    id: 102,
    districtId: 1,
    name: "Gothic Quarter",
    cityId: 1,
    population: 50000,
    avgIncome: 35000,
    surface: 0.8,
    disposableIncome: 24000,
  },
  {
    id: 201,
    districtId: 2,
    name: "La Nova Esquerra de l'Eixample",
    cityId: 1,
    population: 100000,
    avgIncome: 45000,
    surface: 1.3,
    disposableIncome: 30000,
  },
  {
    id: 202,
    districtId: 2,
    name: "La Dreta de l'Eixample",
    cityId: 1,
    population: 100000,
    avgIncome: 50000,
    surface: 1.5,
    disposableIncome: 35000,
  },
]

// Madrid districts
const madridDistricts = [
  { id: 11, name: "Centro", cityId: 2, population: 150000, avgIncome: 35000, surface: 5.2, disposableIncome: 24000 },
  {
    id: 12,
    name: "Arganzuela",
    cityId: 2,
    population: 120000,
    avgIncome: 32000,
    surface: 6.1,
    disposableIncome: 22000,
  },
  { id: 13, name: "Retiro", cityId: 2, population: 130000, avgIncome: 38000, surface: 5.4, disposableIncome: 26000 },
  { id: 14, name: "Salamanca", cityId: 2, population: 140000, avgIncome: 45000, surface: 5.3, disposableIncome: 30000 },
  { id: 15, name: "Chamartín", cityId: 2, population: 135000, avgIncome: 42000, surface: 5.8, disposableIncome: 28000 },
]

// Madrid neighborhoods
const madridNeighborhoods = [
  {
    id: 1101,
    districtId: 11,
    name: "Sol",
    cityId: 2,
    population: 30000,
    avgIncome: 40000,
    surface: 1.0,
    disposableIncome: 28000,
  },
  {
    id: 1102,
    districtId: 11,
    name: "Embajadores",
    cityId: 2,
    population: 40000,
    avgIncome: 30000,
    surface: 1.2,
    disposableIncome: 21000,
  },
  {
    id: 1201,
    districtId: 12,
    name: "Imperial",
    cityId: 2,
    population: 50000,
    avgIncome: 32000,
    surface: 1.4,
    disposableIncome: 23000,
  },
  {
    id: 1202,
    districtId: 12,
    name: "Acacias",
    cityId: 2,
    population: 45000,
    avgIncome: 34000,
    surface: 1.3,
    disposableIncome: 24000,
  },
]

// Create TopoJSON for Barcelona districts
export const barcelonaDistrictsTopoJSON = {
  type: "Topology",
  objects: {
    areas: {
      type: "GeometryCollection",
      geometries: barcelonaDistricts.map((district, index) => ({
        type: "Polygon",
        properties: {
          id: district.id,
          name: district.name,
          population: district.population,
          avgIncome: district.avgIncome,
          surface: district.surface,
          disposableIncome: district.disposableIncome,
          level: "district",
          index: index,
        },
        arcs: [[index]],
      })),
    },
  },
  arcs: barcelonaDistricts.map((district, index) => {
    // Create a simple polygon for each district
    const centerLat = 41.38 + index * 0.02
    const centerLng = 2.15 + index * 0.02
    const size = 0.01

    return [
      [centerLng - size, centerLat - size],
      [centerLng + size, centerLat - size],
      [centerLng + size, centerLat + size],
      [centerLng - size, centerLat + size],
      [centerLng - size, centerLat - size],
    ]
  }),
}

// Create TopoJSON for Barcelona neighborhoods
export const barcelonaNeighborhoodsTopoJSON = {
  type: "Topology",
  objects: {
    areas: {
      type: "GeometryCollection",
      geometries: barcelonaNeighborhoods.map((neighborhood, index) => ({
        type: "Polygon",
        properties: {
          id: neighborhood.id,
          name: neighborhood.name,
          districtId: neighborhood.districtId,
          population: neighborhood.population,
          avgIncome: neighborhood.avgIncome,
          surface: neighborhood.surface,
          disposableIncome: neighborhood.disposableIncome,
          level: "neighborhood",
          index: index,
        },
        arcs: [[index]],
      })),
    },
  },
  arcs: barcelonaNeighborhoods.map((neighborhood, index) => {
    // Create a simple polygon for each neighborhood
    const centerLat = 41.38 + index * 0.01
    const centerLng = 2.15 + index * 0.01
    const size = 0.005

    return [
      [centerLng - size, centerLat - size],
      [centerLng + size, centerLat - size],
      [centerLng + size, centerLat + size],
      [centerLng - size, centerLat + size],
      [centerLng - size, centerLat - size],
    ]
  }),
}

// Create TopoJSON for Madrid districts
export const madridDistrictsTopoJSON = {
  type: "Topology",
  objects: {
    areas: {
      type: "GeometryCollection",
      geometries: madridDistricts.map((district, index) => ({
        type: "Polygon",
        properties: {
          id: district.id,
          name: district.name,
          population: district.population,
          avgIncome: district.avgIncome,
          surface: district.surface,
          disposableIncome: district.disposableIncome,
          level: "district",
          index: index,
        },
        arcs: [[index]],
      })),
    },
  },
  arcs: madridDistricts.map((district, index) => {
    // Create a simple polygon for each district
    const centerLat = 40.41 + index * 0.02
    const centerLng = -3.7 + index * 0.02
    const size = 0.01

    return [
      [centerLng - size, centerLat - size],
      [centerLng + size, centerLat - size],
      [centerLng + size, centerLat + size],
      [centerLng - size, centerLat + size],
      [centerLng - size, centerLat - size],
    ]
  }),
}

// Create TopoJSON for Madrid neighborhoods
export const madridNeighborhoodsTopoJSON = {
  type: "Topology",
  objects: {
    areas: {
      type: "GeometryCollection",
      geometries: madridNeighborhoods.map((neighborhood, index) => ({
        type: "Polygon",
        properties: {
          id: neighborhood.id,
          name: neighborhood.name,
          districtId: neighborhood.districtId,
          population: neighborhood.population,
          avgIncome: neighborhood.avgIncome,
          surface: neighborhood.surface,
          disposableIncome: neighborhood.disposableIncome,
          level: "neighborhood",
          index: index,
        },
        arcs: [[index]],
      })),
    },
  },
  arcs: madridNeighborhoods.map((neighborhood, index) => {
    // Create a simple polygon for each neighborhood
    const centerLat = 40.41 + index * 0.01
    const centerLng = -3.7 + index * 0.01
    const size = 0.005

    return [
      [centerLng - size, centerLat - size],
      [centerLng + size, centerLat - size],
      [centerLng + size, centerLat + size],
      [centerLng - size, centerLat + size],
      [centerLng - size, centerLat - size],
    ]
  }),
}

export const pointFeatures = [
  {
    id: 1,
    geoId: 1, // Ciutat Vella
    name: "Museu Picasso",
    featureType: "museum",
    latitude: 41.385,
    longitude: 2.181,
    properties: {
      exhibitions: 12,
      address: "Carrer Montcada, 15-23",
    },
  },
  {
    id: 2,
    geoId: 2, // Eixample
    name: "Sagrada Familia",
    featureType: "heritage_space",
    latitude: 41.404,
    longitude: 2.174,
    properties: {
      visitors: 4500000,
      address: "Carrer de Mallorca, 401",
    },
  },
  {
    id: 3,
    geoId: 3, // Sants-Montjuïc
    name: "Fundació Joan Miró",
    featureType: "museum",
    latitude: 41.369,
    longitude: 2.16,
    properties: {
      exhibitions: 8,
      address: "Parc de Montjuïc",
    },
  },
  {
    id: 4,
    geoId: 11, // Centro (Madrid)
    name: "Museo del Prado",
    featureType: "museum",
    latitude: 40.414,
    longitude: -3.692,
    properties: {
      exhibitions: 15,
      address: "Calle de Ruiz de Alarcón, 23",
    },
  },
  {
    id: 5,
    geoId: 12, // Arganzuela (Madrid)
    name: "Matadero Madrid",
    featureType: "cultural_center",
    latitude: 40.392,
    longitude: -3.696,
    properties: {
      events: 120,
      address: "Plaza de Legazpi, 8",
    },
  },
  {
    id: 6,
    geoId: 13, // Retiro (Madrid)
    name: "Parque del Retiro",
    featureType: "park_garden",
    latitude: 40.415,
    longitude: -3.684,
    properties: {
      area: 118,
      address: "Plaza de la Independencia, 7",
    },
  },
]

export const getAvailableAreas = (cityId: number, level: string) => {
  if (cityId === 1) {
    return level === "district" ? barcelonaDistricts : barcelonaNeighborhoods
  } else if (cityId === 2) {
    return level === "district" ? madridDistricts : madridNeighborhoods
  }
  return []
}

export const getTopoJSON = (cityId: number, level: string) => {
  if (cityId === 1) {
    return level === "district" ? barcelonaDistrictsTopoJSON : barcelonaNeighborhoodsTopoJSON
  } else if (cityId === 2) {
    return level === "district" ? madridDistrictsTopoJSON : madridNeighborhoodsTopoJSON
  }
  return null
}

export const getIndicatorValue = (areaId: number, indicatorId: number, level: string) => {
  let area
  if (level === "district") {
    area = [...barcelonaDistricts, ...madridDistricts].find((d) => d.id === areaId)
  } else {
    area = [...barcelonaNeighborhoods, ...madridNeighborhoods].find((n) => n.id === areaId)
  }

  if (!area) return null

  switch (indicatorId) {
    case 1:
      return area.population
    case 2:
      return area.surface
    case 3:
      return area.avgIncome
    case 4:
      return area.disposableIncome
    default:
      return null
  }
}
