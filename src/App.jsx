import {useAcolytes} from './hooks/useAcolytes';
import {useScheduleGenerator} from './hooks/useScheduleGenerator';
import {AcolyteForm} from './components/AcolyteForm';
import {AcolyteList} from './components/AcolyteList';
import {ScheduleGenerator} from './components/ScheduleGenerator';
import {StatsCard} from './components/StatsCard';
import {CalendarPreview} from './components/CalendarPreview';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/ui/tabs';

const App = () => {
    const {
        acolytes,
        newAcolyte,
        setNewAcolyte,
        addAcolyte,
        deleteAcolyte,
        clearAcolytes,
        importFromCSV,
        exportToCSV
    } = useAcolytes();

    const {
        scheduleMonths,
        setScheduleMonths,
        adultRatio,
        setAdultRatio,
        generateReportExcel,
        generateReportPDF,
        generateExcel,
        generatePDF,
        calculateExpectedParticipations,
        participationHistory,
        generateSchedule,
        generateSchedulePreview,
        resetParticipations,
    } = useScheduleGenerator(acolytes);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Programador de Acólitos
                </h1>

                <h2 className="text-xl text-center">Desarollado Por: Mateo Elías</h2>

                <hr className="my-8"/>

                <AcolyteForm
                    newAcolyte={newAcolyte}
                    setNewAcolyte={setNewAcolyte}
                    addAcolyte={addAcolyte}
                    importFromCSV={importFromCSV}
                    exportToCSV={exportToCSV}
                />

                <AcolyteList
                    acolytes={acolytes}
                    onDelete={deleteAcolyte}
                    onClear={clearAcolytes}
                    onResetCounts={resetParticipations}
                />

                {acolytes.length > 0 ? (
                    <Tabs defaultValue="stats">
                        <TabsList>
                            <TabsTrigger value="stats">
                                📊 Estadísticas
                            </TabsTrigger>
                            <TabsTrigger value="preview">
                                📅 Vista Previa del Calendario
                            </TabsTrigger>
                            <TabsTrigger value="export">
                                💾 Exportar
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="stats">
                            <StatsCard 
                                acolytes={acolytes}
                                scheduleMonths={scheduleMonths}
                                adultRatio={adultRatio}
                                calculateExpectedParticipations={calculateExpectedParticipations}
                                participationHistory={participationHistory}
                            />
                        </TabsContent>

                        <TabsContent value="preview">
                            <CalendarPreview 
                                scheduleMonths={scheduleMonths}
                                adultRatio={adultRatio}
                                generateSchedulePreview={generateSchedulePreview}
                            />
                        </TabsContent>

                        <TabsContent value="export">
                            <ScheduleGenerator
                                scheduleMonths={scheduleMonths}
                                setScheduleMonths={setScheduleMonths}
                                adultRatio={adultRatio}
                                setAdultRatio={setAdultRatio}
                                generateExcel={generateExcel}
                                generatePDF={generatePDF}
                                generateReportPDF={generateReportPDF}
                                generateReportExcel={generateReportExcel}
                            />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">
                            👆 Agrega acólitos para comenzar a generar calendarios
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;