/**
 * admin.js — Admin Panel Logic (Firebase Compat SDK)
 * Handles CRUD operations for disasters and EmailJS notifications.
 */

// UI Elements
const disasterForm = document.getElementById('disaster-form');
const tableBody = document.getElementById('disaster-table-body');
const loader = document.getElementById('loading');
const toastEl = document.getElementById('liveToast');
const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
const toastMessage = document.getElementById('toast-message');

let editingId = null;

/**
 * Show Toast Notification
 */
function showToast(message, type = 'danger') {
    toastEl.classList.remove('bg-danger', 'bg-success', 'bg-warning', 'bg-info');
    toastEl.classList.add('bg-' + type);
    toastMessage.textContent = message;
    bsToast.show();
}

/**
 * Map severity to CSS badge class
 */
function getSeverityClass(severity) {
    return { 'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' }[severity] || 'bg-secondary';
}

/**
 * Get Emoji for Disaster Type
 */
function getEmoji(type) {
    const emojis = { 'Earthquake': '🌍', 'Flood': '🌊', 'Hurricane': '🌀', 'Wildfire': '🔥', 'Tsunami': '🌋', 'Cyclone': '🌪️', 'Landslide': '⛰️' };
    return emojis[type] || '⚠️';
}

/**
 * Load & display all disasters in real-time using onSnapshot
 */
function loadDisasters() {
    loader.classList.remove('d-none');
    db.collection('disasters')
        .orderBy('timestamp', 'desc')
        .onSnapshot(function (snapshot) {
            loader.classList.add('d-none');
            tableBody.innerHTML = '';
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">No disasters reported yet.</td></tr>';
                return;
            }
            snapshot.forEach(function (docSnap) {
                const data = docSnap.data();
                const id = docSnap.id;
                const sevClass = getSeverityClass(data.severity);
                const statusClass = data.status === 'Active' ? 'text-danger' : 'text-success';
                const statusIcon = data.status === 'Active' ? 'bi-record-circle-fill' : 'bi-check-circle-fill';

                const row = `
                    <tr class="align-middle">
                        <td><div class="fw-bold">${getEmoji(data.type)} ${data.type}</div></td>
                        <td>${data.location}</td>
                        <td><span class="badge ${sevClass}">${data.severity}</span></td>
                        <td class="text-center">${(data.affectedPopulation || 0).toLocaleString()}</td>
                        <td class="text-center">
                            <span class="${statusClass}"><i class="bi ${statusIcon}"></i> ${data.status}</span>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button onclick="editDisaster('${id}')" class="btn btn-outline-info btn-sm" title="Edit"><i class="bi bi-pencil-square"></i></button>
                                <button onclick="deleteDisaster('${id}')" class="btn btn-outline-danger btn-sm" title="Delete"><i class="bi bi-trash"></i></button>
                                ${data.status === 'Active' ? `<button onclick="resolveDisaster('${id}')" class="btn btn-outline-success btn-sm" title="Resolve"><i class="bi bi-check-lg"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        }, function (error) {
            loader.classList.add('d-none');
            console.error('Firestore Error:', error);
            showToast('Error connecting to database: ' + error.message);
        });
}

/**
 * Submit: Add or Update a Disaster
 */
disasterForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const location = document.getElementById('location').value;
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);
    const severity = document.querySelector('input[name="severity"]:checked').value;
    const affected = parseInt(document.getElementById('affected').value);
    const description = document.getElementById('description').value;
    const active = document.getElementById('status').checked;

    if (!type) { showToast('Please select a disaster type.', 'warning'); return; }

    const disasterData = {
        type: type,
        location: location,
        latitude: lat,
        longitude: lng,
        severity: severity,
        affectedPopulation: affected,
        description: description,
        status: active ? 'Active' : 'Resolved',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    loader.classList.remove('d-none');

    if (editingId) {
        db.collection('disasters').doc(editingId).update(disasterData)
            .then(function () {
                showToast('✅ Disaster updated successfully!', 'success');
                editingId = null;
                document.getElementById('submit-btn').innerHTML = '➕ ADD DISASTER';
                disasterForm.reset();
            })
            .catch(function (err) {
                console.error('Update error:', err);
                showToast('❌ Error updating disaster: ' + err.message);
            })
            .finally(function () { loader.classList.add('d-none'); });
    } else {
        db.collection('disasters').add(disasterData)
            .then(function () {
                showToast('✅ Disaster reported successfully!', 'success');
                disasterForm.reset();
                notifySubscribers(disasterData);
            })
            .catch(function (err) {
                console.error('Add error:', err);
                showToast('❌ Error adding disaster: ' + err.message);
            })
            .finally(function () { loader.classList.add('d-none'); });
    }
});

/**
 * Delete a Disaster document
 */
function deleteDisaster(id) {
    if (!confirm('Are you sure you want to delete this report?')) return;
    db.collection('disasters').doc(id).delete()
        .then(function () { showToast('🗑️ Disaster report deleted.', 'warning'); })
        .catch(function (err) { showToast('❌ Delete failed: ' + err.message); });
}

/**
 * Mark a Disaster as Resolved
 */
function resolveDisaster(id) {
    db.collection('disasters').doc(id).update({ status: 'Resolved' })
        .then(function () { showToast('✅ Disaster marked as Resolved.', 'success'); })
        .catch(function (err) { showToast('❌ Error: ' + err.message); });
}

/**
 * Edit a Disaster — populate form
 */
function editDisaster(id) {
    db.collection('disasters').doc(id).get()
        .then(function (docSnap) {
            if (!docSnap.exists) return;
            const data = docSnap.data();
            editingId = id;

            document.getElementById('type').value = data.type;
            document.getElementById('location').value = data.location;
            document.getElementById('latitude').value = data.latitude;
            document.getElementById('longitude').value = data.longitude;
            document.getElementById('affected').value = data.affectedPopulation;
            document.getElementById('description').value = data.description;
            document.getElementById('status').checked = data.status === 'Active';

            const sevId = 'sev-' + data.severity.toLowerCase();
            const sevRadio = document.getElementById(sevId);
            if (sevRadio) sevRadio.checked = true;

            document.getElementById('submit-btn').innerHTML = '💾 UPDATE DISASTER';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(function (err) { showToast('❌ Error loading record: ' + err.message); });
}

/**
 * Notify Subscribers via EmailJS (mocked — set up your EmailJS keys to activate)
 */
function notifySubscribers(disaster) {
    db.collection('subscribers').get()
        .then(function (snapshot) {
            if (snapshot.empty) return;
            const count = snapshot.size;
            console.log('Would notify ' + count + ' subscribers about ' + disaster.type + ' in ' + disaster.location);
            // Uncomment and configure to activate real emails:
            // snapshot.forEach(doc => {
            //   emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
            //     to_email: doc.data().email,
            //     disaster_type: disaster.type,
            //     location: disaster.location,
            //     severity: disaster.severity,
            //     description: disaster.description,
            //     affected_population: disaster.affectedPopulation,
            //   });
            // });
        });
}

// Expose functions to window for inline onclick handlers
window.deleteDisaster = deleteDisaster;
window.resolveDisaster = resolveDisaster;
window.editDisaster = editDisaster;

// Initialize
loadDisasters();
