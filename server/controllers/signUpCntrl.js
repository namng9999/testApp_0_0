var models = require('../models/userModels.js');
var User;

module.exports.createUser = function (request, response) {
	User = new models.user(request.body);
	User.save (function (err, result) {
		if (!err) {response.json (result); }
		else { response.json (err) }
	});
}
module.exports.listUsers = function (request, response) {
	models.user.find ({}, function (err, results) {
		
		response.json (results); 
		
	});
}
module.exports.findUserID = function (profileID) {
	models.user.find ({id: profileID}, function (err, results) {
		if (results[0] === undefined) {
			console.log('Empty Result');
		}else{
			console.log('Something Here');
		}
	});
}
module.exports.clearCollection = function (request, response) {
	models.user.remove({});
	response.send('Cleared Everything');
}