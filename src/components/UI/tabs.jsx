import { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export const Tabs = ({ defaultValue, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`tabs-container ${className}`}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-row overflow-x-auto md:overflow-visible md:flex-col md:border-b-0 border-b border-gray-200 mb-6 bg-white md:bg-transparent rounded-t-lg md:rounded-none gap-2 scrollbar-hide ${className}`}>
            {children}
        </div>
    );
};

export const TabsTrigger = ({ value, children, className = '', disabled = false }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === value;
    
    return (
        <button
            onClick={() => !disabled && setActiveTab(value)}
            disabled={disabled}
            className={`px-4 py-3 md:px-6 md:py-4 text-left font-medium text-sm transition-all border-b-2 md:border-b-0 md:border-l-4 md:rounded-r-lg flex items-center gap-2 whitespace-nowrap ${
                isActive
                    ? 'border-indigo-600 md:border-indigo-600 text-indigo-700 bg-indigo-50/50 md:bg-white shadow-sm md:shadow-md'
                    : 'border-transparent text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-500' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ value, children, className = '' }) => {
    const { activeTab } = useContext(TabsContext);
    
    if (activeTab !== value) {
        return null;
    }
    
    return (
        <div className={`tabs-content ${className}`}>
            {children}
        </div>
    );
};
