import React from "react"
import Home from "./pages/Dashboard/Home"
import Login from "./pages/Auth/Login"
import SignUp from "./pages/Auth/SignUp"
import Income from  "./pages/Dashboard/Income.jsx"
import Expense from  "./pages/Dashboard/Expense.jsx"
import {Toaster} from 'react-hot-toast'
import Logout from "./pages/Auth/Logout.jsx"

import { BrowserRouter as Router , Routes , Route , Navigate } from "react-router-dom"
import UserProvider  from "./context/UserContext.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"

function App() {

  return (
    <ThemeProvider>
    <UserProvider>
        <div>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Root />} /> */}
          <Route path="/"  element={<Home/>} />
          <Route path="/dashboard"  element={<Home/>} />
          <Route path="/login"  element={<Login />} />
          <Route path="/register"  element={<SignUp />} />
          <Route path="/income"  element={<Income />} />
          <Route path="/expenses"  element={<Expense />} />
          <Route path="/Logout"  element={<Logout />} />

        </Routes>
      </Router>
    </div>
    <Toaster
      toastOptions={{
        className :"",
        style :{
          fontSize :'13px'
        }
      }}
    />
    </UserProvider>
    </ThemeProvider>
  )
}

export default App