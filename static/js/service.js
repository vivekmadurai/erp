app.service('dataService', ['$http', function ($http) {

    this.get = function (url) {
        return $http.get(url);
    };

    this.post = function (url, data) {
        return $http.post(url, data);
    };

    this.put = function (url, data) {
        return $http.put(url, data);
    };

    this.delete = function (url) {
        return $http.delete(url);
    };

}]);