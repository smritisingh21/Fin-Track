import React, { useContext, useState } from 'react'
import {FaRegEye ,FaRegEyeSlash } from 'react-icons/fa'
import { ThemeContext } from '../../context/ThemeContext';

export default function Input({type , value , label , onChange , placeholder}) {
    const [showPassword , setShowPassword] = useState(false);
    const{isDark} = useContext(ThemeContext)

    const toggleShowPassword=()=>{
        setShowPassword(!showPassword);
    }
  return (
    <div className={`${isDark? 'bg-gray-900' :'bg-white'}`}>
        <label className={`text-[13px] ${isDark? 'text-white' : 'text-slate-800 '}`}>{label}</label>
        <div className='input-box'>
            
            <input
            type={type == 'password'? showPassword ? 'text': 'password' :type }
            placeholder={placeholder}
            className={`"w-full outline-none" ${isDark? 'bg-gray-900' :'bg-white'}`}
            value={value}
            onChange={(e) =>onChange(e)}
            />

            {type === 'password' && ( // Show eye icon only for password input
            <>
                {showPassword? ( // Show eye icon when password is visible
                    <FaRegEye size ={22}
                    className= "text-primary cursor-pointer"
                    onClick={() => toggleShowPassword()}
                    />
                ) : (
                    <FaRegEyeSlash size ={22}
                    className= "bg-amber-50 cursor-pointer"
                    onClick={() => toggleShowPassword()}
                    />
                )
            }
             </>
            )}
        </div>
    </div>
       
  )
}
