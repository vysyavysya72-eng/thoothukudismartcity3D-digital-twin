/**
 * THOOTHUKUDI 3D DIGITAL TWIN - GATESENSE AI ENGINE
 * Integrated from vysyavysya72-eng/gatesense-ai.
 * Models Thoothukudi's real 4-gate railway crossing network (Gates 1, 2, 4 active + Gate 3 port goods line).
 * Features:
 * - Real-time Split-Flap Gate Status Board
 * - Leave-Now Recommendation Engine
 * - Interactive Route Planner (Wait vs Bypass) with Emergency Vehicle Mode
 * - Tamil & English Voice Alert System (Web Speech Synthesis)
 * - 17+ Real Southern Railway Train Schedules
 * - Crowdsourced Citizen Verification Feed with Reporter Trust Scores
 */

class GateSenseTwin {
    constructor() {
        // Real Thoothukudi Railway Crossings (from GateSense AI)
        this.crossings = [
            {
                id: 'g1',
                name: 'Gate 1 (Millerpuram)',
                fullName: 'Railway Gate 1 — Millerpuram / Tuticorin Melur',
                lat: 8.7668, lng: 78.1296,
                dist: 1.8,
                train: '12693 Pearl City SF Exp',
                status: 'closed', // 'open', 'soon', 'closed'
                wait: 6,
                next: 'Next: 06017 at 4:30 AM',
                reason: 'Express train crossing',
                alt: 'Via Millerpuram Bypass Road — adds ~5 min',
                pos: CityConfig.landmarks.railwayGate1.position
            },
            {
                id: 'g2',
                name: 'Gate 2 (Korampallam)',
                fullName: 'Railway Gate 2 — Korampallam Ring Road Approach',
                lat: 8.7701, lng: 78.1352,
                dist: 2.4,
                train: '56760 Tuticorin–VM Pass',
                status: 'soon',
                wait: 9,
                next: 'Following: 16235 at 5:30 PM',
                reason: 'Passenger train departure',
                alt: 'Via Korampallam Ring Road — adds ~6 min',
                pos: CityConfig.landmarks.railwayGate2.position
            },
            {
                id: 'g3',
                name: 'Gate 3 (VOC Port Line)',
                fullName: 'Railway Gate 3 — Port Outer Dedicated Freight Line',
                lat: 8.7520, lng: 78.1610,
                dist: 5.1,
                train: 'Coal & Container Freight Rake',
                status: 'goods_only',
                wait: 0,
                next: 'Goods traffic to Berth #4',
                reason: 'Port goods only — no road crossing',
                alt: 'Dedicated rail siding',
                pos: CityConfig.landmarks.railwayGate3.position
            },
            {
                id: 'g4',
                name: 'Gate 4 (Bryant Nagar)',
                fullName: 'Railway Gate 4 — Bryant Nagar / Grand Arterial Highway',
                lat: 8.7614, lng: 78.1409,
                dist: 0.8,
                train: '16235 Tuticorin–Mysuru Exp',
                status: 'open',
                wait: 0,
                next: 'Next closure: 5:30 PM',
                reason: 'Nominal corridor',
                alt: 'Via Bryant Nagar Main Road — adds ~4 min',
                pos: CityConfig.landmarks.railwayGate4.position
            }
        ];

        // Real Southern Railway Schedule Matrix (from GateSense AI)
        this.trains = [
            ['12693', 'Pearl City SF Express', '05:55 AM', '—', 'Daily', 'Gate 4'],
            ['06017', 'Chennai Egmore–Tuticorin SF Spl', '04:30 AM', '—', 'Wed', 'Gate 1'],
            ['56722', 'Rameswaram–Madurai Passenger', '09:30 AM', '—', 'Mon–Sat', 'Gate 2'],
            ['16236', 'Mysuru–Tuticorin Express', '10:25 AM', '—', 'Daily', 'Gate 4'],
            ['56759', 'Vanchi Maniyachchi–Tuticorin Pass', '03:45 AM', '—', 'Daily', 'Gate 1'],
            ['56724', 'Rameswaram–Madurai Passenger', '10:00 PM', '—', 'Daily', 'Gate 2'],
            ['16792', 'Palaruvi Express', '06:30 AM', '—', 'Daily', 'Gate 4'],
            ['06101', 'Katpadi–Villupuram Spl', '—', '05:00 AM', 'Mon–Thu', 'Gate 1'],
            ['17616', 'Madurai–Kacheguda Weekly Exp', '—', '07:40 AM', 'Wed', 'Gate 2'],
            ['56760', 'Tuticorin–Vanchi Maniyachchi Pass', '—', '08:30 AM', 'Daily', 'Gate 2'],
            ['56723', 'Madurai–Rameswaram Passenger', '—', '08:30 AM', 'Daily', 'Gate 4'],
            ['16235', 'Tuticorin–Mysuru Express', '—', '05:30 PM', 'Daily', 'Gate 4'],
            ['56721', 'Madurai–Rameswaram Passenger', '—', '06:15 PM', 'Mon–Sat', 'Gate 1'],
            ['12694', 'Pearl City SF Express', '—', '09:05 PM', 'Daily', 'Gate 4'],
            ['16791', 'Palaruvi Express', '—', '09:40 PM', 'Daily', 'Gate 2'],
            ['56725', 'Madurai–Rameswaram Passenger', '—', '10:35 PM', 'Daily', 'Gate 1'],
            ['56762', 'Tiruchendur–Tirunelveli Pass', '—', '10:45 PM', 'Daily', 'Gate 2']
        ];

        // Crowdsourced Community Reports
        this.reports = [
            { crossing: 'Gate 2', issue: 'Traffic Jam', desc: 'Backed up 200m towards signal, wait estimated 12 min.', time: '4 min ago', confirms: 7, disputes: 0, reporterTrust: 9 },
            { crossing: 'Gate 1', issue: 'Long Wait', desc: 'Passenger express crossing delayed, barrier arm down.', time: '12 min ago', confirms: 4, disputes: 1, reporterTrust: 6 },
            { crossing: 'Gate 4', issue: 'Clear Flow', desc: 'Pearl City Express passed, gate open and clear.', time: '20 min ago', confirms: 8, disputes: 0, reporterTrust: 10 }
        ];

        this.emergencyMode = false;
        this.routePref = 'fastest';

        // Periodic simulation countdown (demo speed: 12s real time = 1 min simulated)
        setInterval(() => this.tickCountdowns(), 12000);
    }

