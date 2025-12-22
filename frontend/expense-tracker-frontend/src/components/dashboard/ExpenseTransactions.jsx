import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard.jsx'
import moment from 'moment'

export const ExpenseTransactions = ({transactions, onseeMore}) => {
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
          <h5 className='text-lg'>Expenses</h5>
          <button className='card-btn' onClick={onseeMore}>
              See All 
              <LuArrowRight className='text-base'/>
          </button>

        </div>

        <div className='mt-6'>
            {transactions?.slice(0,5).map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    date={moment(expense.date).format('DD-MM-YYYY')}
                    amount={expense.amount}
                    type= "expense"
                    hideDeleteBtn
                />
          ))}
        </div>
    </div>
  )
}
