let currentContractId = null;

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || !requireAuth()) return;
    
    if (user.role === 'landowner') {
        document.getElementById('createContractPanel').style.display = 'block';
        document.getElementById('farmersLink') && (document.getElementById('farmersLink').style.display = 'block');
        loadFormOptions();
    }

    loadContracts();

    // ----- UI Integration from digital-agreement -----
    
    // Set Current date for document
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const docDateEl = document.getElementById('docDate');
    if (docDateEl) docDateEl.textContent = today;

    // DOM Elements for preview
    const inputs = {
        land: document.getElementById('contractLand'),
        farmer: document.getElementById('contractFarmer'),
        scope: document.getElementById('contractScope'),
        start: document.getElementById('contractStart'),
        end: document.getElementById('contractEnd')
    };

    const docNodes = {
        location: document.getElementById('docLocation'),
        lo: document.getElementById('docLo'), // Since we don't have separate owner input, we can use user name
        fa: document.getElementById('docFa'),
        crop: document.getElementById('docCrop'),
        start: document.getElementById('docStart'),
        end: document.getElementById('docEnd')
    };

    const pvNodes = {
        parties: document.getElementById('pvParties'),
        duration: document.getElementById('pvDuration'),
        crop: document.getElementById('pvCrop'),
        location: document.getElementById('pvLocation')
    };

    function updatePreviews() {
        const selectedLandText = inputs.land?.options[inputs.land.selectedIndex]?.text || '';
        const selectedFarmerText = inputs.farmer?.options[inputs.farmer.selectedIndex]?.text || '';
        const landownerName = user?.name || 'Local Landowner';
        const farmerName = selectedFarmerText.split(' (')[0] || 'Selected Farmer';
        const farmName = selectedLandText.split(' (')[0] || 'Selected Farm';

        // Document Previews
        if (docNodes.lo) { docNodes.lo.textContent = landownerName; docNodes.lo.className = ''; }
        if (docNodes.fa) { docNodes.fa.textContent = farmerName; docNodes.fa.className = farmerName !== 'Selected Farmer' ? '' : 'document-placeholder'; }
        if (docNodes.location) { docNodes.location.textContent = farmName; docNodes.location.className = farmName !== 'Selected Farm' ? '' : 'document-placeholder'; }
        if (docNodes.crop) { docNodes.crop.textContent = inputs.scope.value || '[Scope/Crop]'; docNodes.crop.className = inputs.scope.value ? '' : 'document-placeholder'; }
        if (docNodes.start) { docNodes.start.textContent = inputs.start.value || '[Start Date]'; docNodes.start.className = inputs.start.value ? '' : 'document-placeholder'; }
        if (docNodes.end) { docNodes.end.textContent = inputs.end.value || '[End Date]'; docNodes.end.className = inputs.end.value ? '' : 'document-placeholder'; }

        // Summary Preview
        if (pvNodes.parties) { pvNodes.parties.textContent = `${landownerName} & ${farmerName}`; }
        if (pvNodes.crop) { pvNodes.crop.textContent = inputs.scope.value || 'Crop Scope'; }
        if (pvNodes.location) { pvNodes.location.textContent = farmName || 'Selected Farm'; }
        if (pvNodes.duration) {
            if (inputs.start.value && inputs.end.value) {
                pvNodes.duration.textContent = `Duration: ${inputs.start.value} to ${inputs.end.value}`;
            } else {
                pvNodes.duration.textContent = 'Duration: Not set';
            }
        }
    }

    Object.values(inputs).forEach(input => {
        if(input) {
            input.addEventListener('input', updatePreviews);
            input.addEventListener('change', updatePreviews);
        }
    });

    // ----- Share Split Logic -----
    const shareSlider = document.getElementById('shareSlider');
    const loInput = document.getElementById('loShareInput');
    const faInput = document.getElementById('faShareInput');
    
    // Bar and text elements
    const barLo = document.getElementById('barLo');
    const barFa = document.getElementById('barFa');
    const txtLo = document.getElementById('txtLo');
    const txtFa = document.getElementById('txtFa');
    const docLoShare = document.getElementById('docRatioLo');
    const docFaShare = document.getElementById('docRatioFa');

    function updateShare(loVal) {
        let lo = parseInt(loVal);
        if (isNaN(lo)) lo = 0;
        if (lo > 100) lo = 100;
        if (lo < 0) lo = 0;
        let fa = 100 - lo;

        if (shareSlider) shareSlider.value = lo;
        if (loInput) loInput.value = lo;
        if (faInput) faInput.value = fa;

        if (barLo) { barLo.style.width = `${lo}%`; barLo.textContent = `${lo}%`; }
        if (barFa) { barFa.style.width = `${fa}%`; barFa.textContent = `${fa}%`; }
        if (lo === 0 && barLo) barLo.textContent = '';
        if (fa === 0 && barFa) barFa.textContent = '';

        if (txtLo) txtLo.textContent = `Landowner gets ${lo}%`;
        if (txtFa) txtFa.textContent = `Farmer gets ${fa}%`;
        if (docLoShare) docLoShare.textContent = `${lo}%`;
        if (docFaShare) docFaShare.textContent = `${fa}%`;
        
        updateStatusStep(2);
    }

    if (shareSlider) shareSlider.addEventListener('input', (e) => updateShare(e.target.value));
    if (loInput) loInput.addEventListener('input', (e) => updateShare(parseInt(e.target.value)||0));
    if (faInput) faInput.addEventListener('input', (e) => updateShare(100 - (parseInt(e.target.value)||0)));

    // ----- Fake eSign Canvas Logic -----
    const sigCanvas = document.getElementById('sigCanvas');
    const sigInput = document.getElementById('sigInput');
    let ctx = null;
    let isDrawing = false;
    
    if (sigCanvas) {
        ctx = sigCanvas.getContext('2d');
        function resizeCanvas() {
            const rect = sigCanvas.getBoundingClientRect();
            sigCanvas.width = rect.width;
            sigCanvas.height = rect.height;
        }
        window.addEventListener('resize', resizeCanvas);
        setTimeout(resizeCanvas, 100);

        function startPosition(e) {
            isDrawing = true;
            draw(e);
        }

        function endPosition() {
            isDrawing = false;
            ctx.beginPath();
            updateStatusStep(2);
        }

        function draw(e) {
            if (!isDrawing) return;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#2C1808';

            const rect = sigCanvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
            const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        sigCanvas.addEventListener('mousedown', startPosition);
        sigCanvas.addEventListener('mouseup', endPosition);
        sigCanvas.addEventListener('mousemove', draw);
        sigCanvas.addEventListener('touchstart', startPosition, { passive: true });
        sigCanvas.addEventListener('touchend', endPosition);
        sigCanvas.addEventListener('touchmove', draw, { passive: true });
    }

    document.getElementById('clearSig')?.addEventListener('click', () => {
        if(ctx) ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        if(sigInput) sigInput.value = '';
    });

    document.querySelectorAll('input[name="sigType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'draw') {
                if(sigCanvas) { sigCanvas.style.display = 'block'; }
                if(sigInput) { sigInput.style.display = 'none'; }
            } else {
                if(sigCanvas) { sigCanvas.style.display = 'none'; }
                if(sigInput) { sigInput.style.display = 'block'; }
            }
        });
    });

    if (sigInput) sigInput.addEventListener('input', () => updateStatusStep(2));

    // Monitor form to active "Pending" state
    document.getElementById('createContractForm')?.addEventListener('keyup', () => updateStatusStep(2));

    // ----- Form Submission -----
    document.getElementById('createContractForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // eSign validation check
        const activeMode = document.querySelector('input[name="sigType"]:checked')?.value || 'draw';
        const isCanvasBlank = sigCanvas ? (sigCanvas.toDataURL() === document.createElement('canvas').toDataURL()) : true;
        const isTextBlank = sigInput ? (sigInput.value.trim() === '') : true;
        
        if ((activeMode === 'draw' && isCanvasBlank && sigCanvas) || (activeMode === 'type' && isTextBlank)) {
            alert("Please provide your signature before signing the agreement.");
            return;
        }

        const loShare = document.getElementById('shareSlider')?.value || 50;
        const fShare = 100 - loShare;
        
        const body = {
            landRef: document.getElementById('contractLand').value,
            farmerRef: document.getElementById('contractFarmer').value,
            workScope: document.getElementById('contractScope').value,
            startDate: document.getElementById('contractStart').value,
            endDate: document.getElementById('contractEnd').value,
            landownerShare: loShare,
            farmerShare: fShare,
            totalAmount: 0 // Optional for share
        };
        
        const signBtn = document.getElementById('signBtn');
        const prevText = signBtn.innerText;
        signBtn.innerText = "Signing...";
        
        try {
            const res = await apiFetch('/contracts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                completeContractSubmission({ body, signBtn, sigCanvas, sigInput, ctx, prevText });
                return;
            }
        } catch(err) {
            console.error(err); 
        }

        const demoContracts = getDemoContracts();
        demoContracts.unshift({
            _id: `demo-contract-${Date.now()}`,
            landRef: {
                _id: body.landRef,
                name: document.getElementById('contractLand').selectedOptions[0]?.textContent?.split(' (')[0] || 'Farm'
            },
            landownerRef: { _id: user.id, name: user.name },
            farmerRef: {
                _id: body.farmerRef,
                name: document.getElementById('contractFarmer').selectedOptions[0]?.textContent?.split(' (')[0] || 'Farmer',
                location: 'Demo Location'
            },
            workScope: body.workScope,
            startDate: body.startDate,
            endDate: body.endDate,
            contractStatus: 'pending',
            landownerShare: Number(body.landownerShare),
            farmerShare: Number(body.farmerShare)
        });
        writeDemoItems('demoContracts', demoContracts);
        completeContractSubmission({ body, signBtn, sigCanvas, sigInput, ctx, prevText, isDemoMode: true });
    });

    // Make updateStatusStep function globally available if needed
    window.updateStatusStep = function(stepNumber) {
        const steps = document.querySelectorAll('.status-step');
        steps.forEach(step => {
            let num = parseInt(step.getAttribute('data-step'));
            if (num < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
                step.querySelector('.step-icon').innerHTML = "<i class='bx bx-check'></i>";
            } else if (num === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
                // Restore icon based on original steps if moving back (simplified here)
            } else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        });
    };
});

