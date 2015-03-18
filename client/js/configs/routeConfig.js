angular.module("routerConfig", ["ngRoute"])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when('/signup', {templateUrl: "views/templates/signUp.html"})
            .when('/driveui', {templateUrl: "views/templates/driveUI.html"})
    }]);

    