    tickCountdowns() {
        this.crossings.forEach(c => {
            if (c.id === 'g3') return; // Gate 3 is goods only

            if (c.status === 'closed' && c.wait > 0) {
                c.wait -= 1;
                if (c.wait <= 0) {
                    c.status = 'open';
                    c.wait = 0;
                    c.reason = 'Nominal passage';
                }
            } else if (c.status === 'soon' && c.wait > 0) {
                c.wait -= 1;
                if (c.wait <= 0) {
                    c.status = 'closed';
                    c.wait = 5 + Math.floor(Math.random() * 4);
                    c.reason = 'Train entering crossing block';
                }
            } else if (c.status === 'open') {
                // Random chance of upcoming train in simulation
                if (Math.random() < 0.15) {
                    c.status = 'soon';
                    c.wait = 3 + Math.floor(Math.random() * 4);
                    c.reason = 'Approaching scheduled train';
                }
            }
        });

        // Sync main railway gate G01 (Gate 4) with SensorHub
        const g4 = this.crossings.find(c => c.id === 'g4');
        if (g4 && window.sensorHub) {
            if (g4.status === 'closed') {
                window.sensorHub.data.railway.gateStatus = 'CLOSED';
                window.sensorHub.data.railway.waitingVehiclesCount = Math.max(6, window.sensorHub.data.railway.waitingVehiclesCount);
            } else if (g4.status === 'soon') {
                window.sensorHub.data.railway.gateStatus = 'CLOSING';
            } else {
                window.sensorHub.data.railway.gateStatus = 'OPEN';
            }
        }
    }

