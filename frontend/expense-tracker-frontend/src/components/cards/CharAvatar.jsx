import { getInitials } from '../../utils/helper';
import React from 'react';

const CharAvatar = ({name , width , height, style}) => {
  return (
    <div className={`${width || 'w-12'} ${height || 'h-12'} ${style || ''}
        flex items-center justify-center rounded-full text-gray-100 font-medium bg-gray-900 `}>
        {getInitials(name|| "user")}
    </div>
  )
}
export default CharAvatar;
