import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL :import.meta.env.VITE_API_BASE_URL,
    timeout : 10000,
   
})

//request interceptor
axiosInstance.interceptors.request.use(
    
    (config) =>{
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization =`Bearer ${accessToken}`
        }
        return config;
    },(error) =>{
        return Promise.reject(error);
    }
)

//response intercenptor

axiosInstance.interceptors.response.use(
    (response) =>{
        return response;
    },
    (error)=>{
    if (error.response) {
         if (error.response.status === 401) {
         window.location.href = '/login';
         } else if (error.response.status === 500) {
            console.log("Server error. Please try again later");
         } else if (error.code === "ECONNABORTED") {
         console.log("Request timed out. Please try again later");
       }
    return Promise.reject(error);

    } else {
    console.log("Network error or no response from server");
    }}
)
export default axiosInstance;