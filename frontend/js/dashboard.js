document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || !requireAuth()) return;
    
    document.getElementById('welcomeMsg').innerHTML = `Welcome, ${user.name} <span class="english-title">(${user.role})</span>`;
    
    if (user.role === 'landowner') {
        document.getElementById('farmersLink').style.display = 'block';
        document.getElementById('addFarmPanel').style.display = 'block';
    }
    
    loadLands();
    loadContracts();
    
    document.getElementById('addFarmForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('farmName').value,
            size: document.getElementById('farmSize').value,
            cropType: document.getElementById('farmCrop').value,
            location: {
                lat: 20.0, lng: 70.0,
                address: document.getElementById('farmAddress').value
            }
        };
        
        try {
            const res = await apiFetch('/lands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                showToast('Farm added successfully');
                loadLands();
                return;
            }
        } catch(e) {
            console.error(e);
        }

        const demoLands = getDemoLands();
        demoLands.push({
            _id: `demo-land-${Date.now()}`,
            name: body.name,
            size: body.size,
            cropType: body.cropType,
            status: 'active',
            location: { address: body.location.address },
            ownerRef: { _id: user.id, name: user.name }
        });
        writeDemoItems('demoLands', demoLands);
        showToast('Farm added locally in demo mode');
        loadLands();
    });
});

async function loadLands() {
    const user = getUser();
    try {
        const res = await apiFetch('/lands');
        if (!res.ok) {
            throw new Error('Using demo lands');
        }

        const lands = await res.json();
        
        const filtered = user.role === 'landowner' ? lands.filter(l => l.ownerRef._id === user.id) : lands;
        
        renderLands(filtered);
        return;
    } catch(e) { console.error(e); }

    const demoLands = getDemoLands().map((land) => ({
        ...land,
        ownerRef: land.ownerRef || { _id: user.id, name: user.name }
    }));
    const filteredDemoLands = user.role === 'landowner'
        ? demoLands.filter((land) => land.ownerRef._id === user.id)
        : demoLands;
    renderLands(filteredDemoLands);
}

async function loadContracts() {
    try {
        const res = await apiFetch('/contracts');
        if (!res.ok) {
            throw new Error('Using demo contracts');
        }

        const contracts = await res.json();
        renderContracts(contracts);
        return;
    } catch(e) { console.error(e); }

    renderContracts(getDemoContracts());
}

function renderLands(lands) {
    const list = document.getElementById('farmsList');
    list.innerHTML = '';

    if (lands.length === 0) {
        list.innerHTML = '<p>No farms found.</p>';
        return;
    }

    lands.forEach(land => {
        list.innerHTML += `
            <div class="feature-item">
                <h4>${land.name}</h4>
                <p><i class='bx bx-map'></i> ${land.location.address}</p>
                <p><strong>Size:</strong> ${land.size} Acres</p>
                <p><strong>Crop:</strong> ${land.cropType}</p>
                <span style="display:inline-block; margin-top:10px; padding:5px 10px; background:var(--accent-color); color:white; border-radius:15px; font-size:0.8rem;">
                    ${land.status.toUpperCase()}
                </span>
            </div>
        `;
    });
}

function renderContracts(contracts) {
    const list = document.getElementById('contractsList');
    list.innerHTML = '';

    if (contracts.length === 0) {
        list.innerHTML = '<p>No active contracts found.</p>';
        return;
    }

    contracts.forEach(c => {
        const statusColor = c.contractStatus === 'active' ? 'var(--accent-color)' : (c.contractStatus === 'pending' ? 'var(--secondary-color)' : 'red');
        list.innerHTML += `
            <div class="flow-card">
                <h4>Contract for: ${c.landRef?.name || 'Farm'}</h4>
                <p><strong>Scope:</strong> ${c.workScope}</p>
                <p><strong>Duration:</strong> ${new Date(c.startDate).toDateString()} - ${new Date(c.endDate).toDateString()}</p>
                <p style="color:${statusColor}; font-weight:bold;">Status: ${c.contractStatus.toUpperCase()}</p>
                <a href="contracts.html" class="btn-outline" style="display:inline-block; margin-top:15px;">View Details</a>
            </div>
        `;
    });
}
