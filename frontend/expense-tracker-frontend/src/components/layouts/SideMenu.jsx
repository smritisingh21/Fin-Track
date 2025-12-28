import React, { useContext } from 'react'
import { SIDE_DATA_MENU } from '../../utils/data.js'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import CharAvatar from '../cards/CharAvatar.jsx'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { ThemeContext } from '../../context/ThemeContext.jsx'
import ProfilePicSelector from '../ProfilePicSelector.jsx'
const SideMenu = ({activeMenu}) => {
    const {isDark} = useContext(ThemeContext);
    const {user , clearUser} = useContext(UserContext)
    const navigate = useNavigate();


  return <div className={`w-64 h-[calc(100vh-61px)] border-r border-gray-400/30 p-5 sticky top-[61px] z-20 ${isDark? 'bg-[#030712]': 'bg-white'}`}>
            <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-7'>
                
            {user?.profileImageUrl? (
                <img
                src = { user?.profileImageUrl || ``}
                alt ="profile image"
                className={`w-20 h-20 bg-slate-400 rounded-full ${isDark? 'bg-gray-800': 'bg-white'}`}
                /> )
                :
                (
                <CharAvatar
                    fullname ={user?.name}
                    width = "w-20"
                    height ="h-20"
                    style="text-xl"
                    
                />
                
                )
            }
            <h5 className={`font-medium leading-6 ${isDark? 'text-white': 'text-black'}`}>
                {user?.name}
            </h5>
            </div>

            { SIDE_DATA_MENU.map((item , index) =>(
                
                <button
                 key= {`menu_${index}`}
                 className={`w-full flex items-center gap-4 text-[15px] ${ 
                    activeMenu === item.label ? "text-white bg-gray-900"  :  " "
                } ${isDark? 'text-white': 'text-gray'} py-3 px-6 rounded-lg mb-3 cursor-pointer`}
                 onClick ={()=> navigate(item.path)}
                
                >

                <item.icon className={`text-xl ${isDark? 'text-white': 'text-gray'} `}/>
                {item.label}
                </button>
            ))}
        </div>
  
}

export default SideMenu;