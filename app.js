// --- VARIABLES GLOBALES ---
let currentLang = 'es'; 
let lastCalculatedKg = null; 
let transportModes = []; 
let tipsDatabase = []; // Variable global para los consejos
let legCounter = 0; // Para dar un ID único a cada tramo

// --- DICCIONARIO DE IDIOMAS ---
const translations = {
    es: {
        title: "Huella de Movilidad",
        landingTitle: "Bienvenido a PRO-MOUTE",
        landingSubtitle: "¿Qué tipo de viaje deseas calcular hoy?",
        btnSingle: "Viaje de Hoy (Evento)",
        btnAnnual: "Rutina Anual (Commute)",
        btnBack: "⬅ Volver",
        singleTitle: "Viaje al Evento",
        singleDesc: "Calcula las emisiones de CO₂ de tu viaje de hoy (solo ida).",
        annualTitle: "Rutina Anual",
        annualDesc: "Calcula tu impacto anual (ida y vuelta).",
        daysLabel: "Días en la oficina por semana:",
        weeksLabel: "Semanas laborables al año:",
        btnAddLeg: "+ Añadir otro tramo",
        distanceLabel: "Distancia (km):",
        modeLabel: "Transporte:",
        selectMode: "Selecciona una opción...",
        legDelete: "X Eliminar",
        calculateBtn: "Calcular Huella",
        calculateAnnualBtn: "Calcular Huella Anual",
        resultTitle: "Tu impacto:",
        equivTrees: "Árboles / año",
        equivKm: "km en coche"
    },
    cat: {
        title: "Petjada de Mobilitat",
        landingTitle: "Benvingut a PRO-MOUTE",
        landingSubtitle: "Quin tipus de viatge vols calcular avui?",
        btnSingle: "Viatge d'Avui (Esdeveniment)",
        btnAnnual: "Rutina Anual (Commute)",
        btnBack: "⬅ Tornar",
        singleTitle: "Viatge a l'Esdeveniment",
        singleDesc: "Calcula les emissions de CO₂ del teu viatge d'avui (només anada).",
        annualTitle: "Rutina Anual",
        annualDesc: "Calcula el teu impacte anual (anada i tornada).",
        daysLabel: "Dies a l'oficina per setmana:",
        weeksLabel: "Setmanes laborables a l'any:",
        btnAddLeg: "+ Afegir un altre tram",
        distanceLabel: "Distància (km):",
        modeLabel: "Transport:",
        selectMode: "Selecciona una opció...",
        legDelete: "X Eliminar",
        calculateBtn: "Calcular Petjada",
        calculateAnnualBtn: "Calcular Petjada Anual",
        resultTitle: "El teu impacte:",
        equivTrees: "Arbres / any",
        equivKm: "km en cotxe"
    },
    en: {
        title: "Mobility Footprint",
        landingTitle: "Welcome to PRO-MOUTE",
        landingSubtitle: "What kind of trip do you want to calculate today?",
        btnSingle: "Today's Trip (Event)",
        btnAnnual: "Annual Routine (Commute)",
        btnBack: "⬅ Back",
        singleTitle: "Trip to Event",
        singleDesc: "Calculate the CO₂ emissions of your trip today (one-way).",
        annualTitle: "Annual Routine",
        annualDesc: "Calculate your annual impact (round trip).",
        daysLabel: "Days at the office per week:",
        weeksLabel: "Work weeks per year:",
        btnAddLeg: "+ Add another leg",
        distanceLabel: "Distance (km):",
        modeLabel: "Transport:",
        selectMode: "Select an option...",
        legDelete: "X Delete",
        calculateBtn: "Calculate Footprint",
        calculateAnnualBtn: "Calculate Annual Footprint",
        resultTitle: "Your impact:",
        equivTrees: "Trees / year",
        equivKm: "km by car"
    }
};

// --- 1. GESTIÓN DE VISTAS ---
function goToView(viewId) {
    document.getElementById('view-landing').classList.replace('view-active', 'view-hidden');
    document.getElementById('view-single').classList.replace('view-active', 'view-hidden');
    document.getElementById('view-annual').classList.replace('view-active', 'view-hidden');
    document.getElementById('result-card').classList.replace('result-visible', 'result-hidden');
    document.getElementById(`view-${viewId}`).classList.replace('view-hidden', 'view-active');
}

