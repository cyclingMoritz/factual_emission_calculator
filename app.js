// --- VARIABLES GLOBALES ---
let currentLang = 'es'; 
let lastCalculatedKg = null; 
let transportModes = []; 
let legCounter = 0; // Para dar un ID único a cada tramo que añadamos

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
        annualDesc: "Calcula tu impacto anual (ida y vuelta, 45 semanas al año).",
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
        equivKm: "km en coche",
        contextEco: "¡Genial! Tu huella es muy baja. ¡Gracias por cuidar el aire!",
        contextMid: "Buena elección. El transporte público reduce la contaminación.",
        contextHigh: "Considera opciones como el transporte público para reducir este impacto."
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
        annualDesc: "Calcula el teu impacte anual (anada i tornada, 45 setmanes a l'any).",
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
        equivKm: "km en cotxe",
        contextEco: "Genial! La teva petjada és molt baixa. Gràcies per cuidar l'aire!",
        contextMid: "Bona elecció. El transport públic redueix la contaminació.",
        contextHigh: "Considera opcions com el transport públic per reduir aquest impacte."
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
        annualDesc: "Calculate your annual impact (round trip, 45 weeks a year).",
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
        equivKm: "km by car",
        contextEco: "Great! Your footprint is very low. Thanks for keeping the air clean!",
        contextMid: "Good choice. Public transport helps reduce pollution.",
        contextHigh: "Consider options like public transport to reduce this impact."
    }
};

// --- 1. GESTIÓN DE VISTAS Y ENRUTAMIENTO ---
function goToView(viewId) {
    // Ocultar todas las vistas
    document.getElementById('view-landing').classList.replace('view-active', 'view-hidden');
    document.getElementById('view-single').classList.replace('view-active', 'view-hidden');
    document.getElementById('view-annual').classList.replace('view-active', 'view-hidden');
    
    // Ocultar resultados al cambiar de pantalla
    document.getElementById('result-card').classList.replace('result-visible', 'result-hidden');

    // Mostrar la vista solicitada
    document.getElementById(`view-${viewId}`).classList.replace('view-hidden', 'view-active');
}

function handleUrlHash() {
    const hash = window.location.hash;
    if (hash === '#evento') {
        goToView('single');
    } else if (hash === '#anual') {
        goToView('annual');
    } else {
        goToView('landing');
    }
}

