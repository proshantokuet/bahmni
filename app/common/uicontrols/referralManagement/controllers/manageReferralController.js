'use strict';

angular.module('bahmni.common.uicontrols.referralmanagement')
    .controller('ManageReferralController', ['$scope', '$rootScope', '$stateParams', 'referManagementService',
        function ($scope, $rootScope, $stateParams, referManagementService) {
            var test = $stateParams;
            $scope.showInWardSection = false;
            $scope.showOutWardSection = false;
            $scope.inwardReferral = {};
            $scope.outwardReferral = {};
            $scope.outwardReferral.clientInformation = {};
            $scope.saveInwardReferral = function () {
                $scope.inwardReferral.patientUuid = $stateParams.patientUuid;
                var splitedDate = $scope.inwardReferral.referralDate.split('/');
                var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                finalizedSplitedDate.setDate(finalizedSplitedDate.getDate());
                $scope.inwardReferral['referralDate'] = finalizedSplitedDate;
                referManagementService.inwordReferralcreate($scope.inwardReferral).then(function (result) {
                });
            };
            $scope.saveOutwardReferral = function () {
                $scope.outwardReferral.patientUuid = $stateParams.patientUuid;
            };
        }
    ]);
