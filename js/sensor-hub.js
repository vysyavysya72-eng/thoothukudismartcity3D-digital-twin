/**
 * THOOTHUKUDI 3D DIGITAL TWIN - SENSOR HUB & SIMULATED DATA LAYER
 * Central state store simulating IoT sensor telemetry for the entire city.
 * Clearly labeled: "SIMULATED SENSOR DATA – PROTOTYPE"
 * Includes hooks for future ESP32 / MQTT / WebSocket streaming.
 */

class SensorHub {
    constructor() {
        this.activeScenario = CityConfig.scenarios.NORMAL;
        this.listeners = [];
        this.alertListeners = [];
        this.dispatchListeners = [];

        // Simulated Sensor Data State
        this.data = {
            metadata: {
                city: "Thoothukudi Smart City",
                dataSource: CityConfig.prototypeBadge,
                timestamp: new Date().toISOString(),
                activeScenario: CityConfig.scenarios.NORMAL
            },
            weather: {
                rainfall: 8.5,           // mm/h
                humidity: 68,            // %
                temperature: 31.2,       // °C
                windSpeed: 14.5,         // km/h
                isRaining: false,
                isStorm: false,
                dayNightMode: 'DAY',     // 'DAY' or 'NIGHT'
                sunAngle: 1.0            // 1.0 day, 0.0 night
            },
            flood: {
                canalWaterLevel: 28.0,   // %
                roadWaterLevel: 0.0,     // meters (0 to 1.5)
                floodRiskPct: 15,        // %
                floodStatus: "NORMAL"    // NORMAL, WARNING, CRITICAL
            },
            bridge: {
                waterLevelPct: 32.0,     // %
                bridgeClearance: 4.8,    // meters under bridge
                structuralHealth: 98.5,  // %
                vibrationStrain: 21.0,   // µε
                status: "NORMAL",        // NORMAL, WARNING, CRITICAL_CLOSED
                closed: false,
                detourActive: false,
                vehiclesPerMin: 42
            },
            traffic: {
                densityLevel: "MEDIUM",  // LOW, MEDIUM, HIGH, CRITICAL
                vehiclesPerMin: 58,
                avgSpeedKmh: 45,
                congestionRiskPct: 38,
                signalCycle: "GREEN",    // GREEN, YELLOW, RED
                signalTimer: 18,
                heatmapActive: false
            },
            railway: {
                trainApproaching: false,
                trainDistanceMeters: 2800,
                trainSpeedKmh: 0,
                gateStatus: "OPEN",      // OPEN, CLOSING, CLOSED, OPENING
                gateAngle: 0,            // 0 deg = open, 90 deg = closed
                waitingVehiclesCount: 0,
                estimatedWaitSec: 0
            },
            electricity: {
                transformerId: "TNEB-T01-110KV",
                voltageKV: 11.2,
                currentAmps: 420,
                temperatureC: 58.4,
                powerLoadPct: 62.0,
                gridFrequencyHz: 50.02,
                healthStatus: "NORMAL",  // NORMAL, OVERLOAD, FAULT
                sparkEffectActive: false,
                districtBlackout: false
            },
            port: {
                shipName: "VOC VOYAGER - CONTAINER",
                shipStatus: "BERTHED_ACTIVE",
                containersMovedToday: 1420,
                craneOperationalPct: 88,
                seaLevelTideMeters: 1.2,
                berthDepthMeters: 14.2
            },
            industry: {
                zoneId: "SIPCOT-IND-01",
                reactorTempC: 142.5,
                linePressureBar: 12.4,
                gasLeakPpm: 18,          // VOC / SO2 / NH3
                smokeDensityPct: 22,
                status: "NORMAL"         // NORMAL, ABNORMAL, EMERGENCY
            },
            waterSupply: {
                tankLevelPct: 84.5,
                systemPressureBar: 4.2,
                flowRateKlPerHour: 620,
                pipelineStatus: "NORMAL" // NORMAL, LOW_PRESSURE, BURST
            },
            waste: {
                bin1FillPct: 42,
                bin2FillPct: 76,
                bin3FillPct: 28,
                truckDispatched: false
            },
            emergency: {
                activeIncident: null,    // null or { type, location, unit, route, eta }
                nearestHospital: "Thoothukudi Govt Medical College",
                nearestFireStation: "Central Fire Station (Sector 4)",
                ambulanceStatus: "STANDBY",
                fireTruckStatus: "STANDBY"
            }
        };

        this.alerts = [];
        this.scenarioTransitionProgress = 1.0;
        this.targetValues = {};

        // Start real-time simulation interval (every 1.5 seconds)
        this.simulationTimer = setInterval(() => this.tickSimulation(), 1500);
        this.initDefaultAlerts();
    }

