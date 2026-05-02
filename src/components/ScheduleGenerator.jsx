import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState } from 'react';

export const ScheduleGenerator = ({
    scheduleMonths,
    setScheduleMonths,
    adultRatio,
    setAdultRatio,
    generateExcel,
    generatePDF,
    generateReportPDF,
    generateReportExcel,
    initialTeam = [],
    setInitialTeam,
    acolytes = [],
}) => {
    const [savedStatus, setSavedStatus] = useState(false);

    const handleInitialTeamChange = (index, value) => {
        const newTeam = [...initialTeam];
        while (newTeam.length < 4) newTeam.push('');
        newTeam[index] = value === 'none' ? '' : value;
        setInitialTeam(newTeam);
        setSavedStatus(false);
    };

    const handleSaveInitialTeam = () => {
        setSavedStatus(true);
        setTimeout(() => setSavedStatus(false), 3000);
    };

    const adultOptions = acolytes.filter(a => a.isAdult);
    const minorOptions = acolytes.filter(a => !a.isAdult);

    // Convert to exactly 4 slots for UI
    const slots = [0, 1, 2, 3].map(i => {
        const isAdultSlot = i < adultRatio;
        return {
            index: i,
            isAdultSlot,
            options: isAdultSlot ? adultOptions : minorOptions,
            value: initialTeam[i] || '',
        };
    });

    return (
        <div className="space-y-8">


            {/* 2. Exportar Calendario */}
            <Card className="border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📄</span>
                        Exportar Calendario
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 font-medium">
                            Genera y descarga el calendario completo con la distribución de acólitos:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Button onClick={generateExcel} className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md shadow-emerald-200 transition-all hover:scale-[1.02]">
                                📊 Exportar a Excel
                            </Button>
                            <Button
                                onClick={generatePDF}
                                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-200 transition-all hover:scale-[1.02]"
                            >
                                📄 Exportar a PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Exportar Reportes */}
            <Card className="border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">📈</span>
                        Exportar Reportes de Participación
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 font-medium">
                            Genera reportes detallados con estadísticas de participación de cada acólito:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Button
                                onClick={generateReportExcel}
                                className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
                            >
                                📊 Reporte a Excel
                            </Button>
                            <Button
                                onClick={generateReportPDF}
                                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
                            >
                                📄 Reporte a PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Configuracion */}
            <Card className="border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">⚙️</span>
                        Configuración del Calendario
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <Label htmlFor="months" className="text-slate-700 font-bold">Número de meses</Label>
                                <Input
                                    id="months"
                                    type="number"
                                    value={scheduleMonths}
                                    onChange={(e) => setScheduleMonths(parseInt(e.target.value))}
                                    min="1"
                                    max="12"
                                    className="mt-3 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                                />
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    Define por cuántos meses generar el calendario
                                </p>
                            </div>
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <Label htmlFor="adultRatio" className="text-slate-700 font-bold">Número de mayores por misa</Label>
                                <Input
                                    id="adultRatio"
                                    type="number"
                                    value={adultRatio}
                                    onChange={(e) => setAdultRatio(parseInt(e.target.value))}
                                    min="1"
                                    max="3"
                                    className="mt-3 bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                                />
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    Los menores completarán los 4 espacios restantes
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 1. Asignacion Manual */}
            <Card className="border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">🎯</span>
                        Asignación Manual para la Primera Fecha
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-sm text-slate-600 mb-6 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                        (Opcional) Define exactamente quiénes acólitarán en el primer domingo del período. El sistema continuará automáticamente a partir del segundo domingo evitando repeticiones.
                    </p>
                    <div className="grid md:grid-cols-2 gap-5 mb-6">
                        {slots.map((slot) => (
                            <div key={slot.index}>
                                <Label htmlFor={`slot-${slot.index}`}>
                                    {slot.isAdultSlot ? `Mayor ${slot.index + 1}` : `Menor ${slot.index + 1 - adultRatio}`}
                                </Label>
                                <select
                                    id={`slot-${slot.index}`}
                                    value={slot.value}
                                    onChange={(e) => handleInitialTeamChange(slot.index, e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                                >
                                    <option value="">-- Selección Aleatoria --</option>
                                    {slot.options.map(acolyte => (
                                        <option key={acolyte.id} value={acolyte.id}>
                                            {acolyte.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSaveInitialTeam}
                            className={`px-6 font-semibold transition-all shadow-sm ${savedStatus ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
                        >
                            {savedStatus ? '✅ Guardado y Listo' : '💾 Guardar Asignación'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};