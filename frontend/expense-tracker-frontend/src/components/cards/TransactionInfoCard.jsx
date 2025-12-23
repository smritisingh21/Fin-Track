import React from 'react'
import { LuUtensils , LuTrash2 } from 'react-icons/lu';



const TransactionInfoCard = ({title ,icon,date,amount,type,hideDeleteBtn,onDelete}) => {

    const getAmountStyles = () => {
    return type === "income" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"} 

  return (
    <div className='group relative flex items-center gap-2 mt-4 p-3 rounded-lg hover:bg-gray-100/50'>
        
       <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full' >
            {icon?(
            <img src={icon} alt={title} className='w-6 h-6'/>
            ):(
            <LuUtensils/>
            )}
       </div>

       <div className='flex-1 flex items-center justify-between'>
        <div>
            <p className='text-md text-gray-600 font-medium'>{title}</p>
            <p className='text-sm text-gray-400 mt-1'>{date}</p>
         </div>

            <div className='flex items-center gap-2'>
                {!hideDeleteBtn && (
                    <button className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition:opacity cusrsor-pointer'
                     onClick={onDelete}>
                        <LuTrash2 size={20}/>
                    </button>   
                )}

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()} `}>
                    <h5 className='text-xs font-large'>
                        {type === 'income'? '+' :'-' } Rs. {amount}/-
                    </h5>

                </div>
            </div>
        </div>
       </div>
  )
}

export default TransactionInfoCard;


