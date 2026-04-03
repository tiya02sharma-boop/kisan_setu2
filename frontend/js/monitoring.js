document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    // Basic init if needed, user session check
    const user = getUser();
    
    if (user) {
        if (user.role === 'farmer') {
            document.getElementById('farmerView').style.display = 'block';
        } else if (user.role === 'landowner') {
            document.getElementById('landownerView').style.display = 'block';
        }
    }
    
    // Tab switching logic for Work Logs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Mock refreshing data
            showToast('Filtering logs by: ' + tab.innerText);
        });
    });
});

// Photo Preview Logic
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImage = document.getElementById('previewImage');
            const previewText = document.getElementById('previewText');
            
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            previewText.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

// Map/GPS Simulation
function autoDetectGPS() {
    showToast('Locating satellite GPS signal...');
    setTimeout(() => {
        // Simulate finding the location
        const randomLat = (23.0 + Math.random() * 0.1).toFixed(4);
        const randomLng = (72.5 + Math.random() * 0.1).toFixed(4);
        document.getElementById('gpsReadout').innerHTML = `<i class='bx bx-map-pin'></i> Lat: ${randomLat}, Lng: ${randomLng}`;
        document.getElementById('gpsReadout').style.color = 'var(--accent-color)';
        showToast('Location successfully mapped!');
    }, 1500);
}

// Voice Note Simulation
let isListening = false;
let listeningTimer = null;

function toggleVoiceInputQuick() {
    const icon = document.getElementById('quickMicIcon');
    if (!isListening) {
        startListening(icon);
    } else {
        stopListening(icon, true);
    }
}

function toggleVoiceInput() {
    const btn = document.getElementById('micBtn');
    if (!isListening) {
        startListening(btn, true);
    } else {
        stopListening(btn, false);
    }
}

function startListening(element, isButton = false) {
    isListening = true;
    if (isButton) {
        element.classList.add('listening');
    } else {
        element.style.color = 'red';
        element.classList.add('bx-flashing');
    }
    showToast('Listening... Speak now.');
    
    // Automatically stop after 3 seconds for dummy
    listeningTimer = setTimeout(() => {
        if(isListening) stopListening(element, !isButton);
    }, 3000);
}

function stopListening(element, isQuickAction = false) {
    isListening = false;
    clearTimeout(listeningTimer);
    
    if (!isQuickAction) {
        element.classList.remove('listening');
    } else {
        element.style.color = 'var(--secondary-color)';
        element.classList.remove('bx-flashing');
    }
    
    const textarea = document.getElementById('logNotes');
    const dummyPhrases = [
        "Watering complete for the Northern plot.",
        "Found some pest activity near the fences.",
        "Applied fertilizer mix as requested.",
        "Soil feels a bit dry, extended irrigation by 2 hours."
    ];
    
    const randomNote = dummyPhrases[Math.floor(Math.random() * dummyPhrases.length)];
    textarea.value = (textarea.value ? textarea.value + " " : "") + randomNote;
    
    showToast('Voice note transcribed.');
}

// Submit Handlers
function submitWorkLog() {
    const farm = document.getElementById('farmSelector').value;
    const notes = document.getElementById('logNotes').value;
    const imgSrc = document.getElementById('previewImage').src;
    
    if(!notes && imgSrc === window.location.href) {
        showToast('Please add a photo or some notes.');
        return;
    }
    
    showToast('Uploading securely via GPS lock...');
    
    // Simulate API delay
    setTimeout(() => {
        const dummyLogsList = document.getElementById('dummyLogsList');
        
        // Build new log item
        const newLog = document.createElement('div');
        newLog.className = 'log-item';
        newLog.style.backgroundColor = '#fafffa'; // Highlight new element
        
        const iconHtml = imgSrc && imgSrc !== window.location.href ? 
            `<img src="${imgSrc}" alt="farm">` : 
            `<i class='bx bx-check'></i>`;
            
        newLog.innerHTML = `
            <div class="log-icon">${iconHtml}</div>
            <div class="log-content">
                <h5 style="margin-bottom:3px;">${farm} Update</h5>
                <span class="badge" style="background:#e8f5e9; color:#2e7d32; margin-bottom:5px; display:inline-block;">Just Now</span>
                <p style="font-size:0.85rem; color:#666;"><i class='bx bx-time'></i> Today | ${document.getElementById('gpsReadout').innerText}</p>
                <p style="font-size:0.85rem; margin-top:5px; font-weight:500;">"${notes}"</p>
            </div>
        `;
        
        dummyLogsList.prepend(newLog);
        
        // Reset form
        document.getElementById('logNotes').value = '';
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewImage').src = '';
        document.getElementById('previewText').style.display = 'block';
        document.getElementById('logPhotoInput').value = '';
        
        document.getElementById('gpsReadout').innerHTML = `<i class='bx bx-map-pin'></i> Lat: 23.02, Lng: 72.57`;
        document.getElementById('gpsReadout').style.color = '#666';
        
        showToast('Work Logged Successfully!');
        
    }, 1000);
}

function reportProblem() {
    const notes = document.getElementById('logNotes').value;
    if(!notes) {
        showToast('Please describe the problem in the notes section.');
        document.getElementById('logNotes').focus();
        return;
    }
    
    showToast('Problem Ticket created! Landowner notified.');
    document.getElementById('logNotes').value = '';
}
