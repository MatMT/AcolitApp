/**
 * verify-algorithm.mjs
 * Script de verificación del algoritmo de asignaciones.
 * Corre con: node src/services/verify-algorithm.mjs
 *
 * Prueba los siguientes invariantes:
 *   1. Equidad — las participaciones están balanceadas al final
 *   2. Sin repetición consecutiva — nadie sirve dos domingos seguidos
 *   3. Asignación manual — el primer domingo respeta el equipo definido
 *   4. Variedad — dos generaciones producen equipos distintos
 *   5. Clasificación — adultos y menores se asignan en la proporción correcta
 */

// ─── Copia embebida del motor (para no depender de transpilación) ─────────────

const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const selectAcolytesForMass = (pool, needed, lastWeekTeam = [], currentDate) => {
    if (pool.length === 0 || needed <= 0) return [];
    const lastWeekIds = new Set(lastWeekTeam.map((a) => a.id));
    const notLastWeek = pool.filter((a) => !lastWeekIds.has(a.id));
    const wasLastWeek = pool.filter((a) => lastWeekIds.has(a.id));

    const pickFromPool = (candidates, n) => {
        if (candidates.length === 0 || n <= 0) return [];
        return shuffle(candidates)
            .sort((a, b) => {
                const aThisMonth = a.lastServedDate &&
                    new Date(a.lastServedDate).getFullYear() === currentDate.getFullYear() &&
                    new Date(a.lastServedDate).getMonth() === currentDate.getMonth();
                const bThisMonth = b.lastServedDate &&
                    new Date(b.lastServedDate).getFullYear() === currentDate.getFullYear() &&
                    new Date(b.lastServedDate).getMonth() === currentDate.getMonth();
                if (aThisMonth !== bThisMonth) return aThisMonth ? 1 : -1;
                if (a.participations !== b.participations) return a.participations - b.participations;
                return 0;
            })
            .slice(0, n);
    };

    const selected = pickFromPool(notLastWeek, needed);
    if (selected.length >= needed) return selected;
    return [...selected, ...pickFromPool(wasLastWeek, needed - selected.length)];
};

const generateSchedule = ({ participationHistory, months, adultRatio, initialTeam = [] }) => {
    const schedule = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    const workingHistory = participationHistory.map((p) => ({ ...p }));
    let lastWeekTeam = [];
    let isFirstSunday = true;
    const minorsNeeded = 4 - adultRatio;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) continue;
        const currentDate = new Date(d);
        const day = { date: currentDate, team: [] };

        if (isFirstSunday) {
            let dayTeam = [null, null, null, null];
            const manuallyAssignedIds = [];
            for (let i = 0; i < 4; i++) {
                if (initialTeam[i]) {
                    const acolyte = workingHistory.find((a) => String(a.id) === String(initialTeam[i]));
                    if (acolyte) { dayTeam[i] = acolyte; manuallyAssignedIds.push(acolyte.id); }
                }
            }
            const availableAdults = workingHistory.filter((a) => a.isAdult && !manuallyAssignedIds.includes(a.id));
            const availableMinors = workingHistory.filter((a) => !a.isAdult && !manuallyAssignedIds.includes(a.id));
            let neededAdults = 0; for (let i = 0; i < adultRatio; i++) if (!dayTeam[i]) neededAdults++;
            let neededMinors = 0; for (let i = adultRatio; i < 4; i++) if (!dayTeam[i]) neededMinors++;
            const autoAdults = selectAcolytesForMass(availableAdults, neededAdults, [], currentDate);
            const autoMinors = selectAcolytesForMass(availableMinors, neededMinors, [], currentDate);
            let ai = 0; for (let i = 0; i < adultRatio; i++) if (!dayTeam[i] && ai < autoAdults.length) dayTeam[i] = autoAdults[ai++];
            let mi = 0; for (let i = adultRatio; i < 4; i++) if (!dayTeam[i] && mi < autoMinors.length) dayTeam[i] = autoMinors[mi++];
            day.team = dayTeam.filter(Boolean);
        } else {
            const adults = workingHistory.filter((a) => a.isAdult);
            const minors = workingHistory.filter((a) => !a.isAdult);
            const lastWeekAdults = lastWeekTeam.filter((a) => a.isAdult);
            const lastWeekMinors = lastWeekTeam.filter((a) => !a.isAdult);
            const selectedAdults = selectAcolytesForMass(adults, adultRatio, lastWeekAdults, currentDate);
            const selectedMinors = selectAcolytesForMass(minors, minorsNeeded, lastWeekMinors, currentDate);
            day.team = [...selectedAdults, ...selectedMinors];
        }

        day.team.forEach((member) => {
            const record = workingHistory.find((a) => a.id === member.id);
            if (record) { record.participations++; record.lastServedDate = currentDate.toISOString(); }
        });
        lastWeekTeam = [...day.team];
        schedule.push(day);
        isFirstSunday = false;
    }
    return { schedule, finalHistory: workingHistory };
};

