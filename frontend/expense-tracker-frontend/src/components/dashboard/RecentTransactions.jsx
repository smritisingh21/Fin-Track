import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext.jsx'
import { EmptyLayout } from '../layouts/EmptyLayout.jsx'
import { useNavigate } from 'react-router'


const RecentTransactions = ({transactions}) => {

    const navigate = useNavigate();
    const {isDark} = useContext(ThemeContext);

    const hasTransactions = transactions && transactions.length > 0 

  return (
    <div className={`${isDark? 'card-dark': 'card'}`}>
        <div className='flex items-center justify-between'>
            <h5 className={`text-lg ${isDark? 'text-amber-50': 'text-black'}`}>Recent transactions</h5>
        </div>

        <div className='mt-6'>

        {hasTransactions?
            (transactions?.slice(0,5).map((transaction) =>(
                <TransactionInfoCard
                    key={transaction._id}
                    title={transaction.source || transaction.category}
                    icon ={transaction.icon}
                    date={moment(transaction.date).format('ll')}
                    amount={transaction.amount}
                    type= {transaction.type}
                    hideDeleteBtn
                />))):(
                  <EmptyLayout type='transaction' clickEvent={() => navigate("/income")}/>
                )
          }
        </div>
    </div>
  )
}

export default RecentTransactions;