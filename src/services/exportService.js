/**
 * exportService.js
 * Funciones de exportación a PDF y Excel.
 * Sin dependencias de React — pueden llamarse desde cualquier contexto.
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/** Paleta de colores para identificar acólitos en el PDF */
const COLOR_PALETTE = [
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

/**
 * Exporta el calendario de acólitos a un archivo Excel (.xlsx).
 * @param {{ schedule: Array, finalHistory: Array }} data
 */
export const exportCalendarExcel = ({ schedule, finalHistory }) => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Lista de acólitos con sus participaciones proyectadas
    const acolytesList = [
        ['#', 'Nombre', 'Categoría', 'Participaciones'],
        ...finalHistory.map((a) => [a.id, a.name, a.isAdult ? 'Mayor' : 'Menor', a.participations]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(acolytesList), 'Lista de Acólitos');

    // Hoja 2: Calendario con fechas y equipos
    const scheduleData = schedule.map((day) => ({
        Domingo: day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) + ': Misa',
        ...day.team.reduce((acc, member, idx) => ({ ...acc, [`Acólito ${idx + 1}`]: member.name }), {}),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scheduleData), 'Calendario');

    XLSX.writeFile(wb, 'horario_acolitos.xlsx');
};

/**
 * Exporta el calendario de acólitos a un archivo PDF con colores por acólito.
 * @param {{ schedule: Array, scheduleMonths: number }} params
 */
export const exportCalendarPDF = ({ schedule, scheduleMonths }) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', '');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Calendario de Acólitos', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${scheduleMonths} meses | ${schedule.length} domingos`, 14, 22);

    // Mapa estable de colores por acólito
    const colorMap = new Map();
    let colorIdx = 0;
    schedule.forEach((day) => {
        day.team.forEach((member) => {
            if (!colorMap.has(member.name)) {
                colorMap.set(member.name, COLOR_PALETTE[colorIdx % COLOR_PALETTE.length]);
                colorIdx++;
            }
        });
    });

    // Agrupar domingos por mes
    const groups = new Map();
    schedule.forEach((day, idx) => {
        const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ day, idx });
    });

    const columns = ['#', 'Domingo', 'Acólito 1', 'Acólito 2', 'Acólito 3', 'Acólito 4'];
    let startY = 28;

    for (const [key, rows] of groups.entries()) {
        const [year, month] = key.split('-');
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
        });

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), 14, startY);
        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.line(14, startY + 2, 200, startY + 2);

        const tableData = rows.map(({ day, idx }) => [
            `#${idx + 1}`,
            day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            ...day.team.map((m) => m.name),
        ]);

        doc.autoTable({
            head: [columns],
            body: tableData,
            startY: startY + 6,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 55, fontStyle: 'bold' },
                2: { cellWidth: 31 },
                3: { cellWidth: 31 },
                4: { cellWidth: 31 },
                5: { cellWidth: 31 },
            },
            didParseCell(data) {
                if (data.section === 'body' && data.column.index >= 2) {
                    const color = colorMap.get(data.cell.text[0]);
                    if (color) {
                        data.cell.styles.fillColor = color.map((c) => Math.min(255, c + 150));
                        data.cell.styles.textColor = color.map((c) => Math.max(0, c - 20));
                    }
                }
            },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 14, right: 14 },
        });

        startY = (doc.lastAutoTable?.finalY ?? startY + 40) + 10;
    }

    doc.save('calendario_acolitos.pdf');
};

/**
 * Exporta el reporte de participaciones a PDF.
 * @param {{ finalHistory: Array }} params
 */
export const exportReportPDF = ({ finalHistory }) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Participaciones', 14, 15);

    const total = finalHistory.reduce((acc, a) => acc + a.participations, 0);
    const reportData = finalHistory.map((a) => [
        a.name,
        a.participations,
        total > 0 ? `${((a.participations / total) * 100).toFixed(2)}%` : '0%',
    ]);

    doc.autoTable({
        head: [['Nombre', 'Participaciones', 'Porcentaje']],
        body: reportData,
        startY: 25,
    });

    doc.save('reporte_participaciones.pdf');
};

/**
 * Exporta el reporte de participaciones a Excel.
 * @param {{ finalHistory: Array }} params
 */
export const exportReportExcel = ({ finalHistory }) => {
    const total = finalHistory.reduce((acc, a) => acc + a.participations, 0);
    const reportData = [
        ['Nombre', 'Participaciones', 'Porcentaje'],
        ...finalHistory.map((a) => [
            a.name,
            a.participations,
            total > 0 ? `${((a.participations / total) * 100).toFixed(2)}%` : '0%',
        ]),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(reportData), 'Reporte Participaciones');
    XLSX.writeFile(wb, 'reporte_participaciones.xlsx');
};