async function loadFormOptions() {
    const user = getUser();
    try {
        const landsRes = await apiFetch('/lands');
        if (!landsRes.ok) {
            throw new Error('Using demo form options');
        }
        const lands = await landsRes.json();
        const myLands = lands.filter(l => l.ownerRef._id === user.id);
        const farmersRes = await apiFetch('/farmers');
        const farmers = farmersRes.ok ? await farmersRes.json() : [];
        populateContractOptions(myLands, farmers);
        return;
    } catch(err) { console.error(err); }

    const demoLands = getDemoLands().filter((land) => land.ownerRef._id === user.id);
    const demoFarmers = [
        { _id: 'demo-farmer', name: 'Demo Farmer', trustScore: 4.8 },
        { _id: 'demo-farmer-2', name: 'Sohan Patel', trustScore: 4.6 }
    ];
    populateContractOptions(demoLands, demoFarmers);
}

async function loadContracts() {
    const user = getUser();
    try {
        const res = await apiFetch('/contracts');
        if (!res.ok) {
            throw new Error('Using demo contracts');
        }
        const contracts = await res.json();
        renderContractsList(contracts, user);
        return;
    } catch(err) { console.error(err); }

    const demoContracts = getDemoContracts().filter((contract) => (
        user.role === 'farmer'
            ? contract.farmerRef?._id === user.id
            : contract.landownerRef?._id === user.id
    ));
    renderContractsList(demoContracts, user);
}

