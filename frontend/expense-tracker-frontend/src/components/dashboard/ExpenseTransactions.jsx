import React from 'react'
import TransactionInfoCard from '../cards/TransactionInfoCard.jsx'
import moment from 'moment'
import { useContext } from 'react'
import { LuArrowRight } from 'react-icons/lu'
import { ThemeContext } from '../../context/ThemeContext.jsx'
import { EmptyLayout } from '../layouts/EmptyLayout.jsx'



export const ExpenseTransactions = ({transactions, onseeMore}) => {

      const {isDark} = useContext(ThemeContext);
       const hasTransactions = transactions && transactions.length > 0;

  
  return (

    <div className={` ${isDark? 'card-dark': 'card'}`}>
      

        <div className='flex items-center justify-between'>
          <h5 className={` text-lg mb-2 ${isDark? 'text-white':'text-gray-900'}`}> Recent Expenses</h5>
          <button 
            className="group btn-primary flex items-center gap-2 text-sm font-bold transition-all" 
            onClick={onseeMore}
          >
            See All 
            <LuArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        <div className='mt-6'>
        {hasTransactions?
        (transactions.slice(0,5).map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    date={moment(expense.date).format('ll')}
                    amount={expense.amount}
                    type= "expense"
                    hideDeleteBtn
                />))):(
                  <EmptyLayout type="expense"/>
                )

          }
        </div>
    </div>
      )
}
