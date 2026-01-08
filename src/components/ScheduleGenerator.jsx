import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const ScheduleGenerator = ({
                                      scheduleMonths,
                                      setScheduleMonths,
                                      adultRatio,
                                      setAdultRatio,
                                      generateExcel,
                                      generatePDF,
                                      generateReportPDF,
                                      generateReportExcel,
                                  }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Configuración del Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="months">Número de meses</Label>
                                <Input
                                    id="months"
                                    type="number"
                                    value={scheduleMonths}
                                    onChange={(e) => setScheduleMonths(parseInt(e.target.value))}
                                    min="1"
                                    max="12"
                                    className="mt-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Define por cuántos meses generar el calendario
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="adultRatio">Número de mayores por misa</Label>
                                <Input
                                    id="adultRatio"
                                    type="number"
                                    value={adultRatio}
                                    onChange={(e) => setAdultRatio(parseInt(e.target.value))}
                                    min="1"
                                    max="3"
                                    className="mt-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Los menores completarán los 4 espacios restantes
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>📄 Exportar Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Genera y descarga el calendario completo con la distribución de acólitos:
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Button onClick={generateExcel} className="w-full">
                                📊 Exportar Calendario a Excel
                            </Button>
                            <Button
                                onClick={generatePDF}
                                className="bg-green-600 hover:bg-green-700 w-full"
                            >
                                📄 Exportar Calendario a PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>📈 Exportar Reportes de Participación</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Genera reportes detallados con estadísticas de participación de cada acólito:
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Button
                                onClick={generateReportExcel}
                                className="bg-blue-600 hover:bg-blue-700 w-full"
                            >
                                📊 Reporte a Excel
                            </Button>
                            <Button
                                onClick={generateReportPDF}
                                className="bg-purple-600 hover:bg-purple-700 w-full"
                            >
                                📄 Reporte a PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};