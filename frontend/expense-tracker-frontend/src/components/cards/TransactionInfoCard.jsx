import React,{useContext} from 'react'
import { LuUtensils , LuTrash2 } from 'react-icons/lu';
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { ThemeContext } from '../../context/ThemeContext';



const TransactionInfoCard = ({title ,icon,date,amount,type,hideDeleteBtn,onDelete}) => {

    const {isDark} = useContext(ThemeContext)

    const getAmountStyles = () => {
        return type === "income" ? 
        "bg-green-50 text-green-500" 
        : "bg-red-50 text-red-500"
    }

  return (
    <div className={`group relative flex items-center gap-2 hover:transition-transform mt-4 p-3 rounded-lg ${isDark? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/50'}`}>
        
       <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full' >
            {icon?(
            <img src={icon} alt={title} className='w-6 h-6'/>
            ):(
            <RiMoneyRupeeCircleLine  size={30}/>
            )}
       </div>

       <div className='flex-1 flex items-center justify-between'>
        <div>
            <p className='text-md text-gray-600 font-medium'>{title}</p>
            <p className='text-sm text-gray-400 mt-1'>{date}</p>
         </div>

            <div className='flex items-center gap-2'>
                {!hideDeleteBtn && (
                    <button className='flex text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition:opacity cursor-pointer mr-2'
                     onClick={onDelete}>
                        <LuTrash2 size={20} className=''/>
                        <span className='text-sm ml-1'>Delete</span>
                    </button>   
                )}

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()} `}>
                    <h5 className='text-sm font-large'>
                        {type === 'income'? '+' :'-' } Rs. {amount}
                    </h5>

                </div>
            </div>
        </div>
       </div>
  )
}

export default TransactionInfoCard;


