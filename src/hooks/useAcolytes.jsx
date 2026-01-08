import { useState, useEffect } from 'react';

export const useAcolytes = () => {
    const [acolytes, setAcolytes] = useState(() => {
        const savedAcolytes = localStorage.getItem('acolytes');
        return savedAcolytes ? JSON.parse(savedAcolytes) : [];
    });
    const [newAcolyte, setNewAcolyte] = useState({ name: '', isAdult: false });

    useEffect(() => {
        localStorage.setItem('acolytes', JSON.stringify(acolytes));
    }, [acolytes]);

    const addAcolyte = () => {
        if (newAcolyte.name.trim()) {
            setAcolytes([...acolytes, {
                ...newAcolyte,
                id: Date.now(),
                number: acolytes.length + 1
            }]);
            setNewAcolyte({ name: '', isAdult: false });
        }
    };

    const deleteAcolyte = (id) => {
        setAcolytes(prev => {
            const filtered = prev.filter(acolyte => acolyte.id !== id);

            // Renumerar los acólitos
            return filtered.map((acolyte, index) => ({
                ...acolyte,
                number: index + 1,
            }));
        });
    };

    const clearAcolytes = () => {
        setAcolytes([]);
        localStorage.removeItem('participationHistory');
    };

    const importFromCSV = (csvContent) => {
        try {
            // Dividir en líneas
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                throw new Error('El archivo CSV está vacío');
            }

            // Verificar si la primera línea es un encabezado
            const firstLine = lines[0].toLowerCase();
            const hasHeader = firstLine.includes('nombre') || firstLine.includes('apellido') || firstLine.includes('clasificacion');
            
            const dataLines = hasHeader ? lines.slice(1) : lines;
            const importedAcolytes = [];
            const errors = [];

            dataLines.forEach((line, index) => {
                const lineNumber = hasHeader ? index + 2 : index + 1;
                
                // Separar por coma o punto y coma
                const parts = line.split(/[,;]/).map(part => part.trim());
                
                if (parts.length < 3) {
                    errors.push(`Línea ${lineNumber}: Formato incorrecto (se esperan al menos 3 columnas)`);
                    return;
                }

                const nombre = parts[0];
                const apellido = parts[1];
                const clasificacion = parts[2].toLowerCase();

                if (!nombre || !apellido) {
                    errors.push(`Línea ${lineNumber}: Nombre o apellido vacío`);
                    return;
                }

                // Determinar si es mayor o menor
                let isAdult = false;
                if (clasificacion.includes('mayor') || clasificacion.includes('adulto') || clasificacion === 'a' || clasificacion === 'm') {
                    isAdult = true;
                } else if (clasificacion.includes('menor') || clasificacion.includes('niño') || clasificacion === 'n') {
                    isAdult = false;
                } else {
                    errors.push(`Línea ${lineNumber}: Clasificación no reconocida "${parts[2]}" (use "Mayor" o "Menor")`);
                    return;
                }

                importedAcolytes.push({
                    name: `${nombre} ${apellido}`,
                    isAdult,
                    id: Date.now() + index,
                    number: acolytes.length + importedAcolytes.length + 1
                });
            });

            if (importedAcolytes.length > 0) {
                setAcolytes([...acolytes, ...importedAcolytes]);
                return {
                    success: true,
                    imported: importedAcolytes.length,
                    errors: errors.length > 0 ? errors : null
                };
            } else {
                return {
                    success: false,
                    imported: 0,
                    errors: errors.length > 0 ? errors : ['No se pudo importar ningún acólito']
                };
            }
        } catch (error) {
            return {
                success: false,
                imported: 0,
                errors: [error.message]
            };
        }
    };

    const exportToCSV = () => {
        if (acolytes.length === 0) {
            alert('No hay acólitos para exportar');
            return;
        }

        // Crear contenido CSV
        let csvContent = 'Nombre,Apellido,Clasificación\n';
        
        acolytes.forEach(acolyte => {
            const nameParts = acolyte.name.trim().split(' ');
            const apellido = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            const nombre = nameParts[0];
            const clasificacion = acolyte.isAdult ? 'Mayor' : 'Menor';
            
            csvContent += `${nombre},${apellido},${clasificacion}\n`;
        });

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `acolitos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        acolytes,
        newAcolyte,
        setNewAcolyte,
        addAcolyte,
        deleteAcolyte,
        clearAcolytes,
        importFromCSV,
        exportToCSV
    };
};
