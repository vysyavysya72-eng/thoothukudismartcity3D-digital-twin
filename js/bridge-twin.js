/**
 * THOOTHUKUDI 3D DIGITAL TWIN - BRIDGE DIGITAL TWIN (BUCKLE CANAL B01)
 * Models the 4-lane arterial road bridge crossing the Buckle drainage canal.
 * Dynamically animates the rising water level beneath, safety warning strobes,
 * automated closure barriers, and alternate bypass detour routing.
 */

class BridgeTwin {
    constructor(scene, interactiveList) {
        this.scene = scene;
        this.interactiveList = interactiveList;

        this.bridgeGroup = new THREE.Group();
        this.currentWaterY = CityConfig.world.normalWaterLevel;
        this.targetWaterY = CityConfig.world.normalWaterLevel;

        this.warningLights = [];
        this.barrierGates = [];
        this.barrierAngle = 0; // 0 = open (vertical), PI/2 = closed (horizontal across road)

        this.buildBridge();
        this.buildCanalWater();
        this.buildBarriers();
    }

    buildBridge() {
        const canalX = CityConfig.world.canalX;
        const deckWidth = 16;   // Z dimension (carriageway)
        const deckSpan = 22;    // X dimension (spanning across canal from X=34 to X=56)
        const deckThickness = 1.2;
        const deckElevation = 2.0;

        // 1. Bridge Road Deck
        const deckGeo = new THREE.BoxGeometry(deckSpan, deckThickness, deckWidth);
        const deckMat = new THREE.MeshStandardMaterial({
            color: 0x3d4451,
            roughness: 0.8,
            metalness: 0.2
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.set(canalX, deckElevation, 0);
        deck.castShadow = true;
        deck.receiveShadow = true;
        this.bridgeGroup.add(deck);

        // Deck Road Marking
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5b324 });
        for (let i = -deckSpan / 2 + 2; i < deckSpan / 2; i += 4) {
            const dash = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.35), lineMat);
            dash.rotation.x = -Math.PI / 2;
            dash.rotation.z = Math.PI / 2;
            dash.position.set(canalX + i, deckElevation + deckThickness / 2 + 0.02, 0);
            this.bridgeGroup.add(dash);
        }

        // 2. Concrete Support Piers / Pillars in Canal
        const pierGeo = new THREE.BoxGeometry(2.5, 4.5, deckWidth - 2);
        const pierMat = new THREE.MeshStandardMaterial({
            color: 0x57606f,
            roughness: 0.8
        });

        const centerPier = new THREE.Mesh(pierGeo, pierMat);
        centerPier.position.set(canalX, 0, 0);
        centerPier.castShadow = true;
        this.bridgeGroup.add(centerPier);

        // Water level gauge markings painted on central pier
        for (let y = -1.2; y <= 2.0; y += 0.5) {
            const markColor = y > 1.2 ? 0xff0055 : (y > 0.3 ? 0xffaa00 : 0x00ff88);
            const mark = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.8),
                new THREE.MeshBasicMaterial({ color: markColor })
            );
            mark.position.set(canalX + 1.26, y, (deckWidth - 2) / 2 + 0.01);
            this.bridgeGroup.add(mark);
        }

        // 3. Bridge Side Guardrails & Balustrades
        const railMat = new THREE.MeshStandardMaterial({ color: 0xa4b0be, metalness: 0.7 });
        const addRail = (zPos) => {
            const railBar = new THREE.Mesh(new THREE.BoxGeometry(deckSpan, 1.2, 0.4), railMat);
            railBar.position.set(canalX, deckElevation + deckThickness / 2 + 0.6, zPos);
            this.bridgeGroup.add(railBar);

            // Warning Strobe Beacon on ends
            [-deckSpan / 2 + 1, deckSpan / 2 - 1].forEach(xOff => {
                const strobeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12);
                const strobeMat = new THREE.MeshStandardMaterial({
                    color: 0x00ff88,
                    emissive: 0x00ff88,
                    emissiveIntensity: 0.8
                });
                const strobe = new THREE.Mesh(strobeGeo, strobeMat);
                strobe.position.set(canalX + xOff, deckElevation + deckThickness / 2 + 1.4, zPos);
                this.bridgeGroup.add(strobe);
                this.warningLights.push(strobe);
            });
        };
        addRail(deckWidth / 2 - 0.2);
        addRail(-deckWidth / 2 + 0.2);

        // Interactive metadata
        this.bridgeGroup.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.bridge.id,
            name: CityConfig.landmarks.bridge.name,
            district: CityConfig.landmarks.bridge.district,
            type: "BRIDGE",
            status: "NORMAL",
            details: {
                clearance: "4.8 m",
                waterLevel: "32%",
                vibration: "21.0 µε",
                trafficRate: "42 veh/min"
            }
        };

        this.interactiveList.push(this.bridgeGroup);
        this.scene.add(this.bridgeGroup);
    }

    buildCanalWater() {
        // Dynamic water plane inside the Buckle Canal trough
        const canalWidth = CityConfig.world.canalWidth;
        const waterGeo = new THREE.PlaneGeometry(canalWidth - 0.5, 300, 16, 32);
        this.waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x0984e3,
            roughness: 0.1,
            metalness: 0.6,
            transparent: true,
            opacity: 0.85
        });

        this.canalWater = new THREE.Mesh(waterGeo, this.waterMaterial);
        this.canalWater.rotation.x = -Math.PI / 2;
        this.canalWater.position.set(CityConfig.world.canalX, this.currentWaterY, 0);
        this.scene.add(this.canalWater);
    }

    buildBarriers() {
        const canalX = CityConfig.world.canalX;
        // Automated closure barrier gate posts at West and East bridge approaches
        const postMat = new THREE.MeshStandardMaterial({ color: 0x2f3640 });
        const armMat = new THREE.MeshStandardMaterial({ color: 0xff4757 });

        [-12, 12].forEach(xOffset => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.8), postMat);
            post.position.set(canalX + xOffset, 1.0, 8);
            this.scene.add(post);

            // Barrier Arm (pivots down across road)
            const armPivot = new THREE.Group();
            armPivot.position.set(canalX + xOffset, 1.8, 8);

            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 16), armMat);
            arm.position.set(0, 0, -8); // Center along pivot
            armPivot.add(arm);

            // Default arm is raised upright (rotated 90 deg)
            armPivot.rotation.x = Math.PI / 2;

            this.barrierGates.push(armPivot);
            this.scene.add(armPivot);
        });
    }

    update(delta, time, sensorData) {
        // 1. Water elevation physics based on sensor telemetry
        if (sensorData.flood.canalWaterLevel) {
            const pct = sensorData.flood.canalWaterLevel / 100;
            // Map 0% to -1.4m, 100% to +1.9m
            this.targetWaterY = -1.4 + pct * 3.3;
        }

        // Smooth water height lerp
        this.currentWaterY += (this.targetWaterY - this.currentWaterY) * 0.05;
        this.canalWater.position.y = this.currentWaterY;

        // Subtle wave undulating animation
        const pos = this.canalWater.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const u = pos.getX(i);
            const v = pos.getY(i);
            pos.setZ(i, Math.sin(time * 3 + u * 0.4 + v * 0.2) * 0.08);
        }
        this.canalWater.geometry.attributes.position.needsUpdate = true;

        // 2. Visual Strobe Lights & Color
        const status = sensorData.bridge.status;
        this.warningLights.forEach((light, idx) => {
            if (status === "CRITICAL_CLOSED") {
                // Alternating intense red flash
                const flash = Math.sin(time * 12 + idx) > 0;
                light.material.color.setHex(flash ? 0xff0055 : 0x330011);
                light.material.emissive.setHex(flash ? 0xff0055 : 0x000000);
                light.material.emissiveIntensity = flash ? 2.5 : 0.0;
            } else if (status === "WARNING") {
                // Amber pulsing
                const pulse = (Math.sin(time * 5) + 1) / 2;
                light.material.color.setHex(0xffaa00);
                light.material.emissive.setHex(0xffaa00);
                light.material.emissiveIntensity = pulse * 1.5;
            } else {
                // Solid green
                light.material.color.setHex(0x00ff88);
                light.material.emissive.setHex(0x00ff88);
                light.material.emissiveIntensity = 0.8;
            }
        });

        // 3. Automated Barrier Gates Mechanism
        // If CRITICAL_CLOSED, rotate down (rotation.x = 0)
        // If NORMAL/WARNING, rotate up (rotation.x = Math.PI / 2)
        const targetGateAngle = (status === "CRITICAL_CLOSED") ? 0 : Math.PI / 2;
        this.barrierGates.forEach(gate => {
            gate.rotation.x += (targetGateAngle - gate.rotation.x) * 0.08;
        });

        // Water muddy color in heavy storm
        if (sensorData.weather.isStorm) {
            this.waterMaterial.color.setHex(0x354b5e);
            this.waterMaterial.opacity = 0.95;
        } else {
            this.waterMaterial.color.setHex(0x0984e3);
            this.waterMaterial.opacity = 0.85;
        }
    }
}

window.BridgeTwin = BridgeTwin;
