/**
 * THOOTHUKUDI 3D DIGITAL TWIN - COMMAND CENTER UI CONTROLLER
 * Manages the Sci-Fi Command Center HUD, Viewport navigation toolbar,
 * Chart.js real-time risk graphs, GateSense AI intelligence suite,
 * Simulation Lab scenario triggers, Camera bookmark animations,
 * and 3D Raycasting Inspector modal.
 */

class UIController {
    constructor(app) {
        this.app = app;
        this.riskChart = null;
        this.selectedObject = null;

        this.initDomElements();
        this.initChart();
        this.bindEvents();
        this.subscribeSensors();
        this.initGateSenseUI();
    }

    initDomElements() {
        // Ticker elements
        this.elTime = document.getElementById('liveTime');
        this.elScenarioBadge = document.getElementById('scenarioBadge');
        this.elRainVal = document.getElementById('kpiRain');
        this.elWaterVal = document.getElementById('kpiWater');
        this.elTrafficVal = document.getElementById('kpiTraffic');
        this.elPowerVal = document.getElementById('kpiPower');
        this.elAqiVal = document.getElementById('kpiAqi');
        this.elAlertCount = document.getElementById('alertCountBadge');

        // Panels & Modals
        this.inspectorModal = document.getElementById('inspectorModal');
        this.inspectorTitle = document.getElementById('inspectorTitle');
        this.inspectorDistrict = document.getElementById('inspectorDistrict');
        this.inspectorStatus = document.getElementById('inspectorStatus');
        this.inspectorDetails = document.getElementById('inspectorDetails');
        this.inspectorActions = document.getElementById('inspectorActions');

        // Alert list
        this.alertContainer = document.getElementById('alertListContainer');

        // Scenario Buttons & Camera
        this.scenarioButtons = document.querySelectorAll('.scenario-btn');
        this.cameraButtons = document.querySelectorAll('.cam-btn');
        this.dayNightBtn = document.getElementById('dayNightToggle');

        // Right panel toggle
        this.rightPanel = document.querySelector('.right-panel');
        this.toggleRightPanelBtn = document.getElementById('toggleRightPanelBtn');

        // Viewport controls
        this.cleanViewRestoreBtn = document.getElementById('cleanViewRestoreBtn');
        this.hudOverlay = document.getElementById('hudOverlay');
    }