// --- 2. GESTIÓN DE TRAMOS (MULTIMODALIDAD) ---
function addLeg(containerType) {
    legCounter++;
    const container = document.getElementById(`${containerType}-legs-container`);
    const isFirstLeg = container.children.length === 0;

    const legHtml = `
        <div class="leg-card" id="leg-${legCounter}">
            <div class="leg-header">
                <span class="leg-title">Tramo</span>
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
    
    // Rellenar el nuevo select con los modos de transporte y traducir
    buildDropdowns(currentLang);
    updateTranslations(currentLang);
}

function removeLeg(legId) {
    const leg = document.getElementById(legId);
    if (leg) leg.remove();
}

// --- 3. CARGAR DATOS Y CREAR DESPLEGABLES ---
async function loadEmissionData() {
    // Usamos el enlace de exportación directa a CSV
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1GoZvvJaK_v2fBLh4C8HzBHc-pRdg1IDyOFUUhxKFKCI/export?format=csv';

    try {
        const response = await fetch(sheetUrl);
        
        // Si el fetch falla (error de red o permisos)
        if (!response.ok) throw new Error('No se pudo acceder a la hoja de cálculo');

        const data = await response.text();
        const lines = data.trim().split('\n');
        
        transportModes = []; // Limpiamos para evitar duplicados

        for(let i = 1; i < lines.length; i++) {
            // Google Sheets al exportar suele usar la coma (,) como separador
            const [id, co2, icon, es, cat, en] = lines[i].split(',');
            
            if(id && co2) {
                transportModes.push({
                    id: id.trim(),
                    co2: parseFloat(co2.trim()),
                    icon: icon.trim(),
                    translations: { 
                        es: es.trim(), 
                        cat: cat.trim(), 
                        en: en.trim() 
                    }
                });
            }
        }
        
        // Inicializar el resto de la app
        setLanguage(currentLang);
        handleUrlHash();
        setupSliders();

    } catch (error) {
        console.error("Error cargando Google Sheets:", error);
        // Opcional: Cargar un backup local si falla Google
        // loadLocalBackup(); 
    }
}

function buildDropdowns(lang) {
    // Buscar todos los selects dinámicos en la página
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

    if (lastCalculatedKg !== null) updateContextMessage(lastCalculatedKg);
}

function updateTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
}

// --- 5. CÁLCULOS Y EQUIVALENCIAS ---
function calculateFootprint(type) {
    const container = document.getElementById(`${type}-legs-container`);
    const legs = container.querySelectorAll('.leg-card');
    
    let totalKgCO2 = 0;
    let isValid = true;

    // Recorrer todos los tramos (viaje multimodal)
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
        alert(currentLang === 'es' ? "Por favor, completa todos los tramos correctamente." : 
             (currentLang === 'cat' ? "Si us plau, completa tots els trams correctament." : 
             "Please complete all legs correctly."));
        return;
    }

    // Si es anual, multiplicar por días, ida/vuelta (2) y 45 semanas
    if (type === 'annual') {
        const days = document.getElementById('days-per-week').value || 5;
        const weeks = document.getElementById('weeks-per-year').value || 45;
        totalKgCO2 = totalKgCO2 * 2 * days * weeks;
    }
    
    lastCalculatedKg = totalKgCO2;

    // Mostrar resultados
    document.getElementById('co2-result').textContent = `${totalKgCO2.toFixed(1)} kg CO₂`;
    updateContextMessage(totalKgCO2);
    
    // Calcular Equivalencias
    // 1 Árbol absorbe ~20kg al año
    document.getElementById('equiv-trees').textContent = (totalKgCO2 / 20).toFixed(1);
    // Mix eléctrico España ~0.15 kg/kWh
    document.getElementById('equiv-kwh').textContent = (totalKgCO2 / 0.15).toFixed(0);
    // Coche combustión a 170g/km (0.17kg/km)
    document.getElementById('equiv-km').textContent = (totalKgCO2 / 0.17).toFixed(0);

    const resultCard = document.getElementById('result-card');
    resultCard.classList.replace('result-hidden', 'result-visible');
    
    // Hacer scroll hacia el resultado en móviles
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function updateContextMessage(kgCO2) {
    const contextElement = document.getElementById('context-text');
    // Ajustar umbrales según si es un viaje o anual. 
    // Como simplificación visual, usamos el valor absoluto.
    if (kgCO2 < 5) {
        contextElement.textContent = translations[currentLang].contextEco;
        contextElement.style.color = "#166534"; 
    } else if (kgCO2 < 50) {
        contextElement.textContent = translations[currentLang].contextMid;
        contextElement.style.color = "#854d0e"; 
    } else {
        contextElement.textContent = translations[currentLang].contextHigh;
        contextElement.style.color = "#991b1b"; 
    }
}

// --- 6. SINCRONIZAR SLIDERS Y NÚMEROS ---
function setupSliders() {
    const syncPairs = [
        { slider: 'days-slider', number: 'days-per-week' },
        { slider: 'weeks-slider', number: 'weeks-per-year' }
    ];

    syncPairs.forEach(pair => {
        const slider = document.getElementById(pair.slider);
        const num = document.getElementById(pair.number);

        if (slider && num) {
            // Si mueven el slider, se actualiza el número
            slider.addEventListener('input', (e) => num.value = e.target.value);
            
            // Si escriben el número manualmente, se mueve el slider
            num.addEventListener('input', (e) => {
                let val = parseInt(e.target.value);
                const min = parseInt(num.min);
                const max = parseInt(num.max);
                
                // Evitamos que metan valores locos (como 900 días por semana)
                if (val < min) val = min;
                if (val > max) val = max;
                
                slider.value = val || min; 
            });
        }
    });
}
// --- ARRANQUE ---
window.onload = loadEmissionData;