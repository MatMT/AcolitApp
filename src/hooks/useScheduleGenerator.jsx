import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const useScheduleGenerator = (acolytes) => {
    const [scheduleMonths, setScheduleMonths] = useState(3);
    const [adultRatio, setAdultRatio] = useState(2);
    const [participationHistory, setParticipationHistory] = useState(() => {
        return acolytes.map(acolyte => ({
            id: acolyte.id,
            name: acolyte.name,
            isAdult: acolyte.isAdult,
            participations: 0,
            lastParticipation: null,
            participationsThisMonth: 0
        }));
    });

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const calculateTargetParticipations = (totalSundays, groupSize) => {
        return Math.ceil((totalSundays * 4) / groupSize);
    };

    const selectTeamMembers = (availableMembers, count, currentDate, schedule, targetParticipations) => {
        // Filtrar miembros que no han participado el domingo anterior
        const notLastWeek = availableMembers.filter(member => {
            const lastSunday = schedule[schedule.length - 1];
            return !lastSunday || !lastSunday.team.some(m => m.id === member.id);
        });

        // Ordenar por número de participaciones (menos participaciones primero)
        const sortedMembers = notLastWeek.sort((a, b) => {
            const participationDiff = a.participations - b.participations;
            if (participationDiff !== 0) return participationDiff;
            
            // Si tienen las mismas participaciones, usar el tiempo desde la última participación
            const aLastPart = a.lastParticipation ? a.lastParticipation.getTime() : 0;
            const bLastPart = b.lastParticipation ? b.lastParticipation.getTime() : 0;
            return aLastPart - bLastPart;
        });

        // Seleccionar primero a los que están por debajo del objetivo
        const underTarget = sortedMembers.filter(m => m.participations < targetParticipations);
        const selected = underTarget.slice(0, count);

        // Si necesitamos más miembros, tomar del resto
        if (selected.length < count) {
            const remaining = sortedMembers.filter(m => !selected.includes(m));
            selected.push(...remaining.slice(0, count - selected.length));
        }

        return shuffleArray(selected);
    };

    const generateSchedule = (months) => {
        const schedule = [];
        const startDate = new Date();
        
        // Reiniciar el historial de participaciones
        let currentHistory = acolytes.map(acolyte => ({
            id: acolyte.id,
            name: acolyte.name,
            isAdult: acolyte.isAdult,
            participations: 0,
            lastParticipation: null,
            participationsThisMonth: 0
        }));

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        // Calcular número total de domingos
        let totalSundays = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) totalSundays++;
        }

        // Calcular participaciones objetivo para cada grupo
        const adults = currentHistory.filter(a => a.isAdult);
        const minors = currentHistory.filter(a => !a.isAdult);
        const targetAdultParticipations = calculateTargetParticipations(totalSundays, adults.length);
        const targetMinorParticipations = calculateTargetParticipations(totalSundays, minors.length);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const day = {
                    date: new Date(d),
                    team: []
                };

                const currentAdults = currentHistory.filter(a => a.isAdult);
                const currentMinors = currentHistory.filter(a => !a.isAdult);

                const selectedAdults = selectTeamMembers(
                    currentAdults,
                    adultRatio,
                    d,
                    schedule,
                    targetAdultParticipations
                );
                const selectedMinors = selectTeamMembers(
                    currentMinors,
                    4 - adultRatio,
                    d,
                    schedule,
                    targetMinorParticipations
                );

                day.team = [...selectedAdults, ...selectedMinors];

                // Actualizar participaciones
                day.team.forEach(member => {
                    const participant = currentHistory.find(p => p.id === member.id);
                    participant.participations++;
                    participant.participationsThisMonth++;
                    participant.lastParticipation = new Date(d);
                });

                schedule.push(day);
            }
        }

        setParticipationHistory(currentHistory);
        return schedule;
    };


    const generateExcel = () => {
        const schedule = generateSchedule(scheduleMonths);
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
        const schedule = generateSchedule(scheduleMonths);
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Calendario de Acólitos - Por: Mateo Elías', 14, 15);

        const tableData = schedule.map(day => [
            day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
            ...day.team.map(member => member.name),
        ]);

        const columns = ['Domingo', 'Acólito 1', 'Acólito 2', 'Acólito 3', 'Acólito 4'];

        doc.autoTable({
            head: [columns],
            body: tableData,
            startY: 25,
        });

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

    return {
        scheduleMonths,
        setScheduleMonths,
        adultRatio,
        setAdultRatio,
        generateSchedule,
        generateExcel,
        generatePDF,
        generateReportPDF,
        generateReportExcel,
    };
};