    initChart() {
        const ctx = document.getElementById('riskTrendChart');
        if (!ctx) return;

        const chartData = window.aiEngine.getChartData();

        this.riskChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 250 },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#8a99ad', font: { size: 9 }, maxTicksLimit: 5 }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: {
                            color: '#8a99ad',
                            font: { size: 9 },
                            callback: (v) => v + '%'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#dcdde1',
                            font: { size: 9.5, family: 'monospace' },
                            boxWidth: 8,
                            padding: 6
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 18, 36, 0.95)',
                        borderColor: '#00f2fe',
                        borderWidth: 1,
                        titleFont: { size: 10 },
                        bodyFont: { size: 9.5 }
                    }
                }
            }
        });
    }

    bindEvents() {
        // 1. Scenario Lab Buttons
        this.scenarioButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const scenario = btn.getAttribute('data-scenario');
                window.sensorHub.setScenario(scenario);

                this.scenarioButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Camera auto-focus on relevant feature with balanced framing
                if (scenario === CityConfig.scenarios.FLOOD_EMERGENCY || scenario === CityConfig.scenarios.HEAVY_RAIN) {
                    this.app.moveCameraTo(CityConfig.landmarks.bridge.cameraPos, CityConfig.landmarks.bridge.cameraTarget);
                } else if (scenario === CityConfig.scenarios.TRAIN_APPROACHING) {
                    this.app.moveCameraTo(CityConfig.landmarks.railwayGate4.cameraPos, CityConfig.landmarks.railwayGate4.cameraTarget);
                    this.app.railwayTwin.triggerTrainPassage();
                } else if (scenario === CityConfig.scenarios.TRANSFORMER_FAULT) {
                    this.app.moveCameraTo(CityConfig.landmarks.substation.cameraPos, CityConfig.landmarks.substation.cameraTarget);
                } else if (scenario === CityConfig.scenarios.INDUSTRIAL_EMERGENCY) {
                    this.app.moveCameraTo(CityConfig.landmarks.industry.cameraPos, CityConfig.landmarks.industry.cameraTarget);
                } else if (scenario === CityConfig.scenarios.TRAFFIC_CONGESTION) {
                    // Frame the Grand Arterial corridor clearly
                    this.app.moveCameraTo({ x: 30, y: 35, z: 45 }, { x: 15, y: 0, z: 0 });
                }
            });
        });

        // 2. Camera Bookmark Buttons
        this.cameraButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const landmarkKey = btn.getAttribute('data-cam');
                const landmark = CityConfig.landmarks[landmarkKey];
                if (landmark) {
                    this.app.moveCameraTo(landmark.cameraPos, landmark.cameraTarget);
                    this.cameraButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });

        // 3. Viewport Navigation Toolbar Tools
        document.getElementById('toolZoomIn')?.addEventListener('click', () => {
            this.app.zoomBy(-20);
        });
        document.getElementById('toolZoomOut')?.addEventListener('click', () => {
            this.app.zoomBy(20);
        });
        document.getElementById('toolTopView')?.addEventListener('click', () => {
            this.app.moveCameraTo({ x: 0, y: 175, z: 0.1 }, { x: 0, y: 0, z: 0 });
        });
        document.getElementById('toolOrbit')?.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            this.app.controls.autoRotate = !this.app.controls.autoRotate;
            this.app.controls.autoRotateSpeed = 1.2;
            btn.classList.toggle('active', this.app.controls.autoRotate);
        });
        document.getElementById('toolCleanView')?.addEventListener('click', () => {
            this.hudOverlay.classList.add('clean-view');
            if (this.cleanViewRestoreBtn) this.cleanViewRestoreBtn.style.display = 'block';
        });
        if (this.cleanViewRestoreBtn) {
            this.cleanViewRestoreBtn.addEventListener('click', () => {
                this.hudOverlay.classList.remove('clean-view');
                this.cleanViewRestoreBtn.style.display = 'none';
            });
        }

        // 4. Day / Night Mode Toggle
        if (this.dayNightBtn) {
            this.dayNightBtn.addEventListener('click', () => {
                const current = window.sensorHub.data.weather.dayNightMode;
                const next = current === 'DAY' ? 'NIGHT' : 'DAY';
                window.sensorHub.setDayNight(next);
                this.dayNightBtn.innerHTML = next === 'DAY'
                    ? '<i class="fas fa-sun text-yellow-400"></i> DAY'
                    : '<i class="fas fa-moon text-blue-400"></i> NIGHT';
            });
        }

        // 5. Toggle Right Panel Collapse
        if (this.toggleRightPanelBtn) {
            this.toggleRightPanelBtn.addEventListener('click', () => {
                this.rightPanel.classList.toggle('panel-collapsed');
                const isCollapsed = this.rightPanel.classList.contains('panel-collapsed');
                this.toggleRightPanelBtn.innerHTML = isCollapsed
                    ? '<i class="fas fa-chart-pie mr-1"></i> Expand Panel'
                    : '<i class="fas fa-angles-right mr-1"></i> Collapse';
            });
        }

        // 6. Modal Close Button
        const closeBtn = document.getElementById('closeInspectorBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.inspectorModal.classList.add('hidden');
                this.selectedObject = null;
            });
        }

        // 7. Tab Switching in Right Panel
        const tabs = document.querySelectorAll('.panel-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const targetTab = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                const activeContent = document.getElementById('tabContent_' + targetTab);
                if (activeContent) activeContent.classList.remove('hidden');
            });
        });
    }

    subscribeSensors() {
        window.sensorHub.subscribe((data) => {
            this.renderTopBar(data);
            this.renderGauges(data);
            this.updateChart();
            this.renderGateSenseBoard();
            if (this.selectedObject) {
                this.updateInspectorContent(this.selectedObject);
            }
        });

        window.sensorHub.onAlert((alerts) => {
            this.renderAlerts(alerts);
        });
    }

    renderTopBar(data) {
        const now = new Date();
        if (this.elTime) {
            this.elTime.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + " IST";
        }

        if (this.elScenarioBadge) {
            this.elScenarioBadge.textContent = data.metadata.activeScenario.replace(/_/g, ' ');
            this.elScenarioBadge.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold ';
            if (data.metadata.activeScenario === "NORMAL_CITY") {
                this.elScenarioBadge.classList.add('bg-green-500/20', 'text-green-400', 'border', 'border-green-500/40');
            } else if (data.metadata.activeScenario.includes("EMERGENCY") || data.metadata.activeScenario.includes("FAULT")) {
                this.elScenarioBadge.classList.add('bg-red-500/20', 'text-red-400', 'border', 'border-red-500/40', 'animate-pulse');
            } else {
                this.elScenarioBadge.classList.add('bg-yellow-500/20', 'text-yellow-400', 'border', 'border-yellow-500/40');
            }
        }

        if (this.elRainVal) this.elRainVal.textContent = data.weather.rainfall.toFixed(1) + " mm";
        if (this.elWaterVal) this.elWaterVal.textContent = data.flood.canalWaterLevel.toFixed(0) + "%";
        if (this.elTrafficVal) this.elTrafficVal.textContent = data.traffic.densityLevel;
        if (this.elPowerVal) this.elPowerVal.textContent = data.electricity.powerLoadPct.toFixed(0) + "%";
        if (this.elAqiVal) this.elAqiVal.textContent = "42 Good";
    }

    renderGauges(data) {
        const risks = window.aiEngine.getRisks();

        const updateRiskMeter = (id, val) => {
            const bar = document.getElementById(id + 'Bar');
            const txt = document.getElementById(id + 'Val');
            if (bar) {
                bar.style.width = val + '%';
                if (val > 75) {
                    bar.className = 'h-full rounded bg-red-500 transition-all duration-500';
                } else if (val > 45) {
                    bar.className = 'h-full rounded bg-yellow-500 transition-all duration-500';
                } else {
                    bar.className = 'h-full rounded bg-cyan-400 transition-all duration-500';
                }
            }
            if (txt) txt.textContent = val + '%';
        };

        updateRiskMeter('riskFlood', risks.flood);
        updateRiskMeter('riskBridge', risks.bridge);
        updateRiskMeter('riskTraffic', risks.traffic);
        updateRiskMeter('riskTransformer', risks.transformer);
        updateRiskMeter('riskIndustrial', risks.industrial);

        const healthEl = document.getElementById('overallHealthScore');
        if (healthEl) healthEl.textContent = risks.overallCityHealth + '%';
    }

    updateChart() {
        if (!this.riskChart) return;
        const chartData = window.aiEngine.getChartData();
        this.riskChart.data.labels = chartData.labels;
        this.riskChart.data.datasets[0].data = chartData.datasets[0].data;
        this.riskChart.data.datasets[1].data = chartData.datasets[1].data;
        this.riskChart.data.datasets[2].data = chartData.datasets[2].data;
        this.riskChart.data.datasets[3].data = chartData.datasets[3].data;
        this.riskChart.update('none');
    }

    // ========================================================
    // GATESENSE AI SUITE (from vysyavysya72-eng/gatesense-ai)
    // ========================================================
    initGateSenseUI() {
        // Voice Alert button
        const voiceBtn = document.getElementById('gateVoiceAlertBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                window.gateSenseTwin.playTamilVoiceAlert();
            });
        }

        // Emergency Vehicle Mode Toggle
        const emgToggle = document.getElementById('gateEmergencyModeBtn');
        if (emgToggle) {
            emgToggle.addEventListener('click', () => {
                window.gateSenseTwin.emergencyMode = !window.gateSenseTwin.emergencyMode;
                emgToggle.classList.toggle('bg-red-500/30', window.gateSenseTwin.emergencyMode);
                emgToggle.classList.toggle('border-red-500', window.gateSenseTwin.emergencyMode);
                this.updateRoutePlannerUI();
            });
        }

        // Route Planner calculate button
        const planBtn = document.getElementById('gatePlanRouteBtn');
        if (planBtn) {
            planBtn.addEventListener('click', () => {
                this.updateRoutePlannerUI();
            });
        }

        // Train schedule search input
        const searchInput = document.getElementById('trainSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderTrainScheduleTable(e.target.value);
            });
        }

        this.renderGateSenseBoard();
        this.updateRoutePlannerUI();
        this.renderTrainScheduleTable('');
        this.renderCitizenFeed();
    }

    renderGateSenseBoard() {
        const boardEl = document.getElementById('gateSenseSplitFlap');
        if (!boardEl) return;

        const crossings = window.gateSenseTwin.crossings;
        let html = '';

        crossings.forEach(c => {
            let pillClass = 'status-open';
            let statusLabel = 'OPEN';
            if (c.status === 'closed') {
                pillClass = 'status-closed';
                statusLabel = `CLOSED · ${c.wait}m`;
            } else if (c.status === 'soon') {
                pillClass = 'status-soon';
                statusLabel = `CLOSING · ${c.wait}m`;
            } else if (c.status === 'goods_only') {
                pillClass = 'status-goods';
                statusLabel = 'GOODS ONLY';
            }

            html += `
                <div class="flap-row">
                    <div>
                        <div class="font-bold text-slate-200">${c.name}</div>
                        <div class="text-[10px] text-slate-400">${c.train}</div>
                    </div>
                    <div>
                        <span class="status-pill ${pillClass}">
                            <span class="w-1.5 h-1.5 rounded-full ${c.status === 'closed' ? 'bg-red-400' : (c.status === 'soon' ? 'bg-yellow-400' : 'bg-green-400')} pulse-dot"></span>
                            ${statusLabel}
                        </span>
                    </div>
                    <div class="text-[10px] text-right text-slate-400">
                        ${c.alt}
                    </div>
                </div>
            `;
        });

        boardEl.innerHTML = html;

        // Update Leave-Now Banner
        const leaveBanner = document.getElementById('leaveNowBanner');
        if (leaveBanner) {
            const rec = window.gateSenseTwin.getLeaveNowRecommendation();
            leaveBanner.innerHTML = `
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-amber-400 uppercase font-mono">
                        <i class="fas fa-bell mr-1"></i> ${rec.title}
                    </span>
                </div>
                <div class="text-[11px] text-slate-300 leading-relaxed font-mono">
                    ${rec.text}
                </div>
            `;
        }
    }

    updateRoutePlannerUI() {
        const fromInput = document.getElementById('routeFromInput')?.value || "Thoothukudi Old Bus Stand";
        const toInput = document.getElementById('routeToInput')?.value || "V.O.C. Port Logistics Bay";
        const result = window.gateSenseTwin.calculateRoute(fromInput, toInput);
        const container = document.getElementById('routeComparisonContainer');
        if (!container) return;

        if (result.mode === "EMERGENCY") {
            container.innerHTML = `
                <div class="route-card recommended border-red-500 bg-red-950/30">
                    <span class="route-badge bg-red-500 text-white">Emergency Bypass</span>
                    <div class="text-xs font-bold text-red-300 font-mono mb-1">${result.title}</div>
                    <div class="text-2xl font-bold font-mono text-slate-100 mb-1">${result.time} min</div>
                    <div class="text-[11px] text-slate-300 font-mono mb-2">${result.desc}</div>
                    <div class="flex justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
                        <span>Gate Crossings: <b class="text-green-400">0</b></span>
                        <span>Distance: <b>${result.distance}</b></span>
                    </div>
                </div>
            `;

            // Project 3D neon path on road
            window.sensorHub.dispatchEmergency({
                type: "GATE_BYPASS_EMERGENCY",
                targetName: "VOC Port Bypass",
                targetPosition: CityConfig.landmarks.port.position,
                service: "FIRE_AND_RESCUE",
                originName: "Thoothukudi Central Transit",
                originPosition: CityConfig.landmarks.busStand.position,
                etaSeconds: result.time * 60
            });
        } else {
            container.innerHTML = `
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div class="route-card ${result.recommended === 'via' ? 'recommended' : ''}">
                        ${result.recommended === 'via' ? '<span class="route-badge">Recommended</span>' : ''}
                        <div class="text-[10px] text-slate-400 mb-0.5">Via Crossing</div>
                        <div class="text-xl font-bold text-slate-100 mb-1">${result.via.time}m</div>
                        <div class="text-[10px] text-slate-400 space-y-0.5">
                            <div>Drive: ${result.via.driveTime}m</div>
                            <div>Gate Wait: <b class="text-amber-400">${result.via.gateWait}m</b></div>
                            <div>Dist: ${result.via.distance}</div>
                        </div>
                    </div>
                    <div class="route-card ${result.recommended === 'alt' ? 'recommended' : ''}">
                        ${result.recommended === 'alt' ? '<span class="route-badge">Recommended</span>' : ''}
                        <div class="text-[10px] text-slate-400 mb-0.5">Alternate Bypass</div>
                        <div class="text-xl font-bold text-slate-100 mb-1">${result.alt.time}m</div>
                        <div class="text-[10px] text-slate-400 space-y-0.5">
                            <div>Drive: ${result.alt.driveTime}m</div>
                            <div>Gate Wait: <b class="text-green-400">0m</b></div>
                            <div>Dist: ${result.alt.distance}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderTrainScheduleTable(filter = '') {
        const tableBody = document.getElementById('trainScheduleBody');
        if (!tableBody) return;

        const f = filter.toLowerCase();
        const trains = window.gateSenseTwin.trains.filter(t => 
            t[0].toLowerCase().includes(f) || t[1].toLowerCase().includes(f) || t[5].toLowerCase().includes(f)
        );

        tableBody.innerHTML = trains.map(t => `
            <tr class="border-b border-white/5 hover:bg-slate-800/40 font-mono text-[10.5px]">
                <td class="p-1.5 text-cyan-300 font-bold">${t[0]}</td>
                <td class="p-1.5 text-slate-200">${t[1]}</td>
                <td class="p-1.5 text-slate-400">${t[2] !== '—' ? t[2] : t[3]}</td>
                <td class="p-1.5"><span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">${t[5]}</span></td>
            </tr>
        `).join('');
    }

    renderCitizenFeed() {
        const feedContainer = document.getElementById('citizenFeedList');
        if (!feedContainer) return;

        const reports = window.gateSenseTwin.reports;
        feedContainer.innerHTML = reports.map(r => `
            <div class="p-2.5 rounded bg-black/30 border border-white/5 font-mono text-xs mb-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ${r.issue}
                    </span>
                    <span class="text-slate-500 text-[10px]">${r.time}</span>
                </div>
                <div class="text-slate-200 font-bold mb-1">${r.crossing}</div>
                <div class="text-slate-400 text-[11px] mb-2 leading-tight">${r.desc}</div>
                <div class="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/5 text-slate-400">
                    <span class="text-emerald-400">Trust Score: ${r.reporterTrust}/10</span>
                    <div class="flex gap-2">
                        <button class="hover:text-cyan-300">✓ Confirm (${r.confirms})</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAlerts(alerts) {
        if (this.elAlertCount) {
            this.elAlertCount.textContent = alerts.length;
        }

        if (!this.alertContainer) return;
        this.alertContainer.innerHTML = '';

        alerts.forEach(alert => {
            const item = document.createElement('div');
            item.className = 'p-3 rounded-lg border text-xs font-mono transition-all duration-300 hover:border-cyan-400 ';

            let badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            if (alert.level === 'CRITICAL') {
                badgeClass = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
                item.classList.add('bg-red-950/20', 'border-red-900/40');
            } else if (alert.level === 'WARNING') {
                badgeClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
                item.classList.add('bg-yellow-950/20', 'border-yellow-900/40');
            } else {
                item.classList.add('bg-slate-900/40', 'border-slate-800');
            }

            item.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${badgeClass}">
                        ${alert.level}
                    </span>
                    <span class="text-slate-400 text-[10px]">${alert.timestamp}</span>
                </div>
                <div class="font-bold text-slate-200 mb-1">${alert.source}</div>
                <div class="text-slate-300 mb-1.5 leading-relaxed">${alert.message}</div>
                <div class="bg-black/30 p-1.5 rounded border border-white/5 text-[11px] mb-2">
                    <span class="text-slate-400">Metric:</span> <span class="text-cyan-300 font-bold">${alert.value}</span> | 
                    <span class="text-slate-400">Limit:</span> <span class="text-slate-200">${alert.threshold}</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    <span>${alert.action}</span>
                    <button class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 locate-btn">
                        <i class="fas fa-crosshairs"></i> Locate
                    </button>
                </div>
            `;

            const locBtn = item.querySelector('.locate-btn');
            locBtn.addEventListener('click', () => {
                this.locateAlertSource(alert.source);
            });

            this.alertContainer.appendChild(item);
        });
    }

    locateAlertSource(source) {
        if (source.includes('Bridge') || source.includes('Canal')) {
            this.app.moveCameraTo(CityConfig.landmarks.bridge.cameraPos, CityConfig.landmarks.bridge.cameraTarget);
        } else if (source.includes('Railway') || source.includes('Gate')) {
            this.app.moveCameraTo(CityConfig.landmarks.railwayGate4.cameraPos, CityConfig.landmarks.railwayGate4.cameraTarget);
        } else if (source.includes('Substation') || source.includes('Transformer')) {
            this.app.moveCameraTo(CityConfig.landmarks.substation.cameraPos, CityConfig.landmarks.substation.cameraTarget);
        } else if (source.includes('Port') || source.includes('Vessel')) {
            this.app.moveCameraTo(CityConfig.landmarks.port.cameraPos, CityConfig.landmarks.port.cameraTarget);
        } else if (source.includes('Industrial') || source.includes('SIPCOT')) {
            this.app.moveCameraTo(CityConfig.landmarks.industry.cameraPos, CityConfig.landmarks.industry.cameraTarget);
        } else if (source.includes('Bus')) {
            this.app.moveCameraTo(CityConfig.landmarks.busStand.cameraPos, CityConfig.landmarks.busStand.cameraTarget);
        }
    }

    showInspector(objectData) {
        this.selectedObject = objectData;
        this.inspectorModal.classList.remove('hidden');
        this.updateInspectorContent(objectData);
    }

    updateInspectorContent(data) {
        if (!this.inspectorTitle) return;

        this.inspectorTitle.textContent = data.name;
        this.inspectorDistrict.textContent = data.district || "Thoothukudi Smart City Grid";

        this.inspectorStatus.textContent = data.status || "OPERATIONAL";
        this.inspectorStatus.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold ';
        if (data.status === 'NORMAL' || data.status === 'OPERATIONAL' || data.status === 'READY') {
            this.inspectorStatus.classList.add('bg-green-500/20', 'text-green-400', 'border', 'border-green-500/30');
        } else if (data.status.includes('CRITICAL') || data.status === 'FAULT' || data.status === 'EMERGENCY') {
            this.inspectorStatus.classList.add('bg-red-500/20', 'text-red-400', 'border', 'border-red-500/30', 'animate-pulse');
        } else {
            this.inspectorStatus.classList.add('bg-yellow-500/20', 'text-yellow-400', 'border', 'border-yellow-500/30');
        }

        let detailsHtml = '';
        const s = window.sensorHub.data;

        if (data.type === 'BRIDGE') {
            detailsHtml = `
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Canal Water Level</div>
                        <div class="text-base font-bold text-cyan-400">${s.flood.canalWaterLevel.toFixed(1)}%</div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Bridge Clearance</div>
                        <div class="text-base font-bold text-slate-200">${(5.2 - (s.flood.canalWaterLevel / 100 * 3.3)).toFixed(2)} m</div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Structural Vibration</div>
                        <div class="text-base font-bold text-yellow-400">${s.bridge.vibrationStrain.toFixed(1)} µε</div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Active Bridge Traffic</div>
                        <div class="text-base font-bold ${s.bridge.closed ? 'text-red-400' : 'text-green-400'}">
                            ${s.bridge.closed ? 'CLOSED (DIVERTED)' : '58 veh/min FLOW'}
                        </div>
                    </div>
                </div>
            `;
        } else if (data.type === 'TRANSIT_TERMINAL') {
            detailsHtml = `
                <div class="space-y-1.5 text-xs font-mono">
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Depot Fleet Status</div>
                        <div class="text-base font-bold text-cyan-400">48 TNSTC • 12 SETC Super Deluxe</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-black/30 p-2 rounded border border-white/5">
                            <div class="text-slate-400">Daily Commuters</div>
                            <div class="font-bold text-slate-200">18,500 Pass.</div>
                        </div>
                        <div class="bg-black/30 p-2 rounded border border-white/5">
                            <div class="text-slate-400">Next Departure</div>
                            <div class="font-bold text-green-400">Tirunelveli SF (05m)</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (data.type === 'SUBSTATION_TRANSFORMER') {
            detailsHtml = `
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Voltage Output</div>
                        <div class="text-base font-bold text-cyan-400">${s.electricity.voltageKV.toFixed(2)} kV</div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Current Load</div>
                        <div class="text-base font-bold text-slate-200">${s.electricity.currentAmps} A (${s.electricity.powerLoadPct.toFixed(0)}%)</div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Core Temperature</div>
                        <div class="text-base font-bold ${s.electricity.temperatureC > 90 ? 'text-red-400' : 'text-yellow-400'}">
                            ${s.electricity.temperatureC.toFixed(1)} °C
                        </div>
                    </div>
                    <div class="bg-black/30 p-2 rounded border border-white/5">
                        <div class="text-slate-400">Grid Frequency</div>
                        <div class="text-base font-bold text-green-400">${s.electricity.gridFrequencyHz.toFixed(2)} Hz</div>
                    </div>
                </div>
            `;
        } else {
            detailsHtml = `<div class="space-y-1.5 text-xs font-mono">`;
            for (const [k, v] of Object.entries(data.details || {})) {
                detailsHtml += `
                    <div class="flex justify-between bg-black/30 p-1.5 rounded border border-white/5">
                        <span class="text-slate-400 capitalize">${k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span class="text-slate-200 font-bold">${v}</span>
                    </div>
                `;
            }
            detailsHtml += `</div>`;
        }

        this.inspectorDetails.innerHTML = detailsHtml;

        this.inspectorActions.innerHTML = `
            <button class="flex-1 py-1.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono font-bold transition-all">
                <i class="fas fa-satellite-dish mr-1"></i> Diagnostic Scan
            </button>
            <button class="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded text-xs font-mono transition-all" onclick="document.getElementById('inspectorModal').classList.add('hidden')">
                Close
            </button>
        `;
    }
}

window.UIController = UIController;
