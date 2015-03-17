angular.module('ergo.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('AssessCtrl', ['$scope' ,'$http',  function($scope,$http) {
                $scope.val1 = 'This is temp Val' ;  
                $scope.fName = '';
                $scope.lName = '';
                $scope.knee = '';  
                $scope.elbow = '' ;
                $scope.eye = '' ;
                
                $scope.getAllRec = function(){ 
                     $http({method: 'GET', url: '/db/readRecords'}).
                        success(function(data, status) { 
                              $scope.dataset = data; 
                        }).
                        error(function(data, status) {
                          $scope.dataset = data || "Request failed "; 
                      }); 
                }
                
                $scope.addRecord = function(){ 
                    $http({method: 'GET', url: '/db/addRecord?fName='+$scope.fName+'&lName='+
                           $scope.lName+'&knee='+$scope.knee+'&elbow='+$scope.elbow+'&eye='+$scope.eye}).
                        success(function(data, status) { 
                                alert('Record Added');
                                $scope.getAllRec();
                        });  
                }
                
                $scope.delRecord = function(recId){
                    console.log(recId);
                    if(confirm('Are you sure you want to delete this record ? '))
                    {
                        $http({method: 'GET', url: '/db/delRecord?id='+recId}).
                            success(function(data, status) {  
                                    $scope.getAllRec();
                            });
                    }
                } 
                
                $scope.getAllRec();
                
            }])

.controller('RecsCtrl', function($scope) {});
