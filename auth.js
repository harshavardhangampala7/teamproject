// ========== HELPERS ==========
const $ = s => document.querySelector(s);
let mode = 'login';

// If already logged in, go straight to the home page
if (localStorage.getItem('hsb_user')) {
    location.href = 'index.html';
}

const get = k => JSON.parse(localStorage.getItem(k) || '[]');

// ========== SWITCH BETWEEN LOGIN AND REGISTER ==========
function setMode(m) {
    mode = m;

    $('#tL').classList.toggle('on', m == 'login');
    $('#tR').classList.toggle('on', m == 'reg');

    // Name and confirm-password fields only show in register mode
    $('#nameL').hidden = $('#cpL').hidden = m == 'login';

    $('#go').textContent = m == 'login' ? 'Login' : 'Create account';
    $('#msg').textContent = '';

    document.querySelectorAll('.err').forEach(e => e.textContent = '');
}

$('#tL').onclick = () => setMode('login');
$('#tR').onclick = () => setMode('reg');

// ========== VALIDATION HELPER ==========
// Shows an error message under the field and returns false
const bad = (el, t) => {
    el.parentElement.querySelector('.err').textContent = t;
    return false;
};

// ========== FORM SUBMIT ==========
$('#form').onsubmit = e => {
    e.preventDefault();

    // Clear old errors
    document.querySelectorAll('.err').forEach(x => x.textContent = '');

    const id = $('#id').value.trim();
    const pw = $('#pw').value;
    const ok = [];

    const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(id);
    const isTel = /^[6-9]\d{9}$/.test(id);

    // Validate fields
    if (mode == 'reg' && $('#name').value.trim().length < 2) {
        ok.push(bad($('#name'), 'Enter your full name.'));
    }

    if (!isMail && !isTel) {
        ok.push(bad($('#id'), 'Enter a valid email or 10-digit mobile number.'));
    }

    if (pw.length < 6) {
        ok.push(bad($('#pw'), 'Password must be at least 6 characters.'));
    }

    if (mode == 'reg' && $('#cp').value !== pw) {
        ok.push(bad($('#cp'), 'Passwords do not match.'));
    }

    // Stop if any validation failed
    if (ok.length) return;

    const users = get('hsb_users');

    if (mode == 'reg') {
        // REGISTER
        if (users.some(u => u.id == id)) {
            return ($('#msg').textContent = 'This account already exists. Please log in.');
        }

        const u = { id, pw, name: $('#name').value.trim() };
        users.push(u);
        localStorage.setItem('hsb_users', JSON.stringify(users));
        login(u);
    } else {
        // LOGIN
        const u = users.find(u => u.id == id && u.pw == pw);

        if (!u) {
            return ($('#msg').textContent = 'Incorrect details, or no account yet. Try registering.');
        }

        login(u);
    }
};

// ========== SAVE SESSION AND REDIRECT ==========
function login(u) {
    localStorage.setItem('hsb_user', JSON.stringify({ id: u.id, name: u.name }));
    location.href = 'index.html';
}