import React , {  useContext, useState}from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import Input from '../../components/layouts/Input'
import {Link, useNavigate} from 'react-router-dom'
import {validateEmail} from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/UserContext'
import { ThemeContext } from '../../context/ThemeContext'
import { FaHeart } from 'react-icons/fa'


export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState(null);

  const {isDark, toggleDark} =useContext(ThemeContext);

  const {updateUser, clearUser} = useContext(UserContext);
  const navigate = useNavigate();

  //handle login form submit
 
  const handleLogin= async (e) => { 
  e.preventDefault();

   if(!validateEmail(email)){
   setError("Email not found. Please enter a valid email address.");
   return;
  }
  if(!password){
  setError("Please enter a password");
  return;
  }
  else setError("");

//Login API call

  try{
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
    email,
    password,
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
  }else{
    setError("Something went wrong. Please try again")
  }
  }}
  return (
    <AuthLayout>

   <div className="w-full max-w-md mx-auto flex flex-col">
  <h3 className={`${isDark ? "text-white" : "text-black"} text-xl font-semibold`}>
    Welcome Back
  </h3>

  <p className="text-xs text-slate-500 mt-1 mb-6">
    Please enter your details to log in
  </p>

        <form onSubmit={handleLogin}>
          <Input
            type = "text"
            label ="Email Address"
            value = {email} 
            onChange = {(e) =>{ setEmail(e.target.value)}}
            placeholder = "John@example.com"
            />
          <Input
            type = "password"
            label ="Password"
            value = {password} 
            onChange = {(e) =>{ setPassword(e.target.value)}}
            placeholder = "Minimum 8 characters"
            />

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}


          <div className='flex gap-3'>
              <button type='submit' className='btn-primary'>
              LOGIN
              </button>


            <p className='text-[13px] text-slate-800 mt-3' >
              Don't have an account? {" "}
              <Link to={"/register"}className={` onhover:underline font-medium ${isDark? 'text-white' :'text-black'}`}>
              <u>SIGNUP</u>
              </Link>
            </p>
          </div>

         <p className='text-xs text-gray-600 mt-10 flex gap-2 justify-center'>Made with <FaHeart size={15} color='red'/> by Smriti Singh</p>

           
        </form>
    </div>
    </AuthLayout>
  )
}
