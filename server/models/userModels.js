var mongoose = require('mongoose');

module.exports = 
{
	user: mongoose.model('Users', 
	{
		_id: String, 
		username: String,
		displayName: String,
		email: String,
		password: String,
		accessToken: String
	})
}; 


 