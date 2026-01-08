import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const useScheduleGenerator = (acolytes) => {
    const [scheduleMonths, setScheduleMonths] = useState(12);
    const [adultRatio, setAdultRatio] = useState(2);
    const [participationHistory, setParticipationHistory] = useState(() => {
        return acolytes.map(acolyte => ({
            id: acolyte.id,
            name: acolyte.name,
            isAdult: acolyte.isAdult,
            participations: 0,
            lastParticipation: null,
            participationsThisMonth: 0,
            // Registro de con quién ha participado cada miembro
            teamHistory: Object.fromEntries(
                acolytes.map(a => [a.id, 0])
            )
        }));
    });

    // Sincronizar participationHistory con acolytes y sanear valores extremos
    useEffect(() => {
        const sanitize = (value) => {
            if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
            if (value < 0) return 0;
            // Evitar números absurdamente grandes provenientes de sesiones anteriores
            if (value > 1000) return 0;
            return Math.floor(value);
        };

        const updatedHistory = acolytes.map(acolyte => {
            const existing = participationHistory.find(p => p.id === acolyte.id);
            return existing
                ? {
                    ...existing,
                    name: acolyte.name,
                    isAdult: acolyte.isAdult,
                    participations: sanitize(existing.participations),
                    lastMonthParticipations: sanitize(existing.lastMonthParticipations),
                }
                : {
                    id: acolyte.id,
                    name: acolyte.name,
                    isAdult: acolyte.isAdult,
                    participations: 0,
                    lastMonthParticipations: 0,
                };
        });

        // Ordena por número de participaciones y última participación
        const sortedMembers = notLastWeek.sort((a, b) => {
            const participationDiff = a.participations - b.participations;
            if (participationDiff !== 0) return participationDiff;
            
            const aLastPart = a.lastParticipation ? a.lastParticipation.getTime() : 0;
            const bLastPart = b.lastParticipation ? b.lastParticipation.getTime() : 0;
            return aLastPart - bLastPart;
        });

        return sortedMembers.slice(0, Math.min(count * 2, sortedMembers.length));
    };

    // Función para calcular estadísticas de participación esperada
    const calculateExpectedParticipations = (months) => {
        const sundaysCount = countSundays(months);
        const adultsCount = acolytes.filter(a => a.isAdult).length;
        const minorsCount = acolytes.filter(a => !a.isAdult).length;
        const minorsNeeded = 4 - adultRatio;

        // Calcular participaciones esperadas por persona
        const expectedPerAdult = adultsCount > 0 ? (sundaysCount * adultRatio) / adultsCount : 0;
        const expectedPerMinor = minorsCount > 0 ? (sundaysCount * minorsNeeded) / minorsCount : 0;

        return {
            sundaysCount,
            adultsCount,
            minorsCount,
            expectedPerAdult: Math.round(expectedPerAdult * 10) / 10,
            expectedPerMinor: Math.round(expectedPerMinor * 10) / 10,
            totalSlots: sundaysCount * 4
        };
    };

    // Contar domingos en un período
    const countSundays = (months) => {
        let count = 0;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) count++;
        }
        return count;
    };

    // Prioriza: 1) No repetir en el mes 2) No repetir semana pasada 3) Menos participaciones 4) Aleatorio
    const selectAcolytesForMass = (availableAcolytes, needed, lastWeekTeam = [], monthCounts) => {
        if (availableAcolytes.length === 0) return [];

        const lastWeekIds = lastWeekTeam.map(a => a.id);
        const notLastWeek = availableAcolytes.filter(a => !lastWeekIds.includes(a.id));
        const wasLastWeek = availableAcolytes.filter(a => lastWeekIds.includes(a.id));

        const pickByMonthThenParticipation = (pool, n) => {
            if (pool.length === 0 || n <= 0) return [];

            const getMonthCount = (id) => (monthCounts.get(id) || 0);

            // Seleccionar primero quienes tienen menor conteo mensual, empatando por participaciones
            const sorted = [...pool].sort((a, b) => {
                const ma = getMonthCount(a.id);
                const mb = getMonthCount(b.id);
                if (ma !== mb) return ma - mb;
                if (a.participations !== b.participations) return a.participations - b.participations;
                return Math.random() - 0.5;
            });

            // Intentar cubrir con el mínimo conteo mensual presente
            const minMonth = getMonthCount(sorted[0].id);
            const eligiblesMinMonth = sorted.filter(p => getMonthCount(p.id) === minMonth);
            if (eligiblesMinMonth.length >= n) {
                return eligiblesMinMonth.slice(0, n);
            }

            // Si no alcanza, tomar todos y completar del resto siguiendo el orden
            const selected = [...eligiblesMinMonth];
            const remaining = sorted.filter(p => !selected.includes(p));
            const neededMore = n - selected.length;
            selected.push(...remaining.slice(0, neededMore));
            return selected;
        };

        // Primero, quienes NO estuvieron la semana pasada
        const selectedFromNotLast = pickByMonthThenParticipation(notLastWeek, needed);
        if (selectedFromNotLast.length >= needed) return selectedFromNotLast.slice(0, needed);

        // Completar si hace falta con quienes SÍ estuvieron la semana pasada
        const stillNeeded = needed - selectedFromNotLast.length;
        const selectedFromLast = pickByMonthThenParticipation(wasLastWeek, stillNeeded);
        return [...selectedFromNotLast, ...selectedFromLast];
    };

    // Función auxiliar para seleccionar de un pool de acólitos
    const selectFromPool = (pool, needed) => {
        if (pool.length === 0) return [];
        
        // Ordenar por participaciones (menor a mayor)
        const sorted = [...pool].sort((a, b) => {
            // Primero por participaciones
            if (a.participations !== b.participations) {
                return a.participations - b.participations;
            }
            // Si tienen las mismas, usar aleatoriedad
            return Math.random() - 0.5;
        });

        // Encontrar el mínimo de participaciones
        const minParticipations = sorted[0].participations;
        
        // Obtener todos los que tienen el mínimo o uno más (para dar variedad)
        const eligibles = sorted.filter(a => 
            a.participations <= minParticipations + 1
        );

        // Si tenemos suficientes elegibles, seleccionar aleatoriamente de ellos
        if (eligibles.length >= needed) {
            // Mezclar aleatoriamente los elegibles
            const shuffled = [...eligibles].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, needed);
        }

        // Si no hay suficientes, tomar todos los elegibles y completar con los siguientes
        const selected = [...eligibles];
        const remaining = sorted.filter(a => !selected.includes(a));
        const additionalNeeded = needed - selected.length;
        
        // Mezclar los restantes y tomar los necesarios
        const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
        selected.push(...shuffledRemaining.slice(0, additionalNeeded));

        return selected;
    };

    const generateSchedule = (months) => {
        const schedule = [];
        const startDate = new Date();
        
        let currentHistory = acolytes.map(acolyte => ({
            id: acolyte.id,
            name: acolyte.name,
            isAdult: acolyte.isAdult,
            participations: 0,
            lastParticipation: null,
            participationsThisMonth: 0,
            teamHistory: Object.fromEntries(
                acolytes.map(a => [a.id, 0])
            )
        }));

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        // Crear una copia del historial de participaciones para trabajar
        const workingHistory = participationHistory.map(p => ({ ...p }));
        // Variable para guardar el equipo de la semana anterior
        let lastWeekTeam = [];
        // Conteo por mes para priorizar a quienes aún no han servido ese mes
        let currentMonthKey = '';
        let monthCounts = new Map(); // id -> veces en el mes

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const day = { date: new Date(d), team: [] };

                // Resetear contador mensual si cambia el mes
                const mk = `${d.getFullYear()}-${d.getMonth()}`;
                if (mk !== currentMonthKey) {
                    currentMonthKey = mk;
                    monthCounts = new Map();
                }

                const adults = workingHistory.filter(a => a.isAdult);
                const minors = workingHistory.filter(a => !a.isAdult);

                const minorsNeeded = 4 - adultRatio;

                // Filtrar el equipo anterior por tipo
                const lastWeekAdults = lastWeekTeam.filter(a => a.isAdult);
                const lastWeekMinors = lastWeekTeam.filter(a => !a.isAdult);

                // Usar el nuevo algoritmo con prioridad mensual y evitando consecutivos
                const selectedAdults = selectAcolytesForMass(adults, adultRatio, lastWeekAdults, monthCounts);
                const selectedMinors = selectAcolytesForMass(minors, minorsNeeded, lastWeekMinors, monthCounts);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const day = {
                    date: new Date(d),
                    team: []
                };

                // Actualizar participaciones en el historial de trabajo
                day.team.forEach(member => {
                    const acolyte = workingHistory.find(a => a.id === member.id);
                    if (acolyte) {
                        acolyte.participations++;
                    }
                    // Sumar conteo mensual
                    monthCounts.set(member.id, (monthCounts.get(member.id) || 0) + 1);
                });

                // Guardar el equipo actual para la próxima iteración
                lastWeekTeam = [...day.team];

                schedule.push(day);
            }
        }

        // Actualizar el historial de participaciones real
        setParticipationHistory(workingHistory);
        updateLocalStorage(workingHistory);

        return schedule;
    };

    // Función de vista previa que NO modifica el estado ni localStorage
    const generateSchedulePreview = (months) => {
        const schedule = [];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        // Crear una copia del historial solo para la simulación
        const workingHistory = participationHistory.map(p => ({ ...p }));
        let lastWeekTeam = [];
        let currentMonthKey = '';
        let monthCounts = new Map();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const day = { date: new Date(d), team: [] };

                // Resetear contador mensual si cambia el mes
                const mk = `${d.getFullYear()}-${d.getMonth()}`;
                if (mk !== currentMonthKey) {
                    currentMonthKey = mk;
                    monthCounts = new Map();
                }

                const adults = workingHistory.filter(a => a.isAdult);
                const minors = workingHistory.filter(a => !a.isAdult);

                const minorsNeeded = 4 - adultRatio;

                const lastWeekAdults = lastWeekTeam.filter(a => a.isAdult);
                const lastWeekMinors = lastWeekTeam.filter(a => !a.isAdult);

                const selectedAdults = selectAcolytesForMass(adults, adultRatio, lastWeekAdults, monthCounts);
                const selectedMinors = selectAcolytesForMass(minors, minorsNeeded, lastWeekMinors, monthCounts);

                day.team = [...selectedMinors, ...selectedAdults];

                // Actualizar participaciones solo en la copia local
                day.team.forEach(member => {
                    const acolyte = workingHistory.find(a => a.id === member.id);
                    if (acolyte) {
                        acolyte.participations++;
                    }
                    monthCounts.set(member.id, (monthCounts.get(member.id) || 0) + 1);
                });

                lastWeekTeam = [...day.team];
                schedule.push(day);
            }
        }

        // NO actualizar el estado real, solo retornar la simulación
        return schedule;
    };

    const generateExcel = () => {
        // Usar vista previa para no modificar historial
        const schedule = generateSchedulePreview(scheduleMonths);
        const wb = XLSX.utils.book_new();

        // Primera hoja: Lista de acólitos
        const acolytesList = [
            ['#', 'Nombre', 'Categoría', 'Participaciones'],
            ...participationHistory.map(a => [
                a.id,
                a.name,
                a.isAdult ? 'Mayor' : 'Menor',
                a.participations,
            ]),
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(acolytesList);
        XLSX.utils.book_append_sheet(wb, ws1, 'Lista de Acólitos');

        // Segunda hoja: Calendario
        const scheduleData = schedule.map(day => ({
            Domingo: day.date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
            }) + ': Misa',
            ...day.team.reduce((acc, member, idx) => ({
                ...acc,
                [`Acólito ${idx + 1}`]: member.name,
            }), {}),
        }));

        const ws2 = XLSX.utils.json_to_sheet(scheduleData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Calendario');

        XLSX.writeFile(wb, 'horario_acolitos.xlsx');
    };

    const generatePDF = () => {
        // Usar vista previa para no modificar historial
        const schedule = generateSchedulePreview(scheduleMonths);
        const doc = new jsPDF();

        // Evitar caracteres raros: usar fuente estándar y NO emojis
        doc.setFont('helvetica', '');
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Calendario de Acólitos', 14, 15);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Período: ${scheduleMonths} meses | ${schedule.length} domingos`, 14, 22);

        // Generar mapa de colores para cada acólito (estable a lo largo del documento)
        const colorPalette = [
            [66, 153, 225],   // blue
            [72, 187, 120],   // green
            [159, 122, 234],  // purple
            [237, 100, 166],  // pink
            [246, 173, 85],   // yellow
            [99, 102, 241],   // indigo
            [239, 68, 68],    // red
            [251, 146, 60],   // orange
            [20, 184, 166],   // teal
            [14, 165, 233],   // cyan
        ];
        
        const acolyteColorMap = new Map();
        let colorIndex = 0;
        schedule.forEach(day => {
            day.team.forEach(member => {
                if (!acolyteColorMap.has(member.name)) {
                    acolyteColorMap.set(member.name, colorPalette[colorIndex % colorPalette.length]);
                    colorIndex++;
                }
            });
        });

        // Agrupar por mes para añadir separadores
        const groups = new Map(); // key: 'YYYY-MM', value: array of entries
        schedule.forEach((day, idx) => {
            const y = day.date.getFullYear();
            const m = String(day.date.getMonth() + 1).padStart(2, '0');
            const key = `${y}-${m}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push({ day, idx });
        });

        const columns = ['#', 'Domingo', 'Acólito 1', 'Acólito 2', 'Acólito 3', 'Acólito 4'];
        let startY = 28;

        for (const [key, rows] of groups.entries()) {
            const [year, month] = key.split('-');
            const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

            // Título del mes
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), 14, startY);
            // Línea separadora
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(14, startY + 2, 200, startY + 2);

            // Preparar datos de tabla del mes
            const tableData = rows.map(({ day, idx }) => {
                const dateStr = day.date.toLocaleDateString('es-ES', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                });
                return [
                    `#${idx + 1}`,
                    dateStr,
                    ...day.team.map(member => member.name),
                ];
            });

            doc.autoTable({
                head: [columns],
                body: tableData,
                startY: startY + 6,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [99, 102, 241],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 55, fontStyle: 'bold' },
                    2: { cellWidth: 31 },
                    3: { cellWidth: 31 },
                    4: { cellWidth: 31 },
                    5: { cellWidth: 31 },
                },
                didParseCell: function(data) {
                    // Colorear las celdas de los acólitos
                    if (data.section === 'body' && data.column.index >= 2) {
                        const name = data.cell.text[0];
                        const color = acolyteColorMap.get(name);
                        if (color) {
                            data.cell.styles.fillColor = [Math.min(255, color[0] + 150), Math.min(255, color[1] + 150), Math.min(255, color[2] + 150)];
                            data.cell.styles.textColor = [Math.max(0, color[0] - 20), Math.max(0, color[1] - 20), Math.max(0, color[2] - 20)];
                        }
                    }
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250],
                },
                margin: { left: 14, right: 14 },
            });

            // Calcular nueva Y para el próximo mes
            startY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : startY + 40;
        }

        doc.save('calendario_acolitos.pdf');
    };

    const generateReportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Reporte de Participaciones', 14, 15);

        const totalParticipations = participationHistory.reduce((acc, a) => acc + a.participations, 0);
        const reportData = participationHistory.map(a => [
            a.name,
            a.participations,
            `${((a.participations / totalParticipations) * 100).toFixed(2)}%`,
        ]);

        doc.autoTable({
            head: [['Nombre', 'Participaciones', 'Porcentaje']],
            body: reportData,
            startY: 25,
        });

        doc.save('reporte_participaciones.pdf');
    };

    const generateReportExcel = () => {
        const wb = XLSX.utils.book_new();
        const totalParticipations = participationHistory.reduce((acc, a) => acc + a.participations, 0);

        const reportData = [
            ['Nombre', 'Participaciones', 'Porcentaje'],
            ...participationHistory.map(a => [
                a.name,
                a.participations,
                `${((a.participations / totalParticipations) * 100).toFixed(2)}%`,
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(reportData);
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Participaciones');

        XLSX.writeFile(wb, 'reporte_participaciones.xlsx');
    };

    const resetParticipations = () => {
        const reset = participationHistory.map(p => ({
            ...p,
            participations: 0,
            lastMonthParticipations: 0,
        }));
        setParticipationHistory(reset);
        updateLocalStorage(reset);
    };

    return {
        scheduleMonths,
        setScheduleMonths,
        adultRatio,
        setAdultRatio,
        generateSchedule,
        generateSchedulePreview,
        generateExcel,
        generatePDF,
        generateReportPDF,
        generateReportExcel,
        calculateExpectedParticipations,
        participationHistory,
        resetParticipations,
    };
};