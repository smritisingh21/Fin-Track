import React, { useMemo } from 'react' 
import { CustomPieChart } from '../charts/CustomPieChart'


const COLORS =["#075CF5" ,"#FA2C37","#FF6900"]

const RecentIncomeWithChart = ({data,totalIncome}) => {

    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        
        return data.map((item) =>({
            name : item?.source || item?.category || "other", 
            amount: item?.amount
        }));
    }, [data]); 

  return (
    <div className='card'>
        <div className=''>
            <h5>Last 60 days Income</h5>
        </div>

        <CustomPieChart
            data={chartData} 
            label ='Total income'
            totalAmount={`$${totalIncome}`}
            colors={COLORS}
            showTextAnchor
       />
       
    </div>
  )
}
export default  RecentIncomeWithChart;