// ─── Dataset de prueba (8 adultos, 8 menores) ────────────────────────────────

const makeHistory = (acolytes) => acolytes.map((a) => ({
    id: a.id, name: a.name, isAdult: a.isAdult,
    participations: 0, lastMonthParticipations: 0, lastServedDate: null,
}));

const ADULTS = [
    { id: 'a1', name: 'Edwin Gabriel', isAdult: true },
    { id: 'a2', name: 'Anderson Aarón', isAdult: true },
    { id: 'a3', name: 'Eleazar Omar', isAdult: true },
    { id: 'a4', name: 'Fatima Saraí', isAdult: true },
    { id: 'a5', name: 'Kevin Ezequiel', isAdult: true },
    { id: 'a6', name: 'Dayana Nicolle', isAdult: true },
    { id: 'a7', name: 'Stefani Guadalupe', isAdult: true },
    { id: 'a8', name: 'Arianna Marcela', isAdult: true },
];
const MINORS = [
    { id: 'm1', name: 'Fatima Guadalupe', isAdult: false },
    { id: 'm2', name: 'Milena Sofía', isAdult: false },
    { id: 'm3', name: 'Valeria & Iris', isAdult: false },
    { id: 'm4', name: 'Guillermo Alessandro', isAdult: false },
    { id: 'm5', name: 'Howard Steven', isAdult: false },
    { id: 'm6', name: 'Ashley Ninette', isAdult: false },
    { id: 'm7', name: 'Matías Emmanuel', isAdult: false },
    { id: 'm8', name: 'Kimberly Stace', isAdult: false },
];
const ALL = [...ADULTS, ...MINORS];
const ADULT_RATIO = 2; // 2 adultos + 2 menores por domingo

