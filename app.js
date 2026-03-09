// --- VARIABLES GLOBALES ---
let currentLang = 'es'; 
let lastCalculatedKg = null; 
let transportModes = []; // Aquí se guardarán los datos del CSV

// --- DICCIONARIO DE IDIOMAS (Solo para la interfaz estática) ---
// Nota: Los nombres de los transportes ahora viven en el archivo modes.csv
const translations = {
    es: {
        title: "Huella de Movilidad",
        description: "Calcula las emisiones de CO₂ de tu viaje al evento de hoy.",
        distanceLabel: "Distancia recorrida (km):",
        modeLabel: "Medio de transporte:",
        selectMode: "Selecciona una opción...",
        calculateBtn: "Calcular Huella",
        resultTitle: "Tu impacto:",
        contextEco: "¡Genial! Tu medio de transporte es de muy bajo impacto. ¡Gracias por cuidar el aire de Barcelona!",
        contextMid: "Buena elección. El transporte público ayuda a reducir el tráfico y la contaminación en la ciudad.",
        contextHigh: "Si es posible, considera opciones como el Metro, Rodalies o compartir coche para futuros trayectos."
    },
    cat: {
        title: "Petjada de Mobilitat",
        description: "Calcula les emissions de CO₂ del teu viatge a l'esdeveniment d'avui.",
        distanceLabel: "Distància recorreguda (km):",
        modeLabel: "Mitjà de transport:",
        selectMode: "Selecciona una opció...",
        calculateBtn: "Calcular Petjada",
        resultTitle: "El teu impacte:",
        contextEco: "Genial! El teu mitjà de transport és de molt baix impacte. Gràcies per cuidar l'aire de Barcelona!",
        contextMid: "Bona elecció. El transport públic ajuda a reduir el trànsit i la contaminació a la ciutat.",
        contextHigh: "Si és possible, considera opcions com el Metro, Rodalies o compartir cotxe per a futurs trajectes."
    },
    en: {
        title: "Mobility Footprint",
        description: "Calculate the CO₂ emissions of your trip to today's event.",
        distanceLabel: "Distance traveled (km):",
        modeLabel: "Transport mode:",
        selectMode: "Select an option...",
        calculateBtn: "Calculate Footprint",
        resultTitle: "Your impact:",
        contextEco: "Great! Your transport mode has a very low impact. Thank you for keeping Barcelona's air clean!",
        contextMid: "Good choice. Public transport helps reduce traffic and pollution in the city.",
        contextHigh: "If possible, consider options like the Metro, Rodalies, or carpooling for future trips."
    }
};

// --- 1. CARGAR DATOS DESDE EL CSV ---
async function loadEmissionData() {
    try {
        const response = await fetch('modes.csv');
        const data = await response.text();
        
        const lines = data.trim().split('\n');
        
        // Leer a partir de la línea 1 (saltando los encabezados)
        for(let i = 1; i < lines.length; i++) {
            // Usamos punto y coma (;) para separar
            const [id, co2, icon, es, cat, en] = lines[i].split(';');
            
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
        
        console.log("Modos de transporte cargados:", transportModes);
        
        // Inicializar la página en español una vez cargados los datos
        setLanguage('es');

    } catch (error) {
        console.error("Error al cargar modes.csv:", error);
        alert("Hubo un problema cargando los modos de transporte. Verifica que el archivo modes.csv exista.");
    }
}

// --- 2. CONSTRUIR EL MENÚ DESPLEGABLE DINÁMICAMENTE ---
function buildDropdown(lang) {
    const selectElement = document.getElementById('mode');
    
    // Guardar la opción actual seleccionada (si la hay)
    const currentSelection = selectElement.value;
    
    // Limpiar el menú (dejando solo la opción por defecto)
    selectElement.innerHTML = `<option value="" disabled ${currentSelection === "" ? "selected" : ""} data-i18n="selectMode">${translations[lang].selectMode}</option>`;
    
    // Crear una opción nueva por cada línea del CSV
    transportModes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode.id;
        // Formato visual: 🚇 Metro TMB (28 g/km)
        option.textContent = `${mode.icon} ${mode.translations[lang]} (${mode.co2} g/km)`;
        
        // Mantener seleccionado lo que el usuario ya había elegido al cambiar de idioma
        if (mode.id === currentSelection) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

// --- 3. CAMBIAR EL IDIOMA DE LA INTERFAZ ---
function setLanguage(lang) {
    currentLang = lang;
    
    // Cambiar estilos de los botones de idioma
    document.querySelectorAll('.language-switch button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');

    // Traducir los textos estáticos de la interfaz (título, botón, etc.)
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Actualizar el menú desplegable con el nuevo idioma
    buildDropdown(lang);

    // Si ya hay un resultado en pantalla, actualizar el texto de contexto
    if (lastCalculatedKg !== null) {
        updateContextMessage(lastCalculatedKg);
    }
}

// --- 4. CALCULAR LA HUELLA ---
function calculateFootprint() {
    const distanceInput = document.getElementById('distance').value;
    const modeSelect = document.getElementById('mode').value;

    // Validación
    if (!distanceInput || distanceInput <= 0 || !modeSelect) {
        let alertMsg = "Por favor, introduce una distancia válida y selecciona un transporte.";
        if (currentLang === 'cat') alertMsg = "Si us plau, introdueix una distància vàlida i selecciona un transport.";
        if (currentLang === 'en') alertMsg = "Please enter a valid distance and select a transport mode.";
        alert(alertMsg);
        return;
    }

    // Encontrar el modo de transporte seleccionado en nuestra base de datos dinámica
    const selectedModeData = transportModes.find(m => m.id === modeSelect);
    const emissionFactor = selectedModeData.co2;
    
    // Cálculo final
    const distance = parseFloat(distanceInput);
    const totalKgCO2 = (distance * emissionFactor) / 1000;
    
    lastCalculatedKg = totalKgCO2;

    // Mostrar resultado
    document.getElementById('co2-result').textContent = `${totalKgCO2.toFixed(2)} kg CO₂`;
    updateContextMessage(totalKgCO2);

    const resultCard = document.getElementById('result-card');
    resultCard.classList.remove('result-hidden');
    resultCard.classList.add('result-visible');
}

// --- 5. ACTUALIZAR MENSAJE DE CONTEXTO ---
function updateContextMessage(kgCO2) {
    const contextElement = document.getElementById('context-text');
    
    if (kgCO2 === 0 || kgCO2 < 0.5) {
        contextElement.textContent = translations[currentLang].contextEco;
        contextElement.style.color = "#166534"; 
    } else if (kgCO2 < 2.0) {
        contextElement.textContent = translations[currentLang].contextMid;
        contextElement.style.color = "#854d0e"; 
    } else {
        contextElement.textContent = translations[currentLang].contextHigh;
        contextElement.style.color = "#991b1b"; 
    }
}

// Inicializar la app cargando los datos del CSV al abrir la página
window.onload = loadEmissionData;