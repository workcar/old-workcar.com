angular.module('app', [
    'ngRoute',
    'ngAria',
    'ngMessages',
    'ngAnimate',
    'ngCookies',
    'socialsharing',
    'mailchimp',
    'ngFileUpload'
])

.constant('MAILCHIMP', {
    username: 'workcar',
    dc: 'us11',
    u: '48e3866be26d164fb12e857cc',
    id: '8f21fd44e1'
})

.config(['$routeProvider', '$locationProvider', '$twtProvider', function($routeProvider, $locationProvider, $twtProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'RegisterCtrl'
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl'
        })
        .when('/verify', {
            templateUrl: 'views/verify.html',
            controller: 'VerifyCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    $twtProvider.init()
        .trimText(true);

}])

.controller('AppCtrl', ['$scope', '$location', 'MAILCHIMP',
    function($scope, $location, MAILCHIMP) {
        $scope.location = $location;
        $scope.MAILCHIMP = MAILCHIMP;
    }
])

.controller('RegisterCtrl', ['$scope', '$location', '$http', '$cookies',
    function($scope, $location, $http, $cookies) {

        var ctrl = {};
        var newCustomer = {
            firstName: '',
            lastName: '',
            mobilePhone: '',
            email: '',
            password: ''
        };

        var signup = function() {
            if (ctrl.signupForm.$valid) {

                $http.post('http://localhost:5000/signup', newCustomer).
                success(function(data, status, headers, config) {

                    $location.path('/verify')
                }).
                error(function(data, status, headers, config) {
                    ctrl.showSubmittedPrompt = true;
                    (ctrl.showSubmittedErrors).push("Failed to signup");
                });
            }
        };

        var clearForm = function() {
            ctrl.newCustomer = {
                firstName: '',
                lastName: '',
                mobilePhone: '',
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

.controller('VerifyCtrl', ['$scope', 'Upload', function($scope, Upload) {
    $scope.$watch('files', function() {
        $scope.upload($scope.files);
    });
    // set default directive values
    // Upload.setDefaults( {ngf-keep:false ngf-accept:'image/*', ...} );
    $scope.upload = function(files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: 'upload/url',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function(evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function(data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                }).error(function(data, status, headers, config) {
                    console.log('error status: ' + status);
                })
            }
        }
    };
}])

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
