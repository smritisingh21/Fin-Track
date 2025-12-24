import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext';

const DeleteAlert = ({content , onDelete}) => {

  const {isDark} = useContext(ThemeContext)
  return (
    <div >
      <p className={` ${isDark? 'text-gray-200' :'text-gray-500'}`}
        onClick={onDelete}>
        {content}
      </p>

      <div className='flex justify-end mt-6'>
        <button 
        type='button'
        className={`delete-btn ${isDark? 'text-white' :'text-gray-500'}`}
        onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default DeleteAlert;