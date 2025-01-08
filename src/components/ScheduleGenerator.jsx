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
        <Card>
            <CardHeader>
                <CardTitle>Generar Calendario</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className='flex-auto'>
                            <Label htmlFor="months">Número de meses</Label>
                            <Input
                                id="months"
                                type="number"
                                value={scheduleMonths}
                                onChange={(e) => setScheduleMonths(parseInt(e.target.value))}
                                min="1"
                                max="12"
                                className="w-24"
                            />
                        </div>
                        <div className='flex-auto'>
                            <Label htmlFor="adultRatio">Número de mayores por misa</Label>
                            <Input
                                id="adultRatio"
                                type="number"
                                value={adultRatio}
                                onChange={(e) => setAdultRatio(parseInt(e.target.value))}
                                min="1"
                                max="3"
                                className="w-24"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={generateExcel} className='flex-auto'>Exportar a Excel</Button>
                        <Button
                            onClick={generatePDF}
                            className="bg-green-600 hover:bg-green-700 flex-auto"
                        >
                            Exportar Calendario a PDF
                        </Button>
                        <Button
                            onClick={generateReportExcel}
                            className="bg-blue-600 hover:bg-blue-700 flex-auto"
                        >
                            Reporte a Excel
                        </Button>
                        <Button
                            onClick={generateReportPDF}
                            className="bg-purple-600 hover:bg-purple-700 flex-auto"
                        >
                            Reporte a PDF
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};