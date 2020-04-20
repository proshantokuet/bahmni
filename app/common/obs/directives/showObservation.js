'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['ngDialog', function (ngDialog) {
        debugger;
        var controller = function ($scope, $rootScope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };
            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.dateString = function (observation) {
                var filterName;
                if ($scope.showDate && $scope.showTime) {
                    filterName = 'bahmniDateTime';
                } else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    filterName = 'bahmniTime';
                } else {
                    return null;
                }
                return $filter(filterName)(observation.observationDateTime);
            };
            $scope.openVideoInPopup = function (observation) {
                ngDialog.open({
                    template: "../common/obs/views/showVideo.html",
                    closeByDocument: false,
                    className: 'ngdialog-theme-default',
                    showClose: true,
                    data: {
                        observation: observation
                    }
                });
            };

            $scope.conceptDictionary = ["PNC","Date of maternal death","Cause of maternal death","Cause of neonatal death","Remarks","Gravida","Blood transfusion quantity","ANC","Vitals","Pulse"];


            $scope.checkObsCondition = function (observation) {
                debugger;
                if ($rootScope.isBeingPrinted) {
                    var flag = $scope.conceptDictionary.indexOf(observation);
                    if (flag !== -1) {
                        return true;
                    }
                    else return false;
                }
                else {
                    return true;
                }
                console.log(observation);
            };

        };
        return {
            restrict: 'E',
            scope: {
                observation: "=?",
                patient: "=",
                showDate: "=?",
                showTime: "=?",
                showDetailsButton: "=?"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    }]);
