const mongoose = require("mongoose");

 const ExpenseSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.ObjectId,
        ref:'user',
        required : true
    },
    icon:{type : String},
    amount : {type : Number, required : true},
    category : {type : String, required : true},
    date : {type :Date , default : Date.now},
 },{
    timestamps: true
 }
)

module.exports = mongoose.model("Expense" , ExpenseSchema)
