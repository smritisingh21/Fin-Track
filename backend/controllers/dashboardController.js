const Income = require('../models/income.js');
const Expense = require('../models/expenses.js');
const {isValidObjectId , Types} = require('mongoose');


exports.getDashboardData = async(req,res) =>{

try{
    const userId = req.user.id;
    const userObjId = new Types.ObjectId(String(userId));

    const totalIncome = await Income.aggregate([
        {$match : {userId : userObjId}},
        {$group :{
            _id : null , 
            total :{$sum :"$amount"}
        }}
    ])
    
    
     const totalExpense = await Expense.aggregate([
        {$match : {userId : userObjId}},
        {$group :{
            _id : null ,
            total :{$sum :"$amount"}
            }}
    ])
    //income transactions in the last 60 days
    const last60daysIncomeTransactions = await Income.find({
        userId,
        date:{$gte :new Date(Date.now() - 60* 24* 60* 60* 1000)},
    }).sort({date :-1})

    //total income for the last 60 days
    const incomeLast60days = last60daysIncomeTransactions.reduce(
        (sum, transaction) => sum + transaction.amount ,0
    );
    //expense transactions for the last 30 days
     const last30daysExpenseTransactions = await Expense.find({
        userId,
        date:{$gte :new Date(Date.now() - 30* 24* 60* 60* 1000)},
    }).sort({date :-1})

    //total expense in the last 30 days
     const expenseLast30days = last30daysExpenseTransactions.reduce(
        (sum, transaction) => sum + transaction.amount ,0
    );
    //last 5 transactions(income + expense)
    const lastTransactions  = [
        ...(await Income.find({userId}).sort({date : -1}).limit(5)) .map(
            (txn) =>({
            ...txn.toObject(),
            type: "income",
        })),

        ...(await Expense.find({userId}).sort({date : -1}).limit(5)) .map(
            (txn) =>({
            ...txn.toObject(),
            type: "expense",
        }))
    ].sort((a , b ) => new Date(b.date) - new Date(a.date));//sort latest first

    //finalresponse
      res.status(200).json({
        totalBalance : (totalIncome[0]?.total || 0 ) - (totalExpense[0]?.total || 0 ),
        totalIncome : totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,

        last30daysExpense :{
            total : expenseLast30days ,
            transactions : last30daysExpenseTransactions,
        },

        last60daysIncome :{
            total : incomeLast60days ,
            transactions : last60daysIncomeTransactions,
        },
        recentTransactions : lastTransactions
    })
  }catch(err){
    res.status(400).json({message :"server error", err})
  }
}


