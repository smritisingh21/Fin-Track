import { StrictMode} from 'react'
import React from "react"
import { createRoot } from 'react-dom/client'
import './index.css'
import {GoogleOAuthProvider} from '@react-oauth/google'
import App from './App.jsx'


const CLIENT_ID="533389753474-o2qh96igs9v0uet904kl65al7nquj9t2.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
      <StrictMode>
        <App />
      </StrictMode>,
  </GoogleOAuthProvider>
)
 
