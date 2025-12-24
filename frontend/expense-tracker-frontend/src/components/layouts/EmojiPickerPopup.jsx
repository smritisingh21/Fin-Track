import React ,{useContext, useState}from 'react'
import EmojiPicker from "emoji-picker-react"
import { LuImage , LuX } from 'react-icons/lu'
import { ThemeContext } from '../../context/ThemeContext';

export const EmojiPickerPopup = ({icon , selectedIcon , onSelect}) => {
    const [isOpen , setIsOpen] = useState(false);
    const  {isDark} = useContext(ThemeContext)
  return (
    <div className='flex flex-col md:flex-row items-start gap-5 mb-6'>
        <div className='flex item-center gap-4 cursor-pointer'
         onClick ={() => setIsOpen(true)}
         >   
            <div className='w-13 h-13 flex items-center justify-center text-2xl bg-green-50 text-black rounded-full'>
                { icon? (
                    <img src={icon} alt ="icon" className='w-12 h-12'/>
                ) 
                :(
                <LuImage/>
                )
            }
            </div>
            <p className='text-gray-500 pt-3'>
                {icon ? "Change Icon": "Select icon"}
            </p>

        </div>
        {isOpen && (
            <div className=' absolute top-30 left-12 z-50'>
            <div className={`w-7  h-7 flex bg-gray-200 items-center justify-center border border-gray-200 
                rounded-full absolute -top-2 -right-2 z-10 cursor-pointer `}>
                <button className=''
                 onClick={() => setIsOpen(false) }
                 onTouchMove={() => setIsOpen(false) }>
                <LuX/>
                </button>
                </div>
                <EmojiPicker open={isOpen} className={`${isDark? 'bg-black' :'bg-white'}`}
                onEmojiClick={(emoji) => onSelect(emoji?.imageUrl || "")}/>
            </div>
        )}
    </div>
  )
}
