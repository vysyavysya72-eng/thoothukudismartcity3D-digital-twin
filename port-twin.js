/**
 * THOOTHUKUDI 3D DIGITAL TWIN - PORT DIGITAL TWIN (V.O. CHIDAMBARANAR PORT)
 * Models Tuticorin's deepwater seaport on the Gulf of Mannar.
 * Includes a large container cargo ship with floating wave physics,
 * rail-mounted ship-to-shore gantry cranes with moving trolleys,
 * container staging yards, terminal trucks, and ocean water wave animations.
 */

class PortTwin {
    constructor(scene, interactiveList) {
        this.scene = scene;
        this.interactiveList = interactiveList;

        this.portGroup = new THREE.Group();
        this.cranes = [];
        this.shipGroup = new THREE.Group();

        this.buildPortQuay();
        this.buildCargoShip();
        this.buildGantryCranes();
        this.buildContainerYard();
        this.buildOceanWater();
    }

    buildPortQuay() {
        // Wharf surface (X: 90 to 110, Z: -120 to 120)
        const wharfGeo = new THREE.BoxGeometry(20, 2, 220);
        const wharfMat = new THREE.MeshStandardMaterial({ color: 0x4b4b4b, roughness: 0.85 });
        const wharf = new THREE.Mesh(wharfGeo, wharfMat);
        wharf.position.set(100, -0.5, 0);
        wharf.receiveShadow = true;
        this.portGroup.add(wharf);

        // Yellow Mooring Bollards along edge
        const bollardMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8 });
        for (let z = -90; z <= 90; z += 18) {
            const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.8, 12), bollardMat);
            bollard.position.set(110, 0.8, z);
            this.portGroup.add(bollard);
        }

        // Craneway rails along wharf (X = 98 and X = 108)
        const railMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9 });
        [98, 108].forEach(xPos => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 200), railMat);
            rail.position.set(xPos, 0.55, 0);
            this.portGroup.add(rail);
        });

        this.scene.add(this.portGroup);
    }

    buildCargoShip() {
        const shipMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.5 }); // Dark hull
        const deckMat = new THREE.MeshStandardMaterial({ color: 0xb33939, roughness: 0.7 }); // Rust-red deck
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.4 }); // White superstructure

        // 1. Ship Hull (Length = 65, Width = 14, Depth = 6)
        const hull = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 62), shipMat);
        hull.position.y = 1.0;
        hull.castShadow = true;
        this.shipGroup.add(hull);

        // Deck
        const deck = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.4, 61), deckMat);
        deck.position.y = 4.1;
        this.shipGroup.add(deck);

        // Bow taper (triangular prism front)
        const bow = new THREE.Mesh(new THREE.ConeGeometry(7, 12, 4), shipMat);
        bow.rotation.x = Math.PI / 2;
        bow.rotation.y = Math.PI / 4;
        bow.position.set(0, 1.0, 36);
        this.shipGroup.add(bow);

        // 2. Stern Bridge Superstructure & Navigation Tower
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(11, 8, 10), bridgeMat);
        bridge.position.set(0, 8.0, -20);
        bridge.castShadow = true;
        this.shipGroup.add(bridge);

        // Exhaust Funnel / Smokestack
        const funnel = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.4, 4, 12),
            new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
        );
        funnel.position.set(0, 13.0, -22);
        this.shipGroup.add(funnel);

        // Radar Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 6, 8), new THREE.MeshStandardMaterial({ color: 0xff4757 }));
        mast.position.set(0, 15.0, -18);
        this.shipGroup.add(mast);

        // 3. Container Cargo Stacks on Ship Deck
        const containerColors = [0x2980b9, 0xc0392b, 0x27ae60, 0xf39c12, 0x8e44ad];
        for (let row = -1; row <= 1; row++) {
            for (let bay = -1; bay <= 3; bay++) {
                const heightLayers = 2 + (Math.abs(row + bay) % 3);
                for (let h = 0; h < heightLayers; h++) {
                    const cMat = new THREE.MeshStandardMaterial({
                        color: containerColors[(row + bay + h + 5) % containerColors.length],
                        roughness: 0.6
                    });
                    const cMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 7.5), cMat);
                    cMesh.position.set(row * 3.6, 5.3 + h * 2.3, bay * 8.5 + 4);
                    cMesh.castShadow = true;
                    this.shipGroup.add(cMesh);
                }
            }
        }

        // Position ship alongside berth in Gulf of Mannar
        this.shipGroup.position.set(128, -0.6, 10);

        // Interactive click metadata
        const shipHitBox = new THREE.Mesh(
            new THREE.BoxGeometry(20, 18, 80),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        shipHitBox.position.set(0, 8, 0);
        shipHitBox.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.port.id,
            name: CityConfig.landmarks.port.name,
            district: CityConfig.landmarks.port.district,
            type: "PORT_FACILITY",
            status: "OPERATIONAL",
            details: {
                vessel: "VOC VOYAGER (Container 4,200 TEU)",
                berth: "Berth #4 Deepwater Quay",
                cargoHandled: "1,420 TEU / 24h",
                windSpeed: "14.5 km/h",
                tideHeight: "1.2 m"
            }
        };
        this.interactiveList.push(shipHitBox);
        this.shipGroup.add(shipHitBox);

        this.scene.add(this.shipGroup);
    }

    buildGantryCranes() {
        const craneMat = new THREE.MeshStandardMaterial({ color: 0x3498db, metalness: 0.7 });
        const trolleyMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f });

        // 2 Heavy Ship-to-Shore (STS) Cranes
        [-15, 25].forEach(zPos => {
            const craneGroup = new THREE.Group();
            craneGroup.position.set(103, 0, zPos);

            // Gantry Legs (Straddling the quay rails)
            [-5, 5].forEach(xOff => {
                [-3, 3].forEach(zOff => {
                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 22, 0.8), craneMat);
                    leg.position.set(xOff, 11, zOff);
                    craneGroup.add(leg);
                });
            });

            // Main Horizontal Boom extending over ship
            const boom = new THREE.Mesh(new THREE.BoxGeometry(32, 1.4, 2.2), craneMat);
            boom.position.set(8, 22, 0); // Reaches from quay (X=0) to over ship (X=20)
            craneGroup.add(boom);

            // Moving Trolley with Container Hoist Spreader
            const trolley = new THREE.Mesh(new THREE.BoxGeometry(3, 1.0, 2.0), trolleyMat);
            trolley.position.set(5, 21.2, 0);
            craneGroup.add(trolley);

            const cable = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 10, 6),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            cable.position.set(0, -5, 0);
            trolley.add(cable);

            const spreader = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.6, 6.0),
                new THREE.MeshStandardMaterial({ color: 0xe67e22 })
            );
            spreader.position.set(0, -10, 0);
            trolley.add(spreader);

            this.cranes.push({ group: craneGroup, trolley: trolley, baseTrolleyX: 5, phase: Math.random() * 5 });
            this.scene.add(craneGroup);
        });
    }

    buildContainerYard() {
        const colors = [0x2980b9, 0xc0392b, 0x27ae60, 0xf39c12, 0x34495e];
        for (let row = 0; row < 3; row++) {
            for (let stack = -3; stack <= 3; stack++) {
                const height = 2 + (Math.abs(row + stack) % 3);
                for (let h = 0; h < height; h++) {
                    const cMat = new THREE.MeshStandardMaterial({
                        color: colors[(row * 2 + stack + h + 8) % colors.length],
                        roughness: 0.6
                    });
                    const c = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 7.0), cMat);
                    c.position.set(91 - row * 3.5, 1.1 + h * 2.2, stack * 8);
                    c.castShadow = true;
                    this.scene.add(c);
                }
            }
        }
    }

    buildOceanWater() {
        const seaGeo = new THREE.PlaneGeometry(120, 300, 32, 32);
        this.seaMat = new THREE.MeshStandardMaterial({
            color: 0x005082,
            roughness: 0.15,
            metalness: 0.8,
            transparent: true,
            opacity: 0.92
        });

        this.ocean = new THREE.Mesh(seaGeo, this.seaMat);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.set(145, -0.8, 0);
        this.scene.add(this.ocean);
    }

    update(delta, time, sensorData) {
        // 1. Cargo Ship Floating Dynamics (Roll, Pitch, Heave)
        const waveIntensity = sensorData.weather.isStorm ? 2.2 : 1.0;
        this.shipGroup.position.y = -0.6 + Math.sin(time * 1.5) * 0.18 * waveIntensity;
        this.shipGroup.rotation.z = Math.sin(time * 1.2) * 0.02 * waveIntensity;
        this.shipGroup.rotation.x = Math.cos(time * 0.9) * 0.015 * waveIntensity;

        // 2. Crane Trolley Loading Animation
        this.cranes.forEach(crane => {
            const tOffset = Math.sin(time * 0.8 + crane.phase) * 8;
            crane.trolley.position.x = crane.baseTrolleyX + tOffset;
        });

        // 3. Ocean Wave undulations
        const pos = this.ocean.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const u = pos.getX(i);
            const v = pos.getY(i);
            pos.setZ(i, Math.sin(time * 2 + u * 0.15 + v * 0.1) * 0.25 * waveIntensity);
        }
        this.ocean.geometry.attributes.position.needsUpdate = true;
    }
}

window.PortTwin = PortTwin;
