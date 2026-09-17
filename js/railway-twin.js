/**
 * THOOTHUKUDI 3D DIGITAL TWIN - RAILWAY CROSSING DIGITAL TWIN (GATE G01)
 * Models electrified double-track level crossing intersecting the Grand Arterial Highway.
 * Includes motorized barrier arms, flashing LED signals, a detailed Indian Railways train,
 * and realistic traffic queue coordination.
 */

class RailwayTwin {
    constructor(scene, interactiveList) {
        this.scene = scene;
        this.interactiveList = interactiveList;

        this.railwayGroup = new THREE.Group();
        this.crossingX = CityConfig.landmarks.railway.position.x; // X = -20
        this.barrierArms = [];
        this.signalLeds = [];

        this.trainGroup = new THREE.Group();
        this.trainZ = -160;
        this.trainSpeed = 0;
        this.isTrainMoving = false;

        this.buildTracks();
        this.buildCrossingGates();
        this.buildTrain();
    }

    buildTracks() {
        const trackX = this.crossingX;
        const trackLen = 300;

        // Ballast Bed (crushed gravel base)
        const ballastMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.95 });
        const ballast = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, trackLen), ballastMat);
        ballast.position.set(trackX, 0.12, 0);
        this.railwayGroup.add(ballast);

        // Sleepers / Ties (wooden cross-ties)
        const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4b382a, roughness: 0.9 });
        for (let z = -trackLen / 2; z <= trackLen / 2; z += 1.8) {
            // Track 1 Sleeper
            const s1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.4), sleeperMat);
            s1.position.set(trackX - 1.8, 0.2, z);
            this.railwayGroup.add(s1);

            // Track 2 Sleeper
            const s2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.4), sleeperMat);
            s2.position.set(trackX + 1.8, 0.2, z);
            this.railwayGroup.add(s2);
        }

        // Steel Rails
        const railMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.95, roughness: 0.2 });
        [-2.5, -1.1, 1.1, 2.5].forEach(offset => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, trackLen), railMat);
            rail.position.set(trackX + offset, 0.32, 0);
            this.railwayGroup.add(rail);
        });

        // OHE Catenary Masts (Electrified overhead line poles)
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.6 });
        for (let z = -trackLen / 2 + 10; z <= trackLen / 2; z += 35) {
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 10, 8), mastMat);
            mast.position.set(trackX + 5, 5, z);
            this.railwayGroup.add(mast);

            const portalArm = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 0.15), mastMat);
            portalArm.position.set(trackX + 1.5, 9.8, z);
            this.railwayGroup.add(portalArm);
        }

        this.scene.add(this.railwayGroup);
    }

    buildCrossingGates() {
        const trackX = this.crossingX;
        const gateMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
        const armMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Barrier posts on West (X = -20 - 7) and East (X = -20 + 7) of tracks on Grand Arterial (Z = -9 and Z = 9)
        const positions = [
            { x: trackX - 6.5, z: 8.5, armLength: 16, pivotSign: 1 },
            { x: trackX + 6.5, z: -8.5, armLength: 16, pivotSign: -1 }
        ];

        positions.forEach(pos => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.5, 12), gateMat);
            post.position.set(pos.x, 1.25, pos.z);
            this.scene.add(post);

            // Signal Crossbuck & Twin Warning Lights
            const signalBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.4), gateMat);
            signalBox.position.set(pos.x, 2.6, pos.z);
            this.scene.add(signalBox);

            // Twin Alternating Red LEDs
            [-0.35, 0.35].forEach(xOff => {
                const led = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0x330000 })
                );
                led.position.set(pos.x + xOff, 2.6, pos.z + 0.22);
                this.scene.add(led);
                this.signalLeds.push(led);
            });

            // Motorized Barrier Arm with striped decals
            const armPivot = new THREE.Group();
            armPivot.position.set(pos.x, 1.8, pos.z);

            const boomArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, pos.armLength), armMat);
            boomArm.position.set(0, 0, (pos.armLength / 2) * -pos.pivotSign);
            armPivot.add(boomArm);

            // Red stripes on white boom arm
            const stripeMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
            for (let i = 1; i < pos.armLength; i += 2) {
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.8), stripeMat);
                stripe.position.set(0, 0, (i * -pos.pivotSign));
                armPivot.add(stripe);
            }

            // Initial position: Open (Arm tilted up 80 deg)
            armPivot.rotation.x = (Math.PI / 2.2) * pos.pivotSign;

            this.barrierArms.push({ pivot: armPivot, normalRotation: (Math.PI / 2.2) * pos.pivotSign, closedRotation: 0 });
            this.scene.add(armPivot);
        });

        // Make crossing gate interactive
        const interactiveBox = new THREE.Mesh(
            new THREE.BoxGeometry(16, 6, 20),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        interactiveBox.position.set(trackX, 3, 0);
        interactiveBox.userData = {
            isInteractive: true,
            landmarkId: CityConfig.landmarks.railway.id,
            name: CityConfig.landmarks.railway.name,
            district: CityConfig.landmarks.railway.district,
            type: "RAILWAY_CROSSING",
            status: "OPERATIONAL",
            details: {
                interlockStatus: "Automated SCADA Linked",
                trackSpeedLimit: "80 km/h",
                dailyCrossings: "34 Trains",
                avgQueueClearance: "42 sec"
            }
        };
        this.interactiveList.push(interactiveBox);
        this.scene.add(interactiveBox);
    }

    buildTrain() {
        const trackX = this.crossingX + 1.8; // On Track 2

        // 1. WDP-4 Diesel Locomotive (Blue & Cream livery)
        const locoGroup = new THREE.Group();

        const locoBodyMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.4 });
        const locoCabMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.5 });
        const bogieMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.8 });

        const loco = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 14), locoBodyMat);
        loco.position.y = 2.4;
        loco.castShadow = true;
        locoGroup.add(loco);

        // Cab Windows
        const cab = new THREE.Mesh(new THREE.BoxGeometry(3.05, 1.2, 4), locoCabMat);
        cab.position.set(0, 3.2, 4.5);
        locoGroup.add(cab);

        // Headlight
        const headLamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2a3, emissiveIntensity: 2.0 })
        );
        headLamp.position.set(0, 2.5, 7.1);
        locoGroup.add(headLamp);

        // Wheel Bogies
        [-4, 4].forEach(zOff => {
            const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 4.5), bogieMat);
            bogie.position.set(0, 0.6, zOff);
            locoGroup.add(bogie);
        });

        locoGroup.position.set(0, 0, 0);
        this.trainGroup.add(locoGroup);

        // 2. Passenger Coaches (Indian Railways Utkrisht / LHB Livery)
        const coachColors = [0xb33939, 0x192a56];
        [-20, -36].forEach((zOff, i) => {
            const coach = new THREE.Group();
            coach.position.set(0, 0, zOff);

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2.9, 3.1, 15),
                new THREE.MeshStandardMaterial({ color: coachColors[i % 2], roughness: 0.5 })
            );
            body.position.y = 2.4;
            body.castShadow = true;
            coach.add(body);

            // Coach Bogies
            [-5, 5].forEach(bz => {
                const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 3.8), bogieMat);
                bogie.position.set(0, 0.6, bz);
                coach.add(bogie);
            });

            this.trainGroup.add(coach);
        });

        // 3. Freight Container Wagon
        const freightWagon = new THREE.Group();
        freightWagon.position.set(0, 0, -52);

        const flatbed = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.8, 14), bogieMat);
        flatbed.position.y = 1.0;
        freightWagon.add(flatbed);

        const container = new THREE.Mesh(
            new THREE.BoxGeometry(2.7, 2.6, 12.5),
            new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.6 })
        );
        container.position.y = 2.7;
        container.castShadow = true;
        freightWagon.add(container);

        this.trainGroup.add(freightWagon);

        this.trainGroup.position.set(trackX, 0, this.trainZ);
        this.scene.add(this.trainGroup);
    }

    triggerTrainPassage() {
        this.isTrainMoving = true;
        this.trainZ = -160;
        this.trainSpeed = 35;
    }

    update(delta, time, sensorData) {
        const gateStatus = sensorData.railway.gateStatus;

        // 1. Crossing Gate Arm Rotation
        this.barrierArms.forEach(arm => {
            let targetRot = arm.normalRotation;
            if (gateStatus === "CLOSED") {
                targetRot = arm.closedRotation;
            } else if (gateStatus === "CLOSING") {
                targetRot = arm.closedRotation;
            } else if (gateStatus === "OPENING") {
                targetRot = arm.normalRotation;
            }
            arm.pivot.rotation.x += (targetRot - arm.pivot.rotation.x) * 0.05;
        });

        // 2. Alternating Flashing Red Signal Lights when closing/closed
        const isWarning = gateStatus === "CLOSING" || gateStatus === "CLOSED";
        this.signalLeds.forEach((led, idx) => {
            if (isWarning) {
                const flash = (Math.sin(time * 10) > 0 && idx % 2 === 0) || (Math.sin(time * 10) <= 0 && idx % 2 !== 0);
                led.material.color.setHex(flash ? 0xff0055 : 0x220000);
                led.material.emissive.setHex(flash ? 0xff0055 : 0x000000);
                led.material.emissiveIntensity = flash ? 2.5 : 0.0;
            } else {
                led.material.color.setHex(0x220000);
                led.material.emissive.setHex(0x000000);
            }
        });

        // 3. Train Movement Animation
        if (sensorData.railway.trainApproaching || this.isTrainMoving) {
            this.trainSpeed = 32;
            this.trainZ += this.trainSpeed * delta;
            this.trainGroup.position.z = this.trainZ;

            // Calculate simulated distance to crossing (Crossing is at Z = 0)
            const distMeters = Math.max(0, Math.round(Math.abs(this.trainZ) * 10));
            sensorData.railway.trainDistanceMeters = distMeters;

            if (this.trainZ > 170) {
                // Train cleared crossing
                this.trainZ = -170;
                this.isTrainMoving = false;
                sensorData.railway.trainApproaching = false;
                sensorData.railway.gateStatus = "OPEN";
            }
        }
    }
}

window.RailwayTwin = RailwayTwin;
