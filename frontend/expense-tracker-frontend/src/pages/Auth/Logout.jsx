import React,{ useContext }  from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate} from 'react-router-dom';
import {UserContext} from "../../context/UserContext"
import { ThemeContext } from '../../context/ThemeContext';
import { RiLogoutBoxLine } from "react-icons/ri";

export default function Logout() {
    const {user , clearUser} = useContext(UserContext)
    const {isDark} = useContext(ThemeContext)
    const navigate = useNavigate();
    

     const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    }

  return (
<DashboardLayout activeMenu="Logout">

    <div className={` fixed top-0 right-0 left-0 z-50 flex justify-center items-center 
      w-full h-full max-h-full overflow-y-auto overflow-x-hidden bg-transparent backdrop-blur-lg`}>

        <div className={`${isDark? 'card-dark' : 'card'}  border-1 border-gray-300  m-3 flex flex-col items-center justify-around`}>

            <p>
                <RiLogoutBoxLine size={50} color='red' className='mb-4 p-2 ' />
            </p>
             <p className={`m-3 text-lg ${isDark? 'text-white':'text-gray-800'}`}>
                Do you want to logout from FinTrack?
            </p>

           <div className='flex flex-row items-center justify-center gap-5 m-3 '>
            
            <button
            className={` text-xl ${isDark? 'btn-primary-dark':'btn-primary'}`}
            onClick={() => navigate("/dashboard")}>
                Return to dashboard
            </button>

            <button
            className={` delete-btn rounded-2xl`} 
            onClick = {() => handleLogout()}>
                Logout
            </button>
           </div>
        </div>
    </div>
</DashboardLayout>
  )
}
