import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAcolyteStore } from '../store/useAcolyteStore';
import { useScheduleStore } from '../store/useScheduleStore';

export const AcolyteList = () => {
    const { acolytes, deleteAcolyte, clearAcolytes } = useAcolyteStore();
    const { resetParticipations, clearHistory } = useScheduleStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClearAll = () => {
        clearAcolytes();
        clearHistory();
    };

    return (
        <Card className="mb-8 border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl overflow-hidden transition-all duration-300">
            <CardHeader className={`border-b border-slate-100 pb-4 transition-colors ${!isExpanded && 'pb-6'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div 
                        className="flex-1 cursor-pointer group flex items-center justify-between md:justify-start gap-4"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">👥</span>
                                Directorio de Acólitos
                            </CardTitle>
                            <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Guardado automático • <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">{acolytes.length} registrados</span>
                            </p>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors md:mr-4">
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Button onClick={resetParticipations} variant="outline" className="flex-1 md:flex-none text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 font-semibold shadow-sm">
                            🔄 Reiniciar
                        </Button>
                        <Button onClick={handleClearAll} variant="outline" className="flex-1 md:flex-none text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-semibold shadow-sm">
                            🗑️ Limpiar Todo
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
            <CardContent className="pt-6 transition-all">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md text-sm">👨‍👦</span>
                            Mayores <span className="text-xs font-normal bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-auto">{acolytes.filter(a => a.isAdult).length}</span>
                        </h3>
                        <ul className="space-y-2">
                            {acolytes.filter(a => a.isAdult).map(acolyte => (
                                <li key={acolyte.id} className="group flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                                    <span className="font-medium text-slate-700">
                                        <span className="text-slate-400 mr-2 text-sm">#{acolyte.number}</span>
                                        {acolyte.name}
                                    </span>
                                    <button
                                        onClick={() => deleteAcolyte(acolyte.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Eliminar acólito"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                            {acolytes.filter(a => a.isAdult).length === 0 && (
                                <li className="text-center text-slate-400 py-4 text-sm italic">No hay mayores registrados</li>
                            )}
                        </ul>
                    </div>
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                            <span className="bg-orange-100 text-orange-600 p-1.5 rounded-md text-sm">👶</span>
                            Menores <span className="text-xs font-normal bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-auto">{acolytes.filter(a => !a.isAdult).length}</span>
                        </h3>
                        <ul className="space-y-2">
                            {acolytes.filter(a => !a.isAdult).map(acolyte => (
                                <li key={acolyte.id} className="group flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all">
                                    <span className="font-medium text-slate-700">
                                        <span className="text-slate-400 mr-2 text-sm">#{acolyte.number}</span>
                                        {acolyte.name}
                                    </span>
                                    <button
                                        onClick={() => deleteAcolyte(acolyte.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Eliminar acólito"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                            {acolytes.filter(a => !a.isAdult).length === 0 && (
                                <li className="text-center text-slate-400 py-4 text-sm italic">No hay menores registrados</li>
                            )}
                        </ul>
                    </div>
                </div>
            </CardContent>
            )}
        </Card>
    );
};