import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useMemo, useState } from 'react';

export const CalendarPreview = ({ scheduleMonths, adultRatio, generateSchedulePreview }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Generar una paleta de colores para cada acólito
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-300',
        'bg-green-100 text-green-800 border-green-300',
        'bg-purple-100 text-purple-800 border-purple-300',
        'bg-pink-100 text-pink-800 border-pink-300',
        'bg-yellow-100 text-yellow-800 border-yellow-300',
        'bg-indigo-100 text-indigo-800 border-indigo-300',
        'bg-red-100 text-red-800 border-red-300',
        'bg-orange-100 text-orange-800 border-orange-300',
        'bg-teal-100 text-teal-800 border-teal-300',
        'bg-cyan-100 text-cyan-800 border-cyan-300',
        'bg-lime-100 text-lime-800 border-lime-300',
        'bg-amber-100 text-amber-800 border-amber-300',
        'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
        'bg-rose-100 text-rose-800 border-rose-300',
        'bg-violet-100 text-violet-800 border-violet-300',
        'bg-sky-100 text-sky-800 border-sky-300',
        'bg-emerald-100 text-emerald-800 border-emerald-300',
    ];

    // Generar vista previa del calendario sin actualizar el historial
    const previewSchedule = useMemo(() => {
        if (!generateSchedulePreview) return [];
        
        // Generar solo las primeras 8 semanas para vista previa
        const { schedule } = generateSchedulePreview(scheduleMonths);
        return schedule.slice(0, 8); // Mostrar máximo 8 domingos
    }, [scheduleMonths, adultRatio, generateSchedulePreview, refreshKey]);

    // Crear un mapa de colores por nombre de acólito
    const colorMap = useMemo(() => {
        const map = new Map();
        let colorIndex = 0;
        
        previewSchedule.forEach(day => {
            day.team.forEach(member => {
                if (!map.has(member.name)) {
                    map.set(member.name, colors[colorIndex % colors.length]);
                    colorIndex++;
                }
            });
        });
        
        return map;
    }, [previewSchedule]);

    if (previewSchedule.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8 border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">📅</span>
                            Vista Previa del Calendario
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1">
                            {previewSchedule.length < 8 ? 'Todos los domingos' : 'Primeros 8 domingos'} • 
                            El sistema previene repeticiones y balancea
                        </p>
                    </div>
                    <Button 
                        onClick={() => setRefreshKey(k => k + 1)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                    >
                        🔄 Regenerar Simulación
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3">
                    {previewSchedule.map((day, index) => {
                        const minorsCount = day.team.filter(m => !m.isAdult).length;
                        const adultsCount = day.team.filter(m => m.isAdult).length;
                        
                        // Detectar si alguien repitió del domingo anterior
                        const hasRepeats = index > 0 && day.team.some(member => 
                            previewSchedule[index - 1].team.some(prev => prev.id === member.id)
                        );
                        
                        return (
                            <div 
                                key={index}
                                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${hasRepeats ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg text-gray-800">
                                            {day.date.toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                            Domingo #{index + 1}
                                        </span>
                                        {hasRepeats && (
                                            <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full flex items-center gap-1">
                                                ⚠️ Tiene repeticiones
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                            👨‍👦 {adultsCount} {adultsCount === 1 ? 'Mayor' : 'Mayores'}
                                        </span>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                            👶 {minorsCount} {minorsCount === 1 ? 'Menor' : 'Menores'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {day.team.map((member, idx) => {
                                        // Verificar si este acólito también estuvo la semana pasada
                                        const wasLastWeek = index > 0 && previewSchedule[index - 1].team.some(
                                            prev => prev.id === member.id
                                        );
                                        
                                        return (
                                            <div
                                                key={idx}
                                                className={`px-3 py-2.5 rounded-xl border-2 font-medium text-sm flex items-center gap-2 relative shadow-sm hover:shadow-md transition-shadow ${colorMap.get(member.name)}`}
                                            >
                                                {wasLastWeek && (
                                                    <span className="absolute -top-2 -right-2 text-xs bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-bounce" title="Acolita consecutivo">
                                                        ⚠️
                                                    </span>
                                                )}
                                                <span className="text-lg bg-white/50 w-7 h-7 flex items-center justify-center rounded-lg">
                                                    {member.isAdult ? '👨‍👦' : '👶'}
                                                </span>
                                                <span className="truncate" title={member.name}>
                                                    {member.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Leyenda de colores */}
                <div className="mt-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-600 p-1.5 rounded-md text-sm">🎨</span>
                        Leyenda de Acólitos
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(colorMap.entries()).map(([name, colorClass]) => (
                            <div
                                key={name}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-sm ${colorClass}`}
                                title={name}
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex gap-3 items-start shadow-sm">
                    <span className="text-xl">💡</span>
                    <div>
                        <p className="text-blue-900 font-bold">Nota sobre el algoritmo</p>
                        <p className="text-blue-800 text-sm mt-1 leading-relaxed">
                            El sistema evita que los acólitos participen en domingos consecutivos o repitan en el mismo mes si hay otros disponibles, 
                            garantizando una distribución justa. Los colores ayudan a identificar visualmente la rotación en el calendario.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
