document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    loadFarmers();
});

async function loadFarmers() {
    try {
        const res = await apiFetch('/farmers');
        const farmers = await res.json();
        
        const list = document.getElementById('farmersList');
        list.innerHTML = '';
        
        farmers.forEach(f => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${f.name}&background=random`;
            list.innerHTML += `
                <div class="flow-card">
                    <img src="${avatarUrl}" style="width:80px; border-radius:50%; margin-bottom:10px;" alt="${f.name}">
                    <h4 style="margin-bottom:5px;">${f.name}</h4>
                    <p style="color:var(--text-secondary);"><i class='bx bx-map'></i> ${f.location || 'Unknown'}</p>
                    <p><strong>Trust Score:</strong> <i class='bx bxs-star' style="color:var(--secondary-color);"></i> ${f.trustScore}</p>
                    <div style="margin-top:10px; display:flex; flex-wrap:wrap; justify-content:center; gap:5px;">
                        ${(f.skills || []).map(s => `<span style="background:var(--bg-color); padding:2px 8px; border-radius:12px; font-size:0.8rem;">${s}</span>`).join('')}
                    </div>
                    <button class="btn-outline" style="margin-top:15px;" onclick='viewProfile(${JSON.stringify(f)}, "${avatarUrl}")'>View Profile</button>
                </div>
            `;
        });
    } catch(err) { console.error(err); }
}

function viewProfile(farmer, avatarUrl) {
    document.getElementById('profileModal').style.display = 'flex';
    document.getElementById('pImg').src = avatarUrl;
    document.getElementById('pName').innerText = farmer.name;
    document.getElementById('pLocation').innerText = farmer.location || 'N/A';
    document.getElementById('pScore').innerText = farmer.trustScore;
    document.getElementById('pExp').innerText = farmer.experience || 'N/A';
    const skills = farmer.skills || ['General Farming'];
    if (document.getElementById('pSkillsPrimary')) {
        document.getElementById('pSkillsPrimary').innerText = skills[0];
    }
}

function sendRequest() {
    showToast('Request sent successfully to the farmer.');
    setTimeout(() => {
        document.getElementById('profileModal').style.display = 'none';
    }, 2000);
}
