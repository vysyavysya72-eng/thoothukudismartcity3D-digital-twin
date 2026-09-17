/**
 * THOOTHUKUDI 3D DIGITAL TWIN - MAIN APPLICATION ORCHESTRATOR
 * Initializes WebGL renderer, Three.js scene, OrbitControls,
 * procedural city assets, interactive Raycaster, and the 60 FPS animation loop.
 */

class SmartCityApp {
    constructor() {
        this.container = document.getElementById('canvasContainer');
        this.interactiveList = [];

        // Camera Animation State
        this.isCameraMoving = false;
        this.camTargetPos = new THREE.Vector3();
        this.camLookTarget = new THREE.Vector3();
        this.camLerpSpeed = 0.05;

        this.initThree();
        this.initSystems();
        this.initRaycaster();

        window.addEventListener('resize', () => this.onWindowResize());

        // Start render loop
        this.clock = new THREE.Clock();
        this.animate();

        console.log("[SmartCityApp] Thoothukudi 3D Digital Twin successfully initialized.");
    }

    initThree() {
        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
        const initCam = CityConfig.landmarks.overview.cameraPos;
        this.camera.position.set(initCam.x, initCam.y, initCam.z);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;

        this.container.appendChild(this.renderer.domElement);

        // 4. OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent dipping below ground
        this.controls.minDistance = 10;
        this.controls.maxDistance = 350;
        this.controls.target.set(0, 0, 0);
    }

    initSystems() {
        // 1. Environmental & Lighting
        this.envSystem = new EnvironmentalSystem(this.scene);

        // 2. Procedural City Builder
        this.cityBuilder = new CityBuilder();
        const cityData = this.cityBuilder.buildCity(this.scene);
        this.interactiveList.push(...cityData.interactiveObjects);
        this.streetLights = cityData.streetLights;
        this.trafficLights = cityData.trafficLights;

        // 3. Bridge Digital Twin (Buckle Canal B01)
        this.bridgeTwin = new BridgeTwin(this.scene, this.interactiveList);

        // 4. Railway Crossing Digital Twin (Gate G01)
        this.railwayTwin = new RailwayTwin(this.scene, this.interactiveList);

        // 5. Electricity & Substation Digital Twin (TNEB T01)
        this.powerTwin = new PowerTwin(this.scene, this.interactiveList);

        // 6. Port Digital Twin (V.O. Chidambaranar Port)
        this.portTwin = new PortTwin(this.scene, this.interactiveList);

        // 7. Industrial Digital Twin (SIPCOT Complex)
        this.industryTwin = new IndustryTwin(this.scene, this.interactiveList);

        // 8. Traffic Simulation System
        this.trafficSystem = new TrafficSystem(this.scene);

        // 9. Emergency Response & Routing System
        this.emergencySystem = new EmergencySystem(this.scene);

        // 10. UI Controller
        this.ui = new UIController(this);
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        let pointerDownTime = 0;
        let pointerDownPos = { x: 0, y: 0 };

        window.addEventListener('pointerdown', (e) => {
            pointerDownTime = performance.now();
            pointerDownPos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', (e) => {
            // Ignore if dragged (camera orbit)
            const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
            const duration = performance.now() - pointerDownTime;
            if (dist > 5 || duration > 300) return;

            // Only raycast if clicking inside canvas area (not HUD buttons)
            if (e.target.closest('#hudOverlay') && !e.target.closest('#canvasContainer')) {
                return;
            }

            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveList, true);

            if (intersects.length > 0) {
                let hitGroup = intersects[0].object;
                while (hitGroup && !hitGroup.userData.isInteractive && hitGroup.parent) {
                    hitGroup = hitGroup.parent;
                }

                if (hitGroup && hitGroup.userData.isInteractive) {
                    console.log("[Raycaster] Selected landmark:", hitGroup.userData.name);
                    this.ui.showInspector(hitGroup.userData);
                }
            }
        });
    }

    moveCameraTo(targetPos, lookAtTarget) {
        this.camTargetPos.set(targetPos.x, targetPos.y, targetPos.z);
        this.camLookTarget.set(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
        this.isCameraMoving = true;
    }

    zoomBy(deltaDist) {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        this.camera.position.addScaledVector(dir, -deltaDist);
        this.controls.update();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);
        const time = this.clock.getElapsedTime();
        const sensorData = window.sensorHub.data;

        // 1. Smooth Camera LERP Animation
        if (this.isCameraMoving) {
            this.camera.position.lerp(this.camTargetPos, this.camLerpSpeed);
            this.controls.target.lerp(this.camLookTarget, this.camLerpSpeed);

            if (this.camera.position.distanceTo(this.camTargetPos) < 0.5) {
                this.isCameraMoving = false;
            }
        }

        // 2. Update Subsystems
        this.envSystem.update(delta, time, sensorData, this.streetLights);
        this.bridgeTwin.update(delta, time, sensorData);
        this.railwayTwin.update(delta, time, sensorData);
        this.powerTwin.update(delta, time, sensorData);
        this.portTwin.update(delta, time, sensorData);
        this.industryTwin.update(delta, time, sensorData);
        this.trafficSystem.update(delta, time, sensorData);
        this.emergencySystem.update(delta, time);
        this.cityBuilder.updateTrafficSignals(sensorData.traffic.signalCycle);

        // 3. Orbit Controls & Render
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate upon window load
window.addEventListener('DOMContentLoaded', () => {
    window.smartCityApp = new SmartCityApp();
});
