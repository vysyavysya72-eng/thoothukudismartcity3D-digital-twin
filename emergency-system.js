/**
 * THOOTHUKUDI 3D DIGITAL TWIN - EMERGENCY RESPONSE & ROUTING ENGINE
 * Coordinates emergency vehicle dispatches (Ambulance, Fire Engine)
 * from Thoothukudi Medical College and Central Fire Station.
 * Draws an animated glowing neon 3D route spline on the road network
 * and animates response vehicles with active strobe sirens and real-time ETA.
 */

class EmergencySystem {
    constructor(scene) {
        this.scene = scene;
        this.activeDispatch = null;
        this.routeLine = null;
        this.routeCurve = null;
        this.routeProgress = 0;
        this.isDispatched = false;

        this.ambulanceMesh = this.createAmbulance();
        this.fireTruckMesh = this.createFireTruck();

        this.scene.add(this.ambulanceMesh);
        this.scene.add(this.fireTruckMesh);

        this.ambulanceMesh.visible = false;
        this.fireTruckMesh.visible = false;

        // Subscribe to emergency dispatches from sensorHub
        window.sensorHub.onDispatch((incident) => {
            this.handleDispatch(incident);
        });
    }

    createAmbulance() {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.3 });
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00a8ff });
        const redCrossMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

        // Chassis & Van Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 5.0), bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Blue Reflective Stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.4, 4.8), stripeMat);
        stripe.position.set(0, 1.1, 0);
        group.add(stripe);

        // Red Cross Symbol on sides
        [-1.12, 1.12].forEach(x => {
            const crossH = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.25), redCrossMat);
            crossH.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
            crossH.position.set(x, 1.3, 0.2);
            group.add(crossH);

            const crossV = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.8), redCrossMat);
            crossV.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
            crossV.position.set(x, 1.3, 0.2);
            group.add(crossV);
        });

        // Twin Emergency Strobe Lightbar on roof
        const strobeBlue = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.25, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 2.0 })
        );
        strobeBlue.position.set(-0.5, 2.25, 1.2);
        group.add(strobeBlue);

        const strobeRed = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.25, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 2.0 })
        );
        strobeRed.position.set(0.5, 2.25, 1.2);
        group.add(strobeRed);

        // Wheels
        [[-1.1, -1.5], [1.1, -1.5], [-1.1, 1.5], [1.1, 1.5]].forEach(([x, z]) => {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x111111 }));
            w.rotation.z = Math.PI / 2;
            w.position.set(x, 0.4, z);
            group.add(w);
        });

        group.userData.strobes = [strobeBlue, strobeRed];
        return group;
    }

    createFireTruck() {
        const group = new THREE.Group();
        const fireRed = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.4 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, metalness: 0.9 });

        // Heavy Fire Tender Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 7.5), fireRed);
        body.position.y = 1.6;
        body.castShadow = true;
        group.add(body);

        // Equipment Compartment rollups
        for (let z = -2; z <= 1; z += 1.4) {
            [-1.32, 1.32].forEach(x => {
                const rollup = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), chromeMat);
                rollup.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
                rollup.position.set(x, 1.4, z);
                group.add(rollup);
            });
        }

        // Roof Water Cannon / Monitor
        const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), chromeMat);
        cannon.rotation.x = Math.PI / 3;
        cannon.position.set(0, 3.1, 2.2);
        group.add(cannon);

        // Emergency Beacon Light
        const beacon = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2.5 })
        );
        beacon.position.set(0, 3.0, 3.0);
        group.add(beacon);

        // 6 Heavy Wheels
        [[-1.3, -2.4], [1.3, -2.4], [-1.3, -0.6], [1.3, -0.6], [-1.3, 2.4], [1.3, 2.4]].forEach(([x, z]) => {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 12), new THREE.MeshStandardMaterial({ color: 0x111111 }));
            w.rotation.z = Math.PI / 2;
            w.position.set(x, 0.55, z);
            group.add(w);
        });

        group.userData.strobes = [beacon];
        return group;
    }

    handleDispatch(incident) {
        console.log("[EmergencySystem] Dispatch received:", incident);
        this.activeDispatch = incident;
        this.routeProgress = 0;
        this.isDispatched = true;

        // Build path waypoints from origin to target along road network
        const waypoints = this.calculateRoadPath(incident.originPosition, incident.targetPosition);

        this.buildRouteSpline(waypoints);

        if (incident.service === "AMBULANCE_AND_HAZMAT") {
            this.activeVehicle = this.ambulanceMesh;
            this.ambulanceMesh.visible = true;
            this.fireTruckMesh.visible = false;
        } else {
            this.activeVehicle = this.fireTruckMesh;
            this.fireTruckMesh.visible = true;
            this.ambulanceMesh.visible = false;
        }

        this.activeVehicle.position.set(waypoints[0].x, 0.05, waypoints[0].z);
    }

    calculateRoadPath(origin, target) {
        // Navigates along road grid
        // Origin: e.g. Hospital (-15, 0, 70) or Fire Station (15, 0, 70)
        // Step 1: Reach Cross Avenue South (Z = 60)
        // Step 2: Traverse East/West to appropriate North-South Avenue
        // Step 3: Traverse to target
        const path = [];
        path.push(new THREE.Vector3(origin.x, 0.15, origin.z));
        path.push(new THREE.Vector3(origin.x, 0.15, 60)); // Move to cross avenue

        if (target.x < -30) {
            // Towards Industrial or Substation: take Central Ave or Industrial Ave
            path.push(new THREE.Vector3(-75, 0.15, 60));
            path.push(new THREE.Vector3(-75, 0.15, target.z));
            path.push(new THREE.Vector3(target.x, 0.15, target.z));
        } else if (target.x > 30) {
            // Towards Bridge or Port
            path.push(new THREE.Vector3(40, 0.15, 60));
            path.push(new THREE.Vector3(40, 0.15, target.z));
            path.push(new THREE.Vector3(target.x, 0.15, target.z));
        } else {
            path.push(new THREE.Vector3(target.x, 0.15, 60));
            path.push(new THREE.Vector3(target.x, 0.15, target.z));
        }

        return path;
    }

    buildRouteSpline(waypoints) {
        if (this.routeLine) {
            this.scene.remove(this.routeLine);
        }

        this.routeCurve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.2);
        const points = this.routeCurve.getPoints(80);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Glowing Cyan/Neon Line Material
        const material = new THREE.LineBasicMaterial({
            color: CityConfig.palette.neonBlue,
            linewidth: 4,
            transparent: true,
            opacity: 0.95
        });

        this.routeLine = new THREE.Line(geometry, material);
        this.scene.add(this.routeLine);
    }

    update(delta, time) {
        if (!this.isDispatched || !this.routeCurve || !this.activeVehicle) return;

        // Advance vehicle along spline
        this.routeProgress += delta * 0.08; // Arrives in ~12 seconds
        if (this.routeProgress >= 1.0) {
            this.routeProgress = 1.0; // Reached scene!
        }

        const currentPos = this.routeCurve.getPointAt(this.routeProgress);
        this.activeVehicle.position.copy(currentPos);

        // Point vehicle in travel direction
        if (this.routeProgress < 0.99) {
            const nextPos = this.routeCurve.getPointAt(Math.min(1.0, this.routeProgress + 0.02));
            const angle = Math.atan2(nextPos.x - currentPos.x, nextPos.z - currentPos.z);
            this.activeVehicle.rotation.y = angle;
        }

        // Strobe siren lighting
        if (this.activeVehicle.userData.strobes) {
            this.activeVehicle.userData.strobes.forEach((strobe, idx) => {
                const flash = Math.sin(time * 20 + idx * Math.PI) > 0;
                strobe.material.emissiveIntensity = flash ? 3.0 : 0.2;
            });
        }

        // Pulsing glow on neon route line
        if (this.routeLine) {
            this.routeLine.material.opacity = 0.6 + Math.sin(time * 6) * 0.35;
        }
    }
}

window.EmergencySystem = EmergencySystem;
