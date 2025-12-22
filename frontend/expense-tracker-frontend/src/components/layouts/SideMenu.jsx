import React, { useContext } from 'react'
import { SIDE_DATA_MENU } from '../../utils/data.js'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import CharAvatar from '../cards/CharAvatar.jsx'

const SideMenu = ({activeMenu}) => {
    const {user , clearUser} = useContext(UserContext)
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    }

    const handleClick= (route) =>{
        if(route == logout){
            handleLogout();
            return;
        }
    }


  return <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
            <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-7'>
            {user?.profileImageUrl? (
                <img
                src = { user?.profileImageUrl || " "}
                alt ="profile image"
                className='w-20 h-20 bg-slate-400 rounded-full'
                /> )
                :(
                <CharAvatar
                    fullname ={user?.name}
                    width = "w-20"
                    height ="h-20"
                    style="text-xl"
                />
                )

            }
            <h5 className='text-gray-950 font-medium leading-6'>
                {user?.name || ""}
            </h5>
            </div>

            { SIDE_DATA_MENU.map((item , index) =>(
                
                <button
                 key= {`menu_${index}`}
                 className={`w-full flex items-center gap-4 text-[15px] ${ 
                    activeMenu === item.label ? "text-white bg-gray-800"  :  " "
                } py-3 px-6 rounded-lg mb-3 cursor-pointer`}
                 onClick ={()=> navigate(item.path)}
                
                >

                <item.icon className="text-xl"/>
                {item.label}
                </button>
            ))}
        </div>
  
}

export default SideMenu;