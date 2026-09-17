# THOOTHUKUDI 3D DIGITAL TWIN – AI SMART CITY COMMAND CENTER

An interactive, animated, high-fidelity 3D virtual representation of **Thoothukudi Smart City** (Tamil Nadu, India) engineered for real-time urban monitoring, hazard simulation, and AI-driven municipal command.

Built with **Three.js**, **WebGL**, **Chart.js**, and modern modular JavaScript.

> [!NOTE]
> **SIMULATED SENSOR DATA – PROTOTYPE**  
> All sensor streams, hydrological telemetry, electrical loads, and AI risk scores in this demonstration are simulated for prototype and ideathon validation. The system architecture is built with an IoT bridge layer ready for real-world ESP32, SCADA, and MQTT streaming.

---

## Key Features & 3D Digital Twins

### 1. Buckle Canal Coastal Bridge Digital Twin (B01)
- 4-lane arterial road bridge crossing the Buckle drainage canal.
- **Physical Water Level Rise**: Water physically rises up the bridge piers during rain and flood scenarios.
- **Automated Safety Barrier**: Gates automatically lower across the bridge road when water clearance is breached.
- **Traffic Rerouting**: Vehicles divert to the illuminated Southern Bypass Route when the bridge is closed.
- Real-time telemetry: Canal Water Level (%), Bridge Clearance (m), Vibration Strain (µε), Traffic Rate (v/min).

### 2. Thoothukudi Railway Level Crossing Digital Twin (G01)
- Double-track electrified railway cutting across the Grand Arterial Highway.
- **Motorized Barrier Arms**: Gates smoothly descend when a train approaches.
- **Twin Alternating Red Flashing LEDs**: Authentic warning signals and bell sequence.
- **Animated Indian Railways Train**: Locomotive (WDP-4 diesel livery), passenger coaches, and container freight flatbeds roll across the crossing.
- **Queueing Physics**: Vehicles queue up before the closed gate and resume motion once the train passes.

### 3. TNEB Electrical Substation & Transformer Digital Twin (T01)
- 110kV/11kV distribution substation with cooling radiator fins, oil conservator tank, and ceramic insulator bushings.
- **High-Voltage Arc & Spark Particles**:
  - *Normal*: Stable green status halo.
  - *Overload*: Pulsing amber heat aura and load warnings.
  - *Fault*: Violent electrical arc bursts, blue/white spark explosions, and localized blackout effects.
- Live telemetry: Voltage (kV), Current (A), Core Temperature (°C), Load Factor (%), Frequency (Hz).

### 4. V.O. Chidambaranar Port Digital Twin (VOC Port)
- Deepwater port on the Gulf of Mannar.
- **Moored Container Cargo Ship ("VOC VOYAGER")**: 75m vessel floating with dynamic wave heave, roll, and pitch.
- **Rail-Mounted STS Gantry Cranes**: Automated trolleys and hoists actively moving containers.
- Color-coded ISO container staging yards, terminal trucks, and animated ocean waves.

### 5. SIPCOT Industrial Belt Digital Twin (Plant S01)
- Distillation fractionation columns with spiral maintenance platforms, spherical gas pressure storage vessels, cooling towers, and pipeline racks.
- **Volumetric Smoke Particles**: Clean white steam in normal mode; thick, dark toxic plumes in emergency mode with hazard strobe lights.

### 6. Live Traffic Simulation System
- Diverse Indian smart city vehicle mix:
  - White & blue Sedans / Cars
  - Green Electric Smart City Buses
  - Yellow & Green Auto-Rickshaws (3-wheelers)
  - Heavy Tata Cargo Trucks
  - Two-Wheelers / Motorbikes
- Dynamic congestion levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Adaptive 3-aspect traffic signals (Red, Yellow, Green).
- Night / storm automatic vehicle headlight activation.

