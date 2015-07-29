angular.module('app', [
    'ngRoute',
    'ngAria',
    'ngMessages',
    'ngAnimate',
    'ngCookies',
    'socialsharing'
])

.config(['$routeProvider', '$locationProvider', '$twtProvider', function($routeProvider, $locationProvider, $twtProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    $twtProvider.init()
        .trimText(true);

}])

.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location) {
        $scope.location = $location;
    }
])

.controller('RegisterCtrl', ['$scope', '$location', '$http', '$cookies',
    function($scope, $location, $http, $cookies) {

        var ctrl = {};
        var newCustomer = {
            firstName: '',
            lastName: '',
            mobile: '',
            email: '',
            password: ''
        };

        var signup = function() {
            if (ctrl.signupForm.$valid) {

                $http.post('/api/customers', newCustomer).
                success(function(data, status, headers, config) {

                    if (data.hasOwnProperty('status') && data.status == "ok") {

                        $location.path('/pledge')
                        $cookies.put('user_access_token', data.user_access_token);
                    } else {
                        ctrl.showSubmittedPrompt = true;
                        (data.errors).forEach(function(err) {
                            for (var k in err) {
                                (ctrl.showSubmittedErrors).push(err[k][0]);
                            }
                        })
                    }
                }).
                error(function(data, status, headers, config) {});
            }
        };

        var clearForm = function() {
            ctrl.newCustomer = {
                firstName: '',
                lastName: '',
                mobile: '',
                email: '',
                password: ''
            }
            ctrl.signupForm.$setUntouched();
            ctrl.signupForm.$setPristine();
            ctrl.showSubmittedErrors = [];
        };

        var getPasswordType = function() {
            return ctrl.signupForm.showPassword ? 'text' : 'password';
        };

        var toggleEmailPrompt = function(value) {
            ctrl.showEmailPrompt = value;
        };

        var toggleUsernamePrompt = function(value) {
            ctrl.showUsernamePrompt = value;
        };

        var toggleMobilePrompt = function(value) {
            ctrl.toggleMobilePrompt = value;
        };

        var hasErrorClass = function(field) {
            return ctrl.signupForm[field].$touched && ctrl.signupForm[field].$invalid;
        };

        var showMessages = function(field) {
            return ctrl.signupForm[field].$touched || ctrl.signupForm.$submitted
        };

        ctrl.showEmailPrompt = false;
        ctrl.showUsernamePrompt = false;
        ctrl.showSubmittedPrompt = false;
        ctrl.showSubmittedErrors = [];
        ctrl.toggleEmailPrompt = toggleEmailPrompt;
        ctrl.toggleUsernamePrompt = toggleUsernamePrompt;
        ctrl.toggleMobilePrompt = toggleMobilePrompt;
        ctrl.getPasswordType = getPasswordType;
        ctrl.hasErrorClass = hasErrorClass;
        ctrl.showMessages = showMessages;
        ctrl.newCustomer = newCustomer;
        ctrl.signup = signup;
        ctrl.clearForm = clearForm;

        $scope.ctrl = ctrl;
    }
])

.controller('PledgeCtrl', ['$scope', '$location', '$http', '$cookies',

    function($scope, $location, $http, $cookies) {

        $scope.projects = [];

        $http.get('/api/projects').
        success(function(data, status, headers, config) {
            $scope.projects = data;
        }).
        error(function(data, status, headers, config) {});

        $scope.pledgeProject = function(id) {

            var msg = {
                action: 'pledge',
                user_access_token: $cookies.get('user_access_token')
            }
            $http.post('/api/projects/' + id, msg).
            success(function(data, status, headers, config) {

                console.warn(data)
                $location.path('/twitter-start-app');
            }).
            error(function(data, status, headers, config) {
                console.error('something went wrong');
                // Todo: notify admin
                // but let the user proceed
                $location.path('/twitter-start-app');
            });
        }
    }
])

.controller('TwitterCtrl', ['$scope', '$location', '$http', '$cookies',

    function($scope, $location, $http, $cookies) {

        $scope.twtConnect = function() {

            window.location.href = '/auth/twitter';
        }
    }
])

.controller('WalletCtrl', ['$scope', '$location', '$http', '$cookies',

    function($scope, $location, $http, $cookies) {

        $scope.getApp = function() {

            $location.path('/send-address')
        }
    }
])

.controller('SendAddressCtrl', ['$scope', '$location', '$http', '$cookies', '$twt',

    function($scope, $location, $http, $cookies, $twt) {

        $scope.twtText = '';

        $scope.tweetAddress = function(text) {

            $twt.intent('tweet', {
                text: $scope.twtText,
                url: '',
                hashtags: ''
            });
        }
    }
])

.controller('ShoutCtrl', ['$scope', '$location', '$http', '$cookies',

    function($scope, $location, $http, $cookies) {

    }
])

.directive('validatePasswordCharacters', function() {
    return {
        require: 'ngModel',
        link: function($scope, element, attrs, ngModel) {
            ngModel.$validators.eightCharacters = function(value) {
                return (typeof value !== 'undefined') && value.length >= 8;
            };
        }
    }
})
