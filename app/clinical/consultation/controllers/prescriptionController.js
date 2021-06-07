'use strict';

angular.module('bahmni.clinical')
    .controller('PrescriptionController', ['$scope', '$rootScope', 'spinner',
        'messagingService', 'appService',
        function ($scope, $rootScope,  spinner, messagingService,
                  appService) {
            $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
            $scope.prescription = {};
            $scope.prescription.service = [{}];

            $scope.addNewChoice = function () {
                var newItemNo = $scope.prescription.service.length + 1;
                $scope.prescription.service.push({});
            };
            $scope.removeThis = function (index) {
                $scope.prescription.service.splice(index, 1);
            };

            $scope.medicine = [{name:"seclo",code:"203"},{name:"napa",code:"203"},{name:"tufnil",code:"203"},{name:"ACE",code:"203"}]
        }
    ])
;
