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

    // Новый корпус
    for (let f in graphData.buildings.new.floors) {
        allRooms.push(...graphData.buildings.new.floors[f]);
    }

    // Старый корпус А
    for (let f in graphData.buildings.old.wings.A.floors) {
        allRooms.push(...graphData.buildings.old.wings.A.floors[f]);
    }

    const datalist = document.getElementById('auditories-list') || (() => {
        const dl = document.createElement('datalist');
        dl.id = 'auditories-list';
        document.body.appendChild(dl);
        return dl;
    })();

    datalist.innerHTML = '';
    allRooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        datalist.appendChild(opt);
    });
}

function findPath(start, end) {
    const paths = graphData.paths;
    const queue = [[start]];
    const visited = new Set();

    while (queue.length) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === end) return path;
        if (visited.has(node)) continue;
        visited.add(node);
        for (const next of paths[node] || []) {
            if (!visited.has(next)) queue.push([...path, next]);
        }
    }
    return null;
}

function getImageForNode(node) {
    const c = graphData.coordinates[node];
    if (!c) return null;

    if (c.building === 'new') return `/assets/maps/new_${c.floor}.jpg`;
    if (c.building === 'old') return `/assets/maps/old_${c.floor}A.jpg`;
    if (c.building === 'transition') return `/assets/maps/transition_old_new.png`;
    return null;
}

function drawSegment(container, fromNode, toNode, isFirst, isLast, nextCallback) {
    const fromCoord = graphData.coordinates[fromNode];
    const toCoord = graphData.coordinates[toNode];
    if (!fromCoord || !toCoord) return;

    const imgSrc = getImageForNode(fromNode);
    if (!imgSrc) return;

    const img = new Image();
    img.src = imgSrc;
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

        if (nextCallback) {
            const btn = document.createElement('button');
            btn.textContent = '→ Дальше';
            btn.style.marginTop = '16px';
            btn.onclick = nextCallback;
            container.appendChild(btn);
        }
    };
}

function startNavigation(path) {
    const steps = [];
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        const imgA = getImageForNode(a);
        const imgB = getImageForNode(b);
        if (imgA !== imgB || i === 0 || i === path.length - 2) {
            steps.push({ from: a, to: b });
        }
    }

    currentPath = steps;
    currentStep = 0;
    showStep();
}

function showStep() {
    const container = document.getElementById('mapContainer');
    if (!container) return;
    const step = currentPath[currentStep];
    if (!step) return;

    const isLast = currentStep === currentPath.length - 1;
    drawSegment(container, step.from, step.to, currentStep === 0, isLast, () => {
        if (currentStep + 1 < currentPath.length) {
            currentStep++;
            showStep();
        }
    });
}

document.getElementById('findBtn').addEventListener('click', async () => {
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();

    if (!from || !to) return alert('Введите обе аудитории');
    if (!graphData) await loadGraphData();

    const path = findPath(from, to);
    if (!path) return alert('Маршрут не найден');

    startNavigation(path);
    document.getElementById('result').style.display = 'block';
});

loadGraphData();
