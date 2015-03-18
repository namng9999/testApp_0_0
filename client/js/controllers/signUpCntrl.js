angular.module("signUpCntrlDI", [])
	.controller ("signUpCntrl", ["$scope", "$http", function($scope, $http){
		var req = {
			method: "POST",
			url: "https://api.twitter.com/oauth/request_token",
			headers: {
				'Authorization': 

			}

		};

		$scope.postDataTwitter = function () {
			$http (req);
		}

	}]);