// =====================================================================
// ⚙️ ZONA DE CONFIGURACIÓN (Para revisión de supervisores)
// =====================================================================
// Estos son los factores de emisión en gramos de CO2 por kilómetro (g/km).
// Si se obtienen datos locales más exactos para Barcelona, solo hay que 
// cambiar los números aquí. El resto de la app se actualizará sola.

const EMISSION_FACTORS = {
    "walking": 0,    // A pie, Bicing, Patinete
    "metro": 28,     // Metro TMB
    "tram": 29,      // Trambaix / Trambesòs
    "train": 35,     // Rodalies / FGC
    "ev": 47,        // Coche Eléctrico
    "bus": 79,       // Autobús TMB
    "moto": 114,     // Moto
    "car": 170       // Coche Combustión (1 pasajero)
};

// =====================================================================
// 🛑 FIN DE LA ZONA DE CONFIGURACIÓN (No modificar a partir de aquí)
// =====================================================================


// --- DICCIONARIO DE IDIOMAS (Español / Catalán / Inglés) ---
const translations = {
    es: {
        title: "Huella de Movilidad",
        description: "Calcula las emisiones de CO₂ de tu viaje al evento de hoy.",
        distanceLabel: "Distancia recorrida (km):",
        modeLabel: "Medio de transporte:",
        selectMode: "Selecciona una opción...",
        modeWalking: "🚶 A pie / Bicing / Patinete (0 g/km)",
        modeMetro: "🚇 Metro TMB (28 g/km)",
        modeTram: "🚈 Trambaix / Trambesòs (29 g/km)",
        modeTrain: "🚆 Rodalies / FGC (35 g/km)",
        modeEV: "⚡ Coche Eléctrico (47 g/km)",
        modeBus: "🚌 Autobús TMB (79 g/km)",
        modeMoto: "🛵 Moto (114 g/km)",
        modeCar: "🚗 Coche Combustión (170 g/km)",
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
        modeWalking: "🚶 A peu / Bicing / Patinet (0 g/km)",
        modeMetro: "🚇 Metro TMB (28 g/km)",
        modeTram: "🚈 Trambaix / Trambesòs (29 g/km)",
        modeTrain: "🚆 Rodalies / FGC (35 g/km)",
        modeEV: "⚡ Cotxe Elèctric (47 g/km)",
        modeBus: "🚌 Autobús TMB (79 g/km)",
        modeMoto: "🛵 Moto (114 g/km)",
        modeCar: "🚗 Cotxe Combustió (170 g/km)",
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
        modeWalking: "🚶 Walking / Bicing / E-scooter (0 g/km)",
        modeMetro: "🚇 TMB Metro (28 g/km)",
        modeTram: "🚈 Trambaix / Trambesòs (29 g/km)",
        modeTrain: "🚆 Rodalies / FGC Train (35 g/km)",
        modeEV: "⚡ Electric Car (47 g/km)",
        modeBus: "🚌 TMB Bus (79 g/km)",
        modeMoto: "🛵 Motorcycle (114 g/km)",
        modeCar: "🚗 Combustion Car (170 g/km)",
        calculateBtn: "Calculate Footprint",
        resultTitle: "Your impact:",
        contextEco: "Great! Your transport mode has a very low impact. Thank you for keeping Barcelona's air clean!",
        contextMid: "Good choice. Public transport helps reduce traffic and pollution in the city.",
        contextHigh: "If possible, consider options like the Metro, Rodalies, or carpooling for future trips."
    }
};

let currentLang = 'es'; // Idioma por defecto
let lastCalculatedKg = null; // Para recordar el cálculo si cambian de idioma

// --- FUNCIÓN PARA CAMBIAR EL IDIOMA ---
function setLanguage(lang) {
    currentLang = lang;
    
    // Cambiar estilos de los botones de idioma (La versión mejorada)
    // 1. Quitamos la clase 'active' de TODOS los botones
    document.querySelectorAll('.language-switch button').forEach(btn => {
        btn.classList.remove('active');
    });
    // 2. Se la ponemos solo al botón que acabas de hacer clic
    document.getElementById(`lang-${lang}`).classList.add('active');

    // Traducir todos los elementos con la etiqueta data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Si ya hay un resultado en pantalla, actualizar el texto de contexto
    if (lastCalculatedKg !== null) {
        updateContextMessage(lastCalculatedKg);
    }
}
// --- FUNCIÓN PRINCIPAL DE CÁLCULO ---
function calculateFootprint() {
    const distanceInput = document.getElementById('distance').value;
    const modeSelect = document.getElementById('mode').value;

    // Validación básica
    if (!distanceInput || distanceInput <= 0 || !modeSelect) {
        let alertMsg = "Por favor, introduce una distancia válida y selecciona un transporte.";
        if (currentLang === 'cat') alertMsg = "Si us plau, introdueix una distància vàlida i selecciona un transport.";
        if (currentLang === 'en') alertMsg = "Please enter a valid distance and select a transport mode.";
        alert(alertMsg);
        return;
    }

    // El cálculo: (Distancia * Factor de Emisión) / 1000 = kg de CO2
    const distance = parseFloat(distanceInput);
    const emissionFactor = EMISSION_FACTORS[modeSelect];
    const totalKgCO2 = (distance * emissionFactor) / 1000;
    
    // Guardamos el resultado por si cambian de idioma
    lastCalculatedKg = totalKgCO2;

    // Mostrar el resultado en pantalla (redondeado a 2 decimales)
    document.getElementById('co2-result').textContent = `${totalKgCO2.toFixed(2)} kg CO₂`;
    updateContextMessage(totalKgCO2);

    // Hacer visible la tarjeta de resultados con la animación
    const resultCard = document.getElementById('result-card');
    resultCard.classList.remove('result-hidden');
    resultCard.classList.add('result-visible');
}

// --- FUNCIÓN PARA EL MENSAJE DE CONTEXTO ---
function updateContextMessage(kgCO2) {
    const contextElement = document.getElementById('context-text');
    
    // Asignar un mensaje dependiendo del impacto (los umbrales son de ejemplo)
    if (kgCO2 === 0 || kgCO2 < 0.5) {
        contextElement.textContent = translations[currentLang].contextEco;
        contextElement.style.color = "#166534"; // Verde oscuro
    } else if (kgCO2 < 2.0) {
        contextElement.textContent = translations[currentLang].contextMid;
        contextElement.style.color = "#854d0e"; // Naranja/Marrón para avisar
    } else {
        contextElement.textContent = translations[currentLang].contextHigh;
        contextElement.style.color = "#991b1b"; // Rojo suave para impacto alto
    }
}

// Inicializar la página en español al cargar
window.onload = () => setLanguage('es');