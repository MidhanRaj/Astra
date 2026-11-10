// Curated tours and locations for Google Earth-like Voyager experience
export const TOURS = [
  {
    id: 'wonders',
    title: 'Wonders of the World',
    category: 'Heritage',
    description: 'Fly across millennia of human ingenuity and monumental architecture in stunning 3D.',
    thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    stops: [
      {
        name: 'Taj Mahal',
        location: 'Agra, India',
        coords: { lon: 78.0421, lat: 27.1751, height: 250, heading: 350, pitch: -25 },
        description: 'An ivory-white marble mausoleum on the right bank of the river Yamuna, commissioned in 1631 by Mughal emperor Shah Jahan.',
        facts: ['Built between 1631 and 1648', 'UNESCO World Heritage Site since 1983', 'Constructed by over 20,000 artisans']
      },
      {
        name: 'Great Pyramids of Giza',
        location: 'Giza Plateau, Egypt',
        coords: { lon: 31.1342, lat: 29.9792, height: 600, heading: 45, pitch: -30 },
        description: 'The oldest of the Seven Wonders of the Ancient World, and the only one largely intact. Built as tombs for Pharaonic dynasties.',
        facts: ['Over 4,500 years old', 'Khufu pyramid stood 146.6m tall originally', 'Built with roughly 2.3 million stone blocks']
      },
      {
        name: 'The Colosseum',
        location: 'Rome, Italy',
        coords: { lon: 12.4922, lat: 41.8902, height: 280, heading: 320, pitch: -35 },
        description: 'The largest ancient amphitheatre ever built, hosting gladiator contests and public spectacles during the Roman Empire.',
        facts: ['Completed in 80 AD under Emperor Titus', 'Could hold an estimated 50,000 to 80,000 spectators', 'Features an intricate subterranean hypogeum']
      },
      {
        name: 'Machu Picchu',
        location: 'Eastern Cordillera, Peru',
        coords: { lon: -72.5450, lat: -13.1631, height: 3100, heading: 110, pitch: -28 },
        description: 'A 15th-century Inca citadel situated on a mountain ridge 2,430 metres above sea level.',
        facts: ['Built around 1450 at the height of the Inca Empire', 'Abandoned during the Spanish Conquest', 'Engineered with advanced dry-stone terraces']
      },
      {
        name: 'Petra',
        location: 'Ma\'an Governorate, Jordan',
        coords: { lon: 35.4444, lat: 30.3285, height: 1200, heading: 80, pitch: -32 },
        description: 'Famous rock-cut architecture carved into pink sandstone cliffs, established as the capital of the Nabataean Kingdom.',
        facts: ['Known as the Rose City due to stone color', 'Dating back to roughly 300 BC', 'Featured an ingenious water conduit system']
      }
    ]
  },
  {
    id: 'skylines',
    title: 'Megacities in 3D',
    category: 'Architecture',
    description: 'Explore the densest 3D urban skylines with Cesium 3D Tiles and OSM building geometries.',
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    stops: [
      {
        name: 'Lower Manhattan & One World Trade',
        location: 'New York City, USA',
        coords: { lon: -74.0134, lat: 40.7128, height: 650, heading: 30, pitch: -25 },
        description: 'The iconic financial capital showcasing soaring skyscrapers, the Hudson River waterfront, and Central Park beyond.',
        facts: ['One World Trade Center rises to 1,776 feet (541m)', 'Manhattan features over 6,000 high-rise buildings', 'Grid system laid out in the 1811 Commissioners\' Plan']
      },
      {
        name: 'Tokyo Shibuya & Shinjuku',
        location: 'Tokyo, Japan',
        coords: { lon: 139.7003, lat: 35.6595, height: 450, heading: 15, pitch: -30 },
        description: 'The world\'s most populous metropolitan area, blending neon-lit cyberpunk density with Mt. Fuji on the horizon.',
        facts: ['Greater Tokyo houses over 37 million people', 'Shibuya crossing sees up to 3,000 pedestrians per green light', 'Tokyo Skytree stands at 634 meters']
      },
      {
        name: 'Burj Khalifa & Downtown',
        location: 'Dubai, United Arab Emirates',
        coords: { lon: 55.2744, lat: 25.1972, height: 1100, heading: 135, pitch: -22 },
        description: 'The pinnacle of modern desert engineering featuring the world\'s tallest architectural marvel.',
        facts: ['Burj Khalifa stands 828 meters (2,717 feet)', 'Visible from up to 95 kilometers away', 'Features the world\'s highest observation deck']
      },
      {
        name: 'Eiffel Tower & Paris Rive Gauche',
        location: 'Paris, France',
        coords: { lon: 2.2945, lat: 48.8584, height: 420, heading: 45, pitch: -28 },
        description: 'The City of Light along the River Seine with classic Haussmannian boulevard layouts.',
        facts: ['Eiffel Tower built for the 1889 Exposition Universelle', 'Stands 330 meters tall including antenna', 'Puddle iron structure weighs over 10,000 tonnes']
      },
      {
        name: 'San Francisco & Golden Gate',
        location: 'California, USA',
        coords: { lon: -122.4783, lat: 37.8199, height: 500, heading: 120, pitch: -20 },
        description: 'Iconic suspension bridge spanning the Golden Gate strait connecting San Francisco to Marin County.',
        facts: ['Opened in 1937 with a main span of 1,280 meters', 'International Orange color selected for maritime visibility', 'Withstands Pacific fog and seismic activity']
      }
    ]
  },
  {
    id: 'climate',
    title: 'Climate & Fragile Earth',
    category: 'Climate',
    description: 'Observe planetary changes, disappearing glaciers, deforestation fronts, and vulnerable coastal habitats.',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    stops: [
      {
        name: 'Gangotri Glacier - Himalayan Retreat',
        location: 'Uttarakhand, Himalayas',
        coords: { lon: 79.0669, lat: 30.9256, height: 5200, heading: 140, pitch: -30 },
        description: 'Primary source of the Ganges River, Gangotri is retreating at approximately 22 meters per year due to atmospheric warming.',
        facts: ['One of the largest glaciers in the Himalayas (~30 km length)', 'Loss of glacial mass threatens freshwater security for 500M+ people', 'Monitored continuously by satellite imagery']
      },
      {
        name: 'Amazon Rainforest - Rondonia Arc of Deforestation',
        location: 'Rondônia, Brazil',
        coords: { lon: -62.8278, lat: -10.3833, height: 25000, heading: 0, pitch: -50 },
        description: 'The lungs of the planet facing unprecedented habitat fragmentation and agricultural conversion.',
        facts: ['Stores an estimated 150-200 billion metric tons of carbon', 'Generates 20% of global river water discharge', 'Critical tipping point when canopy loss exceeds 20-25%']
      },
      {
        name: 'Great Barrier Reef - Coral Bleaching',
        location: 'Queensland, Australia',
        coords: { lon: 145.9878, lat: -16.8500, height: 6000, heading: 25, pitch: -40 },
        description: 'The planet\'s largest coral reef ecosystem, subjected to recurrent mass bleaching events driven by marine heatwaves.',
        facts: ['Spans over 2,300 kilometers along northeast Australia', 'Contains 400 species of coral and 1,500 fish species', 'Mass bleaching observed in 2016, 2017, 2020, 2022, 2024']
      },
      {
        name: 'Malé & Sinking Atolls',
        location: 'Maldives, Indian Ocean',
        coords: { lon: 73.5093, lat: 4.1755, height: 1800, heading: 210, pitch: -35 },
        description: 'The world\'s lowest-lying nation with an average elevation of just 1.5 meters above mean sea level.',
        facts: ['Over 80% of coral islands sit under 1 meter above sea level', 'Engineered artificial barrier island Hulhumalé as climate refuge', 'At risk of regular tidal inundation by 2050']
      },
      {
        name: 'Aral Sea - Inland Water Desiccation',
        location: 'Kazakhstan / Uzbekistan border',
        coords: { lon: 59.5000, lat: 45.0000, height: 120000, heading: 0, pitch: -65 },
        description: 'Once the 4th largest inland lake in the world, now shrunk to a fraction of its size forming the Aralkum Desert.',
        facts: ['Lost over 90% of water volume since 1960', 'Triggered regional microclimate shifts and toxic dust storms', 'Kokaral Dam built in 2005 to restore North Aral Sea']
      }
    ]
  },
  {
    id: 'nature',
    title: 'Extreme Landscapes',
    category: 'Geography',
    description: 'Fly along vertical tectonic fractures, colossal peaks, and hyper-arid geological formations.',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    stops: [
      {
        name: 'Mount Everest & Sagarmatha',
        location: 'Nepal / Tibet Border',
        coords: { lon: 86.9250, lat: 27.9881, height: 9600, heading: 220, pitch: -25 },
        description: 'Earth\'s highest peak at 8,848.86 meters, situated in the Mahalangur Himal sub-range of the Himalayas.',
        facts: ['Summit elevation 8,848.86 m (29,031.7 ft)', 'Tectonic collision of Indian and Eurasian plates elevates it ~4mm/year', 'Death Zone begins above 8,000 meters where oxygen levels drop to 33%']
      },
      {
        name: 'Grand Canyon & Colorado River',
        location: 'Arizona, USA',
        coords: { lon: -112.1401, lat: 36.0544, height: 2800, heading: 290, pitch: -28 },
        description: 'Carved over 6 million years by the Colorado River, revealing nearly two billion years of Earth\'s geological history.',
        facts: ['Measures 446 km long, up to 29 km wide, and 1,857 m deep', 'Exposes horizontal layered strata from Precambrian to Paleozoic eras', 'Sacred ancestral homeland to 11 Native American tribes']
      },
      {
        name: 'Mount Fuji Stratovolcano',
        location: 'Honshu, Japan',
        coords: { lon: 138.7274, lat: 35.3606, height: 4400, heading: 140, pitch: -25 },
        description: 'An exceptionally symmetrical snow-capped volcanic cone rising solitary above surrounding lakes and forests.',
        facts: ['Elevation 3,776.24 meters', 'Active stratovolcano that last erupted in 1707 (Hoei eruption)', 'Registered as UNESCO Cultural Heritage site']
      },
      {
        name: 'Victoria Falls & Zambezi Gorge',
        location: 'Zambia / Zimbabwe Border',
        coords: { lon: 25.8572, lat: -17.9243, height: 1600, heading: 340, pitch: -35 },
        description: 'Known locally as Mosi-oa-Tunya ("The Smoke That Thunders"), forming the largest sheet of falling water in the world.',
        facts: ['Width of 1,708 meters and height of 108 meters', 'Spray column can rise over 400 meters and be seen 50 km away', 'Cuts through basalt plateau into zigzagging gorges']
      }
    ]
  }
];

