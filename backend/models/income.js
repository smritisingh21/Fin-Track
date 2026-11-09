const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.ObjectId,
        ref:'user',
        required : true
    },
    icon:{type : String},
    source : {type : String, required : true},
    amount : {type : Number, required : true},
    date : {type :Date , default : Date.now},
    year : {type : Number},
    month : {type : Number},
    monthKey : {type : String},
 },{
    timestamps: true
 }
)

IncomeSchema.pre("save", function (next) {
    const d = this.date ? new Date(this.date) : new Date();
    this.year = d.getFullYear();
    this.month = d.getMonth() + 1;
    this.monthKey = `${this.year}-${String(this.month).padStart(2, "0")}`;
    next();
});

IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, monthKey: 1 });

module.exports = mongoose.model("Income" , IncomeSchema);