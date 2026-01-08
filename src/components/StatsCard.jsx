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
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
                <CardTitle className="text-2xl">📊 Estadísticas de Distribución</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Información general */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-3 text-indigo-700">
                                📅 Información del Periodo
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duración:</span>
                                    <span className="font-semibold">{scheduleMonths} meses</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Domingos totales:</span>
                                    <span className="font-semibold text-blue-600">{stats.sundaysCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Espacios por misa:</span>
                                    <span className="font-semibold">4 acólitos</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total de espacios:</span>
                                    <span className="font-semibold text-green-600">{stats.totalSlots}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-3 text-indigo-700">
                                👥 Composición de Equipos
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mayores por misa:</span>
                                    <span className="font-semibold text-purple-600">{adultRatio}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Menores por misa:</span>
                                    <span className="font-semibold text-orange-600">{minorsNeeded}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participaciones esperadas */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-3 text-purple-700">
                                👨‍👦 Acólitos Mayores
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total de mayores:</span>
                                    <span className="font-semibold">{stats.adultsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Espacios totales:</span>
                                    <span className="font-semibold">{stats.sundaysCount * adultRatio}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="text-gray-700 font-medium">Veces por persona:</span>
                                    <span className="font-bold text-lg text-purple-600">
                                        ~{stats.expectedPerAdult} veces
                                    </span>
                                </div>
                                {stats.adultsCount === 0 && (
                                    <p className="text-red-500 text-sm mt-2">⚠️ No hay acólitos mayores registrados</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-3 text-orange-700">
                                👶 Acólitos Menores
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total de menores:</span>
                                    <span className="font-semibold">{stats.minorsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Espacios totales:</span>
                                    <span className="font-semibold">{stats.sundaysCount * minorsNeeded}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="text-gray-700 font-medium">Veces por persona:</span>
                                    <span className="font-bold text-lg text-orange-600">
                                        ~{stats.expectedPerMinor} veces
                                    </span>
                                </div>
                                {stats.minorsCount === 0 && (
                                    <p className="text-red-500 text-sm mt-2">⚠️ No hay acólitos menores registrados</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de distribución actual */}
                {participationHistory && participationHistory.length > 0 && (
                    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-lg mb-3 text-green-700">
                            📈 Distribución Actual de Participaciones
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {adults.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-purple-600">Mayores</h4>
                                    <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                        {participationHistory
                                            .filter(p => p.isAdult)
                                            .sort((a, b) => b.participations - a.participations)
                                            .map(p => (
                                                <div key={p.id} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                                                    <span className="text-gray-700">{p.name}</span>
                                                    <span className="font-semibold text-purple-600">
                                                        {Number(p.participations).toLocaleString()} 
                                                        {stats.expectedPerAdult > 0 && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({Math.min(999, Math.round((p.participations / stats.expectedPerAdult) * 100))}%)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {minors.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2 text-orange-600">Menores</h4>
                                    <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                        {participationHistory
                                            .filter(p => !p.isAdult)
                                            .sort((a, b) => b.participations - a.participations)
                                            .map(p => (
                                                <div key={p.id} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                                                    <span className="text-gray-700">{p.name}</span>
                                                    <span className="font-semibold text-orange-600">
                                                        {Number(p.participations).toLocaleString()}
                                                        {stats.expectedPerMinor > 0 && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({Math.min(999, Math.round((p.participations / stats.expectedPerMinor) * 100))}%)
                                                            </span>
                                                        )}
                                                    </span>
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
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">⚠️ Advertencia</p>
                        <p className="text-yellow-700 text-sm mt-1">
                            {stats.adultsCount < adultRatio && 
                                `No hay suficientes acólitos mayores. Se necesitan al menos ${adultRatio} mayores por misa. `}
                            {stats.minorsCount < minorsNeeded && 
                                `No hay suficientes acólitos menores. Se necesitan al menos ${minorsNeeded} menores por misa.`}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
