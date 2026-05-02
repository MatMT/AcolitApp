import { useState } from 'react';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const useScheduleGenerator = (acolytes) => {
    const [scheduleMonths, setScheduleMonths] = useState(3);
    const [adultRatio, setAdultRatio] = useState(2); // Número de adultos por misa
    const [initialTeam, setInitialTeam] = useState([]); // Acolytes selected for the first date
    const [participationHistory, setParticipationHistory] = useState(() => {
        const savedData = localStorage.getItem('participationHistory');
        return savedData ? JSON.parse(savedData) : [];
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
                    lastServedDate: existing.lastServedDate || null,
                }
                : {
                    id: acolyte.id,
                    name: acolyte.name,
                    isAdult: acolyte.isAdult,
                    participations: 0,
                    lastMonthParticipations: 0,
                    lastServedDate: null,
                };
        });

        setParticipationHistory(updatedHistory);
        localStorage.setItem('participationHistory', JSON.stringify(updatedHistory));
    }, [acolytes]);

    const updateLocalStorage = (data) => {
        localStorage.setItem('participationHistory', JSON.stringify(data));
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

    // Sistema de Pilas: Prioriza a los que no han participado en el mes, luego a los de menores participaciones totales, luego a los que hace más tiempo participaron.
    // Dentro de cada nivel de prioridad, baraja aleatoriamente para maximizar la variedad de equipos.
    const selectAcolytesForMass = (availableAcolytes, needed, lastWeekTeam = [], currentDate) => {
        if (availableAcolytes.length === 0) return [];

        const lastWeekIds = lastWeekTeam.map(a => a.id);

        const notLastWeek = availableAcolytes.filter(a => !lastWeekIds.includes(a.id));
        const wasLastWeek = availableAcolytes.filter(a => lastWeekIds.includes(a.id));

        const pickFromPool = (pool, n) => {
            if (pool.length === 0 || n <= 0) return [];

            // PASO 1: Fisher-Yates shuffle para determinar orden aleatorio dentro de cada nivel de prioridad
            const shuffled = [...pool];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            // PASO 2: Ordenar SOLO por los 2 criterios de equidad.
            // NO usamos lastServedDate como desempate porque crea ciclos deterministas
            // (siempre escoge los mismos subgrupos). El shuffle previo garantiza variedad.
            const sorted = shuffled.sort((a, b) => {
                const aServedThisMonth = a.lastServedDate
                    && new Date(a.lastServedDate).getFullYear() === currentDate.getFullYear()
                    && new Date(a.lastServedDate).getMonth() === currentDate.getMonth();
                const bServedThisMonth = b.lastServedDate
                    && new Date(b.lastServedDate).getFullYear() === currentDate.getFullYear()
                    && new Date(b.lastServedDate).getMonth() === currentDate.getMonth();

                // Criterio 1: quien NO sirvió este mes va primero
                if (aServedThisMonth !== bServedThisMonth) {
                    return aServedThisMonth ? 1 : -1;
                }

                // Criterio 2: quien tiene menos participaciones totales va primero
                if (a.participations !== b.participations) {
                    return a.participations - b.participations;
                }

                // Mismo nivel de prioridad → el orden del shuffle decide (variedad garantizada)
                return 0;
            });

            return sorted.slice(0, n);
        };

        const selectedFromNotLast = pickFromPool(notLastWeek, needed);
        if (selectedFromNotLast.length >= needed) return selectedFromNotLast;

        const stillNeeded = needed - selectedFromNotLast.length;
        const selectedFromLast = pickFromPool(wasLastWeek, stillNeeded);
        return [...selectedFromNotLast, ...selectedFromLast];
    };

    const coreGenerateSchedule = (months) => {
        const schedule = [];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const workingHistory = participationHistory.map(p => ({ ...p }));
        let lastWeekTeam = [];
        let isFirstSunday = true;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const currentDate = new Date(d);
                const day = { date: currentDate, team: [] };

                if (isFirstSunday) {
                    const adults = workingHistory.filter(a => a.isAdult);
                    const minors = workingHistory.filter(a => !a.isAdult);
                    const minorsNeeded = 4 - adultRatio;
                    
                    let dayTeam = [null, null, null, null];
                    let manuallyAssignedIds = [];

                    // 1. Colocar los asignados manualmente respetando sus posiciones
                    if (initialTeam && initialTeam.length > 0) {
                        for (let i = 0; i < 4; i++) {
                            if (initialTeam[i]) {
                                const acolyte = workingHistory.find(a => String(a.id) === String(initialTeam[i]));
                                if (acolyte) {
                                    dayTeam[i] = acolyte;
                                    manuallyAssignedIds.push(acolyte.id);
                                }
                            }
                        }
                    }

                    // 2. Llenar los espacios vacíos automáticamente
                    const availableAdults = adults.filter(a => !manuallyAssignedIds.includes(a.id));
                    const availableMinors = minors.filter(a => !manuallyAssignedIds.includes(a.id));

                    let neededAdults = 0;
                    for (let i = 0; i < adultRatio; i++) {
                        if (!dayTeam[i]) neededAdults++;
                    }
                    let neededMinors = 0;
                    for (let i = adultRatio; i < 4; i++) {
                        if (!dayTeam[i]) neededMinors++;
                    }

                    const selectedAdults = selectAcolytesForMass(availableAdults, neededAdults, [], currentDate);
                    const selectedMinors = selectAcolytesForMass(availableMinors, neededMinors, [], currentDate);

                    // Insertar en los espacios vacíos
                    let adultIdx = 0;
                    for (let i = 0; i < adultRatio; i++) {
                        if (!dayTeam[i] && adultIdx < selectedAdults.length) {
                            dayTeam[i] = selectedAdults[adultIdx++];
                        }
                    }
                    let minorIdx = 0;
                    for (let i = adultRatio; i < 4; i++) {
                        if (!dayTeam[i] && minorIdx < selectedMinors.length) {
                            dayTeam[i] = selectedMinors[minorIdx++];
                        }
                    }

                    day.team = dayTeam.filter(Boolean);
                } else {
                    const adults = workingHistory.filter(a => a.isAdult);
                    const minors = workingHistory.filter(a => !a.isAdult);
                    const minorsNeeded = 4 - adultRatio;

                    const lastWeekAdults = lastWeekTeam.filter(a => a.isAdult);
                    const lastWeekMinors = lastWeekTeam.filter(a => !a.isAdult);

                    const selectedAdults = selectAcolytesForMass(adults, adultRatio, lastWeekAdults, currentDate);
                    const selectedMinors = selectAcolytesForMass(minors, minorsNeeded, lastWeekMinors, currentDate);

                    // Poner a los adultos primero para que encajen en las columnas "Mayor 1, Mayor 2"
                    day.team = [...selectedAdults, ...selectedMinors];
                }

                day.team.forEach(member => {
                    const acolyte = workingHistory.find(a => a.id === member.id);
                    if (acolyte) {
                        acolyte.participations++;
                        acolyte.lastServedDate = currentDate.toISOString();
                    }
                });

                lastWeekTeam = [...day.team];
                schedule.push(day);
                isFirstSunday = false;
            }
        }

        return { schedule, finalHistory: workingHistory };
    };

    const generateSchedule = (months) => {
        const { schedule, finalHistory } = coreGenerateSchedule(months);
        setParticipationHistory(finalHistory);
        updateLocalStorage(finalHistory);
        return schedule;
    };

    const generateSchedulePreview = (months) => {
        return coreGenerateSchedule(months);
    };

    const generateExcel = () => {
        // Usar vista previa para no modificar historial
        const { schedule, finalHistory } = generateSchedulePreview(scheduleMonths);
        const wb = XLSX.utils.book_new();

        // Primera hoja: Lista de acólitos
        const acolytesList = [
            ['#', 'Nombre', 'Categoría', 'Participaciones'],
            ...finalHistory.map(a => [
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
        const { schedule } = generateSchedulePreview(scheduleMonths);
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
        const { finalHistory } = generateSchedulePreview(scheduleMonths);
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Reporte de Participaciones', 14, 15);

        const totalParticipations = finalHistory.reduce((acc, a) => acc + a.participations, 0);
        const reportData = finalHistory.map(a => [
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
        const { finalHistory } = generateSchedulePreview(scheduleMonths);
        const wb = XLSX.utils.book_new();
        const totalParticipations = finalHistory.reduce((acc, a) => acc + a.participations, 0);

        const reportData = [
            ['Nombre', 'Participaciones', 'Porcentaje'],
            ...finalHistory.map(a => [
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
        initialTeam,
        setInitialTeam,
    };
};