function viewContract(c) {
    currentContractId = c._id;
    document.getElementById('contractModal').style.display = 'flex';
    document.getElementById('cFarmName').innerText = c.landRef?.name || 'Farm Property';
    document.getElementById('cParties').innerText = `${c.landownerRef?.name} (Landowner) & ${c.farmerRef?.name} (Farmer)`;
    document.getElementById('cDuration').innerText = `${new Date(c.startDate).toDateString()} to ${new Date(c.endDate).toDateString()}`;
    document.getElementById('cScope').innerText = c.workScope;
    
    document.getElementById('cLoSplitBar').style.width = c.landownerShare + '%';
    document.getElementById('cLoSplitBar').innerText = c.landownerShare + '%';
    document.getElementById('cFSplitBar').style.width = c.farmerShare + '%';
    document.getElementById('cFSplitBar').innerText = c.farmerShare + '%';
    
    document.getElementById('cStatusLabel').innerText = c.contractStatus.toUpperCase();
}

async function acceptContract(id) {
    try {
        const res = await apiFetch(`/contracts/${id}/accept`, {
            method: 'PATCH'
        });
        if (res.ok) {
            showToast('Request accepted! Agreement is now active.');
            loadContracts();
            document.getElementById('contractModal').style.display = 'none';
            return;
        }
    } catch(err) { console.error(err); }

    const demoContracts = getDemoContracts().map((contract) => (
        contract._id === id
            ? { ...contract, contractStatus: 'active' }
            : contract
    ));
    writeDemoItems('demoContracts', demoContracts);
    showToast('Request accepted in demo mode!');
    loadContracts();
    document.getElementById('contractModal').style.display = 'none';
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const printArea = document.getElementById('contractPrintArea');
    
    html2canvas(printArea).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        doc.setFont("helvetica", "bold");
        doc.text("Kisan Setu - Agreement PDF", 10, 10);
        doc.addImage(imgData, 'PNG', 10, 20, pdfWidth - 20, pdfHeight - 20);
        doc.save(`Kisan_Setu_Contract_${currentContractId}.pdf`);
    });
}

