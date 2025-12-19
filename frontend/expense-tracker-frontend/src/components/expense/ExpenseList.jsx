import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'

 const ExpenseList = ({transactions , onDelete, onDownload}) => {
  return (
    <div className='card'>
        <div className='flex place-items-center justify-between mb-10'>

            <h5 className='text-lg'>Expense History</h5>

            <button className='card-btn ml-3 items-end' onClick={onDownload}>
                <LuDownload className='text-base '/>Download
            </button>
        </div>

        <div className='grig grid-cols-1 md:grid-cols-2'>
            {transactions?.map((expense) =>(
                <TransactionInfoCard
                key={expense._id}
                title={expense.category}
                icon = {expense.icon}
                date = {moment(expense.date).format("DD.MM.YYYY")}
                amount = {expense.amount}
                type = "expense"
                onDelete={() => onDelete(expense._id)}
                />
            ))}
        </div>
    </div>

    
  )
}


export default ExpenseList;