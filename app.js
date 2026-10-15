// ========== HELPERS ==========
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// ========== LOGIN CHECK ==========
const user = JSON.parse(localStorage.getItem('hsb_user') || 'null');
if (!user) location.href = 'login.html';

$('#uname').textContent = (user.name || user.id).split(' ')[0];

// ========== DATA ==========
const SERVICES = [
    { n: 'Plumber', i: '🚰', d: 'Leaks, taps, pipes and bathroom fittings.', p: 299 },
    { n: 'Electrician', i: '💡', d: 'Wiring, switches, fans and fittings.', p: 249 },
    { n: 'Carpenter', i: '🪚', d: 'Furniture repair, doors and custom work.', p: 349 },
    { n: 'Cleaner', i: '🧹', d: 'Home and deep cleaning by trained crews.', p: 399 },
    { n: 'Painter', i: '🎨', d: 'Interior and exterior walls, neat finish.', p: 499 },
    { n: 'AC Technician', i: '❄️', d: 'Servicing, gas refill and repairs.', p: 449 },
    { n: 'Appliance Repair', i: '🔧', d: 'Washing machine, fridge, microwave.', p: 349 }
];

// [name, service, city, experience, rating, available, rate per hour]
const NAMES = [
    ['Ravi Kumar', 'Plumber', 'Guntur', 6, 4.8, 1, 160],
    ['Suresh Babu', 'Electrician', 'Tenali', 9, 4.7, 1, 140],
    ['Lakshmi Devi', 'Cleaner', 'Guntur', 5, 4.9, 1, 180],
    ['Venkat Rao', 'Carpenter', 'Vijayawada', 12, 4.6, 0, 200],
    ['Mohan Reddy', 'Painter', 'Guntur', 8, 4.5, 1, 170],
    ['Imran Khan', 'AC Technician', 'Vijayawada', 7, 4.8, 1, 190],
    ['Prasad N.', 'Appliance Repair', 'Tenali', 10, 4.7, 0, 150],
    ['Srinivas K.', 'Plumber', 'Vijayawada', 4, 4.4, 1, 150],
    ['Padma S.', 'Cleaner', 'Tenali', 3, 4.6, 1, 170],
    ['Ajay Verma', 'Electrician', 'Guntur', 11, 4.9, 1, 160]
];

const WORKERS = NAMES.map((w, i) => ({
    id: i + 1,
    name: w[0],
    svc: w[1],
    city: w[2],
    exp: w[3],
    rate: w[4],
    avail: !!w[5],
    rph: w[6],
    dist: +(0.8 + ((i * 37) % 90) / 10).toFixed(1),
    phone: '+91 98' + String(76000000 + i * 13579).slice(0, 8),
    email: w[0].toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '') + '@homeserve.example',
    img: `https://i.pravatar.cc/120?img=${i + 11}`
}));

// ========== UTILITY FUNCTIONS ==========
const money = n => '₹' + n.toLocaleString('en-IN');
const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
const svcOf = n => SERVICES.find(s => s.n == n);

let filter = 'All';

function toast(t) {
    const e = $('#toast');
    e.textContent = t;
    e.style.display = 'block';
    clearTimeout(toast.t);
    toast.t = setTimeout(() => e.style.display = 'none', 2600);
}

// ========== RENDER: FILTER CHIPS ==========
function renderChips() {
    $('#chips').innerHTML = ['All', ...SERVICES.map(s => s.n)]
        .map(n => `<button class="chip ${n == filter ? 'on' : ''}" data-f="${n}">${n}</button>`)
        .join('');
}

// ========== RENDER: SERVICES ==========
function renderServices() {
    const q = $('#q').value.trim().toLowerCase();

    const list = SERVICES.filter(s =>
        (filter == 'All' || s.n == filter) &&
        (!q || (s.n + s.d).toLowerCase().includes(q))
    );

    $('#svcGrid').innerHTML = list.map(s => `
        <div class="card">
            <div class="ico">${s.i}</div>
            <h3>${s.n}</h3>
            <p>${s.d}</p>
            <div class="row">
                <span class="price">From ${money(s.p)}</span>
                <button class="btn sm" data-book="${s.n}">Book Now</button>
            </div>
        </div>`).join('')
        || '<div class="empty">No service matches that search. Try "plumber" or "AC".</div>';
}

