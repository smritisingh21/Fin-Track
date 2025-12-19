import React from 'react'
import CustomTooltip from './CustomTooltip.jsx'
import CustomLegend from './CustomLegend.jsx'

import {PieChart, Pie, Cell ,Tooltip, ResponsiveContainer , Legend} from 'recharts'

export const CustomPieChart = ({data , label , totalAmount ,colors, showTextAnchor}) => {

   const chartData = Array.isArray(data) ? data : [];
   
  return (
    
        <ResponsiveContainer width='100%' height={380}>
        <PieChart>
            <Pie
            data={chartData}
            dataKey="amount"
            nameKey="name"
            cx='50%' cy='50%'
            innerRadius={100} outerRadius={130} 
            labelLine={false}>
            {chartData.map((entry,index) =>(
                <Cell key={index} fill={colors[index % colors.length]}/>
            ))}
            </Pie>
            <Tooltip content={<CustomTooltip/>} />
            <Legend content={<CustomLegend/>}/>

            {showTextAnchor && (
                <>
                <text 
                x='50%'
                y='50%' 
                dy={-25} 
                textAnchor='middle' 
                fill='#666'
                fontSize='14px'
                >
                {label}
                </text>
                  <text 
                x='50%' y='50%' 
                dy={8} textAnchor='middle' 
                fill='#333'
                fontSize='24px'
                fontWeight='semi-bold'
                >
                {totalAmount}
                </text>
                </>
            )}
            </PieChart>
            </ResponsiveContainer>
    
  )
}
