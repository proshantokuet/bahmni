'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$rootScope', '$state', '$stateParams', 'patientService', 'messagingService', 'spinner',
        function ($scope, $rootScope, $state, $stateParams, patientService, messagingService, spinner) {
            $scope.showAddigForm = $scope.ngDialogData.showAddigForm;
            $scope.childInformation = {};
            if ($scope.showAddigForm) {
                $scope.patient = $scope.ngDialogData.patient;
            }
            else {
                $scope.patient = $scope.ngDialogData.patient;
                $scope.noOfVisits = $scope.ngDialogData.noOfVisits;
                var sectionConfig = $scope.ngDialogData.sectionConfig;

                var defaultParams = {
                    maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
                };
                $scope.params = angular.extend(defaultParams, $scope.params);
                $scope.params = angular.extend(sectionConfig, $scope.params);
                $scope.patientUuid = $stateParams.patientUuid;
                $scope.showAllObservationsData = true;
            }

            $rootScope.$on('ngDialog.closed', function (e, $dialog) {
                $rootScope.$broadcast('ChildInfoClosingDialog', { closingFlag: true });
            });

            $scope.saveChildInformation = function () {
                var splitedDate = $scope.childInformation.outcomeDate.split('/');
                var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                finalizedSplitedDate.setDate(finalizedSplitedDate.getDate() + 1);
                $scope.childInformation['outcomeDate'] = finalizedSplitedDate;
                $scope.childInformation.motherUuid = $scope.patient.uuid;
                spinner.forPromise(patientService.savePatientChildInformation($scope.childInformation).then(function (result) {
                    messagingService.showMessage("info", "SUCCESSFULLY_SAVED_REFERRAL_FORM");
                    $scope.closeThisDialog();
                }));
            };
        }]);
