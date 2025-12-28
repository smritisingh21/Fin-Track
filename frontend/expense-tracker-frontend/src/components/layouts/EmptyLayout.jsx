import React from 'react'

export const EmptyLayout = ({type}) => {
  return (
    <div className='m-2 p-3 text-sm text-gray-500'>
        <p>Empty! Add new {type} now.</p>
    </div>
  )
}
