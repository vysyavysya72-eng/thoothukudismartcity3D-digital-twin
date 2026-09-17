/**
 * THOOTHUKUDI 3D DIGITAL TWIN - CONFIGURATION & CONSTANTS
 * Defines city landmarks, coordinates, sensor thresholds, scenarios, and colors.
 * Includes official Thoothukudi Railway 4-Gate Network & Central Bus Stand.
 */

window.CityConfig = {
    title: "THOOTHUKUDI 3D DIGITAL TWIN",
    subtitle: "AI SMART CITY COMMAND CENTER",
    location: "Thoothukudi, Tamil Nadu, India",
    prototypeBadge: "SIMULATED SENSOR DATA – PROTOTYPE",

    // Coordinate System Dimensions (Three.js world units)
    world: {
        width: 320,
        depth: 320,
        seaX: 95,            // X coordinate where Gulf of Mannar starts
        canalX: 45,          // X coordinate where Buckle Canal runs
        canalWidth: 16,
        groundLevel: 0,
        normalWaterLevel: -1.2,
        maxFloodWaterLevel: 2.2, // Floods over road level (which is Y=0.1)
    },

    // Key Thoothukudi Landmarks & Coordinates
    landmarks: {
        overview: {
            id: 'overview',
            name: "Thoothukudi Smart City - Full Command Overview",
            district: "Metropolitan Area",
            position: { x: 0, y: 0, z: 0 },
            cameraPos: { x: 0, y: 120, z: 160 },
            cameraTarget: { x: 0, y: 0, z: 0 },
            description: "Full panoramic view of Thoothukudi Smart City Digital Twin."
        },
        bridge: {
            id: 'bridge_b01',
            name: "Buckle Canal Coastal Bridge (B01)",
            district: "Buckle Canal Corridor",
            position: { x: 45, y: 1.8, z: 0 },
            cameraPos: { x: 80, y: 22, z: 32 },
            cameraTarget: { x: 45, y: 2, z: 0 },
            description: "Critical 4-lane arterial road bridge crossing the Buckle drainage canal connecting central city to coastal port."
        },
        busStand: {
            id: 'bus_stand_central',
            name: "Thoothukudi Central Bus Stand (TNSTC Depot)",
            district: "Central Transit Hub",
            position: { x: -45, y: 0, z: -35 },
            cameraPos: { x: -20, y: 20, z: -15 },
            cameraTarget: { x: -45, y: 2, z: -35 },
            description: "Major interstate and regional bus terminal with TNSTC and SETC passenger bays, departures to Tirunelveli, Madurai, and Chennai."
        },
        railwayGate1: {
            id: 'gate_1',
            name: "Railway Gate 1 (Millerpuram / Melur)",
            district: "North Railway Corridor (Lat: 8.7668, Lng: 78.1296)",
            position: { x: -20, y: 0.5, z: -70 },
            cameraPos: { x: 5, y: 16, z: -50 },
            cameraTarget: { x: -20, y: 1, z: -70 },
            description: "Carries daily city traffic. Express crossing for Chennai Egmore & Vanchi Maniyachchi trains. Alternate: Millerpuram Bypass (+5 min)."
        },
        railwayGate2: {
            id: 'gate_2',
            name: "Railway Gate 2 (Korampallam)",
            district: "South Railway Corridor (Lat: 8.7701, Lng: 78.1352)",
            position: { x: -20, y: 0.5, z: 50 },
            cameraPos: { x: 5, y: 16, z: 70 },
            cameraTarget: { x: -20, y: 1, z: 50 },
            description: "Carries daily commuter traffic. Passenger departure line. Alternate: Korampallam Ring Road (+6 min)."
        },
        railwayGate4: {
            id: 'gate_4',
            name: "Railway Gate 4 (Bryant Nagar / Grand Arterial)",
            district: "Central Railway Corridor (Lat: 8.7614, Lng: 78.1409)",
            position: { x: -20, y: 0.5, z: 0 },
            cameraPos: { x: 10, y: 18, z: 25 },
            cameraTarget: { x: -20, y: 1, z: 0 },
            description: "Busiest crossing on Grand Arterial. Pearl City SF & Mysuru Express. Alternate: Bryant Nagar Main Road (+4 min)."
        },
        railwayGate3: {
            id: 'gate_3',
            name: "Railway Gate 3 (VOC Port Goods Outer Line)",
            district: "Port Freight Corridor",
            position: { x: 75, y: 0.5, z: -40 },
            cameraPos: { x: 95, y: 20, z: -20 },
            cameraTarget: { x: 75, y: 1, z: -40 },
            description: "Outer dedicated goods line strictly for port-bound freight trains (coal/fertilizer/containers). No public road crossing."
        },
        substation: {
            id: 'substation_t01',
            name: "TNEB 110kV/11kV Substation & Transformer T01",
            district: "Southwest Power Grid Zone",
            position: { x: -75, y: 0, z: 65 },
            cameraPos: { x: -45, y: 20, z: 95 },
            cameraTarget: { x: -75, y: 3, z: 65 },
            description: "High-voltage distribution substation powering coastal desalination plants, thermal utilities, and central wards."
        },
        port: {
            id: 'port_voc',
            name: "V.O. Chidambaranar Port (Tuticorin Port)",
            district: "Maritime & Logistics Sector",
            position: { x: 120, y: 0, z: 0 },
            cameraPos: { x: 165, y: 32, z: 40 },
            cameraTarget: { x: 120, y: 4, z: 0 },
            description: "All-weather deepwater sea port handling container cargo, coal, fertilizer, and coastal freight across Gulf of Mannar."
        },
        industry: {
            id: 'industry_s01',
            name: "SIPCOT Industrial Complex - Petrochem & Fertilizer",
            district: "Northwest Industrial Belt",
            position: { x: -75, y: 0, z: -65 },
            cameraPos: { x: -45, y: 26, z: -35 },
            cameraTarget: { x: -75, y: 5, z: -65 },
            description: "Heavy chemical manufacturing, storage spheres, and thermal processing facilities with multi-sensor emission monitoring."
        },
        hospital: {
            id: 'hospital_h01',
            name: "Thoothukudi Govt Medical College & Emergency Hospital",
            district: "Central Healthcare Zone",
            position: { x: -15, y: 0, z: 70 },
            cameraPos: { x: 15, y: 20, z: 100 },
            cameraTarget: { x: -15, y: 4, z: 70 },
            description: "Level-1 multi-specialty trauma center, smart ambulance dispatch bay, and emergency coordination control."
        },
        fireStation: {
            id: 'fire_station_c01',
            name: "Central Fire & Rescue Service Headquarters",
            district: "Emergency Response Hub",
            position: { x: 15, y: 0, z: 75 },
            cameraPos: { x: 45, y: 22, z: 105 },
            cameraTarget: { x: 15, y: 4, z: 75 },
            description: "Rapid deployment fire station housing specialized hazmat tenders, foam tenders, and high-volume flood rescue units."
        },
        railway: {
            id: 'railway_g01',
            name: "Southern Railway Crossing (Gate G01 - Bryant Nagar)",
            district: "Central Railway Corridor",
            position: { x: -20, y: 0.5, z: 0 },
            cameraPos: { x: 10, y: 18, z: 25 },
            cameraTarget: { x: -20, y: 1, z: 0 },
            description: "Southern Railway mainline crossing linking Thoothukudi station with Madurai and Tirunelveli junctions."
        },
        waterTower: {
            id: 'water_tower_w01',
            name: "Municipal Water Supply Reservoir & Elevated Tank",
            district: "Public Utilities Sector",
            position: { x: -55, y: 0, z: -25 },
            cameraPos: { x: -25, y: 24, z: 5 },
            cameraTarget: { x: -55, y: 8, z: -25 },
            description: "Elevated distribution tower with ultrasonic water level sensing and smart SCADA flow valves."
        }
    },

    // Sensor Warning Thresholds
    thresholds: {
        rainfall: { normal: 15, warning: 50, critical: 80, unit: "mm/h" },
        canalWaterLevel: { normal: 35, warning: 65, critical: 85, unit: "%" },
        roadFloodDepth: { normal: 0.0, warning: 0.25, critical: 0.8, unit: "m" },
        bridgeStrain: { normal: 22, warning: 60, critical: 88, unit: "µε" },
        trafficDensity: { normal: 35, warning: 70, critical: 90, unit: "v/min" },
        transformerTemp: { normal: 55, warning: 80, critical: 100, unit: "°C" },
        transformerLoad: { normal: 60, warning: 85, critical: 98, unit: "%" },
        industrialGas: { normal: 24, warning: 65, critical: 85, unit: "ppm" },
        airQualityAQI: { normal: 45, warning: 120, critical: 250, unit: "AQI" },
        waterPressure: { normal: 4.2, low: 2.1, critical: 1.0, unit: "bar" },
        wasteBinFill: { normal: 40, warning: 80, critical: 95, unit: "%" }
    },

    // Scenario Presets
    scenarios: {
        NORMAL: "NORMAL_CITY",
        HEAVY_RAIN: "HEAVY_RAIN",
        FLOOD_EMERGENCY: "FLOOD_EMERGENCY",
        TRAIN_APPROACHING: "TRAIN_APPROACHING",
        TRAFFIC_CONGESTION: "TRAFFIC_CONGESTION",
        TRANSFORMER_FAULT: "TRANSFORMER_FAULT",
        INDUSTRIAL_EMERGENCY: "INDUSTRIAL_EMERGENCY"
    },

    // Visual Palette & Colors
    palette: {
        asphalt: 0x22262c,
        roadLine: 0xf5b324,
        curb: 0x4a5568,
        grass: 0x243b27,
        water: 0x0077be,
        waterFlood: 0x1f4e5b,
        concrete: 0x8a929a,
        buildingGlass: 0x2a5478,
        buildingConcrete: 0xc8ced4,
        neonCyan: 0x00f2fe,
        neonGreen: 0x00ff88,
        neonOrange: 0xffaa00,
        neonRed: 0xff0055,
        neonPurple: 0x9d4edd,
        emergencyRoute: 0x00f2fe
    }
};
