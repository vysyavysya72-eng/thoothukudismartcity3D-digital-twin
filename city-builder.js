/**
 * THOOTHUKUDI 3D DIGITAL TWIN - PROCEDURAL CITY BUILDER
 * Generates the 3D physical world: terrain, roads, Gulf of Mannar coast, Buckle canal,
 * commercial smart towers, residential houses, palm trees, streetlights, traffic signals,
 * smart waste bins, and water supply infrastructure.
 */

class CityBuilder {
    constructor() {
        this.interactiveObjects = [];
        this.streetLights = [];
        this.trafficLights = [];
        this.wasteBins = [];
    }

    buildCity(scene) {
        console.log("[CityBuilder] Procedurally constructing Thoothukudi 3D environment...");

        this.buildTerrain(scene);
        this.buildRoadNetwork(scene);
        this.buildDistricts(scene);
        this.buildCentralBusStand(scene);
        this.buildRailwayNetworkCrossings(scene);
        this.buildVegetation(scene);
        this.buildStreetFurniture(scene);
        this.buildWaterSupplyTower(scene);
        this.buildSmartWasteBins(scene);

        console.log(`[CityBuilder] City built with ${this.interactiveObjects.length} interactive elements.`);
        return {
            interactiveObjects: this.interactiveObjects,
            streetLights: this.streetLights,
            trafficLights: this.trafficLights,
            wasteBins: this.wasteBins
        };
    }

