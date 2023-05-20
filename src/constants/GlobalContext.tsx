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


    return (
        <GlobalContext.Provider value={{ globalValue, updateGlobalValue }}>
            <CurrentVocalCallContext.Provider value={{ currentVocalCall, updateCurrentVocalCall }}>
                {children}
            </CurrentVocalCallContext.Provider>
        </GlobalContext.Provider>
    );
};

export {GlobalContext, CurrentVocalCallContext};