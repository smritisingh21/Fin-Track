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
    <div>

        <label className={`text-[13px] ${isDark? 'text-white' : 'text-slate-800'}`}>{label}</label>
        <div className={`${isDark? 'input-box-dark' : 'input-box'}`}>
            
            <input
            type={type == 'password'? showPassword ? 'text': 'password' :type }
            placeholder={placeholder}
            className="w-full outline-0 bg-transparent"
            value={value}
            onChange={(e) =>onChange(e)}
            />

            {type === 'password' && ( 
            <>
                {showPassword? (
                    <FaRegEye size ={22}
                    className= "cursor-pointer transition-all duration-150"
                    onClick={() => toggleShowPassword()}
                    />
                ) : (
                    <FaRegEyeSlash size ={22}
                    className= " cursor-pointer"
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
