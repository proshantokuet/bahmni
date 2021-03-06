'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['ngDialog', function (ngDialog) {
        var controller = function ($scope, $rootScope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };
            $scope.print = $rootScope.isBeingPrinted || false;
            $scope.conceptForAdviceForm = ["গর্ভবতী মায়ের উপদেশ","প্রসূতি মায়ের উপদেশ","নবজাতকের উপদেশ"];
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


            $scope.checkMultipleSelectionElement = function (observation) {
                if(observation.groupMembers && observation.groupMembers.length <= 0) {
                    var found = $scope.conceptForAdviceForm.indexOf(observation.concept.name);
                    if(found !== -1) {
                        return false;
                    }
                    else return true;
                }
                else {
                      return true;
                }
            };

            $scope.checkObsCondition = function (observation, obj) {
                if ($rootScope.isBeingPrinted) {
                    var isVoidedFormForPrint = false;
                    if (obj.groupMembers) {
                        if (obj.groupMembers.length > 0) {
                            var formName = obj.groupMembers[0].formFieldPath;
                            if (formName) {
                                var finalFormName = formName.split(".")[0];
                                if (finalFormName == "Delivery") {
                                    isVoidedFormForPrint = true;
                                }
                            }
                        }
                        else if (obj.formFieldPath) {
                            var formName = obj.formFieldPath;
                            if (formName) {
                                var finalFormName = formName.split(".")[0];
                                if (finalFormName == "Delivery") {
                                    isVoidedFormForPrint = true;
                                }
                            }
                        }
                    }
                    else if (obj.formFieldPath) {
                        var formName = obj.groupMembers[0].formFieldPath;
                        if (formName) {
                            var finalFormName = formName.split(".")[0];
                            if (finalFormName == "Delivery") {
                                isVoidedFormForPrint = true;
                            }
                        }
                    }
                    if (!isVoidedFormForPrint) {
                        var metaDate = $rootScope.fetchedPrescribedData;
                        var flag = metaDate.indexOf(observation);
                        if (flag !== -1) {
                            return true;
                        }
                        else return false;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
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
