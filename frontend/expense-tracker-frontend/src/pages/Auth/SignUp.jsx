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



// SignUp component for user registration

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

 const  handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
   }
   if(!password){
    return("please enter your password")

   }
   //SIGN UP Api call
  try{
    //upload image if present
    if(profilePicture){
      const imageUploadRes = await uploadImage(profilePicture)
      profileImageUrl = imageUploadRes.imageUrl || "";
    }
    
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
    name,
    email,
    password,
    profileImageUrl
    })

    const {token , user} = response.data;

    if(token){
    localStorage.setItem("token" ,token);
    updateUser(user);
    navigate("/dashboard")
    }
   }catch(err){
    if(err.response && err.response.data.message ){
    setError(err.response.data.message)
   } 
  }
  }


  return (

    <AuthLayout>
      <div className='lg:w-70% h-3/4 md:h-full flex flex-col justify-center'>
        <h5 className={`text-3xl mb-4 font-medium ${isDark?'text-white' :'text-gray-600'}`}>
          Create an account</h5>
        <p className={`${isDark?'text-white' :'text-gray-600'}`}>
          Join us today by entering your details below
        </p>
        <form onSubmit={handleSignup}>

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
            <button type='submit' className='btn-primary'>
              SIGN UP
            </button>
            <p className='text-[13px] text-slate-800 mt-3'>
              Already have an account? {' '}
              <Link to="/login" className='text-white onhover:underline font-medium'>
              LOGIN
              </Link>
            </p></div>
          </div>
         </form>
      </div>
    </AuthLayout>
    )

  }