// ========== RENDER: WORKERS ==========
function renderWorkers() {
    const loc = $('#loc').value.trim().toLowerCase();
    const q = $('#q').value.trim().toLowerCase();

    let l = WORKERS.filter(w =>
        (filter == 'All' || w.svc == filter) &&
        (!loc || w.city.toLowerCase().includes(loc)) &&
        (!q ||
            (w.svc + w.name).toLowerCase().includes(q) ||
            SERVICES.some(s => s.n == w.svc && s.d.toLowerCase().includes(q)))
    );

    // Sort: r = top rated, p = lowest price, otherwise nearest
    const s = $('#sort').value;
    l.sort((a, b) =>
        s == 'r' ? b.rate - a.rate :
        s == 'p' ? a.rph - b.rph :
        a.dist - b.dist
    );

    $('#wSub').textContent = loc
        ? `Workers in "${$('#loc').value.trim()}" (${l.length} found)`
        : `Showing all available workers (${l.length})`;

    $('#wGrid').innerHTML = l.map(w => `
        <div class="card worker">
            <div class="wtop">
                <img class="avatar" src="${w.img}" alt="${w.name}" onerror="this.style.visibility='hidden'">
                <div>
                    <h3>${w.name}</h3>
                    <div style="color:var(--mut);font-size:.9rem">${w.svc} · ${w.city}</div>
                    <span class="stars">${stars(w.rate)}</span> <small>${w.rate}</small>
                </div>
            </div>
            <div class="meta">
                <span>🧰 ${w.exp} yrs experience</span>
                <span>📍 ${w.dist} km away</span>
                <span>💰 ${money(w.rph)}/hr</span>
                <span><span class="tag ${w.avail ? 'ok' : 'busy'}">${w.avail ? 'Available' : 'Busy today'}</span></span>
            </div>
            <div class="acts">
                <button class="btn ghost sm" data-prof="${w.id}">View Profile</button>
                <button class="btn ghost sm" data-prof="${w.id}">Contact</button>
                <button class="btn sm" data-book="${w.svc}" data-w="${w.id}">Book Now</button>
            </div>
        </div>`).join('')
        || '<div class="empty">No workers found in this area yet. Try a nearby city such as Guntur, Tenali or Vijayawada.</div>';
}

// ========== BOOKINGS STORAGE ==========
const getB = () => JSON.parse(localStorage.getItem('hsb_bookings_' + user.id) || '[]');
const setB = b => localStorage.setItem('hsb_bookings_' + user.id, JSON.stringify(b));

// ========== RENDER: BOOKINGS ==========
function renderBookings() {
    const b = getB().slice().reverse();

    $('#bGrid').innerHTML = b.map(x => {
        const w = WORKERS.find(w => w.id == x.wid);

        return `
        <div class="card">
            <div class="row">
                <h3>${svcOf(x.svc).i} ${x.svc}</h3>
                <span class="tag ${x.status == 'Confirmed' ? 'ok' : x.status == 'Cancelled' ? 'bad' : 'pend'}">${x.status}</span>
            </div>
            <p style="margin-bottom:8px">${w.name} · ${w.phone}<br>${w.email}</p>
            <div class="meta">
                <span>📅 ${x.date}</span>
                <span>⏰ ${x.time}</span>
                <span style="grid-column:1/3">📍 ${x.addr}</span>
            </div>
            <div class="row" style="margin-top:14px">
                <span class="price">${money(x.cost)}</span>
                ${x.status == 'Cancelled' ? '' : `<button class="btn ghost sm" data-cancel="${x.id}">Cancel</button>`}
            </div>
        </div>`;
    }).join('')
        || '<div class="empty">No bookings yet. Choose a service above and tap Book Now.</div>';
}

// ========== BOOKING MODAL ==========
function fillWorkers(svc, sel) {
    $('#bWk').innerHTML = WORKERS
        .filter(w => w.svc == svc)
        .map(w => `<option value="${w.id}">${w.name} (${money(w.rph)}/hr, ${w.dist} km)</option>`)
        .join('');

    if (sel) $('#bWk').value = sel;
    estimate();
}

function estimate() {
    const w = WORKERS.find(w => w.id == $('#bWk').value);
    if (!w) return;

    const s = svcOf($('#bSvc').value);

    // Cost = higher of base price or hourly total, plus urgent fee, plus visit fee
    const c = Math.max(s.p, w.rph * $('#bHrs').value) + (+$('#bUrg').value ? 150 : 0) + 49;

    window.est = c;
    $('#bEst').textContent = money(c) + ' (incl. ₹49 visit fee)';
}

function openBook(svc, wid) {
    $('#bSvc').innerHTML = SERVICES
        .map(s => `<option ${s.n == svc ? 'selected' : ''}>${s.n}</option>`)
        .join('');

    fillWorkers(svc, wid);

    const t = new Date().toISOString().split('T')[0];
    $('#bDate').min = t;
    $('#bDate').value = t;

    $('#bookModal').classList.add('open');
}

