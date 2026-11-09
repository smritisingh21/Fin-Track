import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LuSparkles } from 'react-icons/lu';
import useUserAuth from '../../hooks/useUserAuth';
import { ExpenseOverview } from '../../components/expense/ExpenseOverview';
import Modal from '../../components/layouts/Modal';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AddExpenseForms from '../../components/expense/AddExpenseForms';
import ExpenseList from "../../components/expense/ExpenseList"
import DeleteAlert from '../../components/DeleteAlert';
import axiosInstance from '../../utils/axiosInstance';
import API_PATHS from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { RiLoader2Fill } from 'react-icons/ri';
import ThemeContext from '../../context/ThemeContext';
import { addThousandsSeparator } from '../../utils/helper';

function getIsoWeekString(dateInput = new Date()) {
  const date = new Date(dateInput);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export default function Expense() {
  
  useUserAuth();
  const navigate = useNavigate();
  const {isDark } = useContext(ThemeContext);

  const [expenseData , setExpenseData] = useState([]);
  const [loading , setLoading] = useState(false);
  const [openDeleteAlert , setOpenDeleteAlert] = useState({show :false, data: null});
  const [openAddExpenseModal , setOpenAddExpenseModal] = useState(false);

  // Period filtering state: "all" | "month" | "week" | "year"
  const [filterMode, setFilterMode] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedWeek, setSelectedWeek] = useState(() => getIsoWeekString(new Date()));
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));

  const filteredExpenses = useMemo(() => {
    if (filterMode === "all") return expenseData;
    return expenseData.filter((item) => {
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return false;
      if (filterMode === "year") {
        return String(d.getFullYear()) === selectedYear;
      }
      if (filterMode === "month") {
        const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return mKey === selectedMonth;
      }
      if (filterMode === "week") {
        return getIsoWeekString(d) === selectedWeek;
      }
      return true;
    });
  }, [expenseData, filterMode, selectedMonth, selectedWeek, selectedYear]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [filteredExpenses]
  );

  //get income details
  const fetchExpenseDetails = async() =>{
      if(loading) return;
      setLoading(true);

    try{
      const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`)
      if(response.data){
        setExpenseData(response.data);
      }
    }catch(err){
      console.log("Could not fetch expense data.Please try again. \n" , err);
    }finally{
      setLoading(false);
    }
  }

  //add
  const AddExpenseDetails = async(expense) =>{
     const {category , amount , date , icon} = expense;
    
    //validation checks
    if(!category.trim()){
      toast.error("Category is required.");
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
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE ,{
        amount :Number(amount) ,
        category ,
        date,
        icon,
      })

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully.")
      fetchExpenseDetails();
    }catch(error){
    console.error( "Error adding expense: ", error);
    }
  }

  //delete
  const deleteExpense = async(id) =>{
  try{
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))

      setOpenDeleteAlert({show:false , data:null});
      toast.success("Expense removed succesfully");
      fetchExpenseDetails();

    }catch(error){
      console.error(
      "Error deleting expense: ",
      error.response?.data?.message || error.message
      )
    }
  }

  const DownloadExpenseDetails = async() =>{
    try{
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        {
        responseType:"blob",
        }
    );
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download" , "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      }catch(error){
        console.error("Error downloading expense details:" , error);
        toast.error("Failed to download.Please try again.")
      }
  }

  useEffect(() =>{
    fetchExpenseDetails();
    return ()=>{};
  },[ ])


  return (
     <DashboardLayout activeMenu="Expenses">
       <div className=' my-5 mx-auto'>

         {
          (!expenseData || loading) ? (
             <div className='flex justify-center items-center gap-3 py-30'>
                <div className={`' animate-spin ' ${isDark? 'text-white' :'text-black'}`}><RiLoader2Fill size={40} /></div>
                <div className={`' text-center py-20' ${isDark? 'text-white' :'text-black'}`}>Loading your expense data...</div>            
              </div>   
                       
          )
         : 
          (
         <div className='grid grid-cols-1 gap-6'>
          {/* Period Filter & AI Insights Bar */}
          <div className={`${isDark ? 'card-dark' : 'card'} flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
            <div className='flex flex-wrap items-center gap-2'>
              {[
                { id: 'all', label: 'All Time' },
                { id: 'month', label: 'Month' },
                { id: 'week', label: 'Week' },
                { id: 'year', label: 'Year' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    filterMode === tab.id
                      ? 'bg-purple-600 text-white'
                      : isDark
                      ? 'bg-gray-900 text-gray-300 border border-gray-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {filterMode === 'month' && (
                <input
                  type='month'
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              )}

              {filterMode === 'week' && (
                <input
                  type='week'
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              )}

              {filterMode === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  {Array.from({ length: 7 }, (_, i) => {
                    const y = new Date().getFullYear() - 4 + i;
                    return (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className='flex items-center justify-between md:justify-end gap-4'>
              <div className='text-xs'>
                <span className='text-gray-400'>Filtered Total ({filteredExpenses.length}): </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ₹{addThousandsSeparator(filteredTotal)}
                </span>
              </div>
              <button
                onClick={() => {
                  const pType = filterMode === 'all' ? 'month' : filterMode;
                  const pKey =
                    pType === 'year'
                      ? selectedYear
                      : pType === 'week'
                      ? selectedWeek
                      : selectedMonth;
                  navigate(`/insights?periodType=${pType}&periodKey=${pKey}`);
                }}
                className='flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer'
              >
                <LuSparkles size={14} />
                <span>AI Summary & Insights</span>
              </button>
            </div>
          </div>

          <div>
            <ExpenseOverview 
            transactions ={filteredExpenses}
            onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>
         
         <ExpenseList transactions={filteredExpenses}
            onDelete={(id) =>{setOpenDeleteAlert({show : true , data : id}) }}
            onDownload={DownloadExpenseDetails}
          />
            
        </div>
        )}
        <Modal title ='Add expense' 
        isOpen={openAddExpenseModal} 
        onClose={() => setOpenAddExpenseModal(false)}>
        <AddExpenseForms onAddExpense={AddExpenseDetails} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show :false ,  data: null})}
          title="Delete Income"
          >
            <DeleteAlert
            content = "Are you sure you want to delete this expense?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
            />
            
          </Modal>
        </div>
     </DashboardLayout>
  )
}
