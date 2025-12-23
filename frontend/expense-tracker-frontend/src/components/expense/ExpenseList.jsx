import React,{useContext} from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../cards/TransactionInfoCard'
import moment from 'moment'
import { ThemeContext } from '../../context/ThemeContext'


 const ExpenseList = ({transactions , onDelete, onDownload}) => {
     const {isDark} = useContext(ThemeContext);
  return (
   <div className={`${isDark? 'card-dark' : 'card'}`}>

        <div className='flex place-items-center justify-between mb-10 '>

            <h5 className={`text-2xl ${isDark? 'text-white' :''}`}>
                Expense History
                </h5>

            <button className='btn-primary ml-3 items-center' onClick={onDownload}>
                <LuDownload className='text-base '/>Download
            </button>
        </div>

        <div className='grid-cols-2 md:grid-cols-2 '>

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