function populateContractOptions(lands, farmers) {
    const landSelect = document.getElementById('contractLand');
    const farmerSelect = document.getElementById('contractFarmer');

    landSelect.innerHTML = '';
    farmerSelect.innerHTML = '';

    lands.forEach((land) => {
        landSelect.innerHTML += `<option value="${land._id}">${land.name} (${land.cropType})</option>`;
    });

    farmers.forEach((farmer) => {
        farmerSelect.innerHTML += `<option value="${farmer._id}">${farmer.name} (Score: ${farmer.trustScore})</option>`;
    });

    landSelect.dispatchEvent(new Event('change'));
    farmerSelect.dispatchEvent(new Event('change'));
}

function renderContractsList(contracts, user) {
    const list = document.getElementById('contractListContainer');
    list.innerHTML = '';

    if (contracts.length === 0) {
        list.innerHTML = '<p>No contracts found.</p>';
        return;
    }

    contracts.forEach(c => {
        const statusColor = c.contractStatus === 'active' ? 'var(--accent-color)' : (c.contractStatus === 'pending' ? 'var(--secondary-color)' : '#666');
        list.innerHTML += `
            <div class="flow-card" style="text-align:left;">
                <h4>${c.landRef?.name || 'Farm'} - Agreement</h4>
                <p><strong>Parties:</strong> ${c.landownerRef?.name} & ${c.farmerRef?.name}</p>
                <p><strong>Status:</strong> <span style="color:${statusColor}; font-weight:bold;">${c.contractStatus.toUpperCase()}</span></p>
                
                <button class="btn-primary" onclick='viewContract(${JSON.stringify(c)})' style="margin-top:10px;">View Details</button>
                ${c.contractStatus === 'pending' && user.role === 'farmer' ? `<button class="btn-secondary" onclick="acceptContract('${c._id}')" style="margin-top:10px;">Accept Request</button>` : ''}
            </div>
        `;
    });
}

function completeContractSubmission({ signBtn, sigCanvas, sigInput, ctx, prevText, isDemoMode = false }) {
    showToast(isDemoMode ? 'Agreement saved in demo mode!' : 'Agreement digitally signed & proposed!');

    document.getElementById('signTime').textContent = new Date().toLocaleString();
    document.getElementById('statusBadge').classList.add('visible');
    updateStatusStep(3);

    signBtn.disabled = true;
    signBtn.innerText = 'Agreement Sent ✅';
    signBtn.style.background = '#ccc';
    document.getElementById('termsCheck').disabled = true;
    if(sigCanvas) sigCanvas.style.pointerEvents = 'none';
    if(sigInput) sigInput.disabled = true;

    setTimeout(() => { updateStatusStep(4); }, 1500);

    setTimeout(() => {
        document.getElementById('createContractForm').reset();
        if(ctx) ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        if(sigInput) sigInput.value = '';
        updateStatusStep(1);
        document.getElementById('statusBadge').classList.remove('visible');
        signBtn.disabled = false;
        signBtn.innerText = prevText;
        signBtn.style.background = 'var(--secondary-color)';
        document.getElementById('termsCheck').disabled = false;
        if(sigCanvas) sigCanvas.style.pointerEvents = 'auto';
        if(sigInput) sigInput.disabled = false;
        loadContracts();
    }, 4000);
}
