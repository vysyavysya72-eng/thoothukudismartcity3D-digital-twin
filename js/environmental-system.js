/**
 * THOOTHUKUDI 3D DIGITAL TWIN - ENVIRONMENTAL & WEATHER SYSTEM
 * Manages Day/Night lighting transitions, volumetric rain particle engine,
 * storm clouds, and rising road flood surface meshes.
 */

class EnvironmentalSystem {
    constructor(scene) {
        this.scene = scene;

        this.sunLight = null;
        this.ambientLight = null;
        this.rainParticles = null;
        this.rainPositions = [];
        this.rainGeo = null;
        this.rainCount = 3200;

        this.roadFloodPlane = null;
        this.currentFloodY = -0.5;
        this.targetFloodY = -0.5;

        this.initLighting();
        this.initRainSystem();
        this.initRoadFloodPlane();
    }

    initLighting() {
        // Hemispheric Ambient Light
        this.ambientLight = new THREE.HemisphereLight(0xdff9fb, 0x130f40, 0.65);
        this.scene.add(this.ambientLight);

        // Sun Directional Light (with shadows)
        this.sunLight = new THREE.DirectionalLight(0xfffbe6, 1.2);
        this.sunLight.position.set(100, 150, 80);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 380;
        this.sunLight.shadow.camera.left = -160;
        this.sunLight.shadow.camera.right = 160;
        this.sunLight.shadow.camera.top = 160;
        this.sunLight.shadow.camera.bottom = -160;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);

        // Background Sky color
        this.scene.background = new THREE.Color(0x70a1ff);
        this.scene.fog = new THREE.FogExp2(0x70a1ff, 0.003);
    }

    initRainSystem() {
        this.rainGeo = new THREE.BufferGeometry();
        this.rainPositions = new Float32Array(this.rainCount * 3);

        // Spread rain across the city bounds (-150 to 150) and height (0 to 100)
        for (let i = 0; i < this.rainCount; i++) {
            this.rainPositions[i * 3 + 0] = (Math.random() - 0.5) * 300;
            this.rainPositions[i * 3 + 1] = Math.random() * 120;
            this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 300;
        }

        this.rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

        const rainMat = new THREE.PointsMaterial({
            color: 0xced6e0,
            size: 0.75,
            transparent: true,
            opacity: 0.0,
            depthWrite: false
        });

        this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
        this.scene.add(this.rainParticles);
    }

    initRoadFloodPlane() {
        // Plane covering the low-lying central & coastal road corridors
        const floodGeo = new THREE.PlaneGeometry(160, 260, 32, 32);
        this.floodMat = new THREE.MeshStandardMaterial({
            color: 0x1f4068,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.75
        });

        this.roadFloodPlane = new THREE.Mesh(floodGeo, this.floodMat);
        this.roadFloodPlane.rotation.x = -Math.PI / 2;
        this.roadFloodPlane.position.set(10, this.currentFloodY, 0);
        this.scene.add(this.roadFloodPlane);
    }

    update(delta, time, sensorData, streetLights) {
        const isDay = sensorData.weather.dayNightMode === 'DAY';
        const isStorm = sensorData.weather.isStorm || sensorData.weather.isRaining;

        // 1. Atmosphere & Lighting Interpolation
        if (isStorm) {
            // Dark stormy overcast
            this.scene.background.setHex(0x2c3e50);
            this.scene.fog.color.setHex(0x2c3e50);
            this.scene.fog.density = 0.007;

            this.sunLight.intensity = 0.35;
            this.sunLight.color.setHex(0x95a5a6);
            this.ambientLight.intensity = 0.45;
        } else if (!isDay) {
            // Night Mode: dark indigo sky, moon lighting
            this.scene.background.setHex(0x0a1128);
            this.scene.fog.color.setHex(0x0a1128);
            this.scene.fog.density = 0.004;

            this.sunLight.intensity = 0.15;
            this.sunLight.color.setHex(0x4a69bd);
            this.ambientLight.intensity = 0.3;
        } else {
            // Bright Day Mode
            this.scene.background.setHex(0x6a89cc);
            this.scene.fog.color.setHex(0x6a89cc);
            this.scene.fog.density = 0.0025;

            this.sunLight.intensity = 1.25;
            this.sunLight.color.setHex(0xfffbe6);
            this.ambientLight.intensity = 0.7;
        }

        // Street Lights & Window Lights: On at night or during severe storm
        const turnOnLamps = !isDay || isStorm;
        streetLights.forEach(sl => {
            sl.light.visible = turnOnLamps;
            sl.bulb.material.emissiveIntensity = turnOnLamps ? 1.5 : 0.0;
        });

        // 2. Rain Particle Falling Animation
        if (isStorm) {
            this.rainParticles.material.opacity = sensorData.metadata.activeScenario === "FLOOD_EMERGENCY" ? 0.9 : 0.65;
            const positions = this.rainGeo.attributes.position.array;
            const fallSpeed = 95 * delta;

            for (let i = 0; i < this.rainCount; i++) {
                positions[i * 3 + 1] -= fallSpeed;
                // Add wind drift
                positions[i * 3 + 0] += 12 * delta;

                // Loop back to top
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 110 + Math.random() * 15;
                    positions[i * 3 + 0] = (Math.random() - 0.5) * 300;
                }
            }
            this.rainGeo.attributes.position.needsUpdate = true;
        } else {
            this.rainParticles.material.opacity = 0.0;
        }

        // 3. Low-lying Road Flood Water Elevation
        if (sensorData.flood.roadWaterLevel > 0.05) {
            // Road is submerged: physical height rises to Y = 0.25m to 0.75m
            this.targetFloodY = 0.08 + sensorData.flood.roadWaterLevel * 0.6;
        } else {
            // Submerged below road level
            this.targetFloodY = -0.5;
        }

        this.currentFloodY += (this.targetFloodY - this.currentFloodY) * 0.05;
        this.roadFloodPlane.position.y = this.currentFloodY;

        // Subtle water ripples on road puddles
        if (this.currentFloodY > 0) {
            const pos = this.roadFloodPlane.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const u = pos.getX(i);
                const v = pos.getY(i);
                pos.setZ(i, Math.sin(time * 4 + u * 0.2 + v * 0.3) * 0.04);
            }
            this.roadFloodPlane.geometry.attributes.position.needsUpdate = true;
        }
    }
}

window.EnvironmentalSystem = EnvironmentalSystem;
