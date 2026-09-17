/**
 * THOOTHUKUDI 3D DIGITAL TWIN - SMART TRAFFIC SIMULATION ENGINE
 * Simulates multi-lane road traffic with Indian smart city vehicle varieties
 * (Cars, Green City Buses, Auto-Rickshaws, Heavy Tata Cargo Trucks, Two-Wheelers).
 * Integrates dynamic congestion queues, railway gate stops, bridge flood diversions,
 * headlight lighting, and road congestion heatmaps.
 */

class TrafficSystem {
    constructor(scene) {
        this.scene = scene;
        this.vehicles = [];
        this.vehiclePool = [];
        this.maxVehicles = 55;

        // Waypoint Paths across Thoothukudi Road Network
        this.paths = this.createRoadPaths();

        // Vehicle Models & Materials Cache
        this.materials = {
            carColors: [0xf5f6fa, 0x34495e, 0x2980b9, 0xc0392b, 0x7f8c8d],
            busGreen: new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5 }), // Green Smart City Bus
            autoYellow: new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.6 }),
            autoGreen: new THREE.MeshStandardMaterial({ color: 0x16a085, roughness: 0.6 }),
            autoBlack: new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 }),
            truckBrown: new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.7 }),
            wheelMat: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
            glassMat: new THREE.MeshPhysicalMaterial({ color: 0x1e272e, roughness: 0.1, metalness: 0.8 }),
            headlightMat: new THREE.MeshBasicMaterial({ color: 0xfffae6 }),
            taillightMat: new THREE.MeshBasicMaterial({ color: 0xff0055 })
        };

        this.initVehicleFleet();
    }

    createRoadPaths() {
        return {
            // Arterial Highway Eastbound (Industrial -> Railway -> Bridge -> Port)
            arterialEast: [
                { x: -130, z: -3.5 },
                { x: -35, z: -3.5 },
                { x: -28, z: -3.5 }, // Before Railway Gate
                { x: -12, z: -3.5 }, // Past Railway Gate
                { x: 30, z: -3.5 },  // Before Bridge
                { x: 60, z: -3.5 },  // Past Bridge
                { x: 90, z: -3.5 }   // Port Entrance
            ],
            // Arterial Highway Westbound (Port -> Bridge -> Railway -> Industrial)
            arterialWest: [
                { x: 90, z: 3.5 },
                { x: 60, z: 3.5 },
                { x: 30, z: 3.5 },
                { x: -12, z: 3.5 },
                { x: -28, z: 3.5 },
                { x: -35, z: 3.5 },
                { x: -130, z: 3.5 }
            ],
            // Flood Detour Route (Bypassing Bridge B01 via South Bypass)
            floodDetour: [
                { x: 22, z: -3.5 },
                { x: 22, z: 35 },
                { x: 40, z: 38 },
                { x: 68, z: 35 },
                { x: 68, z: -3.5 },
                { x: 90, z: -3.5 }
            ],
            // Coastal Avenue Northbound (X = 78)
            coastalNorth: [
                { x: 75.5, z: 110 },
                { x: 75.5, z: 10 },
                { x: 75.5, z: -10 },
                { x: 75.5, z: -110 }
            ],
            // Coastal Avenue Southbound (X = 80.5)
            coastalSouth: [
                { x: 80.5, z: -110 },
                { x: 80.5, z: -10 },
                { x: 80.5, z: 10 },
                { x: 80.5, z: 110 }
            ],
            // Central Avenue (X = -2)
            centralLoop: [
                { x: -4, z: -90 },
                { x: -4, z: 90 },
                { x: 0, z: 90 },
                { x: 0, z: -90 }
            ],
            // Dedicated Bridge Traffic Eastbound (over Buckle Canal Bridge B01)
            bridgeEast: [
                { x: 10, z: -3.5 },
                { x: 25, z: -3.5 },
                { x: 45, z: -3.5 }, // On Bridge
                { x: 65, z: -3.5 },
                { x: 80, z: -3.5 },
                { x: 80, z: 3.5 },
                { x: 65, z: 3.5 },
                { x: 45, z: 3.5 }, // Returning On Bridge West
                { x: 25, z: 3.5 },
                { x: 10, z: 3.5 }
            ],
            // Dedicated Bridge Traffic Westbound (over Buckle Canal Bridge B01)
            bridgeWest: [
                { x: 80, z: 3.5 },
                { x: 65, z: 3.5 },
                { x: 45, z: 3.5 }, // On Bridge
                { x: 25, z: 3.5 },
                { x: 5, z: 3.5 },
                { x: 5, z: -3.5 },
                { x: 25, z: -3.5 },
                { x: 45, z: -3.5 }, // Returning East
                { x: 65, z: -3.5 },
                { x: 80, z: -3.5 }
            ],
            // Central Bus Stand Transit Route (Departing & Entering TNSTC Depot)
            busStandTransit: [
                { x: -45, z: -25 }, // Bus Stand Exit
                { x: -45, z: -6 },  // Joining Grand Arterial
                { x: -20, z: -3.5 },// Crossing Railway Gate
                { x: 15, z: -3.5 }, // Downtown Commercial
                { x: 15, z: 3.5 },  // U-Turn
                { x: -20, z: 3.5 }, // Returning over railway
                { x: -45, z: 3.5 },
                { x: -45, z: -25 }  // Entering Bus Stand
            ]
        };
    }

    initVehicleFleet() {
        const types = ['CAR', 'BUS', 'AUTO', 'TRUCK', 'BIKE'];

        for (let i = 0; i < this.maxVehicles; i++) {
            // Guarantee extra buses and autos for realism
            let type = types[i % types.length];
            if (i % 5 === 1) type = 'BUS';
            if (i % 5 === 2) type = 'AUTO';

            const mesh = this.createVehicleMesh(type);
            mesh.visible = false;
            this.scene.add(mesh);

            // Assign diverse routes with heavy presence on Bridge and Bus Stand
            const pathKeys = [
                'bridgeEast', 'bridgeWest', 'arterialEast', 'arterialWest', 
                'busStandTransit', 'coastalNorth', 'coastalSouth', 'centralLoop'
            ];
            const assignedPathKey = pathKeys[i % pathKeys.length];

            this.vehicles.push({
                mesh: mesh,
                type: type,
                pathKey: assignedPathKey,
                currentWaypointIdx: Math.floor(Math.random() * 3),
                progress: Math.random(),
                speed: 18 + Math.random() * 10,
                baseSpeed: 18 + Math.random() * 10,
                isStopped: false,
                headlights: mesh.userData.headlights || []
            });
        }
    }

    createVehicleMesh(type) {
        const group = new THREE.Group();
        const m = this.materials;
        const lights = [];

        if (type === 'CAR') {
            const color = m.carColors[Math.floor(Math.random() * m.carColors.length)];
            const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });

            // Lower Body
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 4.2), bodyMat);
            body.position.y = 0.55;
            body.castShadow = true;
            group.add(body);

            // Cabin
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), m.glassMat);
            cabin.position.set(0, 1.1, -0.2);
            group.add(cabin);

            // Wheels
            [[-0.95, -1.2], [0.95, -1.2], [-0.95, 1.2], [0.95, 1.2]].forEach(([x, z]) => {
                const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12), m.wheelMat);
                w.rotation.z = Math.PI / 2;
                w.position.set(x, 0.32, z);
                group.add(w);
            });

            // Headlights
            [-0.7, 0.7].forEach(x => {
                const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), m.headlightMat);
                h.position.set(x, 0.55, 2.15);
                group.add(h);
                lights.push(h);
            });
        }
        else if (type === 'BUS') {
            // Thoothukudi Smart City Green Electric Bus
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 10.0), m.busGreen);
            body.position.y = 1.7;
            body.castShadow = true;
            group.add(body);

            // Large Window Ribbon
            const windowRibbon = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.9, 8.5), m.glassMat);
            windowRibbon.position.set(0, 2.1, 0.2);
            group.add(windowRibbon);

            // 6 Wheels
            [[-1.25, -3.2], [1.25, -3.2], [-1.25, 0], [1.25, 0], [-1.25, 3.2], [1.25, 3.2]].forEach(([x, z]) => {
                const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 12), m.wheelMat);
                w.rotation.z = Math.PI / 2;
                w.position.set(x, 0.48, z);
                group.add(w);
            });

            // Headlights
            [-0.9, 0.9].forEach(x => {
                const h = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), m.headlightMat);
                h.position.set(x, 0.8, 5.05);
                group.add(h);
                lights.push(h);
            });
        }
        else if (type === 'AUTO') {
            // Iconic Indian Auto-Rickshaw (3-Wheeler)
            const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 2.6), m.autoGreen);
            lowerBody.position.y = 0.45;
            group.add(lowerBody);

            const midBody = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.4, 2.5), m.autoYellow);
            midBody.position.y = 0.85;
            group.add(midBody);

            const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 1.8), m.autoBlack);
            canopy.position.set(0, 1.35, -0.3);
            group.add(canopy);

            // Front single wheel
            const frontW = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10), m.wheelMat);
            frontW.rotation.z = Math.PI / 2;
            frontW.position.set(0, 0.25, 1.1);
            group.add(frontW);

            // Rear twin wheels
            [[-0.7, -0.8], [0.7, -0.8]].forEach(([x, z]) => {
                const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10), m.wheelMat);
                rw.rotation.z = Math.PI / 2;
                rw.position.set(x, 0.25, z);
                group.add(rw);
            });

            // Single center headlight
            const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), m.headlightMat);
            h.position.set(0, 0.6, 1.32);
            group.add(h);
            lights.push(h);
        }
        else if (type === 'TRUCK') {
            // Tata Heavy Cargo Hauler
            const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 3.2), m.truckBrown);
            cab.position.set(0, 1.6, 3.4);
            cab.castShadow = true;
            group.add(cab);

            // Cargo Bed with colorful tarpaulin
            const bed = new THREE.Mesh(
                new THREE.BoxGeometry(2.4, 2.4, 6.5),
                new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.8 })
            );
            bed.position.set(0, 1.7, -1.8);
            bed.castShadow = true;
            group.add(bed);

            // Wheels
            [[-1.25, -3.8], [1.25, -3.8], [-1.25, -1.5], [1.25, -1.5], [-1.25, 3.4], [1.25, 3.4]].forEach(([x, z]) => {
                const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12), m.wheelMat);
                w.rotation.z = Math.PI / 2;
                w.position.set(x, 0.5, z);
                group.add(w);
            });
        }
        else {
            // Two-Wheeler (Motorbike/Scooter)
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.8, 1.8),
                new THREE.MeshStandardMaterial({ color: 0xe74c3c })
            );
            frame.position.y = 0.5;
            group.add(frame);

            // Rider silhouette
            const rider = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.9, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
            );
            rider.position.set(0, 1.1, -0.1);
            group.add(rider);

            // Helmet
            const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), m.wheelMat);
            helmet.position.set(0, 1.7, -0.1);
            group.add(helmet);

            // Front and rear wheels
            [-0.7, 0.7].forEach(z => {
                const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 10), m.wheelMat);
                w.rotation.z = Math.PI / 2;
                w.position.set(0, 0.26, z);
                group.add(w);
            });
        }

        group.userData.headlights = lights;
        return group;
    }

    update(delta, time, sensorData) {
        const density = sensorData.traffic.densityLevel;
        let activeCount = 20;
        let speedFactor = 1.0;

        if (density === 'LOW') {
            activeCount = 10;
            speedFactor = 1.2;
        } else if (density === 'MEDIUM') {
            activeCount = 22;
            speedFactor = 1.0;
        } else if (density === 'HIGH') {
            activeCount = 34;
            speedFactor = 0.6; // Heavy rain or congestion slows traffic
        } else if (density === 'CRITICAL') {
            activeCount = 44;
            speedFactor = 0.35; // Severe gridlock
        }

        // Bridge closed check
        const isBridgeClosed = sensorData.bridge.status === "CRITICAL_CLOSED";
        // Railway gate status
        const isGateClosed = sensorData.railway.gateStatus === "CLOSED" || sensorData.railway.gateStatus === "CLOSING";

        // Night / Rain Headlights check
        const isDark = sensorData.weather.dayNightMode === 'NIGHT' || sensorData.weather.isStorm;

        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];

            if (i >= activeCount) {
                v.mesh.visible = false;
                continue;
            }
            v.mesh.visible = true;

            // Route switching if bridge is closed
            if (isBridgeClosed) {
                if (v.pathKey === 'arterialEast' || v.pathKey === 'bridgeEast') {
                    v.pathKey = 'floodDetour';
                    v.currentWaypointIdx = 0;
                } else if (v.pathKey === 'bridgeWest') {
                    // Turn around or divert
                    v.pathKey = 'coastalSouth';
                    v.currentWaypointIdx = 0;
                }
            } else if (!isBridgeClosed && v.pathKey === 'floodDetour') {
                v.pathKey = 'arterialEast';
            }

            const currentPath = this.paths[v.pathKey];
            const p1 = currentPath[v.currentWaypointIdx];
            const nextIdx = (v.currentWaypointIdx + 1) % currentPath.length;
            const p2 = currentPath[nextIdx];

            // 1. Check Railway Gate Stop Line (West approach at X = -28, East approach at X = -12)
            let mustStop = false;
            if (isGateClosed) {
                if (v.pathKey === 'arterialEast' && v.mesh.position.x >= -35 && v.mesh.position.x <= -24) {
                    mustStop = true;
                }
                if (v.pathKey === 'arterialWest' && v.mesh.position.x <= -8 && v.mesh.position.x >= -18) {
                    mustStop = true;
                }
                if (v.pathKey === 'busStandTransit' && v.mesh.position.x >= -35 && v.mesh.position.x <= -24) {
                    mustStop = true;
                }
            }

            // 2. Check Traffic Signal Red Light Stop Line
            if (sensorData.traffic.signalCycle === "RED") {
                // Stop at Coastal Ave junction (X: 74)
                if (v.pathKey === 'arterialEast' && v.mesh.position.x >= 65 && v.mesh.position.x <= 73) {
                    mustStop = true;
                }
            }

            // 3. Check Bridge Closure Barrier Stop Line
            if (isBridgeClosed) {
                if ((v.pathKey === 'bridgeEast' || v.pathKey === 'arterialEast') && v.mesh.position.x >= 28 && v.mesh.position.x <= 34) {
                    mustStop = true; // Stopped right in front of bridge barrier arm!
                }
                if ((v.pathKey === 'bridgeWest' || v.pathKey === 'arterialWest') && v.mesh.position.x <= 62 && v.mesh.position.x >= 56) {
                    mustStop = true;
                }
            }

            if (mustStop) {
                v.isStopped = true;
                continue;
            }
            v.isStopped = false;

            // Bridge Traffic Slowdown Factor: In rain or high water, bridge traffic slows down visibly
            let bridgeSlowFactor = 1.0;
            const isOnBridge = (v.mesh.position.x >= 32 && v.mesh.position.x <= 58 && Math.abs(v.mesh.position.z) < 8);
            if (isOnBridge) {
                if (sensorData.bridge.status === "WARNING" || sensorData.weather.isRaining) {
                    bridgeSlowFactor = 0.45; // Heavy rain slowdown across Buckle canal bridge
                }
            }

            // Move vehicle along segment
            const segDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
            const step = (v.baseSpeed * speedFactor * bridgeSlowFactor * delta) / (segDist || 1);
            v.progress += step;

            if (v.progress >= 1.0) {
                v.progress = 0;
                v.currentWaypointIdx = nextIdx;
            }

            // Interpolate position
            const curX = p1.x + (p2.x - p1.x) * v.progress;
            const curZ = p1.z + (p2.z - p1.z) * v.progress;

            // Elevated on Bridge deck (X between 32 and 58 on Arterial road)
            let curY = 0.05;
            if (curX >= 32 && curX <= 58 && Math.abs(curZ) < 8) {
                curY = 2.65; // Riding on top of Buckle Canal bridge deck!
            }

            v.mesh.position.set(curX, curY, curZ);

            // Orient towards direction
            const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
            v.mesh.rotation.y = angle;

            // Toggle headlights in storm / night
            if (v.headlights) {
                v.headlights.forEach(h => {
                    h.visible = isDark;
                });
            }
        }
    }
}

window.TrafficSystem = TrafficSystem;