    initDefaultAlerts() {
        this.alerts = [
            {
                id: 'alt_001',
                timestamp: 'Just now',
                level: 'NOTICE',
                source: 'VOC Port Terminal',
                message: 'Cargo vessel VOC VOYAGER berthed at Berth #4 safely.',
                value: 'Wind 14.5 km/h',
                threshold: 'Max 45 km/h',
                action: 'Stevedoring in progress'
            },
            {
                id: 'alt_002',
                timestamp: '2m ago',
                level: 'NOTICE',
                source: 'Urban Water Grid',
                message: 'Municipal Reservoir W01 pressure steady at 4.2 bar.',
                value: '84.5% Cap',
                threshold: '>20%',
                action: 'Automatic pump cycle scheduled'
            }
        ];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.data);
    }

    onAlert(callback) {
        this.alertListeners.push(callback);
        callback(this.alerts);
    }

    onDispatch(callback) {
        this.dispatchListeners.push(callback);
    }

    notify() {
        this.data.metadata.timestamp = new Date().toISOString();
        for (const cb of this.listeners) {
            try { cb(this.data); } catch (e) { console.error("SensorHub listener error", e); }
        }
    }

    notifyAlerts() {
        for (const cb of this.alertListeners) {
            try { cb(this.alerts); } catch (e) { console.error("Alert listener error", e); }
        }
    }

    addAlert(alert) {
        alert.id = 'alt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        alert.timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        this.alerts.unshift(alert);
        if (this.alerts.length > 25) this.alerts.pop();
        this.notifyAlerts();
    }

    clearAlert(id) {
        this.alerts = this.alerts.filter(a => a.id !== id);
        this.notifyAlerts();
    }

    setDayNight(mode) {
        this.data.weather.dayNightMode = mode;
        this.data.weather.sunAngle = mode === 'DAY' ? 1.0 : 0.0;
        this.notify();
    }

    // ==========================================
    // SCENARIO LAB STATE MACHINE
    // ==========================================
    setScenario(scenarioName) {
        console.log(`[SensorHub] Switching to scenario: ${scenarioName}`);
        this.activeScenario = scenarioName;
        this.data.metadata.activeScenario = scenarioName;

        switch (scenarioName) {
            case CityConfig.scenarios.NORMAL:
                this.applyNormalState();
                break;

            case CityConfig.scenarios.HEAVY_RAIN:
                this.applyHeavyRainState();
                break;

            case CityConfig.scenarios.FLOOD_EMERGENCY:
                this.applyFloodEmergencyState();
                break;

            case CityConfig.scenarios.TRAIN_APPROACHING:
                this.applyTrainApproachingState();
                break;

            case CityConfig.scenarios.TRAFFIC_CONGESTION:
                this.applyTrafficCongestionState();
                break;

            case CityConfig.scenarios.TRANSFORMER_FAULT:
                this.applyTransformerFaultState();
                break;

            case CityConfig.scenarios.INDUSTRIAL_EMERGENCY:
                this.applyIndustrialEmergencyState();
                break;
        }

        this.notify();
    }

    applyNormalState() {
        this.data.weather.isRaining = false;
        this.data.weather.isStorm = false;
        this.data.weather.rainfall = 4.0;
        this.data.flood.canalWaterLevel = 28.0;
        this.data.flood.roadWaterLevel = 0.0;
        this.data.flood.floodRiskPct = 12;
        this.data.flood.floodStatus = "NORMAL";

        this.data.bridge.waterLevelPct = 30.0;
        this.data.bridge.status = "NORMAL";
        this.data.bridge.closed = false;
        this.data.bridge.detourActive = false;
        this.data.bridge.vibrationStrain = 22.0;

        this.data.traffic.densityLevel = "MEDIUM";
        this.data.traffic.vehiclesPerMin = 50;
        this.data.traffic.avgSpeedKmh = 45;
        this.data.traffic.congestionRiskPct = 30;

        this.data.railway.trainApproaching = false;
        this.data.railway.gateStatus = "OPEN";
        this.data.railway.waitingVehiclesCount = 0;
        this.data.railway.trainDistanceMeters = 3000;

        this.data.electricity.healthStatus = "NORMAL";
        this.data.electricity.temperatureC = 58.0;
        this.data.electricity.powerLoadPct = 60.0;
        this.data.electricity.sparkEffectActive = false;
        this.data.electricity.districtBlackout = false;

        this.data.industry.status = "NORMAL";
        this.data.industry.gasLeakPpm = 18;
        this.data.industry.smokeDensityPct = 20;

        this.data.emergency.activeIncident = null;

        this.addAlert({
            level: 'NOTICE',
            source: 'City Command Hub',
            message: 'City operating under Normal baseline conditions.',
            value: 'All Systems Green',
            threshold: 'Nominal',
            action: 'Continuous AI monitoring'
        });
    }

    applyHeavyRainState() {
        this.data.weather.isRaining = true;
        this.data.weather.isStorm = true;
        this.data.weather.rainfall = 92.4; // mm/h
        this.data.weather.humidity = 98;
        this.data.weather.windSpeed = 38.0;

        this.data.flood.canalWaterLevel = 78.5;
        this.data.flood.roadWaterLevel = 0.22;
        this.data.flood.floodRiskPct = 82;
        this.data.flood.floodStatus = "WARNING";

        this.data.bridge.waterLevelPct = 76.0;
        this.data.bridge.status = "WARNING";
        this.data.bridge.closed = false;
        this.data.bridge.detourActive = false;
        this.data.bridge.vibrationStrain = 64.0;

        this.data.traffic.densityLevel = "HIGH";
        this.data.traffic.avgSpeedKmh = 22; // Vehicles slow down

        this.addAlert({
            level: 'WARNING',
            source: 'Buckle Canal Hydrology Sensor',
            message: 'Canal water level exceeded 75% capacity due to torrential rain.',
            value: 'Rainfall 92 mm/h | Level 78%',
            threshold: '65% Warning Limit',
            action: 'Automated flood gates triggered; Slow vehicle transit'
        });
    }

    applyFloodEmergencyState() {
        this.data.weather.isRaining = true;
        this.data.weather.isStorm = true;
        this.data.weather.rainfall = 142.0;

        this.data.flood.canalWaterLevel = 96.0;
        this.data.flood.roadWaterLevel = 0.85; // Heavy submerged roads
        this.data.flood.floodRiskPct = 95;
        this.data.flood.floodStatus = "CRITICAL";

        this.data.bridge.waterLevelPct = 94.0;
        this.data.bridge.status = "CRITICAL_CLOSED";
        this.data.bridge.closed = true;
        this.data.bridge.detourActive = true;
        this.data.bridge.vibrationStrain = 89.5;

        this.data.traffic.densityLevel = "CRITICAL";
        this.data.traffic.avgSpeedKmh = 10;

        // Trigger Emergency Response Dispatch to Bridge B01
        this.dispatchEmergency({
            type: "FLOOD_RESCUE",
            targetName: "Bridge B01 - Buckle Canal Corridor",
            targetPosition: CityConfig.landmarks.bridge.position,
            service: "FIRE_AND_RESCUE",
            originName: CityConfig.landmarks.fireStation.name,
            originPosition: CityConfig.landmarks.fireStation.position,
            etaSeconds: 45
        });

        this.addAlert({
            level: 'CRITICAL',
            source: 'Bridge B01 Structural Sensor',
            message: 'Bridge B01 water level exceeded safe structural clearance! Traffic diversion active.',
            value: 'Canal Level 96% | Submerged',
            threshold: 'Safe Limit: 80%',
            action: 'Bridge barriers down. Alternate Bypass Road illuminated. Rescue dispatched.'
        });
    }

    applyTrainApproachingState() {
        this.data.railway.trainApproaching = true;
        this.data.railway.trainDistanceMeters = 650;
        this.data.railway.trainSpeedKmh = 65;
        this.data.railway.gateStatus = "CLOSING";
        this.data.railway.waitingVehiclesCount = 8;
        this.data.railway.estimatedWaitSec = 45;

        this.addAlert({
            level: 'NOTICE',
            source: 'Railway Gate G01 Signal Interlock',
            message: 'Express Train 16129 approaching crossing (650m). Gates descending.',
            value: 'Speed: 65 km/h',
            threshold: 'Interlock Distance: 800m',
            action: 'Signal lights flashing red; Traffic hold initiated'
        });

        // Sequence simulation
        setTimeout(() => {
            if (this.activeScenario === CityConfig.scenarios.TRAIN_APPROACHING) {
                this.data.railway.gateStatus = "CLOSED";
                this.data.railway.trainDistanceMeters = 100;
                this.notify();
            }
        }, 4000);

        setTimeout(() => {
            if (this.activeScenario === CityConfig.scenarios.TRAIN_APPROACHING) {
                this.data.railway.gateStatus = "OPENING";
                this.data.railway.trainApproaching = false;
                this.notify();
            }
        }, 12000);

        setTimeout(() => {
            if (this.activeScenario === CityConfig.scenarios.TRAIN_APPROACHING) {
                this.data.railway.gateStatus = "OPEN";
                this.data.railway.waitingVehiclesCount = 0;
                this.notify();
            }
        }, 15000);
    }

    applyTrafficCongestionState() {
        this.data.traffic.densityLevel = "CRITICAL";
        this.data.traffic.vehiclesPerMin = 110;
        this.data.traffic.avgSpeedKmh = 14;
        this.data.traffic.congestionRiskPct = 88;
        this.data.traffic.heatmapActive = true;

        this.addAlert({
            level: 'WARNING',
            source: 'Smart Traffic Video Analytics',
            message: 'Severe congestion bottleneck detected at Grand Arterial & Railway Junction.',
            value: 'Density: 110 veh/min | Queue: 450m',
            threshold: 'Max Capacity: 75 veh/min',
            action: 'Adaptive Green Wave signal timings activated; Traffic rerouted'
        });
    }

    applyTransformerFaultState() {
        this.data.electricity.healthStatus = "FAULT";
        this.data.electricity.temperatureC = 104.8;
        this.data.electricity.powerLoadPct = 99.2;
        this.data.electricity.voltageKV = 8.4;
        this.data.electricity.sparkEffectActive = true;
        this.data.electricity.districtBlackout = true;

        // Dispatch emergency fire truck to substation
        this.dispatchEmergency({
            type: "ELECTRICAL_FIRE_HAZARD",
            targetName: "TNEB Substation T01",
            targetPosition: CityConfig.landmarks.substation.position,
            service: "FIRE_AND_RESCUE",
            originName: CityConfig.landmarks.fireStation.name,
            originPosition: CityConfig.landmarks.fireStation.position,
            etaSeconds: 50
        });

        this.addAlert({
            level: 'CRITICAL',
            source: 'TNEB SCADA Substation T01',
            message: 'Transformer T01 internal arc detected! Core temperature 104.8°C.',
            value: 'Temp: 104.8°C | Load: 99.2%',
            threshold: 'Trip Threshold: 95°C',
            action: 'Automated busbar isolation breaker tripped. Emergency fire tender dispatched.'
        });
    }

    applyIndustrialEmergencyState() {
        this.data.industry.status = "EMERGENCY";
        this.data.industry.gasLeakPpm = 96.5; // Toxic threshold crossed
        this.data.industry.reactorTempC = 188.0;
        this.data.industry.smokeDensityPct = 85;

        // Dispatch ambulance and fire team to SIPCOT
        this.dispatchEmergency({
            type: "TOXIC_GAS_LEAK",
            targetName: "SIPCOT Petrochem Plant S01",
            targetPosition: CityConfig.landmarks.industry.position,
            service: "AMBULANCE_AND_HAZMAT",
            originName: CityConfig.landmarks.hospital.name,
            originPosition: CityConfig.landmarks.hospital.position,
            etaSeconds: 60
        });

        this.addAlert({
            level: 'CRITICAL',
            source: 'SIPCOT Industrial Gas Sniffer Array',
            message: 'Hazardous Ammonia/VOC leak detected at Petrochem Processing Unit 2!',
            value: 'Gas: 96.5 ppm | Smoke: 85%',
            threshold: 'Safe Limit: 30 ppm',
            action: 'Perimeter siren active. Hospital trauma team & Hazmat unit mobilized.'
        });
    }

    dispatchEmergency(incident) {
        this.data.emergency.activeIncident = incident;
        for (const cb of this.dispatchListeners) {
            try { cb(incident); } catch (e) { console.error("Dispatch listener error", e); }
        }
        this.notify();
    }

    // Periodic live simulation tick: subtle fluctuations
    tickSimulation() {
        const drift = (val, maxDelta, minVal, maxVal) => {
            const delta = (Math.random() - 0.5) * maxDelta;
            return Math.max(minVal, Math.min(maxVal, val + delta));
        };

        // Drift temperature and weather
        if (!this.data.weather.isRaining) {
            this.data.weather.rainfall = drift(this.data.weather.rainfall, 0.4, 0, 15);
            this.data.flood.canalWaterLevel = drift(this.data.flood.canalWaterLevel, 0.8, 20, 45);
        } else {
            this.data.weather.rainfall = drift(this.data.weather.rainfall, 2.0, 70, 160);
        }

        // Transformer live values
        if (this.data.electricity.healthStatus === "NORMAL") {
            this.data.electricity.voltageKV = drift(this.data.electricity.voltageKV, 0.1, 10.9, 11.4);
            this.data.electricity.temperatureC = drift(this.data.electricity.temperatureC, 0.3, 52, 65);
            this.data.electricity.powerLoadPct = drift(this.data.electricity.powerLoadPct, 0.5, 55, 75);
        }

        // Port activity
        this.data.weather.windSpeed = drift(this.data.weather.windSpeed, 0.5, 8, 35);
        this.data.waterSupply.systemPressureBar = drift(this.data.waterSupply.systemPressureBar, 0.05, 3.9, 4.5);

        // Waste bin slow fill
        this.data.waste.bin1FillPct = (this.data.waste.bin1FillPct + 0.2) % 100;
        this.data.waste.bin2FillPct = (this.data.waste.bin2FillPct + 0.3) % 100;

        // Signal cycle
        this.data.traffic.signalTimer--;
        if (this.data.traffic.signalTimer <= 0) {
            if (this.data.traffic.signalCycle === "GREEN") {
                this.data.traffic.signalCycle = "YELLOW";
                this.data.traffic.signalTimer = 4;
            } else if (this.data.traffic.signalCycle === "YELLOW") {
                this.data.traffic.signalCycle = "RED";
                this.data.traffic.signalTimer = 14;
            } else {
                this.data.traffic.signalCycle = "GREEN";
                this.data.traffic.signalTimer = 22;
            }
        }

        this.notify();
    }
}

// Global Singleton
window.sensorHub = new SensorHub();
