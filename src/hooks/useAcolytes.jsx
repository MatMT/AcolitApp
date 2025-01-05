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

    return {
        acolytes,
        newAcolyte,
        setNewAcolyte,
        addAcolyte,
        deleteAcolyte,
        clearAcolytes
    };
};
