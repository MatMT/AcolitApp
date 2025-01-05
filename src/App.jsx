import {useAcolytes} from './hooks/useAcolytes';
import {useScheduleGenerator} from './hooks/useScheduleGenerator';
import {AcolyteForm} from './components/AcolyteForm';
import {AcolyteList} from './components/AcolyteList';
import {ScheduleGenerator} from './components/ScheduleGenerator';

const App = () => {
    const {
        acolytes,
        newAcolyte,
        setNewAcolyte,
        addAcolyte,
        deleteAcolyte,
        clearAcolytes
    } = useAcolytes();

    const {
        scheduleMonths,
        setScheduleMonths,
        adultRatio,
        setAdultRatio,
        generateReportExcel,
        generateReportPDF,
        generateExcel,
        generatePDF
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
                />

                <AcolyteList
                    acolytes={acolytes}
                    onDelete={deleteAcolyte}
                    onClear={clearAcolytes}
                />

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
            </div>
        </div>
    );
};

export default App;