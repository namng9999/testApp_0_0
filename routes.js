var routeName; 

module.exports.postRoute = function (request, response) {
	routeName = request.params.routeName;

	switch (routeName) {
		case ('signup'): 
			controllers.signUpCntrl.createUser(request, response); 
			break;
	}
}
