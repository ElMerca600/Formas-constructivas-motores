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
        // Realistic side-profile of a three-phase squirrel-cage induction motor:
        // finned frame, NDE fan cover, DE end-shield, shaft with keyway,
        // flange with bolt circle, feet with fixing holes, detailed terminal box.
        let svg = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">`;

        svg += `<defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="18%" stop-color="#475569"/>
                <stop offset="55%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#1a2333"/>
            </linearGradient>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#e2e8f0"/>
                <stop offset="35%" stop-color="#cbd5e1"/>
                <stop offset="75%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#64748b"/>
            </linearGradient>
            <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#1a2333"/>
            </linearGradient>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="7" stroke="#334155" stroke-width="3"/>
            </pattern>
        </defs>`;

        // Groups for rotation context
        let mainRotation = 0;
        if (vals.iec.axis === "vertical_down") { mainRotation = -90; }
        if (vals.iec.axis === "vertical_up") { mainRotation = 90; }

        const cx = 250;
        const cy = 250;

        svg += `<g transform="rotate(${mainRotation}, ${cx}, ${cy})">`;

        // ---- Mounting feet (drawn behind the body) ----
        if (vals.iec.type.includes("Foot")) {
            let rotateFeet = 0;
            if (vals.iec.wall === "left") { rotateFeet = -90; }    // Wall left
            if (vals.iec.wall === "right") { rotateFeet = 90; }     // Wall right
            if (vals.iec.wall === "top") { rotateFeet = 180; }      // Ceiling

            svg += `<g transform="rotate(${rotateFeet}, ${cx}, ${cy})">`;
            svg += `<rect x="150" y="344" width="190" height="12" fill="url(#hatch)" stroke="#1e293b" stroke-width="1"/>`; // mounting surface
            svg += `<path d="M 175 328 L 195 328 L 215 344 L 155 344 Z" fill="url(#bodyGrad)" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>`;
            svg += `<circle cx="172" cy="337" r="4" fill="#0f172a"/>`;
            svg += `<circle cx="198" cy="337" r="4" fill="#0f172a"/>`;
            svg += `<path d="M 315 328 L 295 328 L 275 344 L 335 344 Z" fill="url(#bodyGrad)" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>`;
            svg += `<circle cx="318" cy="337" r="4" fill="#0f172a"/>`;
            svg += `<circle cx="292" cy="337" r="4" fill="#0f172a"/>`;
            svg += `</g>`;
        }

        // ---- Frame (finned cylindrical body) ----
        svg += `<rect x="150" y="176" width="190" height="152" rx="10" fill="url(#bodyGrad)" stroke="#0f172a" stroke-width="3"/>`;
        for (let fy = 186; fy <= 312; fy += 15) {
            svg += `<rect x="152" y="${fy}" width="186" height="4" rx="2" fill="#1a2333" opacity="0.55"/>`;
            svg += `<rect x="152" y="${fy - 2}" width="186" height="2" rx="1" fill="#7c8ba1" opacity="0.45"/>`;
        }
        // Nameplate
        svg += `<rect x="205" y="242" width="80" height="26" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>`;
        svg += `<line x1="212" y1="250" x2="278" y2="250" stroke="#64748b" stroke-width="2"/>`;
        svg += `<line x1="212" y1="257" x2="260" y2="257" stroke="#64748b" stroke-width="2"/>`;
        svg += `<line x1="212" y1="264" x2="270" y2="264" stroke="#64748b" stroke-width="1.2"/>`;

        // ---- NDE fan cover ----
        svg += `<path d="M 340 178 Q 400 178 400 252 Q 400 326 340 326 Z" fill="url(#capGrad)" stroke="#0f172a" stroke-width="3"/>`;
        svg += `<path d="M 352 200 Q 390 252 352 304" fill="none" stroke="#1a2333" stroke-width="3" opacity="0.6"/>`;
        svg += `<path d="M 362 195 Q 396 252 362 309" fill="none" stroke="#1a2333" stroke-width="3" opacity="0.5"/>`;
        svg += `<path d="M 372 192 Q 400 252 372 312" fill="none" stroke="#1a2333" stroke-width="2.5" opacity="0.4"/>`;
        svg += `<circle cx="340" cy="252" r="5" fill="#0f172a"/>`;

        // ---- DE end-shield / bearing housing ----
        svg += `<rect x="118" y="212" width="40" height="80" rx="10" fill="url(#capGrad)" stroke="#0f172a" stroke-width="3"/>`;

        // ---- Flange (D-End mounting disc, edge-on with bolt circle) ----
        if (vals.iec.type.includes("Flange") || vals.iec.type.includes("Face")) {
            const fH = vals.iec.flangeSize === "large" ? 230 : 168;
            const fY = cy - (fH / 2);
            svg += `<rect x="108" y="${fY}" width="22" height="${fH}" rx="8" fill="url(#metalGrad)" stroke="#334155" stroke-width="3"/>`;
            const boltCount = 6;
            for (let i = 0; i < boltCount; i++) {
                const by = fY + 14 + (i * (fH - 28) / (boltCount - 1));
                svg += `<circle cx="119" cy="${by}" r="3.5" fill="#334155"/>`;
            }
        }

        // ---- Shaft (Drive End, protrudes to the left) ----
        svg += `<rect x="60" y="238" width="60" height="28" fill="url(#metalGrad)" stroke="#334155" stroke-width="2"/>`;
        svg += `<rect x="60" y="238" width="60" height="6" fill="#f1f5f9" opacity="0.6"/>`;
        svg += `<rect x="72" y="233" width="26" height="6" rx="1" fill="#334155"/>`; // keyway
        svg += `<path d="M 60 238 L 52 244 L 52 260 L 60 266 Z" fill="url(#metalGrad)" stroke="#334155" stroke-width="2"/>`;

        // ---- Terminal Box ----
        // On side view, Top is y=110, Right is towards us (centered), Left is away from us.
        let boxX = 215, boxY = 176, boxW = 90, boxH = 46;
        let pOpacity = 1;

        if (vals.position === "T") {
            boxY = 110;
        } else if (vals.position === "R") {
            boxY = 205; boxH = 90; // Front projection
        } else if (vals.position === "L") {
            boxY = 205; boxH = 90; pOpacity = 0.45; // Back projection (hidden face)
        }

        svg += `<g opacity="${pOpacity}">`;
        svg += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="6" fill="url(#boxGrad)" stroke="#0284c7" stroke-width="3"/>`;
        svg += `<line x1="${boxX}" y1="${boxY + boxH * 0.32}" x2="${boxX + boxW}" y2="${boxY + boxH * 0.32}" stroke="#0284c7" stroke-width="2"/>`; // lid parting line
        svg += `<circle cx="${boxX + 8}" cy="${boxY + 8}" r="2.5" fill="#0c4a6e"/>`;
        svg += `<circle cx="${boxX + boxW - 8}" cy="${boxY + 8}" r="2.5" fill="#0c4a6e"/>`;
        svg += `<circle cx="${boxX + 8}" cy="${boxY + boxH - 8}" r="2.5" fill="#0c4a6e"/>`;
        svg += `<circle cx="${boxX + boxW - 8}" cy="${boxY + boxH - 8}" r="2.5" fill="#0c4a6e"/>`;

        // Cable entry represented by a gland extension based on rotation (0,90,180,270)
        let cxBox = boxX + boxW / 2;
        let cyBox = boxY + boxH / 2;
        svg += `<g transform="rotate(${vals.rotation}, ${cxBox}, ${cyBox})">`;
        svg += `<rect x="${cxBox - 12}" y="${boxY - 14}" width="24" height="14" rx="3" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>`;
        svg += `<rect x="${cxBox - 6}" y="${boxY - 34}" width="12" height="22" rx="4" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>`;
        svg += `<path d="M ${cxBox} ${boxY - 34} L ${cxBox} ${boxY - 58}" stroke="#f43f5e" stroke-width="7" stroke-linecap="round"/>`;
        svg += `</g>`;
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
