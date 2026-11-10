// Climate & environmental data layers for 3D visualization
export const CLIMATE_DATA = {
  seaLevelHotspots: [
    {
      name: 'Miami & South Florida Coast',
      lon: -80.1918,
      lat: 25.7617,
      height: 3500,
      baseElev: 1.8,
      riskLevel: 'Extreme',
      description: 'Porous limestone bedrock allows rising seawater to infiltrate groundwater tables and storm drains.'
    },
    {
      name: 'Netherlands & Rhine Delta',
      lon: 4.4777,
      lat: 51.9244,
      height: 12000,
      baseElev: -2.0,
      riskLevel: 'Critical (Engineered)',
      description: 'Over 26% of the country lies below sea level, protected by the world-famous Delta Works barrier network.'
    },
    {
      name: 'Venice & Venetian Lagoon',
      lon: 12.3359,
      lat: 45.4371,
      height: 2500,
      baseElev: 1.0,
      riskLevel: 'Severe',
      description: 'Subject to Acqua Alta storm surges; relying increasingly on the MOSE mobile flood gates.'
    },
    {
      name: 'Ganges-Brahmaputra Delta (Bangladesh)',
      lon: 89.5403,
      lat: 22.3039,
      height: 45000,
      baseElev: 2.5,
      riskLevel: 'Catastrophic',
      description: 'Over 30 million people inhabit coastal zones vulnerable to a 1-meter sea level rise and cyclone storm surges.'
    },
    {
      name: 'Malé, Maldives',
      lon: 73.5093,
      lat: 4.1755,
      height: 3000,
      baseElev: 1.2,
      riskLevel: 'Existential',
      description: 'The world\'s lowest-lying capital, threatened by marine inundation within this century.'
    },
    {
      name: 'Lower Manhattan & NYC Waterfront',
      lon: -74.0134,
      lat: 40.7061,
      height: 2500,
      baseElev: 2.8,
      riskLevel: 'High',
      description: 'Vulnerable to extreme nor\'easter and hurricane surges like Hurricane Sandy (2012).'
    }
  ],

  // Industrial & Megacity GHG Emission Hotspots (Mt CO2e per year)
  co2Hotspots: [
    { name: 'Hebei Industrial Belt', country: 'China', lon: 114.5025, lat: 38.0428, emissions: 620, sector: 'Steel & Coal Power', heightMeters: 60000 },
    { name: 'Greater Tokyo Urban Core', country: 'Japan', lon: 139.6917, lat: 35.6895, emissions: 185, sector: 'Transport & Energy', heightMeters: 35000 },
    { name: 'National Capital Region (Delhi)', country: 'India', lon: 77.1025, lat: 28.7041, emissions: 165, sector: 'Transport & Thermal Power', heightMeters: 32000 },
    { name: 'Ruhr Valley Industrial Hub', country: 'Germany', lon: 7.0116, lat: 51.4556, emissions: 120, sector: 'Heavy Manufacturing & Power', heightMeters: 28000 },
    { name: 'Houston Energy Corridor', country: 'USA', lon: -95.3698, lat: 29.7604, emissions: 210, sector: 'Petrochemical & Refining', heightMeters: 40000 },
    { name: 'Silesian Coal Basin', country: 'Poland', lon: 18.9500, lat: 50.2500, emissions: 95, sector: 'Lignite Coal Combustion', heightMeters: 22000 },
    { name: 'Shanghai Metropolitan Zone', country: 'China', lon: 121.4737, lat: 31.2304, emissions: 260, sector: 'Maritime Port & Industry', heightMeters: 48000 },
    { name: 'Johannesburg-Mpumalanga Coalfields', country: 'South Africa', lon: 29.2333, lat: -25.8667, emissions: 140, sector: 'Eskom Coal Power Cluster', heightMeters: 30000 },
    { name: 'São Paulo Urban Agglomeration', country: 'Brazil', lon: -46.6333, lat: -23.5505, emissions: 85, sector: 'Urban Transport & Fleet', heightMeters: 20000 }
  ],

  // Critical Deforestation Basins
  deforestationZones: [
    {
      name: 'Amazon Basin Arc of Deforestation',
      center: [-61.0, -9.5],
      lossRate: '10,500 km²/year',
      mainDrivers: 'Cattle Ranching & Soy Agriculture',
      description: 'Southern and eastern rims of the Brazilian Amazon experiencing severe primary forest loss.'
    },
    {
      name: 'Congo Basin Tropical Rainforest',
      center: [23.5, -0.5],
      lossRate: '4,200 km²/year',
      mainDrivers: 'Artisanal Logging & Charcoal Production',
      description: 'Second largest continuous rainforest on Earth, harboring massive peatland carbon reserves.'
    },
    {
      name: 'Borneo Peat Swamp & Lowland Forests',
      center: [114.0, 0.5],
      lossRate: '3,800 km²/year',
      mainDrivers: 'Oil Palm Plantations & Pulp Concessions',
      description: 'Over 50% of original cover cleared over 4 decades, jeopardizing orangutan habitats.'
    },
    {
      name: 'Chaco Dry Forest (Gran Chaco)',
      center: [-61.5, -24.0],
      lossRate: '2,900 km²/year',
      mainDrivers: 'Industrial Soy and Beef Expansion',
      description: 'South America\'s second largest forest ecosystem undergoing rapid mechanised deforestation.'
    }
  ]
};

