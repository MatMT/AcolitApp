/**
 * scheduleEngine.js
 * Algoritmo puro de generación de calendario de acólitos.
 * Sin dependencias de React — completamente testeable de forma aislada.
 */

/** Fisher-Yates shuffle — modifica y retorna una copia del array */
const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/**
 * Selecciona `needed` acólitos del pool con el sistema de prioridad de pilas.
 * Prioridades (de mayor a menor):
 *   1. No sirvió la semana pasada
 *   2. No ha servido este mes
 *   3. Menos participaciones totales
 *   4. Aleatoriedad (via shuffle previo) — garantiza variedad de equipos
 */
export const selectAcolytesForMass = (pool, needed, lastWeekTeam = [], currentDate) => {
    if (pool.length === 0 || needed <= 0) return [];

    const lastWeekIds = new Set(lastWeekTeam.map((a) => a.id));
    const notLastWeek = pool.filter((a) => !lastWeekIds.has(a.id));
    const wasLastWeek = pool.filter((a) => lastWeekIds.has(a.id));

    const pickFromPool = (candidates, n) => {
        if (candidates.length === 0 || n <= 0) return [];

        // Pre-shuffle para que los empates de prioridad sean aleatorios cada vez
        const shuffled = shuffle(candidates);

        return shuffled
            .sort((a, b) => {
                const aThisMonth =
                    a.lastServedDate &&
                    new Date(a.lastServedDate).getFullYear() === currentDate.getFullYear() &&
                    new Date(a.lastServedDate).getMonth() === currentDate.getMonth();
                const bThisMonth =
                    b.lastServedDate &&
                    new Date(b.lastServedDate).getFullYear() === currentDate.getFullYear() &&
                    new Date(b.lastServedDate).getMonth() === currentDate.getMonth();

                // Prioridad 1: quien NO sirvió este mes va primero
                if (aThisMonth !== bThisMonth) return aThisMonth ? 1 : -1;

                // Prioridad 2: quien tiene menos participaciones totales
                if (a.participations !== b.participations) return a.participations - b.participations;

                // Empate → el shuffle previo ya ordenó aleatoriamente
                return 0;
            })
            .slice(0, n);
    };

    const selected = pickFromPool(notLastWeek, needed);
    if (selected.length >= needed) return selected;

    const stillNeeded = needed - selected.length;
    return [...selected, ...pickFromPool(wasLastWeek, stillNeeded)];
};

/**
 * Genera el calendario completo.
 * @param {Object} params
 * @param {Array}  params.participationHistory - Historial de participaciones actual
 * @param {number} params.months - Número de meses a generar
 * @param {number} params.adultRatio - Cuántos adultos por misa
 * @param {Array}  params.initialTeam - IDs del equipo del primer domingo (opcional)
 * @returns {{ schedule: Array, finalHistory: Array }}
 */
export const generateSchedule = ({ participationHistory, months, adultRatio, initialTeam = [] }) => {
    const schedule = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Copia de trabajo para no mutar el estado externo
    const workingHistory = participationHistory.map((p) => ({ ...p }));
    let lastWeekTeam = [];
    let isFirstSunday = true;
    const minorsNeeded = 4 - adultRatio;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) continue; // solo domingos

        const currentDate = new Date(d);
        const day = { date: currentDate, team: [] };

        if (isFirstSunday) {
            // --- Primer domingo: asignación manual + relleno automático ---
            let dayTeam = [null, null, null, null];
            const manuallyAssignedIds = [];

            // Colocar los asignados manualmente en su posición exacta
            for (let i = 0; i < 4; i++) {
                if (initialTeam[i]) {
                    const acolyte = workingHistory.find((a) => String(a.id) === String(initialTeam[i]));
                    if (acolyte) {
                        dayTeam[i] = acolyte;
                        manuallyAssignedIds.push(acolyte.id);
                    }
                }
            }

            // Rellenar espacios vacíos automáticamente
            const availableAdults = workingHistory.filter((a) => a.isAdult && !manuallyAssignedIds.includes(a.id));
            const availableMinors = workingHistory.filter((a) => !a.isAdult && !manuallyAssignedIds.includes(a.id));

            let neededAdults = 0;
            for (let i = 0; i < adultRatio; i++) if (!dayTeam[i]) neededAdults++;
            let neededMinors = 0;
            for (let i = adultRatio; i < 4; i++) if (!dayTeam[i]) neededMinors++;

            const autoAdults = selectAcolytesForMass(availableAdults, neededAdults, [], currentDate);
            const autoMinors = selectAcolytesForMass(availableMinors, neededMinors, [], currentDate);

            let ai = 0;
            for (let i = 0; i < adultRatio; i++) {
                if (!dayTeam[i] && ai < autoAdults.length) dayTeam[i] = autoAdults[ai++];
            }
            let mi = 0;
            for (let i = adultRatio; i < 4; i++) {
                if (!dayTeam[i] && mi < autoMinors.length) dayTeam[i] = autoMinors[mi++];
            }

            day.team = dayTeam.filter(Boolean);
        } else {
            // --- Resto de domingos: algoritmo de pilas ---
            const adults = workingHistory.filter((a) => a.isAdult);
            const minors = workingHistory.filter((a) => !a.isAdult);
            const lastWeekAdults = lastWeekTeam.filter((a) => a.isAdult);
            const lastWeekMinors = lastWeekTeam.filter((a) => !a.isAdult);

            const selectedAdults = selectAcolytesForMass(adults, adultRatio, lastWeekAdults, currentDate);
            const selectedMinors = selectAcolytesForMass(minors, minorsNeeded, lastWeekMinors, currentDate);

            day.team = [...selectedAdults, ...selectedMinors];
        }

        // Actualizar contadores en la copia de trabajo
        day.team.forEach((member) => {
            const record = workingHistory.find((a) => a.id === member.id);
            if (record) {
                record.participations++;
                record.lastServedDate = currentDate.toISOString();
            }
        });

        lastWeekTeam = [...day.team];
        schedule.push(day);
        isFirstSunday = false;
    }

    return { schedule, finalHistory: workingHistory };
};

/**
 * Calcula estadísticas de participación esperada para un período.
 */
export const calculateExpectedParticipations = ({ acolytes, months, adultRatio }) => {
    const minorsNeeded = 4 - adultRatio;
    const adultsCount = acolytes.filter((a) => a.isAdult).length;
    const minorsCount = acolytes.filter((a) => !a.isAdult).length;

    // Contar domingos en el período
    let sundaysCount = 0;
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0) sundaysCount++;
    }

    const expectedPerAdult = adultsCount > 0 ? (sundaysCount * adultRatio) / adultsCount : 0;
    const expectedPerMinor = minorsCount > 0 ? (sundaysCount * minorsNeeded) / minorsCount : 0;

    return {
        sundaysCount,
        adultsCount,
        minorsCount,
        expectedPerAdult: Math.round(expectedPerAdult * 10) / 10,
        expectedPerMinor: Math.round(expectedPerMinor * 10) / 10,
        totalSlots: sundaysCount * 4,
    };
};
