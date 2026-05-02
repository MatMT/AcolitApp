/**
 * useScheduleStore.js
 * Store Zustand para la configuración del calendario y el historial de participaciones.
 * Llama a scheduleEngine.js para la lógica pura y exportService.js para los archivos.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSchedule, calculateExpectedParticipations } from '../services/scheduleEngine';
import {
    exportCalendarExcel,
    exportCalendarPDF,
    exportReportPDF,
    exportReportExcel,
} from '../services/exportService';

export const useScheduleStore = create(
    persist(
        (set, get) => ({
            // ─── State ───────────────────────────────────────────────────────────
            scheduleMonths: 3,
            adultRatio: 2,
            initialTeam: [],          // IDs del equipo del primer domingo
            participationHistory: [], // historial de participaciones por acólito

            // ─── Setters simples ─────────────────────────────────────────────────
            setScheduleMonths: (months) => set({ scheduleMonths: months }),
            setAdultRatio: (ratio) => set({ adultRatio: ratio }),
            setInitialTeam: (team) => set({ initialTeam: team }),

            // ─── Sincronización con la lista de acólitos ─────────────────────────
            /**
             * Sincroniza participationHistory con el array de acólitos actual.
             * Se llama desde los componentes cuando la lista de acólitos cambia.
             */
            syncHistoryWithAcolytes: (acolytes) => {
                const sanitize = (v) => {
                    if (!Number.isFinite(v) || Number.isNaN(v) || v < 0 || v > 1000) return 0;
                    return Math.floor(v);
                };

                const { participationHistory } = get();
                const updated = acolytes.map((acolyte) => {
                    const existing = participationHistory.find((p) => p.id === acolyte.id);
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

                set({ participationHistory: updated });
            },

            // ─── Acciones ────────────────────────────────────────────────────────

            /** Resetea los contadores de participación (sin borrar los acólitos) */
            resetParticipations: () => {
                set((state) => ({
                    participationHistory: state.participationHistory.map((p) => ({
                        ...p,
                        participations: 0,
                        lastMonthParticipations: 0,
                        lastServedDate: null,
                    })),
                }));
            },

            /** Limpia el historial completamente (se llama al limpiar todos los acólitos) */
            clearHistory: () => set({ participationHistory: [], initialTeam: [] }),

            /**
             * Genera el calendario en modo preview (no modifica el historial persistido).
             * @returns {{ schedule, finalHistory }}
             */
            generatePreview: () => {
                const { participationHistory, scheduleMonths, adultRatio, initialTeam } = get();
                return generateSchedule({ participationHistory, months: scheduleMonths, adultRatio, initialTeam });
            },

            /** Exporta el calendario a Excel */
            generateExcel: () => {
                const { schedule, finalHistory } = get().generatePreview();
                exportCalendarExcel({ schedule, finalHistory });
            },

            /** Exporta el calendario a PDF */
            generatePDF: () => {
                const { scheduleMonths } = get();
                const { schedule } = get().generatePreview();
                exportCalendarPDF({ schedule, scheduleMonths });
            },

            /** Exporta el reporte de participaciones a PDF */
            generateReportPDF: () => {
                const { finalHistory } = get().generatePreview();
                exportReportPDF({ finalHistory });
            },

            /** Exporta el reporte de participaciones a Excel */
            generateReportExcel: () => {
                const { finalHistory } = get().generatePreview();
                exportReportExcel({ finalHistory });
            },

            /** Calcula estadísticas de participación esperada */
            getExpectedParticipations: (acolytes) => {
                const { scheduleMonths, adultRatio } = get();
                return calculateExpectedParticipations({ acolytes, months: scheduleMonths, adultRatio });
            },
        }),
        {
            name: 'participationHistory', // misma clave que antes — sin pérdida de datos
            partialState: (state) => ({ participationHistory: state.participationHistory }),
        }
    )
);
