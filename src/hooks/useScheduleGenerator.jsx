import { useState } from 'react';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const useScheduleGenerator = (acolytes) => {
    const [scheduleMonths, setScheduleMonths] = useState(3);
    const [adultRatio, setAdultRatio] = useState(2); // Número de adultos por misa
    const [participationHistory, setParticipationHistory] = useState(() => {
        const savedData = localStorage.getItem('participationHistory');
        return savedData ? JSON.parse(savedData) : [];
    });

    // Sincronizar participationHistory con acolytes
    useEffect(() => {
        const updatedHistory = acolytes.map(acolyte => {
            const existing = participationHistory.find(p => p.id === acolyte.id);
            return existing
                ? { ...existing } // Mantener participaciones actuales
                : {
                    id: acolyte.id,
                    name: acolyte.name,
                    isAdult: acolyte.isAdult,
                    participations: 0,
                    lastMonthParticipations: 0,
                };
        });

        setParticipationHistory(updatedHistory);
        localStorage.setItem('participationHistory', JSON.stringify(updatedHistory));
    }, [acolytes]);

    const updateLocalStorage = (data) => {
        localStorage.setItem('participationHistory', JSON.stringify(data));
    };

    const generateSchedule = (months) => {
        const schedule = [];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) {
                const day = { date: new Date(d), team: [] };

                const adults = participationHistory
                    .filter(a => a.isAdult)
                    .sort((a, b) => a.participations - b.participations);
                const minors = participationHistory
                    .filter(a => !a.isAdult)
                    .sort((a, b) => a.participations - b.participations);

                const selectedAdults = adults.slice(0, adultRatio);
                const selectedMinors = minors.slice(0, 4 - adultRatio);

                day.team = [...selectedMinors, ...selectedAdults];

                day.team.forEach(member => {
                    const acolyte = participationHistory.find(a => a.id === member.id);
                    acolyte.participations++;
                });

                schedule.push(day);
            }
        }

        setParticipationHistory([...participationHistory]);
        updateLocalStorage(participationHistory);

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
        doc.text('Calendario de Acólitos', 14, 15);

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