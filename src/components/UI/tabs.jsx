import { useState } from 'react';

export const Tabs = ({ defaultValue, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    // Filtrar children para obtener TabsList y TabsContent
    const childrenArray = Array.isArray(children) ? children : [children];
    const tabsList = childrenArray.find(child => child?.type === TabsList);
    const tabsContents = childrenArray.filter(child => child?.type === TabsContent);

    return (
        <div className={`tabs-container ${className}`}>
            {tabsList && (
                <TabsList {...tabsList.props} activeTab={activeTab} setActiveTab={setActiveTab}>
                    {tabsList.props.children}
                </TabsList>
            )}
            {tabsContents.map(content => {
                if (content.props.value === activeTab) {
                    return <TabsContent key={content.props.value} {...content.props} />;
                }
                return null;
            })}
        </div>
    );
};

export const TabsList = ({ children, activeTab, setActiveTab, className = '' }) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    
    return (
        <div className={`flex border-b border-gray-200 mb-6 bg-white rounded-t-lg ${className}`}>
            {childrenArray.map(child => {
                if (child?.type === TabsTrigger) {
                    return (
                        <TabsTrigger
                            key={child.props.value}
                            {...child.props}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export const TabsTrigger = ({ value, children, activeTab, setActiveTab, className = '' }) => {
    const isActive = activeTab === value;
    
    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${className}`}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ value, children, className = '' }) => {
    return (
        <div className={`tabs-content ${className}`}>
            {children}
        </div>
    );
};
