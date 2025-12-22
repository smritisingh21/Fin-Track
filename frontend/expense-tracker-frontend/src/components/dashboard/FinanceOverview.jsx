import React, { useMemo } from 'react' // 👈 Import useMemo
import { CustomPieChart } from '../charts/CustomPieChart'


const COLORS =["#D9D9D9","#5F8575" ,"#F76565"]

 const FinanceOverview = ({totalBalance , totalIncome , totalExpense}) => {

    const balanceData = useMemo(() => ([
        {name:"totalBalance" ,amount :totalBalance},
        {name:"totalIncome" ,amount :totalIncome},
        {name:"totalExpense" ,amount :totalExpense},
    ]), [totalBalance, totalIncome, totalExpense]); // Dependencies are the primitive values
    
  return (
    
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Overview</h5>
        </div>

        <CustomPieChart
        data={balanceData} 
        label ='Total balance'
        totalAmount={`${totalBalance}/-`}
        colors={COLORS}
        showTextAnchor
        />


    </div>
  )
}

export default FinanceOverview;