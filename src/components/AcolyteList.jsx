import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const AcolyteList = ({ acolytes, onDelete, onClear }) => {
    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Acólitos</CardTitle>
                <Button onClick={onClear} className="bg-red-600 hover:bg-red-700">
                    Limpiar Lista
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold mb-2">Mayores</h3>
                        <ul>
                            {acolytes.filter(a => a.isAdult).map(acolyte => (
                                <li key={acolyte.id} className="flex justify-between items-center mb-2">
                                    <span>{acolyte.number}. {acolyte.name}</span>
                                    <button
                                        onClick={() => onDelete(acolyte.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Menores</h3>
                        <ul>
                            {acolytes.filter(a => !a.isAdult).map(acolyte => (
                                <li key={acolyte.id} className="flex justify-between items-center mb-2">
                                    <span>{acolyte.number}. {acolyte.name}</span>
                                    <button
                                        onClick={() => onDelete(acolyte.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};