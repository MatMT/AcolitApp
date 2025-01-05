import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const AcolyteForm = ({ newAcolyte, setNewAcolyte, addAcolyte }) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Agregar Acólito</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={newAcolyte.name}
                            onChange={(e) => setNewAcolyte({...newAcolyte, name: e.target.value})}
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
            </CardContent>
        </Card>
    );
};