const mongoose = require('mongoose')

const LoginSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true }
	},
	{ collection: 'login' }
)

const model = mongoose.model('LoginSchema', LoginSchema)

module.exports = model