### 7. Automated Hospital & Emergency Dispatch
- Thoothukudi Govt Medical College & Central Fire Station.
- **3D Neon Navigation Splines**: When an emergency occurs (Bridge flood, Transformer blowout, Chemical leak), an animated glowing neon path projects onto the road network.
- **Emergency Fleet**: Ambulance and Fire Tender with active sirens and strobe beacons navigate along the road to the target site with real-time ETA countdown.

### 8. AI Predictive Risk Engine & Chart.js Visualizer
- Multivariate anomaly detection evaluating flood risk, structural bridge risk, grid failure risk, traffic congestion, and industrial hazard.
- Live Chart.js time-series trend graphs with smooth rolling window.

### 9. Interactive 3D Raycasting Inspector
- Click on any building, bridge, railway gate, transformer, ship, or factory in the 3D viewport to open the **Digital Twin Inspector Card** with real-time sensor readouts, diagnostic tools, and manual controls.

---

## 2-Minute Judging / Demo Walkthrough

1. **Launch the Application**:
   - Double-click [`index.html`](file:///C:/Users/muhesh/.gemini/antigravity/scratch/thoothukudi-smart-city-3d/index.html) or open in Google Chrome or Microsoft Edge.
2. **Observe Baseline Normal City**:
   - Note the smooth traffic flow (cars, buses, auto-rickshaws), rotating port cranes, floating cargo ship, and green AI resilience scores.
3. **Trigger Scenario: "HEAVY RAIN"**:
   - Click **HEAVY RAIN** in the Simulation Lab dock.
   - Sky dims into a storm, rain particles fall across the city.
   - Buckle Canal water level visibly rises up the bridge piers.
   - Vehicles turn on headlights and slow down.
4. **Trigger Scenario: "FLOOD EMERGENCY"**:
   - Click **FLOOD EMERGENCY**.
   - Road flood water planes submerge low-lying streets.
   - Bridge B01 closes: automated barrier arms lower, red strobe lights flash.
   - Vehicles divert to the South Bypass road.
   - Fire and Rescue team is dispatched from Central Fire Station: glowing neon route projects on the road.
5. **Trigger Scenario: "TRAIN APPROACHING"**:
   - Click **TRAIN APPROACHING**.
   - Camera zooms to Railway Gate G01.
   - Crossing gates rotate down, alternating red lights flash.
   - Vehicles queue up. Train rolls across the track. Gates open and traffic resumes.
6. **Trigger Scenario: "TRANSFORMER FAULT"**:
   - Click **TRANSFORMER FAULT**.
   - Camera zooms to TNEB Substation T01.
   - Electrical sparks and violent blue plasma arcs burst from transformer bushings.
   - SCADA critical alert pops up on the Command Center HUD.
7. **Interactive 3D Click**:
   - Click on the Bridge, Cargo Ship, or Substation in the 3D scene to inspect live digital twin parameters.

---

## Folder Structure

```
thoothukudi-smart-city-3d/
├── index.html                   # Command Center HUD & WebGL canvas
├── css/
│   └── style.css                # Sci-Fi glassmorphism styling & animations
└── js/
    ├── config.js                # Landmarks, coordinates, sensor thresholds
    ├── sensor-hub.js            # Simulated IoT data layer & scenario state machine
    ├── ai-engine.js             # Anomaly detection, risk scores, Chart.js dataset
    ├── city-builder.js          # Procedural 3D city generator
    ├── bridge-twin.js           # Bridge B01 3D model & dynamic water elevation
    ├── railway-twin.js          # Gate G01 crossing, animated train & queue
    ├── power-twin.js            # TNEB Substation & spark particle engine
    ├── port-twin.js             # VOC Port, cargo ship & gantry cranes
    ├── industry-twin.js         # SIPCOT factories & smoke particle system
    ├── traffic-system.js        # Multi-vehicle traffic & congestion queues
    ├── emergency-system.js      # Emergency dispatch & 3D neon route splines
    ├── environmental-system.js  # Rain particles, road flood planes & day/night
    ├── ui.js                    # HUD bindings, Chart.js trends & 3D raycast inspector
    └── app.js                   # WebGL render loop & Three.js coordinator
```
