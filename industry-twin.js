/**
 * THOOTHUKUDI 3D DIGITAL TWIN - INDUSTRIAL DIGITAL TWIN (SIPCOT COMPLEX)
 * Models heavy chemical processing, fertilizer, and petrochemical infrastructure.
 * Features fractionation columns, spherical gas vessels, cooling towers,
 * and dynamic volumetric smoke/gas particle systems that react to industrial anomalies.
 */

class IndustryTwin {
    constructor(scene, interactiveList) {
        this.scene = scene;
        this.interactiveList = interactiveList;

        this.industryGroup = new THREE.Group();
        this.basePos = CityConfig.landmarks.industry.position; // X: -75, Z: -65

        this.smokeParticles = null;
        this.smokeGeo = null;
        this.smokePositions = [];
        this.smokeVelocities = [];
        this.hazardStrobes = [];

        this.buildComplex();
        this.buildSmokeParticles();
    }

    buildComplex() {
        this.industryGroup.position.set(this.basePos.x, 0, this.basePos.z);

        const steelMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.8, roughness: 0.3 });
        const concreteMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.8 });
        const tankMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, metalness: 0.5, roughness: 0.4 });

        // 1. Concrete Plant Foundation
        const pad = new THREE.Mesh(new THREE.BoxGeometry(42, 0.4, 38), concreteMat);
        pad.position.y = 0.2;
        pad.receiveShadow = true;
        this.industryGroup.add(pad);

        // 2. Main Processing Reactor Building
        const reactorBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 18), concreteMat);
        reactorBuilding.position.set(-6, 6, 0);
        reactorBuilding.castShadow = true;
        this.industryGroup.add(reactorBuilding);

        // 3. Tall Fractionation / Distillation Column (Height = 28)
        const col1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 28, 16), steelMat);
        col1.position.set(10, 14, -8);
        col1.castShadow = true;
        this.industryGroup.add(col1);

        // Maintenance Rings / Platforms around column
        for (let y = 6; y < 28; y += 6) {
            const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 16), steelMat);
            platform.position.set(10, y, -8);
            this.industryGroup.add(platform);
        }

        // 4. Twin Industrial Smokestacks / Chimneys (Where smoke emits)
        [-2, 2].forEach(xOff => {
            const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 24, 12), steelMat);
            chimney.position.set(-6 + xOff, 12, 10);
            chimney.castShadow = true;
            this.industryGroup.add(chimney);

            // Red Aviation Obstruction Warning Light on Top
            const strobe = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 1.0 })
            );
            strobe.position.set(-6 + xOff, 24.3, 10);
            this.industryGroup.add(strobe);
            this.hazardStrobes.push(strobe);
        });

        // 5. Spherical Gas Pressure Storage Vessels (Ammonia / LPG Horton Spheres)
        [ { x: 10, z: 8 }, { x: 10, z: -2 } ].forEach(pos => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(4.2, 24, 24), tankMat);
            sphere.position.set(pos.x, 6.5, pos.z);
            sphere.castShadow = true;
            this.industryGroup.add(sphere);

            // 4 Strut Support Legs
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 6, 8), steelMat);
                leg.position.set(pos.x + Math.cos(angle) * 3, 3, pos.z + Math.sin(angle) * 3);
                this.industryGroup.add(leg);
            }
        });

        // 6. Chemical Pipeline Rack Corridors
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, metalness: 0.7 });
        const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 30, 8), pipeMat);
        pipe1.rotation.z = Math.PI / 2;
        pipe1.position.set(0, 4, 2);
        this.industryGroup.add(pipe1);

        // Make industrial complex interactive
        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(40, 30, 36),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitBox.position.set(0, 15, 0);
        hitBox.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.industry.id,
            name: CityConfig.landmarks.industry.name,
            district: CityConfig.landmarks.industry.district,
            type: "INDUSTRIAL_PLANT",
            status: "OPERATIONAL",
            details: {
                reactorTemp: "142.5 °C",
                pipelinePressure: "12.4 bar",
                gasLevel: "18 ppm (Safe)",
                smokeOpacity: "22% (Filtered)",
                catalyticScrubbers: "Online"
            }
        };
        this.interactiveList.push(hitBox);
        this.industryGroup.add(hitBox);

        this.scene.add(this.industryGroup);
    }

    buildSmokeParticles() {
        const count = 180;
        this.smokeGeo = new THREE.BufferGeometry();
        this.smokePositions = new Float32Array(count * 3);
        this.smokeVelocities = [];

        for (let i = 0; i < count; i++) {
            // Emits from smokestacks (-6, 24.5, 10)
            const stackChoice = Math.random() > 0.5 ? -8 : -4;
            this.smokePositions[i * 3 + 0] = stackChoice + (Math.random() - 0.5) * 0.6;
            this.smokePositions[i * 3 + 1] = 24.5 + Math.random() * 2;
            this.smokePositions[i * 3 + 2] = 10 + (Math.random() - 0.5) * 0.6;

            this.smokeVelocities.push({
                vx: 0.8 + Math.random() * 0.8, // Drift east with coastal wind
                vy: 2.0 + Math.random() * 2.5,
                vz: (Math.random() - 0.5) * 0.6,
                size: 1.0 + Math.random() * 2.0,
                life: Math.random() * 1.5,
                maxLife: 2.5
            });
        }

        this.smokeGeo.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));

        this.smokeMat = new THREE.PointsMaterial({
            color: 0xecf0f1,
            size: 2.2,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });

        this.smokeParticles = new THREE.Points(this.smokeGeo, this.smokeMat);
        this.industryGroup.add(this.smokeParticles);
    }

    update(delta, time, sensorData) {
        const isEmergency = sensorData.industry.status === "EMERGENCY";
        const isAbnormal = sensorData.industry.status === "ABNORMAL";

        // 1. Hazard Aviation Strobes
        this.hazardStrobes.forEach(strobe => {
            if (isEmergency) {
                const flash = Math.sin(time * 15) > 0;
                strobe.material.color.setHex(flash ? 0xff0055 : 0x330000);
                strobe.material.emissiveIntensity = flash ? 3.0 : 0.2;
            } else if (isAbnormal) {
                const pulse = (Math.sin(time * 6) + 1) / 2;
                strobe.material.color.setHex(0xffaa00);
                strobe.material.emissiveIntensity = pulse * 2.0;
            } else {
                strobe.material.color.setHex(0xff0055);
                strobe.material.emissiveIntensity = 0.8;
            }
        });

        // 2. Smoke Particles Physics & Color
        if (isEmergency) {
            this.smokeMat.color.setHex(0x2d3436); // Dark toxic smoke
            this.smokeMat.opacity = 0.85;
            this.smokeMat.size = 3.8;
        } else {
            this.smokeMat.color.setHex(0xdcdde1); // Normal clean steam
            this.smokeMat.opacity = 0.35;
            this.smokeMat.size = 2.2;
        }

        const positions = this.smokeGeo.attributes.position.array;
        for (let i = 0; i < this.smokeVelocities.length; i++) {
            const v = this.smokeVelocities[i];
            const speedMultiplier = isEmergency ? 2.2 : 1.0;

            positions[i * 3 + 0] += v.vx * delta * speedMultiplier;
            positions[i * 3 + 1] += v.vy * delta * speedMultiplier;
            positions[i * 3 + 2] += v.vz * delta * speedMultiplier;

            v.life += delta;
            if (v.life >= v.maxLife) {
                // Respawn at chimney lip
                const stackChoice = Math.random() > 0.5 ? -8 : -4;
                positions[i * 3 + 0] = stackChoice + (Math.random() - 0.5) * 0.8;
                positions[i * 3 + 1] = 24.5;
                positions[i * 3 + 2] = 10 + (Math.random() - 0.5) * 0.8;
                v.life = 0;
            }
        }
        this.smokeGeo.attributes.position.needsUpdate = true;
    }
}

window.IndustryTwin = IndustryTwin;