// ─── Suite de tests ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`  ❌ ${name}`);
        console.log(`     → ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// ─── Test 1: Tamaño de equipo correcto ───────────────────────────────────────
console.log('\n📋 TEST 1 — Tamaño de equipo por domingo\n');
{
    const { schedule } = generateSchedule({ participationHistory: makeHistory(ALL), months: 3, adultRatio: ADULT_RATIO, initialTeam: [] });

    test('Cada domingo tiene exactamente 4 acólitos', () => {
        const wrong = schedule.filter(d => d.team.length !== 4);
        assert(wrong.length === 0, `${wrong.length} domingos con equipo incompleto:\n     ${wrong.map(d => d.date.toLocaleDateString('es-ES') + ` (${d.team.length})`).join(', ')}`);
    });

    test(`Cada domingo tiene exactamente ${ADULT_RATIO} adultos`, () => {
        const wrong = schedule.filter(d => d.team.filter(a => a.isAdult).length !== ADULT_RATIO);
        assert(wrong.length === 0, `${wrong.length} domingos con número incorrecto de adultos`);
    });

    test(`Cada domingo tiene exactamente ${4 - ADULT_RATIO} menores`, () => {
        const wrong = schedule.filter(d => d.team.filter(a => !a.isAdult).length !== 4 - ADULT_RATIO);
        assert(wrong.length === 0, `${wrong.length} domingos con número incorrecto de menores`);
    });
}

// ─── Test 2: Sin repetición consecutiva ──────────────────────────────────────
console.log('\n📋 TEST 2 — Sin repetición dos domingos seguidos\n');
{
    const { schedule } = generateSchedule({ participationHistory: makeHistory(ALL), months: 3, adultRatio: ADULT_RATIO, initialTeam: [] });

    test('Ningún acólito sirve dos domingos consecutivos', () => {
        const violations = [];
        for (let i = 1; i < schedule.length; i++) {
            const prevIds = new Set(schedule[i - 1].team.map(a => a.id));
            const currentIds = schedule[i].team.map(a => a.id);
            const overlap = currentIds.filter(id => prevIds.has(id));
            if (overlap.length > 0) {
                const names = overlap.map(id => ALL.find(a => a.id === id)?.name);
                violations.push(`Semana ${i + 1}: ${names.join(', ')}`);
            }
        }
        assert(violations.length === 0, `Repeticiones consecutivas:\n     ${violations.join('\n     ')}`);
    });
}

// ─── Test 3: Equidad de participaciones ──────────────────────────────────────
console.log('\n📋 TEST 3 — Equidad de participaciones\n');
{
    const { finalHistory } = generateSchedule({ participationHistory: makeHistory(ALL), months: 3, adultRatio: ADULT_RATIO, initialTeam: [] });

    const adultCounts = finalHistory.filter(a => a.isAdult).map(a => a.participations);
    const minorCounts = finalHistory.filter(a => !a.isAdult).map(a => a.participations);
    const maxDiff = (arr) => Math.max(...arr) - Math.min(...arr);

    test('Diferencia máx. entre adultos ≤ 2 participaciones', () => {
        const diff = maxDiff(adultCounts);
        assert(diff <= 2, `Diferencia de ${diff} participaciones entre adultos (máx. tolerable: 2)\n     Conteos: ${adultCounts.sort((a,b)=>a-b).join(', ')}`);
    });

    test('Diferencia máx. entre menores ≤ 2 participaciones', () => {
        const diff = maxDiff(minorCounts);
        assert(diff <= 2, `Diferencia de ${diff} participaciones entre menores (máx. tolerable: 2)\n     Conteos: ${minorCounts.sort((a,b)=>a-b).join(', ')}`);
    });

    test('Todos los adultos participaron al menos una vez', () => {
        const zeros = finalHistory.filter(a => a.isAdult && a.participations === 0).map(a => a.name);
        assert(zeros.length === 0, `Adultos sin participar: ${zeros.join(', ')}`);
    });

    test('Todos los menores participaron al menos una vez', () => {
        const zeros = finalHistory.filter(a => !a.isAdult && a.participations === 0).map(a => a.name);
        assert(zeros.length === 0, `Menores sin participar: ${zeros.join(', ')}`);
    });
}

// ─── Test 4: Asignación manual primer domingo ─────────────────────────────────
console.log('\n📋 TEST 4 — Asignación manual primer domingo\n');
{
    const initialTeam = ['a1', 'a2', 'm1', 'm2']; // posiciones 0-1 adultos, 2-3 menores
    const { schedule } = generateSchedule({ participationHistory: makeHistory(ALL), months: 3, adultRatio: ADULT_RATIO, initialTeam });

    test('El primer domingo contiene exactamente los 4 asignados manualmente', () => {
        const firstIds = schedule[0].team.map(a => a.id);
        const missing = initialTeam.filter(id => !firstIds.includes(id));
        assert(missing.length === 0, `Faltan en el primer domingo: ${missing.join(', ')}`);
    });

    test('El primer domingo no contiene acólitos extra no asignados', () => {
        const firstIds = new Set(schedule[0].team.map(a => a.id));
        const extra = [...firstIds].filter(id => !initialTeam.includes(id));
        assert(extra.length === 0, `Acólitos no asignados en primer domingo: ${extra.join(', ')}`);
    });
}

// ─── Test 5: Asignación manual parcial (2 de 4) ──────────────────────────────
console.log('\n📋 TEST 5 — Asignación manual parcial\n');
{
    const initialTeam = ['a1', '', 'm1', '']; // solo posición 0 y 2
    const { schedule } = generateSchedule({ participationHistory: makeHistory(ALL), months: 1, adultRatio: ADULT_RATIO, initialTeam });

    test('Los 2 asignados manualmente aparecen en el primer domingo', () => {
        const firstIds = schedule[0].team.map(a => a.id);
        assert(firstIds.includes('a1'), 'Falta a1 en primer domingo');
        assert(firstIds.includes('m1'), 'Falta m1 en primer domingo');
    });

    test('El primer domingo tiene 4 acólitos aunque solo se asignaron 2 manualmente', () => {
        assert(schedule[0].team.length === 4, `Solo ${schedule[0].team.length} acólitos en primer domingo`);
    });
}

// ─── Test 6: Variedad entre generaciones ─────────────────────────────────────
console.log('\n📋 TEST 6 — Variedad entre generaciones\n');
{
    const RUNS = 10;
    const fingerprints = new Set();
    for (let i = 0; i < RUNS; i++) {
        const { schedule } = generateSchedule({ participationHistory: makeHistory(ALL), months: 1, adultRatio: ADULT_RATIO, initialTeam: [] });
        // Tomar los primeros 3 domingos como huella
        const fp = schedule.slice(0, 3).map(d => d.team.map(a => a.id).sort().join(',')).join('|');
        fingerprints.add(fp);
    }
    test(`En ${RUNS} generaciones hay al menos 3 combinaciones distintas`, () => {
        assert(fingerprints.size >= 3, `Solo ${fingerprints.size} combinaciones únicas en ${RUNS} generaciones (algoritmo demasiado determinista)`);
    });
}

// ─── Reporte final ───────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
console.log(`\n📊 Resultado: ${passed} tests pasados, ${failed} fallidos\n`);

if (failed === 0) {
    console.log('🎉 ¡Todos los invariantes del algoritmo se cumplen!\n');
} else {
    console.log('⚠️  Hay invariantes fallidos. Revisar los detalles arriba.\n');
    process.exit(1);
}
