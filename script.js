// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let graphData = null;  // Здесь будут данные из JSON

// ========== ЗАГРУЗКА JSON ==========
async function loadGraphData() {
    try {
        const response = await fetch('data/graph.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        graphData = await response.json();
        console.log('✅ Данные загружены:', graphData);
        return true;
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        return false;
    }
}

// ========== ПОИСК АУДИТОРИИ В ДАННЫХ ==========
function findAuditory(roomNumber) {
    if (!graphData) return null;

    roomNumber = roomNumber.trim();

    // ===== НОВЫЙ КОРПУС (0205) =====
    if (roomNumber.length === 4 && roomNumber[0] === '0') {
        const floor = parseInt(roomNumber[1]);  // 2
        const rooms = graphData.buildings.new.auditories[floor];
        if (rooms && rooms.includes(roomNumber)) {
            return {
                building: 'new',
                wing: null,
                floor: floor,
                room: roomNumber,
                isValid: true
            };
        }
    }

    // ===== СТАРЫЙ КОРПУС (205) — ПОКА ЗАГЛУШКА =====
    // Здесь будет поиск по Старому корпусу, когда добавишь аудитории
    if (roomNumber.length === 3 && roomNumber[0] !== '0') {
        // Пока возвращаем "не найдено", потом заменим на реальный поиск
        return null;
    }

    return null;
}

// ========== ПАРСИНГ НОМЕРА (С ПРОВЕРКОЙ ПО JSON) ==========
async function parseRoomNumberWithData(room) {
    room = room.trim();

    // Ждем загрузки данных, если еще не загружены
    if (!graphData) {
        await loadGraphData();
    }

    // Ищем аудиторию в данных
    const found = findAuditory(room);

    if (!found) {
        return {
            original: room,
            isValid: false,
            error: `Аудитория ${room} не найдена в базе`
        };
    }

    if (found.building === 'new') {
        return {
            original: room,
            building: 'Новый',
            floor: found.floor,
            number: room.substring(2),
            isValid: true,
            error: null
        };
    }

    // Для Старого корпуса (будет позже)
    return {
        original: room,
        isValid: false,
        error: 'Старый корпус пока в разработке'
    };
}

// ========== ПОСТРОЕНИЕ МАРШРУТА (ВРЕМЕННО) ==========
function buildRouteWithData(from, to) {
    // Пока просто заглушка, потом заменим на BFS
    return {
        steps: [
            "📍 Маршрут будет построен после добавления данных",
            "✅ Аудитории найдены в базе"
        ]
    };
}

// ========== ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА ==========
async function displayRoute(from, to) {
    const resultDiv = document.getElementById('result');
    const routeTextDiv = document.getElementById('routeText');

    // Парсим номера
    const fromInfo = await parseRoomNumberWithData(from);
    const toInfo = await parseRoomNumberWithData(to);

    // Проверка ошибок
    if (!fromInfo.isValid) {
        routeTextDiv.innerHTML = `<div class="error">⚠️ ${fromInfo.error}</div>`;
        resultDiv.style.display = 'block';
        return;
    }
    if (!toInfo.isValid) {
        routeTextDiv.innerHTML = `<div class="error">⚠️ ${toInfo.error}</div>`;
        resultDiv.style.display = 'block';
        return;
    }

    // Строим маршрут
    const route = buildRouteWithData(fromInfo, toInfo);

    let html = '';
    route.steps.forEach(step => {
        html += `<div class="route-step">${step}</div>`;
    });
    routeTextDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
document.getElementById('findBtn').addEventListener('click', async () => {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    if (!from || !to) {
        alert('Введите обе аудитории');
        return;
    }

    await displayRoute(from, to);
});

// Enter нажатие
document.getElementById('from').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('findBtn').click();
});
document.getElementById('to').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('findBtn').click();
});

// ========== ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ ==========
loadGraphData();