function handleUrlHash() {
    const hash = window.location.hash;
    if (hash === '#evento') goToView('single');
    else if (hash === '#anual') goToView('annual');
    else goToView('landing');
}

// --- 2. GESTIÓN DE TRAMOS ---
function addLeg(containerType) {
    legCounter++;
    const container = document.getElementById(`${containerType}-legs-container`);
    const isFirstLeg = container.children.length === 0;

    const legHtml = `
        <div class="leg-card" id="leg-${legCounter}">
            <div class="leg-header">
                <span class="leg-title" data-i18n="distanceLabel">Tramo</span>
                ${!isFirstLeg ? `<button class="delete-leg-btn" onclick="removeLeg('leg-${legCounter}')" data-i18n="legDelete">X Eliminar</button>` : ''}
            </div>
            <div class="input-group">
                <label data-i18n="distanceLabel">Distancia (km):</label>
                <input type="number" class="leg-distance" placeholder="Ej. 5.5" min="0" step="0.1" required>
            </div>
            <div class="input-group">
                <label data-i18n="modeLabel">Transporte:</label>
                <select class="leg-mode" required>
                    <option value="" disabled selected data-i18n="selectMode">Selecciona una opción...</option>
                </select>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', legHtml);
    buildDropdowns(currentLang);
    updateTranslations(currentLang);
}

function removeLeg(legId) {
    const leg = document.getElementById(legId);
    if (leg) leg.remove();
}

// --- 3. CARGA DE DATOS (GOOGLE SHEETS) ---
async function loadEmissionData() {
    const modesUrl = 'https://docs.google.com/spreadsheets/d/1GoZvvJaK_v2fBLh4C8HzBHc-pRdg1IDyOFUUhxKFKCI/export?format=csv';

    try {
        const response = await fetch(modesUrl);
        if (!response.ok) throw new Error('Error al acceder a Google Sheets');

        const data = await response.text();
        const lines = data.trim().split('\n');
        transportModes = [];

        for(let i = 1; i < lines.length; i++) {
            const [id, co2, icon, es, cat, en] = lines[i].split(',');
            if(id && co2) {
                transportModes.push({
                    id: id.trim(),
                    co2: parseFloat(co2.trim()),
                    icon: icon.trim(),
                    translations: { es: es.trim(), cat: cat.trim(), en: en.trim() }
                });
            }
        }

        // --- CARGAR CONSEJOS ---
        await loadTips();

        // --- INICIALIZACIÓN DE LA UI ---
        // Añadimos el primer tramo por defecto si están vacíos
        if (document.getElementById('single-legs-container').children.length === 0) addLeg('single');
        if (document.getElementById('annual-legs-container').children.length === 0) addLeg('annual');

        setLanguage(currentLang);
        handleUrlHash();
        setupSliders();

    } catch (error) {
        console.error("Error en el arranque:", error);
    }
}


async function loadTips() {
    // 1. Asegúrate de que este GID sea el de la pestaña de 'tips' (mira la URL en tu navegador)
    const url = 'https://docs.google.com/spreadsheets/d/1ywaLDbpOoD8362qdb5jvCQeC60TTeip8JFmnJMBnCHc/export?format=csv'; 

    console.log("🔍 Intentando cargar tips desde:", url);

    try {
        const response = await fetch(url);
        const data = await response.text();
        
        console.log("📄 Datos brutos recibidos de la pestaña Tips:", data);

        const lines = data.trim().split('\n');
        
        // Limpiamos la base de datos antes de cargar
        tipsDatabase = [];

        tipsDatabase = lines.slice(1).map((line, index) => {
            const columns = line.split(',');
            
            // Log por si alguna línea tiene menos columnas de las esperadas
            if (columns.length < 7) {
                console.warn(`⚠️ La línea ${index + 2} del Excel parece incompleta:`, line);
            }

            const [min, max, view, mode, es, cat, en] = columns;
            return {
                min: parseFloat(min),
                max: parseFloat(max),
                view: view ? view.trim() : 'any',
                mode: mode ? mode.trim() : 'any',
                text: { 
                    es: es ? es.trim() : "", 
                    cat: cat ? cat.trim() : "", 
                    en: en ? en.trim() : "" 
                }
            };
        });

        console.log("✅ Base de datos de Tips procesada correctamente:");
        console.table(tipsDatabase); // Esto creará una tabla preciosa en tu consola

    } catch (e) {
        console.error("❌ Error fatal cargando consejos:", e);
    }
}

function buildDropdowns(lang) {
    const selects = document.querySelectorAll('select.leg-mode');
    selects.forEach(selectElement => {
        const currentSelection = selectElement.value;
        selectElement.innerHTML = `<option value="" disabled ${currentSelection === "" ? "selected" : ""} data-i18n="selectMode">${translations[lang].selectMode}</option>`;
        
        transportModes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode.id;
            option.textContent = `${mode.icon} ${mode.translations[lang]} (${mode.co2} g/km)`;
            if (mode.id === currentSelection) option.selected = true;
            selectElement.appendChild(option);
        });
    });
}

// --- 4. IDIOMAS ---
function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.language-switch button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    updateTranslations(lang);
    buildDropdowns(lang);
}

function updateTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
}

// --- 5. CÁLCULOS ---
function calculateFootprint(type) {
    const container = document.getElementById(`${type}-legs-container`);
    const legs = container.querySelectorAll('.leg-card');
    let totalKgCO2 = 0;
    let isValid = true;

    legs.forEach(leg => {
        const distInput = leg.querySelector('.leg-distance').value;
        const modeInput = leg.querySelector('.leg-mode').value;
        if (!distInput || distInput <= 0 || !modeInput) {
            isValid = false;
            return;
        }
        const distance = parseFloat(distInput);
        const emissionFactor = transportModes.find(m => m.id === modeInput).co2;
        totalKgCO2 += (distance * emissionFactor) / 1000;
    });

    if (!isValid) {
        alert(translations[currentLang].selectMode);
        return;
    }

    if (type === 'annual') {
        const days = document.getElementById('days-per-week').value || 5;
        const weeks = document.getElementById('weeks-per-year').value || 45;
        totalKgCO2 = totalKgCO2 * 2 * days * weeks;
    }
    
    lastCalculatedKg = totalKgCO2;
    document.getElementById('co2-result').textContent = `${totalKgCO2.toFixed(1)} kg CO₂`;
    updateContextMessage(totalKgCO2, type);
    
    document.getElementById('equiv-trees').textContent = (totalKgCO2 / 20).toFixed(1);
    document.getElementById('equiv-kwh').textContent = (totalKgCO2 / 0.15).toFixed(0);
    document.getElementById('equiv-km').textContent = (totalKgCO2 / 0.17).toFixed(0);

    const resultCard = document.getElementById('result-card');
    resultCard.classList.replace('result-hidden', 'result-visible');
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function updateContextMessage(kgCO2, type) {
    const contextElement = document.getElementById('context-text');
    const primaryMode = document.querySelector(`#${type}-legs-container .leg-mode`)?.value || 'any';

    let bestTip = tipsDatabase.find(t => 
        kgCO2 >= t.min && kgCO2 <= t.max && 
        (t.view === type || t.view === 'any') && 
        (t.mode === primaryMode || t.mode === 'any')
    );

    if (!bestTip) {
        bestTip = tipsDatabase.find(t => kgCO2 >= t.min && kgCO2 <= t.max && t.mode === 'any');
    }

    if (bestTip) {
        contextElement.textContent = bestTip.text[currentLang];
    } else {
        contextElement.textContent = ""; 
    }

    const threshold = (type === 'annual') ? 500 : 5; 
    if (kgCO2 < threshold) contextElement.style.color = "#166534";
    else if (kgCO2 < (threshold * 10)) contextElement.style.color = "#854d0e";
    else contextElement.style.color = "#991b1b";
}

// --- 6. SLIDERS ---
function setupSliders() {
    const syncPairs = [
        { slider: 'days-slider', number: 'days-per-week' },
        { slider: 'weeks-slider', number: 'weeks-per-year' }
    ];
    syncPairs.forEach(pair => {
        const slider = document.getElementById(pair.slider);
        const num = document.getElementById(pair.number);
        if (slider && num) {
            slider.addEventListener('input', (e) => num.value = e.target.value);
            num.addEventListener('input', (e) => {
                let val = parseInt(e.target.value);
                slider.value = val || 0; 
            });
        }
    });
}

window.onload = loadEmissionData;