/**
 * Hardcoded Admin Credentials
 * DO NOT use in a real production environment where security is a priority.
 */
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "disaster@123"
};

/**
 * Admin Login Logic
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean}
 */
function attemptLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem("isAdmin", "true");
        return true;
    }
    return false;
}

/**
 * Check if user is authenticated as Admin
 * Redirects to login page if not authenticated
 */
function checkAdminSession() {
    if (sessionStorage.getItem("isAdmin") !== "true") {
        window.location.href = "admin-login.html";
    }
}

/**
 * Logout Logic
 * Clears session and redirects to login page
 */
function logout() {
    sessionStorage.removeItem("isAdmin");
    window.location.href = "index.html";
}

// Global exposure if needed for inline event handlers, 
// though modular JS is preferred.
window.logout = logout;
