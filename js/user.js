/**
 * user.js — Public Dashboard Logic (Firebase Compat SDK)
 * Real-time stats, disaster feed, and email subscription
 */

const feedContainer = document.getElementById('alert-feed');
const loader = document.getElementById('feed-loader');

/**
 * Load stats (Active disasters)
 */
db.collection('disasters')
    .where('status', '==', 'Active')
    .onSnapshot(function (snapshot) {
        let total = 0, critical = 0, population = 0;
        const regions = new Set();

        snapshot.forEach(function (docSnap) {
            const data = docSnap.data();
            total++;
            if (data.severity === 'Critical') critical++;
            population += (data.affectedPopulation || 0);
            regions.add((data.location || '').split(',').pop().trim());
        });

        document.getElementById('total-active').textContent = total;
        document.getElementById('critical-alerts').textContent = critical;
        document.getElementById('regions-affected').textContent = regions.size;
        document.getElementById('people-affected').textContent = population.toLocaleString();
    });

/**
 * Load alert feed (Active disasters, newest first)
 */
db.collection('disasters')
    .where('status', '==', 'Active')
    .orderBy('timestamp', 'desc')
    .onSnapshot(function (snapshot) {
        loader.classList.add('d-none');
        feedContainer.innerHTML = '';

        if (snapshot.empty) {
            feedContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-shield-check text-success display-1"></i>
                    <h5 class="mt-3 text-white">No Active Disasters Reported</h5>
                    <p class="text-white">Stay safe and remain vigilant.</p>
                </div>`;
            return;
        }

        snapshot.forEach(function (docSnap) {
            const data = docSnap.data();
            const timeAgo = getTimeAgo(data.timestamp ? data.timestamp.toDate() : null);

            const sevBadge = {
                'Critical': 'badge-critical', 'High': 'badge-high',
                'Medium': 'badge-medium', 'Low': 'badge-low'
            }[data.severity] || 'bg-secondary';

            const card = `
                <div class="col-12 fade-in">
                    <div class="card glass-card border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <span class="badge ${sevBadge} mb-2">${data.severity} Alert</span>
                                    <h5 class="fw-bold mb-0 text-white">${getEmoji(data.type)} ${data.type} — ${data.location}</h5>
                                </div>
                                <span class="text-white small"><i class="bi bi-clock"></i> ${timeAgo}</span>
                            </div>
                            <p class="text-white" style="opacity:0.85;">${data.description}</p>
                            <hr class="border-secondary opacity-25">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="small text-white">
                                    <i class="bi bi-people-fill me-1"></i>
                                    <strong>${(data.affectedPopulation || 0).toLocaleString()}</strong> people potentially affected
                                </span>
                                <a href="map.html" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                                    <i class="bi bi-geo-alt-fill"></i> View on Map
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            feedContainer.insertAdjacentHTML('beforeend', card);
        });
    }, function (error) {
        loader.classList.add('d-none');
        feedContainer.innerHTML = '<p class="text-danger text-center">Error loading data: ' + error.message + '</p>';
    });

/**
 * Email Subscription
 */
document.getElementById('subscribe-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('sub-email');
    const subBtn = document.getElementById('sub-btn');
    const message = document.getElementById('sub-message');

    subBtn.disabled = true;
    subBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    db.collection('subscribers').add({
        email: emailInput.value,
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
        message.classList.remove('d-none');
        emailInput.value = '';
        setTimeout(function () { message.classList.add('d-none'); }, 5000);
    }).catch(function (err) {
        alert('Subscription failed: ' + err.message);
    }).finally(function () {
        subBtn.disabled = false;
        subBtn.innerHTML = '🔔 Subscribe';
    });
});

/**
 * Helper: Time Ago
 */
function getTimeAgo(date) {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return seconds + ' seconds ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
}

/**
 * Helper: Emoji
 */
function getEmoji(type) {
    return { 'Earthquake': '🌍', 'Flood': '🌊', 'Hurricane': '🌀', 'Wildfire': '🔥', 'Tsunami': '🌋', 'Cyclone': '🌪️', 'Landslide': '⛰️' }[type] || '⚠️';
}
