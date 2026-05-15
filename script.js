let graphData = null;
let currentStep = 0;
let currentPath = [];

async function loadGraphData() {
    const res = await fetch('data/graph.json');
    graphData = await res.json();
    setupAutocomplete();
}

function setupAutocomplete() {
    const allRooms = [];

    for (let f in graphData.buildings.new.floors)
        allRooms.push(...graphData.buildings.new.floors[f]);
    for (let f in graphData.buildings.old.wings.A.floors)
        allRooms.push(...graphData.buildings.old.wings.A.floors[f]);

    let datalist = document.getElementById('auditories-list');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'auditories-list';
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = '';
    allRooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        datalist.appendChild(opt);
    });
}

function getImageForNode(node) {
    const c = graphData.coordinates[node];
    if (!c) return null;

    if (c.building === 'new') return `/assets/maps/new_${c.floor}.jpg`;
    if (c.building === 'old') return `/assets/maps/old_${c.floor}A.jpg`;
    if (c.building === 'transition') return `/assets/maps/transition_old_new.png`;
    return null;
}

function drawStep(container, fromNode, toNode, imageSrc, isFirst, isLast, onNext) {
    const fromCoord = graphData.coordinates[fromNode];
    const toCoord = graphData.coordinates[toNode];
    if (!fromCoord || !toCoord) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        ctx.beginPath();
        ctx.moveTo(fromCoord.x, fromCoord.y);
        ctx.lineTo(toCoord.x, toCoord.y);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = 'bold 16px sans-serif';
        if (isFirst) {
            ctx.fillStyle = '#2196F3';
            ctx.fillText('🚩 Вы', fromCoord.x + 10, fromCoord.y - 6);
        }
        if (isLast) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillText('🏁', toCoord.x + 10, toCoord.y - 6);
        }

        container.innerHTML = '';
        container.appendChild(canvas);

        if (onNext) {
            const btn = document.createElement('button');
            btn.textContent = '→ Дальше';
            btn.style.marginTop = '16px';
            btn.onclick = onNext;
            container.appendChild(btn);
        }
    };
}

function startNavigation(startNode, endNode) {
    const path = [startNode, endNode];
    const steps = [];

    // Новый корпус: 0208 → exit_new_to_transition
    steps.push({
        from: "0208",
        to: "exit_new_to_transition",
        image: getImageForNode("0208"),
        isFirst: true,
        isLast: false
    });

    // Переход: enter_transition_from_new → exit_transition_to_old
    steps.push({
        from: "enter_transition_from_new",
        to: "exit_transition_to_old",
        image: getImageForNode("enter_transition_from_new"),
        isFirst: false,
        isLast: false
    });

    // Старый корпус: enter_old_from_transition → ТП-8 ЛТТО ЦТМ
    steps.push({
        from: "enter_old_from_transition",
        to: "ТП-8 ЛТТО ЦТМ",
        image: getImageForNode("enter_old_from_transition"),
        isFirst: false,
        isLast: true
    });

    currentPath = steps;
    currentStep = 0;
    showStep();
}

function showStep() {
    const container = document.getElementById('mapContainer');
    if (!container) return;
    const step = currentPath[currentStep];
    if (!step) return;

    drawStep(container, step.from, step.to, step.image, step.isFirst, step.isLast, () => {
        if (currentStep + 1 < currentPath.length) {
            currentStep++;
            showStep();
        }
    });
}

// Обработчики
document.getElementById('findBtn').addEventListener('click', async () => {
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    if (!from || !to) return alert('Введите обе аудитории');
    if (!graphData) await loadGraphData();

    startNavigation(from, to);
    document.getElementById('result').style.display = 'block';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('mapContainer').innerHTML = '';
    currentPath = [];
    currentStep = 0;
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

loadGraphData();
