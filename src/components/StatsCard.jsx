import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useMemo } from 'react';

export const StatsCard = ({ 
    acolytes, 
    scheduleMonths, 
    adultRatio, 
    calculateExpectedParticipations,
    participationHistory 
}) => {
    const stats = useMemo(() => {
        if (!calculateExpectedParticipations) return null;
        return calculateExpectedParticipations(scheduleMonths);
    }, [scheduleMonths, acolytes, adultRatio, calculateExpectedParticipations]);

    if (!stats) return null;

    const adults = acolytes.filter(a => a.isAdult);
    const minors = acolytes.filter(a => !a.isAdult);
    const minorsNeeded = 4 - adultRatio;

    return (
        <Card className="mb-8 border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">📊</span>
                    Estadísticas de Distribución
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Información general */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md text-sm">📅</span>
                                Información del Periodo
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Duración:</span>
                                    <span className="font-bold text-slate-800">{scheduleMonths} meses</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Domingos totales:</span>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{stats.sundaysCount}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Espacios por misa:</span>
                                    <span className="font-bold text-slate-800">4 acólitos</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Total de espacios:</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{stats.totalSlots}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md text-sm">👥</span>
                                Composición de Equipos
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Mayores por misa:</span>
                                    <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{adultRatio}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Menores por misa:</span>
                                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{minorsNeeded}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participaciones esperadas */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md text-sm">👨‍👦</span>
                                Acólitos Mayores
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Total de mayores:</span>
                                    <span className="font-bold text-slate-800">{stats.adultsCount}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Espacios totales:</span>
                                    <span className="font-bold text-slate-800">{stats.sundaysCount * adultRatio}</span>
                                </div>
                                <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
                                    <span className="text-purple-900 font-semibold text-sm">Frecuencia estimada:</span>
                                    <span className="font-black text-lg text-purple-600 drop-shadow-sm">
                                        ~{stats.expectedPerAdult} <span className="text-xs font-medium text-purple-400">veces c/u</span>
                                    </span>
                                </div>
                                {stats.adultsCount === 0 && (
                                    <p className="text-rose-500 text-xs font-medium mt-2 flex items-center gap-1"><span className="text-base">⚠️</span> No hay acólitos mayores registrados</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-md text-sm">👶</span>
                                Acólitos Menores
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Total de menores:</span>
                                    <span className="font-bold text-slate-800">{stats.minorsCount}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-600 text-sm font-medium">Espacios totales:</span>
                                    <span className="font-bold text-slate-800">{stats.sundaysCount * minorsNeeded}</span>
                                </div>
                                <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                                    <span className="text-orange-900 font-semibold text-sm">Frecuencia estimada:</span>
                                    <span className="font-black text-lg text-orange-600 drop-shadow-sm">
                                        ~{stats.expectedPerMinor} <span className="text-xs font-medium text-orange-400">veces c/u</span>
                                    </span>
                                </div>
                                {stats.minorsCount === 0 && (
                                    <p className="text-rose-500 text-xs font-medium mt-2 flex items-center gap-1"><span className="text-base">⚠️</span> No hay acólitos menores registrados</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de distribución actual */}
                {participationHistory && participationHistory.length > 0 && (
                    <div className="mt-8 bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-md text-sm">📈</span>
                            Distribución Actual de Participaciones
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            {adults.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-3 text-purple-700 border-b border-purple-100 pb-2">Mayores</h4>
                                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {participationHistory
                                            .filter(p => p.isAdult)
                                            .sort((a, b) => b.participations - a.participations)
                                            .map(p => (
                                                <div key={p.id} className="group flex justify-between items-center p-2.5 bg-white border border-slate-100 hover:border-purple-200 rounded-lg hover:shadow-sm transition-all">
                                                    <span className="text-slate-700 font-medium group-hover:text-purple-700 transition-colors">{p.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                                                            {Number(p.participations).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {minors.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-3 text-orange-700 border-b border-orange-100 pb-2">Menores</h4>
                                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {participationHistory
                                            .filter(p => !p.isAdult)
                                            .sort((a, b) => b.participations - a.participations)
                                            .map(p => (
                                                <div key={p.id} className="group flex justify-between items-center p-2.5 bg-white border border-slate-100 hover:border-orange-200 rounded-lg hover:shadow-sm transition-all">
                                                    <span className="text-slate-700 font-medium group-hover:text-orange-700 transition-colors">{p.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                                            {Number(p.participations).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Advertencias */}
                {(stats.adultsCount < adultRatio || stats.minorsCount < minorsNeeded) && (
                    <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm flex gap-3 items-start">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="text-amber-800 font-bold">Atención Requerida</p>
                            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                                {stats.adultsCount < adultRatio && 
                                    `No hay suficientes acólitos mayores. Se necesitan al menos ${adultRatio} mayores por misa. `}
                                {stats.minorsCount < minorsNeeded && 
                                    `No hay suficientes acólitos menores. Se necesitan al menos ${minorsNeeded} menores por misa.`}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
