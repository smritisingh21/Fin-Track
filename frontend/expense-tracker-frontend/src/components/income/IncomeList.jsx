import React, { useContext } from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'
import { ThemeContext } from '../../context/ThemeContext'

 const IncomeList = ({transactions , onDelete, onDownload}) => {

    const {isDark} = useContext(ThemeContext);
  return (
   <div className={`${isDark? 'card-dark' : 'card'}`}>

        <div className='flex items-center justify-between p-5'>
            
            <h5 className={`text-2xl ${isDark? 'text-white' :'text-black'}`}>
                Income Sources
            </h5>

            <button className='btn-primary ml-3 items-center' onClick={onDownload}>
                <LuDownload className='text-base m-0.5 '/>Download
            </button>
        </div>

        <div className='grid-cols-2 md:grid-cols-2 hover:bg-opacity-0.6'>

            {transactions?.map((income) =>(
                <TransactionInfoCard
                key={income._id}
                title={income.source}
                icon = {income.icon}
                date = {moment(income.date).format('llll')} 
                amount = {income.amount}
                type = "income"
                onDelete={() => onDelete(income._id)}
                />
            ))}
        </div>
    </div>

    
  )
}


export default IncomeList;