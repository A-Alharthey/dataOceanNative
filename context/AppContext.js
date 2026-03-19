import { createContext, useEffect, useState } from "react";
import { storage } from "../tools/mmkvStorage";

export const AppContext = createContext()
export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(null);
    //filter is necessary to be within a context so the button within workorder has the how many filters are applied also for filtering the actual table
    const [filters, setFilters] = useState({ workOrder: {}, technician: {} })
    useEffect(() => {
        storage.getString("userData") && setToken(JSON.parse(storage.getString("userData")).token)
    }, [])
    const login = (userData) => {
        storage.set("userData", JSON.stringify(userData))
        setToken(userData.token)
    }
    const logout = () => {
        storage.remove("userData")
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