import React from 'react'
import TransactionInfoCard from '../cards/TransactionInfoCard.jsx'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'


const RecentIncome = ({transactions , onseeMore}) => {
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Income</h5>
            <button className='btn-primary' onClick={onseeMore}>
                See All 
                <LuArrowRight className='text-base'/>
            </button>
        </div>

        <div className='mt-6'>
            {transactions?.slice(0,5).map((income) =>(
                <TransactionInfoCard
                    key={income._id}
                    title={income.source}
                    icon ={income.icon}
                    date={moment(income.date).format('DD-MM-YYYY')}
                    amount={income.amount}
                    type= "income"
                    hideDeleteBtn
                />
          ))}
        </div>
    </div>
  )
}

export default RecentIncome;
