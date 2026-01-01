import React ,{useContext, useState}from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import Input from '../../components/layouts/Input'
import {useNavigate , Link} from 'react-router-dom'
import ProfilePicSelector from '../../components/ProfilePicSelector';
import { UserContext } from '../../context/UserContext';
import { validateEmail } from '../../utils/helper';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage  from '../../utils/uploadImage';
import { ThemeContext } from '../../context/ThemeContext';
import { FaHeart } from 'react-icons/fa';
import {GoogleLogin , googleLogout} from '@react-oauth/google'


export default function Signup() {
  const {isDark} =useContext(ThemeContext);
  const navigate = useNavigate()

  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const {updateUser} = useContext(UserContext);


  let profileImageUrl = "";

 const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Validation checks
    if (!name || !email || !password) {
        setError("All fields are required");
        return;
    }
    if (!validateEmail(email)) {
        setError("Invalid email format");
        return;
    }

    // 2. Create FormData instead of a plain JSON object
    const formData = new FormData();
    
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    
    // 3. Append the profile picture file if present
    if (profilePicture) {
        formData.append("image", profilePicture); // 'image' must match upload.single("image")
    }

    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, formData);

        const { token, user } = response.data;

        if (token) {
            localStorage.setItem("token", token);
            updateUser(user);
            navigate("/dashboard");
        }
    } catch (err) {
        if (err.response && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError("Something went wrong. Please try again.");
        }
    }
};

return (

    <AuthLayout>
      <div className="w-full max-w-md mx-auto flex flex-col justify-center mt-2">

        <h5 className={`text-lg mb-0.3 font-medium ${isDark?'text-white' :'text-gray-600'}`}>
          Create an account</h5>
        <p className={` text-sm text ${isDark?'text-gray-600' :'text-gray-600'}`}>
          Join us today by entering your details below
        </p>

        <form onSubmit={handleSignup} className='mb-4'>

          <ProfilePicSelector
          image ={profilePicture}
          setImage={setProfilePicture}
          className={`mb-2`}/>

          <div className='flex flex-col gap-4'>

            <Input
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
            <Input
              type="text"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="" />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          <div>  

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

             <div className='flex gap-3 mt-2 mb-6'>
            <button type='submit' className={`btn-primary`}>
              SIGN UP
            </button>
            <p className={`text-[13px] text-slate-600 mt-3`}>
              Already have an account? {' '}
              <Link to="/login" className={` onhover:underline font-medium 
                ${isDark? 'text-white' :'text-black'}`}>
              <u>LOGIN</u>
              </Link>
            </p>            
            
          </div>

           <GoogleLogin 
          onSuccess={() => navigate('/dashboard')}
          onError={() => console.log("Error logging in")}
          
          auto_select={true}

        
        />

           <p className='text-xs text-gray-600 mt-10 flex gap-2 justify-center'>Made with <FaHeart size={15} color='red'/> by Smriti Singh</p>

            </div>
          </div>
         </form>

           
      </div>
    </AuthLayout>
    )

  }