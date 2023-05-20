import React, { useState } from "react";

const GlobalContext = React.createContext(undefined);
const CurrentVocalCallContext = React.createContext(undefined);

export const GlobalContextProvider = ({ children }) => {
    const [globalValue, setGlobalValue] = useState(false);
    const [currentVocalCall, setCurrentVocalCall] = useState<number>(-1);

    const updateGlobalValue = (newValue) => {
        setGlobalValue(newValue);
    };

    const updateCurrentVocalCall = (newValue: number) => {
        setCurrentVocalCall(newValue);
    };

    const contextValue = {
        globalValue,
        updateGlobalValue,
        currentVocalCall,
        updateCurrentVocalCall
    };

    return (
        <GlobalContext.Provider value={contextValue}>
            <CurrentVocalCallContext.Provider value={contextValue}>
                {children}
            </CurrentVocalCallContext.Provider>
        </GlobalContext.Provider>
    );
};

export default GlobalContext;