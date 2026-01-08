import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useState, useRef } from 'react';

export const AcolyteForm = ({ newAcolyte, setNewAcolyte, addAcolyte, importFromCSV, exportToCSV }) => {
    const [importResult, setImportResult] = useState(null);
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
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Agregar Acólito</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Formulario manual */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                                id="name"
                                value={newAcolyte.name}
                                onChange={(e) => setNewAcolyte({...newAcolyte, name: e.target.value})}
                                placeholder="Ej: Juan Pérez"
                                className="mb-2"
                            />
                        </div>
                        <div className="flex items-end mb-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={newAcolyte.isAdult}
                                    onChange={(e) => setNewAcolyte({...newAcolyte, isAdult: e.target.checked})}
                                    className="mr-2"
                                />
                                Es Mayor
                            </label>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={addAcolyte}>Agregar</Button>
                        </div>
                    </div>

                    {/* Separador */}
                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-gray-500 text-sm">O</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Importar/Exportar CSV */}
                    <div className="space-y-3">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 mb-3">
                                📄 <strong>Importar desde CSV:</strong> El archivo debe tener las columnas: Nombre, Apellido, Clasificación (Mayor/Menor)
                            </p>
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <Button 
                                    onClick={handleCSVButtonClick}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    📁 Importar CSV
                                </Button>
                                <Button 
                                    onClick={exportToCSV}
                                    className="bg-green-600 hover:bg-green-700"
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
                        <details className="bg-gray-50 p-3 rounded-lg">
                            <summary className="text-sm text-gray-700 cursor-pointer font-medium">
                                📋 Ver ejemplo de formato CSV
                            </summary>
                            <div className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 font-mono">
                                <div>Nombre,Apellido,Clasificación</div>
                                <div>Juan,Pérez,Mayor</div>
                                <div>María,González,Menor</div>
                                <div>Pedro,Martínez,Mayor</div>
                                <div className="text-gray-500 mt-2">
                                    * Clasificación puede ser: Mayor, Menor, Adulto, Niño, M, N, A
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
