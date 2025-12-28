import React from 'react'

export const EmptyPageLayout = (type) => {
    
  return (
    <div>
        <p className='bg-transparent text-gray-500 text-xl text-bold'> 
            No {type} yet.Add a new {type} to see your {type} trends.
        </p>
    </div>
  )
}
