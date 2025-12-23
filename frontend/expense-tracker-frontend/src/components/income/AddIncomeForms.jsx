import React,{useContext, useState} from 'react'
import { EmojiPickerPopup } from '../layouts/EmojiPickerPopup'
import Input from '../layouts/Input.jsx'
import { ThemeContext } from '../../context/ThemeContext.jsx'

 const AddIncomeForms = ({onAddIncome}) => {

  const{isDark} = useContext(ThemeContext);

    const [income, setIncome] = useState({
        source : "",
        amount : "",
        date : "",
        icon: ""
    })

    const handleChange = (key , value) => 
      setIncome({...income ,[key] : value})

  return (
    
    <div className={`${isDark? 'bg-slate-900' : 'bg-white'}`}>
      
        <EmojiPickerPopup
        icon = {income.icon}
        onSelect ={(selectedIcon) => handleChange("icon" , selectedIcon)}/>

        <Input
        value={income.source}
        label="Income Source"
        onChange={({target}) => handleChange("source" , target.value)}
        placeholder= "Freelance , Salary , etc"
        type="text" 
        />

        <Input
        value={income.amount}
        label="Income amount"
        onChange={({target}) => handleChange("amount" , target.value)}
        placeholder= "Amount"
        type="number"
        />

        <Input
        value={income.date}
        label="Date"
        onChange={({target}) => handleChange("date" , target.value)}
        placeholder= " "
        type="date" 
        />

        <div className='flex justify-end mt-6'>
            <button
             type='button'
             className='add-btn add-btn-fill'
             onClick={() => onAddIncome(income)}
            >Add income
            </button>
        </div>
    </div>
  )
}
export default AddIncomeForms;