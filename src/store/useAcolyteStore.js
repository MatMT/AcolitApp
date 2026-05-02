/**
 * useAcolyteStore.js
 * Store Zustand para la gestión del directorio de acólitos.
 * Persiste automáticamente en localStorage con el middleware `persist`.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAcolyteStore = create(
    persist(
        (set, get) => ({
            // ─── State ───────────────────────────────────────────────────────────
            acolytes: [],
            newAcolyte: { name: '', isAdult: false },

            // ─── Setters simples ─────────────────────────────────────────────────
            setNewAcolyte: (value) => set({ newAcolyte: value }),

            // ─── Acciones ────────────────────────────────────────────────────────

            /** Agrega un acólito individual desde el formulario */
            addAcolyte: () => {
                const { newAcolyte, acolytes } = get();
                if (!newAcolyte.name.trim()) return;
                set({
                    acolytes: [
                        ...acolytes,
                        {
                            ...newAcolyte,
                            id: crypto.randomUUID(),
                            number: acolytes.length + 1,
                        },
                    ],
                    newAcolyte: { name: '', isAdult: false },
                });
            },

            /** Elimina un acólito por ID y renumera */
            deleteAcolyte: (id) => {
                set((state) => ({
                    acolytes: state.acolytes
                        .filter((a) => a.id !== id)
                        .map((a, index) => ({ ...a, number: index + 1 })),
                }));
            },

            /** Elimina todos los acólitos */
            clearAcolytes: () => {
                set({ acolytes: [] });
                // Nota: el reseteo del historial de participaciones se maneja
                // en useScheduleStore para mantener la separación de responsabilidades.
            },

            /** Importa acólitos desde contenido CSV */
            importFromCSV: (csvContent) => {
                try {
                    const lines = csvContent.split('\n').filter((l) => l.trim());
                    if (lines.length === 0) throw new Error('El archivo CSV está vacío');

                    const firstLine = lines[0].toLowerCase();
                    const hasHeader =
                        firstLine.includes('nombre') ||
                        firstLine.includes('apellido') ||
                        firstLine.includes('clasificacion');
                    const dataLines = hasHeader ? lines.slice(1) : lines;

                    const { acolytes } = get();
                    const imported = [];
                    const errors = [];

                    dataLines.forEach((line, index) => {
                        const lineNumber = hasHeader ? index + 2 : index + 1;
                        const parts = line.split(/[,;]/).map((p) => p.trim());

                        if (parts.length < 3) {
                            errors.push(`Línea ${lineNumber}: Formato incorrecto (se esperan 3 columnas)`);
                            return;
                        }

                        const [nombre, apellido, clasificacionRaw] = parts;
                        if (!nombre || !apellido) {
                            errors.push(`Línea ${lineNumber}: Nombre o apellido vacío`);
                            return;
                        }

                        const clasificacion = clasificacionRaw.toLowerCase();
                        let isAdult;
                        if (['mayor', 'adulto', 'a', 'm'].some((k) => clasificacion.includes(k))) {
                            isAdult = true;
                        } else if (['menor', 'niño', 'n'].some((k) => clasificacion.includes(k))) {
                            isAdult = false;
                        } else {
                            errors.push(`Línea ${lineNumber}: Clasificación no reconocida "${clasificacionRaw}"`);
                            return;
                        }

                        imported.push({
                            name: `${nombre} ${apellido}`,
                            isAdult,
                            id: crypto.randomUUID(),
                            number: acolytes.length + imported.length + 1,
                        });
                    });

                    if (imported.length > 0) {
                        set((state) => ({ acolytes: [...state.acolytes, ...imported] }));
                        return { success: true, imported: imported.length, errors: errors.length > 0 ? errors : null };
                    }

                    return {
                        success: false,
                        imported: 0,
                        errors: errors.length > 0 ? errors : ['No se pudo importar ningún acólito'],
                    };
                } catch (error) {
                    return { success: false, imported: 0, errors: [error.message] };
                }
            },

            /** Descarga la lista de acólitos como CSV */
            exportToCSV: () => {
                const { acolytes } = get();
                if (acolytes.length === 0) {
                    alert('No hay acólitos para exportar');
                    return;
                }

                const rows = acolytes.map((a) => {
                    const parts = a.name.trim().split(' ');
                    const nombre = parts[0];
                    const apellido = parts.slice(1).join(' ');
                    return `${nombre},${apellido},${a.isAdult ? 'Mayor' : 'Menor'}`;
                });

                const csv = `Nombre,Apellido,Clasificación\n${rows.join('\n')}`;
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `acolitos_${new Date().toISOString().split('T')[0]}.csv`;
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
        }),
        {
            name: 'acolytes', // clave en localStorage — misma que antes, sin pérdida de datos
            partialState: (state) => ({ acolytes: state.acolytes }), // solo persistir acolytes
        }
    )
);
