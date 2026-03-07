/**
 * map.js — Leaflet Map Logic (Firebase Compat SDK)
 * Displays real-time disaster markers and affected area circles
 */

// Initialize the Leaflet Map (centered on India)
const map = L.map('map', { zoomControl: false }).setView([20.5937, 78.9629], 5);

// Dark theme tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(map);

L.control.zoom({ position: 'bottomleft' }).addTo(map);

// Layer group to hold all markers and circles
const layersGroup = L.layerGroup().addTo(map);
let allDisasters = [];
let activeFilter = 'All';

/**
 * Severity config — color and radius
 */
function getSeverityConfig(severity) {
    return {
        'Critical': { color: '#e74c3c', radius: 50000 },
        'High': { color: '#ff9f43', radius: 30000 },
        'Medium': { color: '#f1c40f', radius: 15000 },
        'Low': { color: '#2ecc71', radius: 5000 }
    }[severity] || { color: '#95a5a6', radius: 5000 };
}

/**
 * Emoji per type
 */
function getEmoji(type) {
    return { 'Earthquake': '🌍', 'Flood': '🌊', 'Hurricane': '🌀', 'Wildfire': '🔥', 'Tsunami': '🌋', 'Cyclone': '🌪️', 'Landslide': '⛰️' }[type] || '⚠️';
}

/**
 * Render map markers and circles (re-called on filter change)
 */
function renderLayer() {
    layersGroup.clearLayers();

    const filtered = activeFilter === 'All'
        ? allDisasters
        : allDisasters.filter(function (d) { return d.type === activeFilter; });

    filtered.forEach(function (disaster) {
        const config = getSeverityConfig(disaster.severity);

        // Affected area circle
        L.circle([disaster.latitude, disaster.longitude], {
            color: config.color, fillColor: config.color,
            fillOpacity: 0.18, radius: config.radius, weight: 1
        }).addTo(layersGroup);

        // Emoji marker
        const emojiIcon = L.divIcon({
            html: '<div style="font-size:28px;transform:translate(-50%,-50%);filter:drop-shadow(0 0 6px rgba(0,0,0,0.8));">' + getEmoji(disaster.type) + '</div>',
            className: '', iconSize: [30, 30], iconAnchor: [15, 15]
        });

        const popup = `
            <div style="font-family:'Poppins',sans-serif;min-width:200px;">
                <h6 style="margin:0 0 6px;font-weight:700;">${getEmoji(disaster.type)} ${disaster.type}</h6>
                <span style="background:${config.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;">${disaster.severity}</span>
                <hr style="margin:8px 0;border-color:#555;">
                <p style="margin:3px 0;font-size:12px;">📍 ${disaster.location}</p>
                <p style="margin:3px 0;font-size:12px;">👥 ${(disaster.affectedPopulation || 0).toLocaleString()} affected</p>
                <p style="margin:3px 0;font-size:12px;color:#ccc;">${disaster.description}</p>
                <div style="text-align:right;margin-top:8px;">
                    <span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;">⚠️ ${disaster.status}</span>
                </div>
            </div>`;

        L.marker([disaster.latitude, disaster.longitude], { icon: emojiIcon })
            .bindPopup(popup)
            .addTo(layersGroup);
    });
}

/**
 * Real-time listener for Active disasters from Firestore
 */
db.collection('disasters')
    .where('status', '==', 'Active')
    .onSnapshot(function (snapshot) {
        allDisasters = [];
        snapshot.forEach(function (docSnap) {
            allDisasters.push(Object.assign({ id: docSnap.id }, docSnap.data()));
        });
        document.getElementById('active-count').textContent = allDisasters.length;
        renderLayer();
    }, function (error) {
        console.error('Map Firestore Error:', error);
    });

/**
 * Filter Button Logic
 */
document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        e.target.classList.add('active');
        activeFilter = e.target.getAttribute('data-filter');
        renderLayer();
    });
});