// ========== INFO MODAL ==========
function info(h) {
    $('#infoBox').innerHTML = h;
    $('#infoModal').classList.add('open');
}

// ========== CLICK HANDLER (EVENT DELEGATION) ==========
document.addEventListener('click', e => {
    const t = e.target.closest('button,a');
    if (!t) return;

    // Service filter chips
    if (t.dataset.f) {
        filter = t.dataset.f;
        renderChips();
        renderServices();
        renderWorkers();
    }

    // Open booking modal
    if (t.dataset.book) openBook(t.dataset.book, t.dataset.w);

    // Close modals (X button or click on backdrop)
    if (t.dataset.close !== undefined || e.target.classList.contains('modal')) {
        $$('.modal').forEach(m => m.classList.remove('open'));
    }

    // Worker profile / contact
    if (t.dataset.prof) {
        const w = WORKERS.find(w => w.id == t.dataset.prof);

        info(`
            <button class="x" data-close>×</button>
            <div class="wtop">
                <img class="avatar" src="${w.img}" alt="">
                <div>
                    <h3 style="margin:0">${w.name}</h3>
                    <span class="stars">${stars(w.rate)}</span> ${w.rate}
                </div>
            </div>
            <div class="meta" style="margin:16px 0">
                <span>🛠 ${w.svc}</span>
                <span>🧰 ${w.exp} years</span>
                <span>📍 ${w.city}, ${w.dist} km</span>
                <span>💰 ${money(w.rph)}/hr</span>
            </div>
            <p>
                📞 <a href="tel:${w.phone}">${w.phone}</a><br>
                ✉️ <a href="mailto:${w.email}">${w.email}</a>
            </p>
            <br>
            <button class="btn" data-close data-book="${w.svc}" data-w="${w.id}">Book ${w.name.split(' ')[0]}</button>
        `);
    }

    // Cancel a booking
    if (t.dataset.cancel) {
        setB(getB().map(b => b.id == t.dataset.cancel ? { ...b, status: 'Cancelled' } : b));
        renderBookings();
        toast('Booking cancelled.');
    }

    // User profile
    if (t.id == 'profileBtn') {
        e.preventDefault();

        info(`
            <button class="x" data-close>×</button>
            <h3>Your profile</h3>
            <p>
                <b>${user.name || 'Customer'}</b><br>
                ${user.id}<br>
                ${getB().length} booking(s)
            </p>
        `);
    }

    // Logout
    if (t.id == 'logout') {
        localStorage.removeItem('hsb_user');
        location.href = 'login.html';
    }

    // Search button
    if (t.id == 'searchBtn') {
        renderServices();
        renderWorkers();
        $('#workers').scrollIntoView();
    }

    // Mobile menu toggle
    if (t.id == 'burger' || t.closest('#links') && t.tagName == 'A') {
        $('#links').classList.toggle('open');
    }
});

// ========== FORM AND INPUT EVENTS ==========
$('#bSvc').onchange = e => fillWorkers(e.target.value);

['bWk', 'bHrs', 'bUrg'].forEach(i => $('#' + i).onchange = estimate);

['loc', 'q'].forEach(i => $('#' + i).addEventListener('input', () => {
    renderServices();
    renderWorkers();
}));

$('#sort').onchange = renderWorkers;

// ========== BOOKING FORM SUBMIT ==========
$('#bForm').onsubmit = e => {
    e.preventDefault();

    const w = WORKERS.find(w => w.id == $('#bWk').value);

    const b = {
        id: Date.now(),
        svc: $('#bSvc').value,
        wid: w.id,
        date: $('#bDate').value,
        time: $('#bTime').value,
        addr: $('#bAddr').value.trim(),
        desc: $('#bDesc').value.trim(),
        cost: window.est,
        status: w.avail ? 'Confirmed' : 'Pending'
    };

    setB([...getB(), b]);
    renderBookings();
    $('#bookModal').classList.remove('open');
    e.target.reset();

    info(`
        <div style="text-align:center">
            <div style="font-size:3rem">🎉</div>
            <h3>Booking ${b.status.toLowerCase()}</h3>
            <p>
                ${w.name} will visit on <b>${b.date}</b> at <b>${b.time}</b>.<br>
                Estimated cost: <b>${money(b.cost)}</b>
            </p>
            <br>
            <button class="btn" data-close>Done</button>
        </div>
    `);

    $('#bookings').scrollIntoView();
};

// ========== CONTACT FORM ==========
$('#cForm').onsubmit = e => {
    e.preventDefault();
    e.target.reset();
    toast('Message sent. We will reply soon.');
};

// ========== INITIAL RENDER ==========
renderChips();
renderServices();
renderWorkers();
renderBookings();