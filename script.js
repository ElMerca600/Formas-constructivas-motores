const iecCodes = [
    // GRUPO A: EJE HORIZONTAL
    { code1: "B3", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje sobre patas en la base. (Estándar industrial).", type: "Foot" },
    { code1: "B5", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje por brida grande (agujeros pasantes). Sin patas.", type: "Flange", flangeSize: "large" },
    { code1: "B14", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje por brida pequeña (agujeros roscados). Sin patas.", type: "Face", flangeSize: "small" },
    { code1: "B35", group: "A", axis: "horizontal", desc: "Eje Horizontal. Combinado: Montaje sobre patas y brida grande (B5).", type: "Foot/Flange", flangeSize: "large" },
    { code1: "B34", group: "A", axis: "horizontal", desc: "Eje Horizontal. Combinado: Montaje sobre patas y brida pequeña (B14).", type: "Foot/Face", flangeSize: "small" },
    { code1: "B6", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje en pared, patas a la izquierda (visto desde acople).", type: "Foot", wall: "left" },
    { code1: "B7", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje en pared, patas a la derecha (visto desde acople).", type: "Foot", wall: "right" },
    { code1: "B8", group: "A", axis: "horizontal", desc: "Eje Horizontal. Montaje en techo, patas hacia arriba.", type: "Foot", wall: "top" },
    
    // GRUPO B: EJE VERTICAL
    { code1: "V1", group: "B", axis: "vertical_down", desc: "Eje Vertical hacia ABAJO. Montaje por brida grande. (Requiere sombrerete).", type: "Flange", flangeSize: "large" },
    { code1: "V3", group: "B", axis: "vertical_up", desc: "Eje Vertical hacia ARRIBA. Montaje por brida grande. (Requiere sello de aceite).", type: "Flange", flangeSize: "large" },
    { code1: "V5", group: "B", axis: "vertical_down", desc: "Eje Vertical hacia ABAJO. Montaje sobre patas fijadas a la pared.", type: "Foot" },
    { code1: "V6", group: "B", axis: "vertical_up", desc: "Eje Vertical hacia ARRIBA. Montaje sobre patas fijadas a la pared.", type: "Foot" },
    { code1: "V15", group: "B", axis: "vertical_down", desc: "Eje Vertical hacia ABAJO. Combinado: Patas en pared y brida grande.", type: "Foot/Flange", flangeSize: "large" },
    { code1: "V18", group: "B", axis: "vertical_down", desc: "Eje Vertical hacia ABAJO. Montaje por brida pequeña (B14).", type: "Face", flangeSize: "small" },
    { code1: "V19", group: "B", axis: "vertical_up", desc: "Eje Vertical hacia ARRIBA. Montaje por brida pequeña (B14).", type: "Face", flangeSize: "small" }
];

document.addEventListener('DOMContentLoaded', () => {
    const mountSelect = document.getElementById('mountSelect');
    const boxPositionRadio = document.getElementsByName('boxPosition');
    const cableSegmentBtns = document.querySelectorAll('.segment-btn');
    const svgContainer = document.getElementById('motorSvgContainer');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    const warningBox = document.getElementById('validationWarning');
    const warningText = document.getElementById('warningText');
    const descMotor = document.getElementById('descMotor');

    let currentRotation = 0;

    // Populate Select HTML
    const optGroupA = mountSelect.querySelector('optgroup[label="GRUPO A: EJE HORIZONTAL (IEC 60034-7)"]');
    const optGroupB = mountSelect.querySelector('optgroup[label="GRUPO B: EJE VERTICAL (IEC 60034-7)"]');
    
    iecCodes.forEach(code => {
        const option = document.createElement('option');
        option.value = code.code1;
        option.textContent = `IM ${code.code1}`;
        if (code.group === "A") {
            optGroupA.appendChild(option);
        } else {
            optGroupB.appendChild(option);
        }
    });

    // Event Listeners
    mountSelect.addEventListener('change', updateAll);
    
    boxPositionRadio.forEach(radio => {
        radio.addEventListener('change', updateAll);
    });

    cableSegmentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            cableSegmentBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentRotation = parseInt(e.target.dataset.value);
            updateAll();
        });
    });

    copyBtn.addEventListener('click', () => {
        const text = outputText.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>¡Copiado!</span>`;
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    });

    function getSelectedValues() {
        const mountCode = mountSelect.value;
        const iec = iecCodes.find(c => c.code1 === mountCode);
        const position = Array.from(boxPositionRadio).find(r => r.checked).value;
        return { iec, position, rotation: currentRotation };
    }

    function checkValidation(vals) {
        let warnings = [];

        // Evaluando grupo y direcciones de eje
        if (vals.iec.group === "B") {
            warnings.push("⚠️ ALTA CARGA AXIAL. Verificar rodamientos. Posible necesidad de rodamiento de contacto angular (Cód. 7000) según catálogo WEG/Siemens.");
            if (vals.iec.axis === "vertical_down") {
                warnings.push("⚠️ PROTECCIÓN IP. Instalar sombrerete (Canopy) para evitar entrada de partículas al ventilador (IEC 60034-5).");
            }
            if (vals.iec.axis === "vertical_up") {
                warnings.push("⚠️ ESTANQUEIDAD. Instalar retén de aceite (Oil Seal) para evitar ingreso de fluidos al rodamiento delantero por gravedad.");
            }
        }

        if (warnings.length > 0) {
            warningText.innerHTML = warnings.map(w => `<div>${w}</div>`).join("");
            warningBox.classList.remove('hidden');
        } else {
            warningBox.classList.add('hidden');
        }
        
        descMotor.textContent = vals.iec.desc;
    }

    function renderOutput(vals) {
        let posText = "Superior (0° / Top)";
        if(vals.position === "R") posText = "Derecha (90° / Right)";
        if(vals.position === "L") posText = "Izquierda (270° / Left)";

        const text = `**Designación:** Motor Asíncrono BT
**Forma Constructiva:** IM ${vals.iec.code1}
**Descripción:** ${vals.iec.desc}
**Caja de Bornes:** Posición ${vals.position} [${posText}] visto desde drive end.
**Entrada de Cables:** Orientada a ${vals.rotation}° de la posición de caja.
**Normativa Aplicada:** IEC 60034-7 (Montaje) / IEC 60072-1 (Dim) / IEC 60034-8 (Conex)`;
        
        outputText.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (window.MathJax) { 
            MathJax.typesetPromise(); 
        }
    }

    function drawMotorSVG(vals) {
        // Pseudo-isometric Side Profile drawing
        // This effectively shows the true layout geometry.
        let svg = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">`;
        
        // Groups for rotation context
        let mainRotation = 0;
        if (vals.iec.axis === "vertical_down") { mainRotation = -90; }
        if (vals.iec.axis === "vertical_up") { mainRotation = 90; }

        const cx = 250;
        const cy = 250;
        
        svg += `<g transform="rotate(${mainRotation}, ${cx}, ${cy})">`;
        
        // Motor Body (Cylinder profile)
        svg += `<rect x="150" y="170" width="200" height="160" rx="10" fill="#1e293b" stroke="#475569" stroke-width="4"/>`;
        svg += `<line x1="170" y1="170" x2="170" y2="330" stroke="#334155" stroke-width="2"/>`;
        svg += `<line x1="330" y1="170" x2="330" y2="330" stroke="#334155" stroke-width="2"/>`;

        // Shaft (Drive End context is Left for side-views)
        svg += `<rect x="70" y="235" width="80" height="30" fill="#94a3b8" stroke="#334155" stroke-width="2"/>`;
        svg += `<rect x="80" y="230" width="20" height="5" fill="#cbd5e1"/>`; // keyway hint

        // Flange (D-End)
        if (vals.iec.type.includes("Flange") || vals.iec.type.includes("Face")) {
            const fH = vals.iec.flangeSize === "large" ? 220 : 160;
            const fY = cx - (fH/2);
            svg += `<rect x="130" y="${fY}" width="20" height="${fH}" rx="4" fill="#334155" stroke="#475569" stroke-width="4"/>`;
        }

        // Feet (Base orientation)
        if (vals.iec.type.includes("Foot")) {
            let feetY = 330; 
            let rotateFeet = 0;
            if (vals.iec.wall === "left") { rotateFeet = -90; }    // Wall left
            if (vals.iec.wall === "right") { rotateFeet = 90; }     // Wall right
            if (vals.iec.wall === "top") { rotateFeet = 180; }      // Ceiling
            if (vals.iec.wall === "side") { rotateFeet = 90; }      // Wall vertical

            svg += `<g transform="rotate(${rotateFeet}, ${cx}, ${cy})">`;
            // Draw feet at the "bottom"
            svg += `<path d="M 180 330 L 160 360 L 340 360 L 320 330 Z" fill="#1e293b" stroke="#475569" stroke-width="4" stroke-linejoin="round"/>`;
            svg += `<rect x="140" y="360" width="220" height="8" fill="#475569" />`; // Ground indicator
            svg += `</g>`;
        }

        // Terminal Box
        // On side view, Top is y=110, Right is towards us (centered), Left is away from us.
        let boxX = 220, boxY = 170, boxW = 80, boxH = 50;
        let pStroke = "#0284c7";
        let pFill = "#0ea5e9";
        
        if (vals.position === "T") {
            boxY = 120;
        } else if (vals.position === "R") {
            boxY = 210; boxH = 80;
            pFill = "rgba(14, 165, 233, 0.9)"; // Front projection
        } else if (vals.position === "L") {
            boxY = 210; boxH = 80;
            pFill = "rgba(14, 165, 233, 0.4)"; // Back projection
            pStroke = "rgba(2, 132, 199, 0.4)";
        }

        svg += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="4" fill="${pFill}" stroke="${pStroke}" stroke-width="4"/>`;

        // Cable entry represented by a small extension based on rotation (0,90,180,270)
        let cxBox = boxX + boxW/2;
        let cyBox = boxY + boxH/2;
        svg += `<g transform="rotate(${vals.rotation}, ${cxBox}, ${cyBox})">`;
        svg += `<rect x="${cxBox-15}" y="${boxY-15}" width="30" height="15" fill="#475569"/>`;
        svg += `<path d="M ${cxBox} ${boxY-15} L ${cxBox} ${boxY-50}" stroke="#f43f5e" stroke-width="8" stroke-linecap="round"/>`;
        svg += `</g>`;
        
        svg += `</g>`;
        svg += `</svg>`;
        
        svgContainer.innerHTML = svg;
    }

    function updateAll() {
        const vals = getSelectedValues();
        checkValidation(vals);
        renderOutput(vals);
        drawMotorSVG(vals);
    }

    // Init
    updateAll();
});
