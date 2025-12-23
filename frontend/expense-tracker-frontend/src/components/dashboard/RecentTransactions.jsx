import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext.jsx'
const RecentTransactions = ({transactions}) => {

    const {isDark} = useContext(ThemeContext);
  return (
    <div className={`${isDark? 'card-dark': 'card'}`}>
        <div className='flex items-center justify-between'>
            <h5 className={`text-lg ${isDark? 'text-amber-50': 'text-black'}`}>Recent transactions</h5>
          
        </div>

        <div>
            {transactions?.slice(0,5).map((item) =>(
                <TransactionInfoCard
                    key={item._id}
                    title={item.category? item.category : item.source}
                    icon ={item.icon}
                    date={moment(item.date).format('DD-MM-YYYY')}
                    amount={item.amount}
                    type= {item.type}
                    hideDeleteBtn
                />
            ))}
        </div>
    </div>
  )
}

export default RecentTransactions;