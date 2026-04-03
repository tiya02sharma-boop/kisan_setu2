let isRegisterMode = false;
const PUBLIC_PAGES = ['index.html', ''];
const DEMO_LANDS_KEY = 'demoLands';
const DEMO_CONTRACTS_KEY = 'demoContracts';

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        console.error('Failed to parse stored user.', error);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem('user');
}

async function apiFetch(endpoint, options = {}) {
    const { headers = {}, ...restOptions } = options;
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...restOptions,
        headers
    });
    return response;
}

function isPublicPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return PUBLIC_PAGES.includes(currentPage);
}

function requireAuth() {
    const user = getUser();

    if (!user) {
        clearSession();
        if (!isPublicPage()) {
            window.location.href = 'index.html';
        }
        return false;
    }

    return true;
}

function readDemoItems(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error(`Failed to parse ${key}.`, error);
        return [];
    }
}

function writeDemoItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
}

function getDemoLands() {
    const storedLands = readDemoItems(DEMO_LANDS_KEY);
    if (storedLands.length > 0) {
        return storedLands;
    }

    return [
        {
            _id: 'demo-land-1',
            name: 'Saraswati Farm',
            size: 12,
            cropType: 'Cotton',
            status: 'active',
            location: { address: 'Ahmedabad, Gujarat' },
            ownerRef: { _id: 'demo-landowner', name: 'Demo Landowner' }
        },
        {
            _id: 'demo-land-2',
            name: 'Green Acres',
            size: 8,
            cropType: 'Wheat',
            status: 'active',
            location: { address: 'Anand, Gujarat' },
            ownerRef: { _id: 'demo-landowner', name: 'Demo Landowner' }
        }
    ];
}

function getDemoContracts() {
    const storedContracts = readDemoItems(DEMO_CONTRACTS_KEY);
    if (storedContracts.length > 0) {
        return storedContracts;
    }

    return [
        {
            _id: 'demo-contract-1',
            landRef: { _id: 'demo-land-1', name: 'Saraswati Farm' },
            landownerRef: { _id: 'demo-landowner', name: 'Demo Landowner' },
            farmerRef: { _id: 'demo-farmer', name: 'Demo Farmer', location: 'Ahmedabad' },
            workScope: 'Cotton farming and irrigation',
            startDate: '2026-04-01',
            endDate: '2026-09-30',
            contractStatus: 'active',
            landownerShare: 50,
            farmerShare: 50
        }
    ];
}

function buildDemoUser(role, name, phone) {
    return {
        id: role === 'landowner' ? 'demo-landowner' : 'demo-farmer',
        name: name || (role === 'landowner' ? 'Demo Landowner' : 'Demo Farmer'),
        role,
        phone
    };
}

function openLoginModal(role) {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('authRole').value = role;
    document.getElementById('modalTitle').innerText = `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('nameGroup').style.display = isRegisterMode ? 'block' : 'none';
    document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Register' : 'Login';
    document.getElementById('toggleText').innerHTML = isRegisterMode ? 'Already a user? <a href="#" onclick="toggleAuthMode()">Login here</a>' : 'New user? <a href="#" onclick="toggleAuthMode()">Register here</a>';
}

document.getElementById('authForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('authPhone').value;
    const password = document.getElementById('authPassword').value;
    const role = document.getElementById('authRole').value;
    const name = document.getElementById('authName').value;

    try {
        if (isRegisterMode) {
            showToast('Registration successful! Please login.');
            toggleAuthMode();
        } else {
            const demoUser = buildDemoUser(role, name, phone);
            localStorage.setItem('user', JSON.stringify(demoUser));
            showToast('Login successful!');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred.');
    }
});

function showToast(message) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function logout() {
    clearSession();
    window.location.href = 'index.html';
}

// Check auth on protected pages
function checkAuth() {
    const user = getUser();

    if (!isPublicPage() && !requireAuth()) {
        return;
    }

    if (isPublicPage() && user) {
        const authButtons = document.querySelectorAll('[onclick^="openLoginModal"]');
        authButtons.forEach((button) => {
            button.onclick = () => {
                window.location.href = 'dashboard.html';
            };
        });
    }

    if (user) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="dashboard.html">Dashboard</a></li>
                <li><a href="contracts.html">Contracts</a></li>
                <li><a href="monitoring.html">Monitoring</a></li>
                ${user.role === 'landowner' ? '<li><a href="farmer-profile.html">Farmers</a></li>' : ''}
                <li><span style="color:var(--accent-color); font-weight:bold;">Hi, ${user.name}</span></li>
                <li><button class="btn-outline" onclick="logout()">Logout</button></li>
            `;
        }
    }
}

document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Run auth check on load
document.addEventListener('DOMContentLoaded', checkAuth);
