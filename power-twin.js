/**
 * THOOTHUKUDI 3D DIGITAL TWIN - ELECTRICITY & SUBSTATION DIGITAL TWIN (TNEB T01)
 * Models a 110kV/11kV step-down distribution substation with high-voltage transformer,
 * ceramic insulator bushings, cooling radiator fins, switchyard lattice gantries,
 * and realistic animated electrical arc/spark particle effects.
 */

class PowerTwin {
    constructor(scene, interactiveList) {
        this.scene = scene;
        this.interactiveList = interactiveList;

        this.substationGroup = new THREE.Group();
        this.basePos = CityConfig.landmarks.substation.position; // X: -75, Z: 65

        this.sparkParticles = null;
        this.sparkGeo = null;
        this.sparkPositions = [];
        this.sparkVelocities = [];

        this.statusHalo = null;
        this.strobeLight = null;

        this.buildSubstation();
        this.buildSparkParticleSystem();
    }

    buildSubstation() {
        this.substationGroup.position.set(this.basePos.x, 0, this.basePos.z);

        // 1. Gravel Switchyard Pad
        const padGeo = new THREE.BoxGeometry(32, 0.4, 28);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x4a4b4d, roughness: 0.95 });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.y = 0.2;
        pad.receiveShadow = true;
        this.substationGroup.add(pad);

        // 2. Transformer T01 Main Tank
        const tankMat = new THREE.MeshStandardMaterial({
            color: 0x535c68,
            metalness: 0.6,
            roughness: 0.4
        });
        const tank = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 5), tankMat);
        tank.position.set(0, 2.9, 0);
        tank.castShadow = true;
        this.substationGroup.add(tank);

        // 3. Side Cooling Radiator Fins (Left and Right sides)
        const finMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.7 });
        [-3.2, 3.2].forEach(xOff => {
            for (let z = -2.0; z <= 2.0; z += 0.5) {
                const fin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.8, 0.1), finMat);
                fin.position.set(xOff, 2.6, z);
                this.substationGroup.add(fin);
            }
        });

        // 4. Overhead Cylindrical Oil Conservator Tank
        const oilTankMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.7 });
        const oilTank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 5, 16), oilTankMat);
        oilTank.rotation.z = Math.PI / 2;
        oilTank.position.set(0, 6.2, -1.2);
        this.substationGroup.add(oilTank);

        // 5. High-Voltage Ceramic Insulator Bushings (3-phase 110kV)
        const bushingMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.3 }); // Brown glazed porcelain
        const conductorMat = new THREE.MeshStandardMaterial({ color: 0xffa502, metalness: 0.9 }); // Copper terminal

        [-1.8, 0, 1.8].forEach(xOff => {
            // Fluted ceramic discs
            const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.2, 10), bushingMat);
            bushing.position.set(xOff, 6.4, 0.8);
            this.substationGroup.add(bushing);

            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), conductorMat);
            rod.position.set(xOff, 7.8, 0.8);
            this.substationGroup.add(rod);
        });

        // 6. Lattice Switchyard Gantries & Disconnectors
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.8 });
        [-10, 10].forEach(xOff => {
            const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 0.8), steelMat);
            tower.position.set(xOff, 6, 8);
            this.substationGroup.add(tower);
        });
        const crossArm = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 0.6), steelMat);
        crossArm.position.set(0, 11, 8);
        this.substationGroup.add(crossArm);

        // 7. Status Warning Halo & Strobe Light
        this.strobeLight = new THREE.PointLight(0x00ff88, 1.0, 20);
        this.strobeLight.position.set(0, 8.5, 0.8);
        this.substationGroup.add(this.strobeLight);

        // Make transformer interactive
        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(10, 9, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitBox.position.set(0, 4.5, 0);
        hitBox.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.substation.id,
            name: CityConfig.landmarks.substation.name,
            district: CityConfig.landmarks.substation.district,
            type: "SUBSTATION_TRANSFORMER",
            status: "NORMAL",
            details: {
                voltage: "11.2 kV",
                current: "420 A",
                temperature: "58.4 °C",
                powerLoad: "62.0%",
                frequency: "50.02 Hz"
            }
        };
        this.interactiveList.push(hitBox);
        this.substationGroup.add(hitBox);

        this.scene.add(this.substationGroup);
    }

    buildSparkParticleSystem() {
        const particleCount = 120;
        this.sparkGeo = new THREE.BufferGeometry();
        this.sparkPositions = new Float32Array(particleCount * 3);
        this.sparkVelocities = [];

        for (let i = 0; i < particleCount; i++) {
            // Origin at transformer bushings
            this.sparkPositions[i * 3 + 0] = 0;
            this.sparkPositions[i * 3 + 1] = 7.5;
            this.sparkPositions[i * 3 + 2] = 0.8;

            this.sparkVelocities.push({
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 1,
                vz: (Math.random() - 0.5) * 4,
                life: Math.random()
            });
        }

        this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));

        const sparkMat = new THREE.PointsMaterial({
            color: 0x00f2fe,
            size: 0.6,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending
        });

        this.sparkParticles = new THREE.Points(this.sparkGeo, sparkMat);
        this.substationGroup.add(this.sparkParticles);
    }

    update(delta, time, sensorData) {
        const status = sensorData.electricity.healthStatus;
        const positions = this.sparkGeo.attributes.position.array;

        if (status === "FAULT") {
            // Violent electrical arc burst with sparks & intense red/blue strobe
            this.sparkParticles.material.opacity = 1.0;
            this.sparkParticles.material.color.setHex(0x00ffff);

            const flash = Math.sin(time * 25) > 0;
            this.strobeLight.color.setHex(flash ? 0xff0055 : 0x00f2fe);
            this.strobeLight.intensity = flash ? 4.5 : 1.0;

            for (let i = 0; i < this.sparkVelocities.length; i++) {
                const vel = this.sparkVelocities[i];
                positions[i * 3 + 0] += vel.vx * delta * 4;
                positions[i * 3 + 1] += vel.vy * delta * 4 - 9.8 * delta * delta;
                positions[i * 3 + 2] += vel.vz * delta * 4;

                vel.life -= delta * 3;
                if (vel.life <= 0) {
                    // Reset to bushing terminals
                    const bushingX = (Math.floor(Math.random() * 3) - 1) * 1.8;
                    positions[i * 3 + 0] = bushingX;
                    positions[i * 3 + 1] = 7.6 + Math.random() * 0.4;
                    positions[i * 3 + 2] = 0.8;
                    vel.vx = (Math.random() - 0.5) * 8;
                    vel.vy = Math.random() * 6 + 2;
                    vel.vz = (Math.random() - 0.5) * 8;
                    vel.life = 0.8 + Math.random() * 0.4;
                }
            }
        } else if (status === "OVERLOAD") {
            // Amber heat aura and occasional crackle
            this.sparkParticles.material.opacity = 0.35;
            this.sparkParticles.material.color.setHex(0xffaa00);

            const pulse = (Math.sin(time * 6) + 1) / 2;
            this.strobeLight.color.setHex(0xffaa00);
            this.strobeLight.intensity = pulse * 2.0;

            for (let i = 0; i < this.sparkVelocities.length; i++) {
                const vel = this.sparkVelocities[i];
                positions[i * 3 + 0] += vel.vx * delta * 1.5;
                positions[i * 3 + 1] += vel.vy * delta * 1.5;
                positions[i * 3 + 2] += vel.vz * delta * 1.5;
                vel.life -= delta;
                if (vel.life <= 0) {
                    positions[i * 3 + 0] = 0;
                    positions[i * 3 + 1] = 7.6;
                    positions[i * 3 + 2] = 0.8;
                    vel.life = 1.0;
                }
            }
        } else {
            // Normal baseline - subtle green halo
            this.sparkParticles.material.opacity = 0.0;
            this.strobeLight.color.setHex(0x00ff88);
            this.strobeLight.intensity = 0.6;
        }

        this.sparkGeo.attributes.position.needsUpdate = true;
    }
}

window.PowerTwin = PowerTwin;
