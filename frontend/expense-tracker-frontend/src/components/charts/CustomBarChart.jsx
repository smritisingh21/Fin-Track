import React from 'react'
import { BarChart, Bar , XAxis,YAxis,
        CartesianGrid, Tooltip,Legend,
        ResponsiveContainer,Cell } from 'recharts'

 const CustomBarChart = ({data , dataKey ,color1 , color2}) => {
    
    const getBarColors = ( index )=>{
    return index % 2 === 0? color1: color2
    };

    const CustomTooltip = ({ active ,payload}) =>{
    if(active && payload && payload.length){
    return (
    <div className='bg-white shadow md rounded-lg p02 border border-gray-300'>
        <p className='text-xs font-semibold text-purple-800 mb-1'>
        {payload[0].payload.category || payload[0].payload.month}
        </p>
        <p className='text-sm text-gray-600'>
             Amount : <span className='text-sm font-medium text-gray'>{payload[0].value}</span>
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
