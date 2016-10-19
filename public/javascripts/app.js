var app = angular.module('waste', ['angular-loading-bar', 'ui.router', 'angular-growl']);

app.config(function($stateProvider, $urlRouterProvider, growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalDisableCountDown(true);
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('index', {
        url: '/',
        templateUrl: 'views/index.html',
        controller: 'IndexController'
    });
});

var priorities = {
    low: 2,
    medium: 1,
    high: 0
};

var urgencies = {
    later: 3,
    month: 2,
    week: 1,
    tomorrow: 0
};

function Waste() {
    this.priority = 'medium';
    this.urgency = 'later';
}

app.controller('IndexController', function($scope, $http, growl) {
    $scope.headers = [
        {name: 'Title', sort: 'title'},
        {name: 'Date Added', sort: 'dateAdded'},
        {name: 'Apprx. Cost', sort: 'cost'},
        {name: 'Before'},
        {name: 'Priority', sort: 'priorityVal'},
        {name: 'Urgency', sort: 'urgencyVal'}
    ];
    $scope.selectedWaste = new Waste();
    $scope.wastes = [];
    $http.get('api/waste').then(function(response) {
        $scope.wastes = response.data.map(function(waste) {
            waste.priorityVal = priorities[waste.priority];
            waste.urgencyVal = urgencies[waste.urgency];
            waste.cost = parseInt(waste.cost) || '';
            return waste;
        });
    });
    $scope.upsertWaste = function() {
        var selectedWaste = $scope.selectedWaste;
        if (!selectedWaste._id) {
            selectedWaste.dateAdded = new Date();
            selectedWaste.cost = parseInt(selectedWaste.cost) || '';
            $http.post('/api/waste', selectedWaste).then(function() {
                $scope.wastes.push(selectedWaste);
                $scope.selectedWaste = new Waste();
            });
        } else {
            selectedWaste.dateUpdated = new Date();
            selectedWaste.cost = parseInt(selectedWaste.cost) || '';
            $http.put('/api/waste/' + selectedWaste._id, selectedWaste).then(function() {
                growl.success('Updated!');
            });
        }
    };
    $scope.sort = 'priorityVal';
    $scope.setSort = function(sort) {
        if ($scope.sort == sort) sort = '-' + sort;
        $scope.sort = sort;
    };
    $scope.selectWaste = function(waste) {
        $scope.selectedWaste = waste;
    };
    $scope.unselect =function() {
        $scope.selectedWaste = new Waste();
    };
});