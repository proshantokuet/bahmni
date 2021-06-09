'use strict';

angular.module('bahmni.clinical')
    .controller('PrescriptionController', ['$scope', '$rootScope', 'spinner',
        'messagingService', 'appService','visitService', 'visitHistory','$state',
        function ($scope, $rootScope,  spinner, messagingService, appService, visitService, visitHistory, $state) {
            $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
            debugger;
            $scope.visitHistory = visitHistory;
            $scope.prescription = {"prescriptionId" : 0};
            $scope.prescription.prescribedMedicine = [{"pmId":0,"duration":1}];
            var init = function () {
                visitService.getMedicineList().then(function (response) {
                    $scope.medicine = response.data;
                });

            };
            $scope.addNewChoice = function () {
                var newItemNo = $scope.prescription.prescribedMedicine.length + 1;
                $scope.prescription.prescribedMedicine.push({"pmId":0,"duration":1});
            };
            $scope.removeThis = function (index) {
                $scope.prescription.prescribedMedicine.splice(index, 1);
            };

            //$scope.medicine = [{name:"seclo",code:"203"},{name:"napa",code:"203"},{name:"tufnil",code:"203"},{name:"ACE",code:"203"}];

            $scope.savePrescriptionDetailsWhenComplete = function () {
                $scope.prescription.patientUuid = $scope.patient.uuid;
                $scope.prescription.patientName = $scope.patient.name;
                $scope.prescription.gender = $scope.patient.genderText.replace(/<\/?[^>]+(>|$)/g, "");
                $scope.prescription.patientAge = $scope.patient.ageText.replace(/<\/?[^>]+(>|$)/g, "");
                $scope.prescription.visitUuid = $scope.visitHistory.activeVisit.uuid;
                $scope.prescription.visitDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime($scope.visitHistory.activeVisit.startDatetime);
                $scope.prescription.providerName = $rootScope.currentUser.fullName;
                console.log($scope.prescription);

                spinner.forPromise(visitService.savePrescriptionData($scope.prescription).then(function (response) {
                    if(response.data) {
                        messagingService.showMessage("info", response.data.message);
                        $state.go("patient.dashboard.show", {
                                patientUuid: $scope.patient.uuid
                            }
                        );
                    }
                }));
            };

            $scope.savePrescriptionDetailsWhenPrintAndComplete = function () {
                $scope.prescription.patientUuid = $scope.patient.uuid;
                $scope.prescription.patientName = $scope.patient.name;
                $scope.prescription.gender = $scope.patient.genderText.replace(/<\/?[^>]+(>|$)/g, "");
                $scope.prescription.patientAge = $scope.patient.ageText.replace(/<\/?[^>]+(>|$)/g, "");
                $scope.prescription.visitUuid = $scope.visitHistory.activeVisit.uuid;
                $scope.prescription.visitDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime($scope.visitHistory.activeVisit.startDatetime);
                $scope.prescription.providerName = $rootScope.currentUser.fullName;
                console.log($scope.prescription);

                spinner.forPromise(visitService.savePrescriptionData($scope.prescription).then(function (response) {
                    if (response.data) {
                        messagingService.showMessage("info", response.data.message);
                    }
                }));
            };

            init();
        }
    ])
;
