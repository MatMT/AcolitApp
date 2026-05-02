import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState, useRef } from 'react';
import { useAcolyteStore } from '../store/useAcolyteStore';

export const AcolyteForm = () => {
    const { newAcolyte, setNewAcolyte, addAcolyte, importFromCSV, exportToCSV } = useAcolyteStore();
    const [importResult, setImportResult] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Por favor selecciona un archivo CSV');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const result = importFromCSV(content);
            setImportResult(result);

            // Limpiar el mensaje después de 5 segundos
            setTimeout(() => setImportResult(null), 5000);
        };
        reader.readAsText(file);

        // Limpiar el input para permitir cargar el mismo archivo de nuevo
        event.target.value = '';
    };

    const handleCSVButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card className="mb-8 border-slate-200/60 shadow-lg shadow-indigo-100/50 bg-white/80 backdrop-blur-xl overflow-hidden transition-all duration-300">
            <CardHeader 
                className={`cursor-pointer hover:bg-slate-50/50 transition-colors ${isExpanded ? 'border-b border-slate-100 pb-4' : 'pb-6'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">✨</span>
                        Agregar / Importar Acólitos
                    </CardTitle>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                        {isExpanded ? '−' : '+'}
                    </button>
                </div>
            </CardHeader>
            {isExpanded && (
            <CardContent className="pt-6 transition-all">
                <div className="space-y-6">
                    {/* Formulario manual */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                        <div className="flex-1 w-full">
                            <Label htmlFor="name" className="text-slate-700 font-semibold mb-1.5 block">Nombre completo</Label>
                            <Input
                                id="name"
                                value={newAcolyte.name}
                                onChange={(e) => setNewAcolyte({...newAcolyte, name: e.target.value})}
                                placeholder="Ej: Juan Pérez"
                                className="h-11 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                            />
                        </div>
                        <div className="flex items-center h-11 px-2 mb-1">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={newAcolyte.isAdult}
                                        onChange={(e) => setNewAcolyte({...newAcolyte, isAdult: e.target.checked})}
                                        className="w-5 h-5 border-2 border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
                                    />
                                </div>
                                <span className="ml-3 text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">
                                    Es Mayor
                                </span>
                            </label>
                        </div>
                        <div className="w-full md:w-auto mt-2 md:mt-0 mb-1">
                            <Button 
                                onClick={addAcolyte}
                                className="w-full h-11 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-200/50 transition-all hover:scale-[1.02]"
                            >
                                Agregar
                            </Button>
                        </div>
                    </div>

                    {/* Separador */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">O importa una lista</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                    </div>

                    {/* Importar/Exportar CSV */}
                    <div className="space-y-4">
                        <div className="bg-indigo-50/50 border border-indigo-100/50 p-5 rounded-xl">
                            <p className="text-sm text-indigo-900/80 mb-4">
                                📄 <strong className="text-indigo-900">Importar desde CSV:</strong> El archivo debe tener las columnas: <span className="font-mono text-xs bg-white/60 px-1 rounded">Nombre, Apellido, Clasificación (Mayor/Menor)</span>
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <Button 
                                    onClick={handleCSVButtonClick}
                                    variant="outline"
                                    className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300 font-semibold"
                                >
                                    📁 Importar CSV
                                </Button>
                                <Button 
                                    onClick={exportToCSV}
                                    variant="outline"
                                    className="bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 font-semibold"
                                >
                                    💾 Exportar CSV
                                </Button>
                            </div>
                        </div>

                        {/* Mensaje de resultado de importación */}
                        {importResult && (
                            <div className={`p-3 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                {importResult.success ? (
                                    <div>
                                        <p className="text-green-800 font-medium">✅ Importación exitosa</p>
                                        <p className="text-green-700 text-sm">Se importaron {importResult.imported} acólitos</p>
                                        {importResult.errors && (
                                            <details className="mt-2">
                                                <summary className="text-yellow-700 text-sm cursor-pointer">
                                                    ⚠️ Advertencias ({importResult.errors.length})
                                                </summary>
                                                <ul className="mt-1 text-xs text-yellow-600 list-disc list-inside">
                                                    {importResult.errors.map((error, idx) => (
                                                        <li key={idx}>{error}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-red-800 font-medium">❌ Error en la importación</p>
                                        {importResult.errors && (
                                            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                                {importResult.errors.map((error, idx) => (
                                                    <li key={idx}>{error}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ejemplo de formato CSV */}
                        <details className="group bg-white border border-slate-200 p-4 rounded-xl shadow-sm cursor-pointer hover:border-indigo-200 transition-colors">
                            <summary className="text-sm text-slate-700 font-semibold flex items-center justify-between list-none">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📋</span>
                                    Ver ejemplo de formato CSV
                                </div>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-slate-600">
                                <div>Nombre,Apellido,Clasificación</div>
                                <div>Juan,Pérez,Mayor</div>
                                <div>María,González,Menor</div>
                                <div>Pedro,Martínez,Mayor</div>
                                <div className="text-slate-400 mt-3 text-xs italic">
                                    * Clasificación puede ser: Mayor, Menor, Adulto, Niño, M, N, A
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </CardContent>
            )}
        </Card>
    );
};
