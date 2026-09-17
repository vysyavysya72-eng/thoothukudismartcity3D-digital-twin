/**
 * THOOTHUKUDI 3D DIGITAL TWIN - AI PREDICTION & ANOMALY ENGINE
 * Evaluates real-time sensor streams using multivariate anomaly detection heuristics.
 * Generates probabilistic risk scores (0-100%) and predictive trend buffers for Chart.js.
 * Ready for drop-in ONNX Runtime Web / TensorFlow.js ML model replacement.
 */

class AIEngine {
    constructor(sensorHub) {
        this.sensorHub = sensorHub;
        this.historyLength = 14;

        // Historical time-series buffers for Chart.js
        this.history = {
            labels: [],
            floodRisk: [],
            bridgeRisk: [],
            trafficRisk: [],
            transformerRisk: [],
            industrialRisk: []
        };

        // Current Computed Risks
        this.risks = {
            flood: 15,
            bridge: 12,
            traffic: 35,
            transformer: 22,
            industrial: 18,
            waterSupply: 10,
            overallCityHealth: 94 // %
        };

        // Prepopulate history with stable baseline
        const now = new Date();
        for (let i = this.historyLength; i >= 0; i--) {
            const t = new Date(now.getTime() - i * 3000);
            this.history.labels.push(t.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }));
            this.history.floodRisk.push(15 + Math.random() * 4);
            this.history.bridgeRisk.push(12 + Math.random() * 3);
            this.history.trafficRisk.push(32 + Math.random() * 6);
            this.history.transformerRisk.push(20 + Math.random() * 4);
            this.history.industrialRisk.push(16 + Math.random() * 5);
        }

        // Subscribe to sensor updates
        this.sensorHub.subscribe((data) => this.computeRisks(data));
    }

    computeRisks(data) {
        // 1. AI Flood Risk Evaluation
        // Weight: 45% Rainfall, 40% Canal Level, 15% Road Water
        const normRain = Math.min(100, (data.weather.rainfall / 120) * 100);
        const normCanal = Math.min(100, (data.flood.canalWaterLevel / 95) * 100);
        const normRoad = Math.min(100, (data.flood.roadWaterLevel / 0.8) * 100);
        this.risks.flood = Math.round(normRain * 0.45 + normCanal * 0.40 + normRoad * 0.15);
        this.risks.flood = Math.max(5, Math.min(99, this.risks.flood));

        // 2. AI Bridge Failure & Structural Risk
        // Weight: 50% Water Clearance, 30% Vibration Strain, 20% Flood Risk
        const normStrain = Math.min(100, (data.bridge.vibrationStrain / 90) * 100);
        const normBridgeWater = Math.min(100, (data.bridge.waterLevelPct / 90) * 100);
        this.risks.bridge = Math.round(normBridgeWater * 0.50 + normStrain * 0.30 + this.risks.flood * 0.20);
        this.risks.bridge = Math.max(8, Math.min(99, this.risks.bridge));

        // 3. AI Traffic Congestion Risk
        let trafficBase = 30;
        if (data.traffic.densityLevel === "LOW") trafficBase = 15;
        if (data.traffic.densityLevel === "MEDIUM") trafficBase = 40;
        if (data.traffic.densityLevel === "HIGH") trafficBase = 72;
        if (data.traffic.densityLevel === "CRITICAL") trafficBase = 92;
        if (data.railway.gateStatus === "CLOSED" || data.railway.gateStatus === "CLOSING") {
            trafficBase = Math.min(98, trafficBase + 22);
        }
        this.risks.traffic = Math.round(trafficBase);

        // 4. AI Transformer Fault & Thermal Runaway Risk
        if (data.electricity.healthStatus === "FAULT") {
            this.risks.transformer = 98;
        } else if (data.electricity.healthStatus === "OVERLOAD") {
            this.risks.transformer = 78;
        } else {
            const tempRisk = Math.max(0, (data.electricity.temperatureC - 50) / 45 * 100);
            const loadRisk = Math.max(0, (data.electricity.powerLoadPct - 50) / 45 * 100);
            this.risks.transformer = Math.round(Math.max(10, Math.min(65, (tempRisk + loadRisk) / 2)));
        }

        // 5. AI Industrial Emissions & Chemical Hazard Risk
        if (data.industry.status === "EMERGENCY") {
            this.risks.industrial = 96;
        } else if (data.industry.status === "ABNORMAL") {
            this.risks.industrial = 68;
        } else {
            const gasRisk = (data.industry.gasLeakPpm / 70) * 100;
            const smokeRisk = (data.industry.smokeDensityPct / 80) * 100;
            this.risks.industrial = Math.round(Math.max(8, Math.min(50, (gasRisk + smokeRisk) / 2)));
        }

        // 6. Water Supply Reliability Risk
        const pressureRisk = Math.max(0, (4.2 - data.waterSupply.systemPressureBar) / 3.0 * 100);
        this.risks.waterSupply = Math.round(Math.max(5, Math.min(95, pressureRisk + (100 - data.waterSupply.tankLevelPct) * 0.2)));

        // Overall City Resilience Index
        const maxSevereRisk = Math.max(this.risks.flood, this.risks.bridge, this.risks.transformer, this.risks.industrial);
        this.risks.overallCityHealth = Math.round(100 - (maxSevereRisk * 0.7 + this.risks.traffic * 0.3) * 0.85);
        this.risks.overallCityHealth = Math.max(15, Math.min(99, this.risks.overallCityHealth));

        // Push to history buffer
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
        this.history.labels.push(timeStr);
        this.history.floodRisk.push(this.risks.flood);
        this.history.bridgeRisk.push(this.risks.bridge);
        this.history.trafficRisk.push(this.risks.traffic);
        this.history.transformerRisk.push(this.risks.transformer);
        this.history.industrialRisk.push(this.risks.industrial);

        if (this.history.labels.length > this.historyLength) {
            this.history.labels.shift();
            this.history.floodRisk.shift();
            this.history.bridgeRisk.shift();
            this.history.trafficRisk.shift();
            this.history.transformerRisk.shift();
            this.history.industrialRisk.shift();
        }
    }

    getRisks() {
        return this.risks;
    }

    getChartData() {
        return {
            labels: this.history.labels,
            datasets: [
                {
                    label: 'Flood Risk %',
                    data: [...this.history.floodRisk],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.12)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: 'Bridge Structural Risk %',
                    data: [...this.history.bridgeRisk],
                    borderColor: '#4facfe',
                    backgroundColor: 'transparent',
                    borderDash: [4, 4],
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: 'Grid Fault Risk %',
                    data: [...this.history.transformerRisk],
                    borderColor: '#ffaa00',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: 'Industrial Risk %',
                    data: [...this.history.industrialRisk],
                    borderColor: '#ff0055',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 2
                }
            ]
        };
    }
}

window.aiEngine = new AIEngine(window.sensorHub);
