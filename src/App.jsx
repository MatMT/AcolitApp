import { useEffect } from 'react';
import { AcolyteForm } from './components/AcolyteForm';
import { AcolyteList } from './components/AcolyteList';
import { ScheduleGenerator } from './components/ScheduleGenerator';
import { StatsCard } from './components/StatsCard';
import { CalendarPreview } from './components/CalendarPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useAcolyteStore } from './store/useAcolyteStore';
import { useScheduleStore } from './store/useScheduleStore';

const App = () => {
    const { acolytes } = useAcolyteStore();
    const { syncHistoryWithAcolytes } = useScheduleStore();

    // Sincronizar el historial de participaciones cuando cambia la lista de acólitos
    useEffect(() => {
        syncHistoryWithAcolytes(acolytes);
    }, [acolytes]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 text-slate-800 font-sans selection:bg-indigo-200 selection:text-indigo-900">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Programador de Acólitos
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">
                        Sistema automatizado de asignaciones equilibradas
                    </p>
                    <div className="mt-4 inline-flex items-center justify-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-200/60">
                        <span className="text-sm text-slate-500">Desarrollado por</span>
                        <span className="font-semibold text-slate-700">Mateo Elías</span>
                    </div>
                </div>

                <Tabs defaultValue="acolytes" className="flex flex-col md:flex-row gap-6">
                    {/* Navegación lateral */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="sticky top-8">
                            <TabsList className="w-full">
                                <TabsTrigger value="acolytes" className="w-full flex items-center gap-3">
                                    <span className="text-xl">👥</span>
                                    <span>Directorio</span>
                                </TabsTrigger>
                                <TabsTrigger value="export" className="w-full flex items-center gap-3" disabled={acolytes.length === 0}>
                                    <span className="text-xl">💾</span>
                                    <span>Exportar</span>
                                </TabsTrigger>
                                <TabsTrigger value="stats" className="w-full flex items-center gap-3" disabled={acolytes.length === 0}>
                                    <span className="text-xl">📊</span>
                                    <span>Estadísticas</span>
                                </TabsTrigger>
                            </TabsList>

                            {acolytes.length === 0 && (
                                <div className="mt-6 p-4 bg-indigo-50/80 border border-indigo-200/60 rounded-xl text-indigo-800 text-sm font-medium shadow-sm">
                                    👆 Agrega acólitos en el directorio para habilitar las demás opciones.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                        <TabsContent value="acolytes" className="transition-all">
                            <AcolyteForm />
                            <AcolyteList />
                        </TabsContent>

                        {acolytes.length > 0 && (
                            <>
                                <TabsContent value="stats" className="transition-all">
                                    <StatsCard />
                                </TabsContent>

                                <TabsContent value="preview" className="transition-all">
                                    <CalendarPreview />
                                </TabsContent>

                                <TabsContent value="export" className="transition-all">
                                    <ScheduleGenerator />
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default App;