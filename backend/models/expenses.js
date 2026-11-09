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
    year : {type : Number},
    month : {type : Number},
    monthKey : {type : String},
 },{
    timestamps: true
 }
)

ExpenseSchema.pre("save", function (next) {
    const d = this.date ? new Date(this.date) : new Date();
    this.year = d.getFullYear();
    this.month = d.getMonth() + 1;
    this.monthKey = `${this.year}-${String(this.month).padStart(2, "0")}`;
    next();
});

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, monthKey: 1 });

module.exports = mongoose.model("Expense" , ExpenseSchema)
