import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'

 const IncomeList = ({transactions , onDelete, onDownload}) => {
  return (
    <div className='card'>
        <div className='flex items-center justify-center'>
            <h5 className='text-lg'>Income Sources</h5>

            <button className='card-btn ml-3 items-end' onClick={onDownload}>
                <LuDownload className='text-base m-0.5'/>Download
            </button>
        </div>

        <div className='grig grid-cols-1 md:grid-cols-2'>
            {transactions?.map((income) =>(
                <TransactionInfoCard
                key={income._id}
                title={income.source}
                icon = {income.icon}
                date = {moment(income.date).format("DD-MM-YYYY")} 
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