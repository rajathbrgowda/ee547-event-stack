const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema(
	{
        name: { type: String, required: true },
		location: { type: String, required: true, unique: true },
        date:{type:String,required:true},
        start_time:{type:String,required:true},
        end_time:{type:String,required:true},
        category:{type:String,required:true},
        about:{type:String},
        adminId:{type:Number,required:true},
        registeredUsers:{type:Array,required:false}
	},
	{ collection: 'Event' }
)

const model = mongoose.model('EventSchema', EventSchema)

module.exports = model