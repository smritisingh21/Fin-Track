import React, { useContext, useEffect, useMemo, useState } from 'react'
import useUserAuth from '../../hooks/useUserAuth';
import { ExpenseOverview } from '../../components/expense/ExpenseOverview';
import Modal from '../../components/layouts/Modal';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AddExpenseForms from '../../components/expense/AddExpenseForms';
import ExpenseList from "../../components/expense/ExpenseList"
import DeleteAlert from '../../components/DeleteAlert';
import PeriodFilter from '../../components/PeriodFilter';
import axiosInstance from '../../utils/axiosInstance';
import API_PATHS from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { RiLoader2Fill } from 'react-icons/ri';
import ThemeContext from '../../context/ThemeContext';
import {
  filterTransactionsByPeriod,
  getCurrentMonthString,
  addThousandsSeparator,
} from '../../utils/helper';

export default function Expense() {
  
  useUserAuth();
  const { isDark } = useContext(ThemeContext);

  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Period filter state: defaults to "month"
  const [periodType, setPeriodType] = useState("month");
  const [periodValue, setPeriodValue] = useState(getCurrentMonthString);

  // Get expense details
  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`);
      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (err) {
      console.log("Could not fetch expense data. Please try again. \n", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses by Day, Week, Month (default), Year, or All Time
  const filteredExpenses = useMemo(() => {
    return filterTransactionsByPeriod(expenseData, periodType, periodValue);
  }, [expenseData, periodType, periodValue]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpenses]);

  // Add expense
  const AddExpenseDetails = async (expense) => {
    const { category, amount, date, icon } = expense;
    
    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }
    if (!date) {
      toast.error("Date is required.");
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        amount: Number(amount),
        category,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully.");
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error adding expense: ", error);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense removed successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error(
        "Error deleting expense: ",
        error.response?.data?.message || error.message
      );
    }
  };

  // Download expense details as Excel
  const DownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download. Please try again.");
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, []);

  return (
    <DashboardLayout activeMenu="Expenses">
      <div className='my-5 mx-auto space-y-6'>
        {/* Period Filter right above the Expense Overview */}
        <PeriodFilter
          periodType={periodType}
          setPeriodType={setPeriodType}
          periodValue={periodValue}
          setPeriodValue={setPeriodValue}
          showAllTime={true}
          summaryBadge={
            <div className="text-xs flex items-center gap-1.5">
              <span className="text-gray-400">
                Filtered Total ({filteredExpenses.length}):
              </span>
              <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                ₹{addThousandsSeparator(filteredTotal)}
              </span>
            </div>
          }
        />

        {(!expenseData || loading) ? (
          <div className='flex justify-center items-center gap-3 py-30'>
            <div className={`animate-spin ${isDark ? 'text-white' : 'text-black'}`}>
              <RiLoader2Fill size={40} />
            </div>
            <div className={`text-center py-20 ${isDark ? 'text-white' : 'text-black'}`}>
              Loading your expense data...
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <ExpenseOverview 
                transactions={filteredExpenses}
                onAddExpense={() => setOpenAddExpenseModal(true)}
              />
            </div>
           
            <ExpenseList
              transactions={filteredExpenses}
              onDelete={(id) => { setOpenDeleteAlert({ show: true, data: id }); }}
              onDownload={DownloadExpenseDetails}
            />
          </div>
        )}

        <Modal
          title='Add expense' 
          isOpen={openAddExpenseModal} 
          onClose={() => setOpenAddExpenseModal(false)}
        >
          <AddExpenseForms onAddExpense={AddExpenseDetails} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