    buildTerrain(scene) {
        // 1. Mainland Base (Urban ground)
        const mainlandGeo = new THREE.PlaneGeometry(240, 300);
        const mainlandMat = new THREE.MeshStandardMaterial({
            color: 0x1e272e,
            roughness: 0.9,
            metalness: 0.1
        });
        const mainland = new THREE.Mesh(mainlandGeo, mainlandMat);
        mainland.rotation.x = -Math.PI / 2;
        mainland.position.set(-25, 0, 0);
        mainland.receiveShadow = true;
        scene.add(mainland);

        // 2. Gulf of Mannar Ocean Floor
        const seaBedGeo = new THREE.PlaneGeometry(120, 300);
        const seaBedMat = new THREE.MeshStandardMaterial({
            color: 0x0a192f,
            roughness: 0.8
        });
        const seaBed = new THREE.Mesh(seaBedGeo, seaBedMat);
        seaBed.rotation.x = -Math.PI / 2;
        seaBed.position.set(135, -4, 0);
        scene.add(seaBed);

        // 3. Port Wharf & Coastal Sea Wall
        const quayGeo = new THREE.BoxGeometry(10, 4, 300);
        const quayMat = new THREE.MeshStandardMaterial({
            color: 0x57606f,
            roughness: 0.7,
            metalness: 0.2
        });
        const quay = new THREE.Mesh(quayGeo, quayMat);
        quay.position.set(90, -0.5, 0);
        quay.receiveShadow = true;
        scene.add(quay);

        // 4. Buckle Drainage Canal Trough
        // Canal runs along X = 45 from Z = -150 to Z = 150
        const canalWidth = CityConfig.world.canalWidth;
        const canalBedGeo = new THREE.BoxGeometry(canalWidth, 3, 300);
        const canalBedMat = new THREE.MeshStandardMaterial({
            color: 0x16222f,
            roughness: 0.95
        });
        const canalBed = new THREE.Mesh(canalBedGeo, canalBedMat);
        canalBed.position.set(CityConfig.world.canalX, -1.8, 0);
        canalBed.receiveShadow = true;
        scene.add(canalBed);

        // Concrete Embankment walls for canal
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x747d8c, roughness: 0.8 });
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 300), wallMat);
        leftWall.position.set(CityConfig.world.canalX - canalWidth / 2, 0, 0);
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 300), wallMat);
        rightWall.position.set(CityConfig.world.canalX + canalWidth / 2, 0, 0);
        scene.add(rightWall);
    }

    buildRoadNetwork(scene) {
        const roadMat = new THREE.MeshStandardMaterial({
            color: CityConfig.palette.asphalt,
            roughness: 0.85,
            metalness: 0.1
        });
        const lineMat = new THREE.MeshBasicMaterial({ color: CityConfig.palette.roadLine });
        const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Helper to add road strip
        const addRoad = (x, z, width, length, isEastWest = true) => {
            const roadGeo = new THREE.PlaneGeometry(width, length);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.rotation.x = -Math.PI / 2;
            if (isEastWest) road.rotation.z = Math.PI / 2;
            road.position.set(x, 0.05, z);
            road.receiveShadow = true;
            scene.add(road);

            // Add center dashed line
            const numDashes = Math.floor(length / 6);
            for (let i = -numDashes / 2; i < numDashes / 2; i++) {
                const dashGeo = new THREE.PlaneGeometry(0.35, 3);
                const dash = new THREE.Mesh(dashGeo, lineMat);
                dash.rotation.x = -Math.PI / 2;
                if (isEastWest) {
                    dash.rotation.z = Math.PI / 2;
                    dash.position.set(x + i * 6, 0.06, z);
                } else {
                    dash.position.set(x, 0.06, z + i * 6);
                }
                scene.add(dash);
            }
        };

        // 1. Grand Arterial Highway (East-West, Z = 0)
        // From industrial zone (X=-130) to Port (X=85)
        // (Bridge section covers X: 37 to 53)
        addRoad(-35, 0, 16, 170, true);
        addRoad(68, 0, 16, 30, true);

        // 2. Coastal Port Avenue (North-South, X = 78)
        addRoad(78, 0, 12, 240, false);

        // 3. Central Smart City Avenue (North-South, X = -2)
        addRoad(-2, 0, 12, 220, false);

        // 4. Industrial Corridor Road (North-South, X = -75)
        addRoad(-75, 0, 12, 220, false);

        // 5. Cross Avenue North (East-West, Z = -60)
        addRoad(-5, -60, 10, 150, true);

        // 6. Cross Avenue South (East-West, Z = 60)
        addRoad(-5, 60, 10, 150, true);

        // 7. Alternate Flood Bypass Route (loops south of bridge, X = 20 to 70 at Z = 35)
        this.buildBypassRoute(scene);
    }

    buildBypassRoute(scene) {
        const bypassMat = new THREE.MeshStandardMaterial({
            color: 0x2f3640,
            roughness: 0.9
        });
        // Curved bypass road connecting Central Ave to Coastal Ave around flooded Buckle canal zone
        const bypassGeo = new THREE.PlaneGeometry(8, 70);
        const bypass = new THREE.Mesh(bypassGeo, bypassMat);
        bypass.rotation.x = -Math.PI / 2;
        bypass.rotation.z = Math.PI / 4;
        bypass.position.set(40, 0.052, 38);
        scene.add(bypass);
    }

    buildDistricts(scene) {
        // District 1: Downtown Commercial Smart City (Center: X: 15 to 35, Z: 10 to 45)
        this.buildCommercialCenter(scene);

        // District 2: Residential Colony (South-Central: X: 15 to 35, Z: -15 to -45)
        this.buildResidentialColony(scene);

        // District 3: Healthcare & Emergency Command Hub (South: X: -20 to 20, Z: 75 to 105)
        this.buildEmergencyHub(scene);
    }

    buildCommercialCenter(scene) {
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x1e3799,
            metalness: 0.8,
            roughness: 0.1,
            reflectivity: 0.9,
            clearcoat: 0.6
        });
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.6 });

        const towers = [
            { x: 18, z: 20, w: 12, d: 10, h: 36, name: "Thoothukudi Smart City Command Tower" },
            { x: 30, z: 22, w: 10, d: 12, h: 28, name: "IT & Maritime Logistics Hub" },
            { x: 22, z: 42, w: 14, d: 10, h: 24, name: "Tuticorin Trade & Commerce Center" }
        ];

        towers.forEach(t => {
            const group = new THREE.Group();
            group.position.set(t.x, 0, t.z);

            // Main Tower Body
            const bodyGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
            const body = new THREE.Mesh(bodyGeo, glassMat);
            body.position.y = t.h / 2;
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Concrete frame accents
            const frameGeo = new THREE.BoxGeometry(t.w + 0.5, 1.2, t.d + 0.5);
            for (let y = 4; y < t.h; y += 6) {
                const frame = new THREE.Mesh(frameGeo, concreteMat);
                frame.position.y = y;
                group.add(frame);
            }

            // Rooftop Helipad / Antenna
            const antGeo = new THREE.CylinderGeometry(0.2, 0.4, 8, 8);
            const antMat = new THREE.MeshStandardMaterial({ color: 0xff4757, metalness: 0.9 });
            const antenna = new THREE.Mesh(antGeo, antMat);
            antenna.position.y = t.h + 4;
            group.add(antenna);

            // Make interactive
            group.userData = {
                isInteractive: true,
                landmarkId: 'tower_' + t.name.replace(/\s+/g, '_').toLowerCase(),
                name: t.name,
                district: "Commercial Downtown",
                type: "COMMERCIAL_TOWER",
                status: "NORMAL",
                details: {
                    occupancy: "84%",
                    energyEfficiency: "A+",
                    smartHVAC: "Active"
                }
            };
            this.interactiveObjects.push(group);
            scene.add(group);
        });
    }

    buildResidentialColony(scene) {
        // Flat-roof pastel houses common in coastal Tamil Nadu with water tanks
        const houseColors = [0xf5cd79, 0xf8a5c2, 0x63cdda, 0xe77f67, 0x786fa6];
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.4 }); // Sintex Black tank

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const posX = 16 + col * 9;
                const posZ = -18 - row * 11;
                const h = 6 + (row + col) % 3 * 2.5;

                const house = new THREE.Group();
                house.position.set(posX, 0, posZ);

                const wallMat = new THREE.MeshStandardMaterial({
                    color: houseColors[(row * 3 + col) % houseColors.length],
                    roughness: 0.8
                });

                const body = new THREE.Mesh(new THREE.BoxGeometry(7, h, 8), wallMat);
                body.position.y = h / 2;
                body.castShadow = true;
                body.receiveShadow = true;
                house.add(body);

                // Rooftop parapet & water tank
                const parapet = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 8.2), wallMat);
                parapet.position.y = h + 0.25;
                house.add(parapet);

                const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 12), tankMat);
                tank.position.set(1.5, h + 1.2, 1.5);
                house.add(tank);

                scene.add(house);
            }
        }
    }

    buildEmergencyHub(scene) {
        // 1. Thoothukudi Government Medical College & Hospital (X: -15, Z: 75)
        const hospGroup = new THREE.Group();
        hospGroup.position.set(CityConfig.landmarks.hospital.position.x, 0, CityConfig.landmarks.hospital.position.z);

        const hospMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.5 });
        const mainWing = new THREE.Mesh(new THREE.BoxGeometry(22, 12, 16), hospMat);
        mainWing.position.y = 6;
        mainWing.castShadow = true;
        hospGroup.add(mainWing);

        // Hospital Red Cross on facade
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
        crossH.position.set(0, 8, 8.1);
        hospGroup.add(crossH);

        const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 0.2), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
        crossV.position.set(0, 8, 8.1);
        hospGroup.add(crossV);

        // Helipad on roof
        const helipad = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 4, 0.2, 24),
            new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.9 })
        );
        helipad.position.y = 12.1;
        hospGroup.add(helipad);

        hospGroup.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.hospital.id,
            name: CityConfig.landmarks.hospital.name,
            district: CityConfig.landmarks.hospital.district,
            type: "HOSPITAL",
            status: "READY",
            details: {
                traumaBeds: "140 Available",
                ambulancesReady: "6 Vehicles",
                oxygenPurity: "99.4%"
            }
        };
        this.interactiveObjects.push(hospGroup);
        scene.add(hospGroup);

        // 2. Fire & Rescue Command Station (X: 15, Z: 75)
        const fireGroup = new THREE.Group();
        fireGroup.position.set(CityConfig.landmarks.fireStation.position.x, 0, CityConfig.landmarks.fireStation.position.z);

        const fireMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6 });
        const fireStation = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 14), fireMat);
        fireStation.position.y = 4.5;
        fireStation.castShadow = true;
        fireGroup.add(fireStation);

        // Rollup Bay Doors
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.7 });
        for (let d = -1; d <= 1; d++) {
            const door = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 5), doorMat);
            door.position.set(d * 4.5, 2.5, 7.05);
            fireGroup.add(door);
        }

        fireGroup.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.fireStation.id,
            name: CityConfig.landmarks.fireStation.name,
            district: CityConfig.landmarks.fireStation.district,
            type: "FIRE_STATION",
            status: "READY",
            details: {
                foamTenders: "3 Available",
                waterReserve: "45,000 L",
                crewOnDuty: "18 Personnel"
            }
        };
        this.interactiveObjects.push(fireGroup);
        scene.add(fireGroup);
    }

    buildCentralBusStand(scene) {
        const standGroup = new THREE.Group();
        standGroup.position.set(CityConfig.landmarks.busStand.position.x, 0, CityConfig.landmarks.busStand.position.z);

        const tarmacMat = new THREE.MeshStandardMaterial({ color: 0x222f3e, roughness: 0.9 });
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0x8395a7, roughness: 0.7 });
        const canopyGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x0abde3, transparent: true, opacity: 0.65, roughness: 0.2 });
        const tnstcGreen = new THREE.MeshStandardMaterial({ color: 0x10ac84, roughness: 0.5 });
        const tnstcWhite = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.4 });
        const setcRed = new THREE.MeshStandardMaterial({ color: 0xee5253, roughness: 0.5 });

        // 1. Terminal Ground Tarmac Apron (36 x 30)
        const apron = new THREE.Mesh(new THREE.BoxGeometry(36, 0.2, 30), tarmacMat);
        apron.position.y = 0.1;
        apron.receiveShadow = true;
        standGroup.add(apron);

        // 2. Main Concourse Passenger Terminal Building
        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(30, 6.5, 8), concreteMat);
        mainBuilding.position.set(0, 3.25, -10);
        mainBuilding.castShadow = true;
        standGroup.add(mainBuilding);

        // Terminal Facade Neon Sign
        const signMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const signBar = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 0.3), signMat);
        signBar.position.set(0, 5.5, -5.8);
        standGroup.add(signBar);

        // 3. Raised Boarding Platforms & Curved Passenger Canopy
        const platform = new THREE.Mesh(new THREE.BoxGeometry(28, 0.6, 6), concreteMat);
        platform.position.set(0, 0.4, -3);
        standGroup.add(platform);

        // Canopy roof over platforms
        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 28, 16, 1, false, 0, Math.PI), canopyGlassMat);
        canopy.rotation.z = Math.PI / 2;
        canopy.position.set(0, 5.8, -3);
        standGroup.add(canopy);

        // 4. Angled Bus Parking Bays (Bay 1 to Bay 4) with Yellow Striping
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfeca57 });
        [-10, -3.5, 3.5, 10].forEach((xOff, idx) => {
            const bayStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 13), stripeMat);
            bayStripe.rotation.x = -Math.PI / 2;
            bayStripe.position.set(xOff, 0.22, 4);
            standGroup.add(bayStripe);

            // Parked TNSTC / SETC Buses
            if (idx < 3) {
                const busGroup = new THREE.Group();
                busGroup.position.set(xOff + 1.2, 0, 4);
                busGroup.rotation.y = Math.PI / 24;

                const isSetc = (idx === 2);
                const busMat = isSetc ? setcRed : tnstcGreen;

                // Bus Body
                const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 9.5), busMat);
                busBody.position.y = 1.6;
                busBody.castShadow = true;
                busGroup.add(busBody);

                // White upper stripe for TNSTC
                const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.8, 9.2), tnstcWhite);
                roofStripe.position.set(0, 2.4, 0);
                busGroup.add(roofStripe);

                // Windshield & Windows
                const win = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.9, 8.0), new THREE.MeshPhysicalMaterial({ color: 0x1e272e, roughness: 0.1 }));
                win.position.set(0, 1.8, 0.2);
                busGroup.add(win);

                standGroup.add(busGroup);
            }
        });

        // Make Bus Stand interactive
        standGroup.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.busStand.id,
            name: CityConfig.landmarks.busStand.name,
            district: CityConfig.landmarks.busStand.district,
            type: "TRANSIT_TERMINAL",
            status: "OPERATIONAL",
            details: {
                depotFleet: "48 TNSTC City/Mofussil + 12 SETC Deluxe",
                dailyCommuters: "18,500 Passengers",
                nextDepartures: "Tirunelveli Superfast (05m) | Madurai Exp (15m)",
                bayCapacity: "8 Active Boarding Bays"
            }
        };

        this.interactiveObjects.push(standGroup);
        scene.add(standGroup);
    }

    buildRailwayNetworkCrossings(scene) {
        // Build 3D models for Gate 1 (Millerpuram), Gate 2 (Korampallam), and Gate 3 (Port Goods Outer Line)
        const postMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
        const signMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });

        const gates = [
            {
                id: CityConfig.landmarks.railwayGate1.id,
                name: CityConfig.landmarks.railwayGate1.name,
                district: CityConfig.landmarks.railwayGate1.district,
                pos: CityConfig.landmarks.railwayGate1.position,
                type: 'RAILWAY_CROSSING_GATE_1',
                details: {
                    line: "Southern Railway Mainline (Express & Passenger)",
                    activeTrain: "06017 Chennai Egmore Special / 12693 Pearl City",
                    alternateBypass: "Via Millerpuram Bypass Road (+5 min)",
                    avgWait: "6 min"
                }
            },
            {
                id: CityConfig.landmarks.railwayGate2.id,
                name: CityConfig.landmarks.railwayGate2.name,
                district: CityConfig.landmarks.railwayGate2.district,
                pos: CityConfig.landmarks.railwayGate2.position,
                type: 'RAILWAY_CROSSING_GATE_2',
                details: {
                    line: "Southern Railway Station Approach (Passenger Departure)",
                    activeTrain: "56760 Tuticorin–Vanchi Maniyachchi Passenger",
                    alternateBypass: "Via Korampallam Ring Road (+6 min)",
                    avgWait: "9 min"
                }
            },
            {
                id: CityConfig.landmarks.railwayGate3.id,
                name: CityConfig.landmarks.railwayGate3.name,
                district: CityConfig.landmarks.railwayGate3.district,
                pos: CityConfig.landmarks.railwayGate3.position,
                type: 'RAILWAY_PORT_GOODS_LINE',
                isGoodsOnly: true,
                details: {
                    line: "Outer Port Goods Line (Coal, Container, Fertilizer Rakes)",
                    publicRoadCrossing: "NONE (Restricted Industrial Rail Corridor)",
                    destinations: "Berth #4 & Coal Staging Siding",
                    frequency: "6 Goods Trains / 24h"
                }
            }
        ];

        gates.forEach(g => {
            const group = new THREE.Group();
            group.position.set(g.pos.x, 0, g.pos.z);

            if (!g.isGoodsOnly) {
                // Crossing Posts with Warning Crossbucks
                [-5, 5].forEach(xOff => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 2.4, 8), postMat);
                    post.position.set(xOff, 1.2, 0);
                    group.add(post);

                    const cross = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.05), signMat);
                    cross.position.set(xOff, 2.5, 0);
                    group.add(cross);

                    const redLed = new THREE.Mesh(
                        new THREE.SphereGeometry(0.14, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 1.5 })
                    );
                    redLed.position.set(xOff, 2.8, 0.1);
                    group.add(redLed);
                });
            } else {
                // Port goods siding warning pylon
                const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4, 0.8), postMat);
                pylon.position.y = 2;
                group.add(pylon);

                const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), signMat);
                sign.position.set(0, 3.2, 0.42);
                group.add(sign);
            }

            group.userData = {
                isInteractive: true,
                landmarkId: g.id,
                name: g.name,
                district: g.district,
                type: g.type,
                status: g.isGoodsOnly ? "GOODS_RESTRICTED" : "GATE_MONITORED",
                details: g.details
            };

            this.interactiveObjects.push(group);
            scene.add(group);
        });
    }

    buildVegetation(scene) {
        // Coastal Palm Trees & Urban Shade Trees
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x534337, roughness: 0.9 });
        const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.6 });

        const addPalmTree = (x, z) => {
            const tree = new THREE.Group();
            tree.position.set(x, 0, z);

            // Trunk (slight slant)
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 8, 8), trunkMat);
            trunk.position.y = 4;
            trunk.rotation.z = (Math.random() - 0.5) * 0.15;
            trunk.castShadow = true;
            tree.add(trunk);

            // Palm Fronds
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.5, 5), palmLeafMat);
                leaf.position.set(Math.cos(angle) * 1.4, 8, Math.sin(angle) * 1.4);
                leaf.rotation.x = Math.PI / 2.8;
                leaf.rotation.y = angle;
                tree.add(leaf);
            }
            scene.add(tree);
        };

        // Plant along canal and central park
        for (let z = -90; z <= 90; z += 20) {
            addPalmTree(CityConfig.world.canalX - 12, z);
            addPalmTree(CityConfig.world.canalX + 12, z);
            addPalmTree(70, z);
        }
    }

    buildStreetFurniture(scene) {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x2f3640, metalness: 0.8 });
        const lampBulbMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffeb99,
            emissiveIntensity: 0.8
        });

        // Streetlamps along Grand Arterial (Z = 0)
        for (let x = -100; x <= 80; x += 22) {
            // Avoid bridge overlap
            if (x >= 35 && x <= 55) continue;

            const lamp = new THREE.Group();
            lamp.position.set(x, 0, 9);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7, 8), poleMat);
            pole.position.y = 3.5;
            lamp.add(pole);

            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.5), poleMat);
            arm.position.set(0, 6.9, -1.2);
            lamp.add(arm);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampBulbMat);
            bulb.position.set(0, 6.7, -2.2);
            lamp.add(bulb);

            const light = new THREE.PointLight(0xffeb99, 0.4, 18);
            light.position.set(0, 6.5, -2.2);
            lamp.add(light);

            this.streetLights.push({ group: lamp, light: light, bulb: bulb });
            scene.add(lamp);
        }

        // Traffic Light Gantry at Arterial / Coastal Ave Junction (X: 78, Z: 0)
        this.buildTrafficSignal(scene, 78, 9, 0);
    }

    buildTrafficSignal(scene, x, yOffset, z) {
        const gantry = new THREE.Group();
        gantry.position.set(x - 9, 0, z + 9);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1e272e }));
        pole.position.y = 4;
        gantry.add(pole);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e272e }));
        arm.position.set(4, 7.8, 0);
        gantry.add(arm);

        // Signal Housing
        const housing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 0.8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        housing.position.set(6, 6.6, 0);
        gantry.add(housing);

        // 3 Lenses: Red, Amber, Green
        const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshStandardMaterial({ color: 0x330000 }));
        redLens.position.set(6, 7.4, 0.4);
        gantry.add(redLens);

        const yellowLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshStandardMaterial({ color: 0x333300 }));
        yellowLens.position.set(6, 6.6, 0.4);
        gantry.add(yellowLens);

        const greenLens = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.2 }));
        greenLens.position.set(6, 5.8, 0.4);
        gantry.add(greenLens);

        this.trafficLights.push({ red: redLens, yellow: yellowLens, green: greenLens });
        scene.add(gantry);
    }

    buildWaterSupplyTower(scene) {
        const towerGroup = new THREE.Group();
        towerGroup.position.set(CityConfig.landmarks.waterTower.position.x, 0, CityConfig.landmarks.waterTower.position.z);

        const concreteMat = new THREE.MeshStandardMaterial({ color: 0xb2bec3, roughness: 0.7 });

        // 4 Support Columns
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 16, 12), concreteMat);
            col.position.set(Math.cos(angle) * 4, 8, Math.sin(angle) * 4);
            col.castShadow = true;
            towerGroup.add(col);
        }

        // Central feed pipe
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, metalness: 0.8 });
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 16, 12), pipeMat);
        pipe.position.y = 8;
        towerGroup.add(pipe);

        // Spherical / Cylindrical Water Tank on Top
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(6, 5.2, 6, 24), concreteMat);
        tank.position.y = 18;
        tank.castShadow = true;
        towerGroup.add(tank);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), concreteMat);
        dome.position.y = 21;
        towerGroup.add(dome);

        towerGroup.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.waterTower.id,
            name: CityConfig.landmarks.waterTower.name,
            district: CityConfig.landmarks.waterTower.district,
            type: "WATER_SUPPLY",
            status: "NORMAL",
            details: {
                tankCapacity: "1.5 Million Liters",
                currentPressure: "4.2 bar",
                pumpsOnline: "3 / 3 active"
            }
        };
        this.interactiveObjects.push(towerGroup);
        scene.add(towerGroup);
    }

    buildSmartWasteBins(scene) {
        const binPositions = [
            { x: 14, z: 8, name: "Smart Waste Bin #1 - Downtown Core" },
            { x: -5, z: 8, name: "Smart Waste Bin #2 - Station Approach" },
            { x: 74, z: -20, name: "Smart Waste Bin #3 - Maritime Promenade" }
        ];

        binPositions.forEach((pos, idx) => {
            const binGroup = new THREE.Group();
            binGroup.position.set(pos.x, 0, pos.z);

            const binBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.45, 1.6, 16),
                new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5 })
            );
            binBody.position.y = 0.8;
            binGroup.add(binBody);

            // Solar top cap
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.55, 0.2, 16),
                new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8 })
            );
            cap.position.y = 1.65;
            binGroup.add(cap);

            // LED Fill Level Indicator Bar
            const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
            const led = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.8), ledMat);
            led.position.set(0, 0.9, 0.52);
            binGroup.add(led);

            binGroup.userData = {
                isInteractive: true,
                landmarkId: 'waste_bin_' + idx,
                name: pos.name,
                district: "Smart Sanitation Grid",
                type: "WASTE_MANAGEMENT",
                status: "NORMAL",
                details: {
                    fillLevel: "42%",
                    battery: "94% (Solar)",
                    autoCompressor: "Standby"
                }
            };

            this.interactiveObjects.push(binGroup);
            this.wasteBins.push({ group: binGroup, led: ledMat });
            scene.add(binGroup);
        });
    }

    updateTrafficSignals(cycle) {
        this.trafficLights.forEach(tl => {
            if (cycle === "GREEN") {
                tl.green.material.color.setHex(0x00ff88);
                tl.green.material.emissive.setHex(0x00ff88);
                tl.green.material.emissiveIntensity = 1.2;

                tl.yellow.material.color.setHex(0x333300);
                tl.yellow.material.emissive.setHex(0x000000);

                tl.red.material.color.setHex(0x330000);
                tl.red.material.emissive.setHex(0x000000);
            } else if (cycle === "YELLOW") {
                tl.green.material.color.setHex(0x003300);
                tl.green.material.emissive.setHex(0x000000);

                tl.yellow.material.color.setHex(0xffaa00);
                tl.yellow.material.emissive.setHex(0xffaa00);
                tl.yellow.material.emissiveIntensity = 1.2;

                tl.red.material.color.setHex(0x330000);
                tl.red.material.emissive.setHex(0x000000);
            } else {
                tl.green.material.color.setHex(0x003300);
                tl.green.material.emissive.setHex(0x000000);

                tl.yellow.material.color.setHex(0x333300);
                tl.yellow.material.emissive.setHex(0x000000);

                tl.red.material.color.setHex(0xff0055);
                tl.red.material.emissive.setHex(0xff0055);
                tl.red.material.emissiveIntensity = 1.5;
            }
        });
    }
}

window.CityBuilder = CityBuilder;
