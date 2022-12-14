const mongoose = require('mongoose')

const SignupSchema = new mongoose.Schema(
	{
        name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
        gender: {type:String},
        degree: {type:String,required:true},
        school:{type:String,required:true},
        age:{type:Number,required:true},
        email:{type:String,required:true},
        isAdmin:{type:Boolean,required:true},
        registeredEvents:{type:Array,required:false}
	},
	{ collection: 'User' }
)

const model = mongoose.model('SignupSchema', SignupSchema)

module.exports = model