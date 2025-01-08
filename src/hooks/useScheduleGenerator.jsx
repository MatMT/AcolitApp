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

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Calcula un puntaje de compatibilidad para un equipo potencial
    const calculateTeamCompatibilityScore = (team, currentHistory) => {
        let score = 0;
        
        // Por cada par de miembros en el equipo
        for (let i = 0; i < team.length; i++) {
            for (let j = i + 1; j < team.length; j++) {
                const member1 = currentHistory.find(m => m.id === team[i].id);
                const member2 = currentHistory.find(m => m.id === team[j].id);
                
                // Menor puntaje si ya han trabajado juntos muchas veces
                score += member1.teamHistory[member2.id];
            }
        }
        
        return score;
    };

    // Genera todas las posibles combinaciones de equipo y elige la mejor
    const generatePossibleTeams = (adults, minors, adultCount, minorCount, currentHistory) => {
        const possibleTeams = [];
        const generateCombinations = (arr, size) => {
            const result = [];
            function combine(start, current) {
                if (current.length === size) {
                    result.push([...current]);
                    return;
                }
                for (let i = start; i < arr.length; i++) {
                    current.push(arr[i]);
                    combine(i + 1, current);
                    current.pop();
                }
            }
            combine(0, []);
            return result;
        };

        const adultCombos = generateCombinations(adults, adultCount);
        const minorCombos = generateCombinations(minors, minorCount);

        // Genera todas las posibles combinaciones de equipos
        adultCombos.forEach(adultTeam => {
            minorCombos.forEach(minorTeam => {
                const fullTeam = [...adultTeam, ...minorTeam];
                const score = calculateTeamCompatibilityScore(fullTeam, currentHistory);
                possibleTeams.push({ team: fullTeam, score });
            });
        });

        // Ordena por puntaje (menor es mejor) y añade algo de aleatoriedad
        const sortedTeams = possibleTeams.sort((a, b) => a.score - b.score);
        // Toma el 20% superior de las combinaciones y elige una al azar
        const topTeams = sortedTeams.slice(0, Math.max(1, Math.floor(sortedTeams.length * 0.2)));
        return shuffleArray(topTeams)[0].team;
    };

    const calculateTargetParticipations = (totalSundays, groupSize) => {
        return Math.ceil((totalSundays * 4) / groupSize);
    };

    const selectTeamMembers = (availableMembers, count, schedule, currentHistory) => {
        // Filtrar miembros que no participaron la semana anterior
        const notLastWeek = availableMembers.filter(member => {
            const lastSunday = schedule[schedule.length - 1];
            return !lastSunday || !lastSunday.team.some(m => m.id === member.id);
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

        let totalSundays = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) totalSundays++;
        }

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

                // Seleccionar un pool de candidatos
                const adultCandidates = selectTeamMembers(
                    currentAdults,
                    adultRatio,
                    schedule,
                    currentHistory
                );
                const minorCandidates = selectTeamMembers(
                    currentMinors,
                    4 - adultRatio,
                    schedule,
                    currentHistory
                );

                // Generar la mejor combinación de equipo
                day.team = generatePossibleTeams(
                    adultCandidates,
                    minorCandidates,
                    adultRatio,
                    4 - adultRatio,
                    currentHistory
                );

                // Actualizar participaciones y historial de equipo
                day.team.forEach(member => {
                    const participant = currentHistory.find(p => p.id === member.id);
                    participant.participations++;
                    participant.participationsThisMonth++;
                    participant.lastParticipation = new Date(d);
                    
                    // Actualizar el historial de con quién ha participado
                    day.team.forEach(teammate => {
                        if (teammate.id !== member.id) {
                            participant.teamHistory[teammate.id]++;
                        }
                    });
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