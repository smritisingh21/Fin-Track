import React,{createContext ,useState} from 'react';

export const UserContext = createContext();

const UserProvider = ({children}) =>{

    const [user , setUser ] = useState(null);

    const updateUser = (userData) =>{
        setUser(userData);
    }
    const clearUser = () =>{
        setUser(null);
    }

    return (
        <UserContext.Provider value={{updateUser , clearUser , user}}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;