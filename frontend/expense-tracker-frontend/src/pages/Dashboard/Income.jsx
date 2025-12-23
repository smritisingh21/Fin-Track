import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { IncomeOverview } from '../../components/income/IncomeOverview';
import API_PATHS from '../../utils/apiPaths.js'
import Modal from '../../components/layouts/Modal.jsx';
import { toast } from 'react-hot-toast';
import AddIncomeForms from '../../components/income/AddIncomeForms.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import IncomeList  from '../../components/income/IncomeList.jsx';
import DeleteAlert from '../../components/DeleteAlert.jsx';
import useUserAuth from '../../hooks/useUserAuth.jsx';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext.jsx';

export default function Income() {
  useUserAuth();

  const{isDark} = useContext(ThemeContext)

  const [incomeData , setIncomeData] = useState([]);
  const [loading , setLoading] = useState(false);
  const [openDeleteAlert , setOpenDeleteAlert] = useState({show :false, data: null});
  const [openAddincomeModal , setOpenAddIncomeModal] = useState(false);


  //get income details
  const fetchIncomeDetails = async() =>{
    if(loading) return;
    setLoading(true);

    try{
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`)
      if(response.data){
        setIncomeData(response.data);
      }
    }catch(err){
      console.log("Could not fetch income data.Please try again. \n" , err);
    }finally{
      setLoading(false);
    }
  }

  //add income
  const handleAddIncomes =async(income) =>{
    const {source , amount , date , icon} = income;
    
    //validation checks
    if(!source.trim()){
      toast.error("Source is required.");
      return;
    }
    if(!amount || isNaN(amount) || Number(amount)<=0){
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }
    if(!date){
      toast.error("Date is required.");
      return;
    }
    try{
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME ,{
        amount :Number(amount) ,
        source ,
        date,
        icon,
      })
      fetchIncomeDetails();
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully.")
    }catch(err){
    console.error( "Error adding income: ", errorMessage);
    }
  }

  //delete income
  const handleDeleteIncome =async(id) =>{
    try{
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id))

      setOpenDeleteAlert({show:false , data:null});
      toast.success("Income details deleted succesfully");
      fetchIncomeDetails();
    }catch(error){
      console.error(
      "Error deleting income: ",
      error.response?.data?.message || error.message
      )
    }
  }

  //download
  const handleDownloadIncomeDetails =async() =>{
    try{
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INVOICE,
        {
        responseType:"blob",
        }
    );
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download" , "invoice.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      }catch(error){
        console.error("Error downloading invoice :" , error);
        toast.error("Failed to download.Please try again.")
      }
  }

  useEffect(() =>{
    fetchIncomeDetails();
    return(() => {})
  },[])

  return (
     <DashboardLayout activeMenu="Income">
       <div className=' my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div>
            <IncomeOverview 
            transactions ={incomeData}
            onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>
         
           <IncomeList transactions={incomeData}
            onDelete={(id) =>{setOpenDeleteAlert({show : true , data : id}) }}
            onDownload={handleDownloadIncomeDetails}
            />
            
        </div>


        <Modal title ='Add income' 
        isOpen={openAddincomeModal} 
        onClose={() => setOpenAddIncomeModal(false)}>

          <AddIncomeForms onAddIncome={handleAddIncomes}></AddIncomeForms>
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show :false ,  data: null})}
          title="Delete Income"
          >
            <DeleteAlert
            content = "Are you sure you want to delete this income?"
            onDelete={() => handleDeleteIncome(openDeleteAlert.data)}
            />
            
          </Modal>
        </div>
     </DashboardLayout>
  )
}
