import React from 'react'
import { BarChart, Bar , XAxis,YAxis,
        CartesianGrid, Tooltip,Legend,
        ResponsiveContainer,Cell } from 'recharts'
import { MdCurrencyRupee } from "react-icons/md";
import { addThousandsSeparator } from '../../utils/helper';

 const CustomBarChart = ({data , dataKey ,color1 , color2}) => {
    
    const getBarColors = ( index )=>{
    return index % 2 === 0? color1: color2
    };

    const CustomTooltip = ({ active ,payload}) =>{
    if(active && payload && payload.length){
    return (
    <div className=' bg-white h-xs w-30 shadow md rounded-lg p-2 border border-gray-300 items-center'>

        <p className='text-sm font-semibold text-gray-800'>
        {payload[0].payload.category || payload[0].payload.month} 
        </p>
         <p className='flex text-sm text-gray-600'>
            <MdCurrencyRupee/>
          <span className='text-xs font-medium text-gray'>{addThousandsSeparator(payload[0].value)}/-</span>
        </p>
        
    </div>
    )
    }
    return null

}
  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width='100%' height='90%'>
            <BarChart data={data}>
                <CartesianGrid stroke='none'/>

                <XAxis
                 dataKey={dataKey}
                tick={{fontSize:12 ,fill:'#555'}} />

                <YAxis 
                tick={{fontSize:12 , fill:'#555'}}
                 stroke='none'/>

                <Tooltip content={CustomTooltip}/>

                <Bar 
                    dataKey='amount'
                    fill='#FF8042'
                    radius={[10,10,0,0]}
                    activeDot={{r:8 , fill:'yellow'}}
                    activeStyle={{fill :'green'}}
                    >
                    {data.map((entry,index) => (
                        <Cell key={index} fill={getBarColors(index)}/>
                    ))}
                    </Bar>
            </BarChart>
            </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart;
