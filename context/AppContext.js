import { createContext, useEffect, useState } from "react";
import { storage } from "../tools/mmkvStorage";

export const AppContext = createContext()
export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading,setLoading] = useState(null);
    useEffect(() => {
        storage.getString("userData") && setToken(JSON.parse(storage.getString("userData")).token)
    }, [])
    const login = (userData)=>{
        storage.set("userData",JSON.stringify(userData))
        setToken(userData.token)
    }
    const logout = ()=>{
        storage.remove("userData")
        setToken(null)
    }
    return(
        <AppContext.Provider
        value={{    
            token,
            loading,
            setLoading,
            login,
            logout
        }}
        >
            {children}
        </AppContext.Provider>
    )
}