    getLeaveNowRecommendation() {
        const roadCrossings = this.crossings.filter(c => c.id !== 'g3');
        const busiest = [...roadCrossings].sort((a, b) => b.wait - a.wait)[0];

        if (!busiest || busiest.wait === 0) {
            return {
                title: "All Gates Clear",
                text: "All tracked railway gates (Gates 1, 2, and 4) are open. Zero crossing delays expected across Thoothukudi.",
                severity: "green"
            };
        } else {
            const leaveBy = Math.max(0, busiest.wait - 2);
            return {
                title: "Leave-Now Advisory",
                text: `Heading via ${busiest.name}? Leave within ${leaveBy} min to beat the closure — estimated ${busiest.wait} min wait after that.`,
                severity: "amber",
                busiest: busiest
            };
        }
    }

    calculateRoute(from, to) {
        const viaDriveTime = 14;
        const g4 = this.crossings.find(c => c.id === 'g4') || { wait: 4 };
        const waitMin = g4.status === 'closed' ? g4.wait : (g4.status === 'soon' ? g4.wait + 5 : 0);
        const viaTotal = viaDriveTime + waitMin;

        // Bypass adds ~5 km and ~5 minutes drive time, but 0 gate wait
        const altDriveTime = 19;
        const altTotal = altDriveTime;

        if (this.emergencyMode) {
            return {
                mode: "EMERGENCY",
                recommended: "alt",
                title: "🚑 Emergency Vehicle Always-Bypass Route",
                time: altTotal,
                gateCrossings: 0,
                distance: "6.8 km",
                desc: `${from} → ${to} — routes around every gate with 0 wait risk.`
            };
        }

        let recommended = viaTotal <= altTotal ? 'via' : 'alt';
        if (this.routePref === 'avoid') recommended = 'alt';

        return {
            mode: "STANDARD",
            recommended: recommended,
            via: {
                time: viaTotal,
                driveTime: viaDriveTime,
                gateWait: waitMin,
                distance: "5.2 km",
                label: "Via Grand Arterial Crossing"
            },
            alt: {
                time: altTotal,
                driveTime: altDriveTime,
                gateWait: 0,
                distance: "6.8 km",
                label: "Via Millerpuram / South Bypass"
            }
        };
    }

    playTamilVoiceAlert() {
        if (!('speechSynthesis' in window)) {
            alert('Web Speech Synthesis not supported in this browser.');
            return;
        }

        const roadCrossings = this.crossings.filter(c => c.id !== 'g3');
        const busiest = [...roadCrossings].sort((a, b) => b.wait - a.wait)[0];

        let msg = "";
        if (busiest && busiest.wait > 0) {
            msg = `தூத்துக்குடி கேட்சென்ஸ் ஏஐ எச்சரிக்கை. ${busiest.name}-ல் ${busiest.wait} நிமிடத்தில் ரயில்வே கேட் மூடப்படும். மாற்றுப் பாதையை திட்டமிடுங்கள். Thoothukudi GateSense AI alert: ${busiest.name} closing soon with ${busiest.wait} minutes wait time. Recommended bypass route active.`;
        } else {
            msg = `தூத்துக்குடி கேட்சென்ஸ் ஏஐ. எல்லா ரயில்வே கேட்களும் இப்போது திறந்துள்ளன. பயணம் பாதுகாப்பாக இருக்கட்டும். GateSense AI all gates open. No delays expected.`;
        }

        const utter = new SpeechSynthesisUtterance(msg);
        utter.rate = 0.95;
        const voices = speechSynthesis.getVoices();
        const taVoice = voices.find(v => v.lang && (v.lang.includes('ta') || v.lang.includes('Tamil')));
        if (taVoice) utter.voice = taVoice;

        speechSynthesis.speak(utter);
    }
}

window.gateSenseTwin = new GateSenseTwin();
