
const xlsx = require('xlsx');
const Expense = require('../models/expenses')
//Add expense
exports.addExpense = async( req, res) => {
    const userId = req.user.id;
  try{
     const {category, amount, date} = req.body;
    if(!category || !amount || !date){
        return res.status(400).json({message : "All fields are required"})
    }

    const newExpense= new Expense({
        userId ,
        category ,
        amount:Number(amount) ,
        date:new Date(date)
    })

    await newExpense.save();
    res.status(200).json(newExpense);

}catch(err){
     console.error("Error adding expense:", err);
    res.status(500).json({message : err.message})
}
}


//get all expense
exports.getAllExpense= async( req, res) => {
    const userId = req.user.id;
    try{
        const expense = await Expense.find({ userId : userId}).sort({date: -1})
        res.json(expense);
    }catch(err){
     res.status(500).json({message : err.message})
    }
}

//delete
exports.deleteExpense = async ( req, res) => {
    const expenseId = req.params.id;
    const userId = req.user.id;
    try{
        const deletedExpense = await Expense.findOneAndDelete({ 
            _id: expenseId, 
            userId: userId 
        });
       
        res.json("Deletion successful");
    }catch(err){
     res.status(500).json({message : err.message})
    }
}

exports.downloadExpenseExcel = async(req, res) =>{
    const userId = req.user.id;
      try{
        const expense = await Expense.find({ userId : userId}).sort({date: -1})
        
        const data = expense.map((expense) =>({
            category : expense.category, 
            amount : expense.amount,
            date : expense.date,
        }))
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        xlsx.utils.book_append_sheet( workbook , worksheet , "Expense");
        xlsx.writeFile(workbook ,"ExpenseDetails.xlsx");
        res.download('ExpenseDetails.xlsx');
    }catch(err){
     res.status(500).json({message : err.message})
    }
}