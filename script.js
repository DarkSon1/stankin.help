// ========== ОПРЕДЕЛЕНИЕ КОРПУСА И ЭТАЖА ==========

function parseRoomNumber(room) {
    room = room.trim();

    if (room.length === 4 && room[0] === '0') {
        // Новый корпус: 0205 → 2 этаж, 05 номер
        const floor = parseInt(room[1]);
        const number = room.substring(2);
        return {
            original: room,
            building: 'Новый',
            floor: floor,
            number: number,
            isValid: floor >= 1 && floor <= 8,
            error: null
        };
    }
    else if (room.length === 3 && room[0] !== '0') {
        // Старый корпус: 205 → 2 этаж, 05 номер
        const floor = parseInt(room[0]);
        const number = room.substring(1);
        let wing = null;

        // Определяем крыло по номеру (пока заглушка, потом уточнишь)
        if (parseInt(number) >= 1 && parseInt(number) <= 50) {
            wing = 'А';
        } else {
            wing = 'Б';
        }

        return {
            original: room,
            building: 'Старый',
            wing: wing,
            floor: floor,
            number: number,
            isValid: floor >= 1 && floor <= 5,
            error: null
        };
    }
    else {
        return {
            original: room,
            isValid: false,
            error: 'Неверный формат. Используйте 0205 (Новый) или 205 (Старый)'
        };
    }
}

// ========== ФОРМИРОВАНИЕ ТЕКСТОВОГО МАРШРУТА ==========

function buildRoute(from, to) {
    const fromInfo = parseRoomNumber(from);
    const toInfo = parseRoomNumber(to);

    // Проверка на ошибки
    if (!fromInfo.isValid) {
        return { error: `❌ "${from}" — ${fromInfo.error}` };
    }
    if (!toInfo.isValid) {
        return { error: `❌ "${to}" — ${toInfo.error}` };
    }

    let steps = [];

    // Отправление
    if (fromInfo.building === 'Новый') {
        steps.push(`📍 Отправление: Новый корпус, ${fromInfo.floor} этаж, аудитория ${fromInfo.original}`);
    } else {
        steps.push(`📍 Отправление: Старый корпус (крыло ${fromInfo.wing}), ${fromInfo.floor} этаж, аудитория ${fromInfo.original}`);
    }

    // Переход между корпусами
    if (fromInfo.building !== toInfo.building) {
        steps.push(`🚪 Выйти из ${fromInfo.building} корпуса`);

        if (fromInfo.building === 'Новый' && toInfo.building === 'Старый') {
            steps.push(`🚶 Перейти в Старый корпус`);
        } else if (fromInfo.building === 'Старый' && toInfo.building === 'Новый') {
            steps.push(`🚶 Перейти в Новый корпус`);
        }
    }

    // Смена этажа
    if (fromInfo.floor !== toInfo.floor) {
        if (toInfo.floor > fromInfo.floor) {
            steps.push(`↑ Подняться на ${toInfo.floor} этаж`);
        } else {
            steps.push(`↓ Спуститься на ${toInfo.floor} этаж`);
        }
    }

    // Смена крыла (если в Старом корпусе)
    if (fromInfo.building === 'Старый' && toInfo.building === 'Старый' && fromInfo.wing !== toInfo.wing) {
        steps.push(`🔄 Перейти из крыла ${fromInfo.wing} в крыло ${toInfo.wing} (через переход на ${toInfo.floor} этаже)`);
    }

    // Прибытие
    if (toInfo.building === 'Новый') {
        steps.push(`✅ Прибытие: Новый корпус, ${toInfo.floor} этаж, аудитория ${toInfo.original}`);
    } else {
        steps.push(`✅ Прибытие: Старый корпус (крыло ${toInfo.wing}), ${toInfo.floor} этаж, аудитория ${toInfo.original}`);
    }

    return { steps };
}

// ========== ОТРИСОВКА РЕЗУЛЬТАТА ==========

function displayRoute(from, to) {
    const resultDiv = document.getElementById('result');
    const routeTextDiv = document.getElementById('routeText');

    const result = buildRoute(from, to);

    if (result.error) {
        routeTextDiv.innerHTML = `<div class="error">⚠️ ${result.error}</div>`;
    } else {
        let html = '';
        result.steps.forEach((step, index) => {
            html += `<div class="route-step">${step}</div>`;
        });
        routeTextDiv.innerHTML = html;
    }

    resultDiv.style.display = 'block';
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

document.getElementById('findBtn').addEventListener('click', () => {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    if (!from || !to) {
        alert('Введите обе аудитории');
        return;
    }

    displayRoute(from, to);
});

// Enter нажатие
document.getElementById('from').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('findBtn').click();
});
document.getElementById('to').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('findBtn').click();
});