// 30+ "I'm Feeling Lucky" locations around the world
export const LUCKY_LOCATIONS = [
  { name: 'Aurora Borealis in Tromsø', country: 'Norway', lon: 18.9553, lat: 69.6492, height: 1800, heading: 20, pitch: -30, fact: 'Known as the gateway to the Arctic and one of the finest places to view the Northern Lights.' },
  { name: 'Uluru (Ayers Rock)', country: 'Australia', lon: 131.0369, lat: -25.3444, height: 1800, heading: 320, pitch: -25, fact: 'A massive sandstone monolith sacred to indigenous Anangu people, rising 348m above the red desert.' },
  { name: 'Santorini Caldera', country: 'Greece', lon: 25.4317, lat: 36.3932, height: 900, heading: 190, pitch: -35, fact: 'The remnant of a massive Minoan volcanic eruption 3,600 years ago, rimmed with cliffside white villages.' },
  { name: 'Salar de Uyuni', country: 'Bolivia', lon: -67.4891, lat: -20.1338, height: 8000, heading: 0, pitch: -45, fact: 'The world\'s largest salt flat, spanning 10,582 square kilometers at an altitude of 3,656 meters.' },
  { name: 'Table Mountain & Cape Town', country: 'South Africa', lon: 18.4100, lat: -33.9575, height: 2100, heading: 10, pitch: -30, fact: 'A level plateau overlooking Cape Town and Table Bay, home to one of the world\'s richest floral kingdoms.' },
  { name: 'Ha Long Bay', country: 'Vietnam', lon: 107.1839, lat: 20.9101, height: 1400, heading: 75, pitch: -35, fact: 'Features thousands of towering limestone karsts and isles topped with dense rainforest.' },
  { name: 'Galápagos Archipelago', country: 'Ecuador', lon: -90.5328, lat: -0.7402, height: 3500, heading: 240, pitch: -35, fact: 'Volcanic islands whose unique endemic wildlife inspired Charles Darwin\'s theory of evolution.' },
  { name: 'Venice Lagoon & Grand Canal', country: 'Italy', lon: 12.3359, lat: 45.4371, height: 600, heading: 310, pitch: -40, fact: 'Built across 118 small islands linked by over 400 bridges, protected by the MOSE flood barrier system.' },
  { name: 'Matterhorn', country: 'Switzerland / Italy', lon: 7.6586, lat: 45.9765, height: 5000, heading: 40, pitch: -22, fact: 'A nearly symmetrical pyramidal peak rising 4,478 meters in the Pennine Alps.' },
  { name: 'Bora Bora Lagoon', country: 'French Polynesia', lon: -151.7415, lat: -16.5004, height: 2500, heading: 130, pitch: -35, fact: 'Surrounded by sand-fringed motus and an azure lagoon protected by a coral barrier reef.' },
  { name: 'Banff & Lake Louise', country: 'Canada', lon: -116.1773, lat: 51.4254, height: 2800, heading: 220, pitch: -28, fact: 'Turquoise glacial waters fed by the Victoria Glacier nestled in the Canadian Rocky Mountains.' },
  { name: 'Angkor Wat', country: 'Cambodia', lon: 103.8670, lat: 13.4125, height: 800, heading: 90, pitch: -35, fact: 'The largest religious monument in the world, spanning over 162.6 hectares.' },
  { name: 'Fagradalsfjall Volcano', country: 'Reykjanes, Iceland', lon: -22.2713, lat: 63.9056, height: 1200, heading: 300, pitch: -30, fact: 'Part of the dynamic volcanic rift system tearing Iceland along the Mid-Atlantic Ridge.' },
  { name: 'Sossusvlei Red Dunes', country: 'Namibia', lon: 15.2917, lat: -24.7275, height: 2400, heading: 150, pitch: -35, fact: 'Among the highest sand dunes on Earth, glowing vivid burnt orange against the stark white salt pans.' },
  { name: 'Sydney Harbour & Opera House', country: 'Australia', lon: 151.2153, lat: -33.8568, height: 550, heading: 180, pitch: -30, fact: 'Jørn Utzon\'s masterpiece with sail-shaped roof shells jutting into Port Jackson.' }
];

