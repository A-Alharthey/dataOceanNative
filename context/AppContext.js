import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const AppContext = createContext()
export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(null);
    //filter is necessary to be within a context so the button within workorder has the how many filters are applied also for filtering the actual table
    const [filters, setFilters] = useState({ workOrder: {}, technician: {} })
    useEffect(() => {
        AsyncStorage.getItem("token").then((tokenVal) => {
            tokenVal && setToken(tokenVal)
        })
    }, [])
    const login = async (tokenVal) => {
        await AsyncStorage.setItem("token", tokenVal)
        setToken(tokenVal)
    }
    const logout = async () => {
        await AsyncStorage.removeItem("token")
        setToken(null)
    }
    return (
        <AppContext.Provider
            value={{
                token,
                loading,
                setLoading,
                login,
                logout,
                filters,
                setFilters
            }}
        >
            {children}
        </AppContext.Provider>
    )
}