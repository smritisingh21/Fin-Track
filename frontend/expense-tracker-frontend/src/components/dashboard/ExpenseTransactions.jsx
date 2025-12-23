import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard.jsx'
import moment from 'moment'
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext.jsx'

export const ExpenseTransactions = ({transactions, onseeMore, mode}) => {

      const {isDark} = useContext(ThemeContext);
  
  return (
    <div className={` ${isDark? 'card-dark': 'card'}`}>
        <div className='flex items-center justify-between'>
          <h5 className={` text-lg${isDark? 'text-white':'text-gray-900'}`}>Expenses</h5>
          <button className={isDark? 'text-white':'text-gray-900'} onClick={onseeMore}>
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
