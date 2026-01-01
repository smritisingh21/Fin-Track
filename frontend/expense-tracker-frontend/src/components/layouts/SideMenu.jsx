import React, { useContext ,useState,useRef} from 'react'
import { SIDE_DATA_MENU } from '../../utils/data.js'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import CharAvatar from '../cards/CharAvatar.jsx'
import { ThemeContext } from '../../context/ThemeContext.jsx'
import { CameraIcon } from '@heroicons/react/16/solid'
import { LuLoaderCircle } from 'react-icons/lu'
import uploadImage from '../../utils/uploadImage.js'
import toast from 'react-hot-toast'

const SideMenu = ({activeMenu}) => {

    const {isDark} = useContext(ThemeContext);
    const {user} = useContext(UserContext);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);


    const navigate = useNavigate();

    const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try{
      setIsUploading(true);

      const data = await uploadImage(file);
      if (data && data.user) {
            toast.success("Profile updated!");
        }
      window.location.reload();
      
    }catch(err){
      console.log(err);
    }
      setLoading(false);
    
  }


  return (
  <div className={`w-64 h-full border-r transition-colors duration-300 p-5 flex flex-col sticky top-[61px] z-20 ${
      isDark ? 'bg-[#030712] border-zinc-800' : 'bg-white border-zinc-100'
    }`}>
      <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-7'>
        
        <div 
          className="relative group cursor-pointer" 
          onClick={handleAvatarClick}
        >
          <div className="relative overflow-hidden rounded-full w-20 
          h-20 border-2 border-transparent group-hover:border-blue-500 transition-all">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="profile"
                className="w-full h-full object-cover"
              /> 
            ) : (
              <CharAvatar
                fullname={user?.name}
                width="w-20"
                height="h-20"
                style="text-xl"
              />
            )}

            <div className={`absolute inset-0 flex items-center justify-center
             bg-black/40 transition-opacity duration-200 ${
              isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>


              {isUploading ? (
                <LuLoaderCircle className="text-white animate-spin" size={20} />
              ) : (
                <CameraIcon className="text-white" size={2} />
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <h5 className={`font-bold text-center leading-6 transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {user?.name}
        </h5>
      </div>

      <nav className="flex-1 space-y-1">
        {SIDE_DATA_MENU.map((item, index) => (
          <button
          onClick={() => navigate(item.path)}
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-sm font-medium py-3 px-5 rounded-xl transition-all duration-200 cursor-pointer ${ 
              activeMenu === item.label 
                ? "text-white bg-gray-900 " 
                : isDark 
                  ? 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <item.icon size={20} strokeWidth={activeMenu === item.label ? 2.5 : 2} />
            {item.label}
          </button>
        ))}
      </nav>

      
    </div>
  );
}

export default SideMenu;


