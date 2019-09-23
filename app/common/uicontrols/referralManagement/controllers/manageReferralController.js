'use strict';

angular.module('bahmni.common.uicontrols.referralmanagement')
    .controller('ManageReferralController', ['$scope', '$rootScope', '$stateParams', 'referManagementService', 'messagingService', 'spinner',
        function ($scope, $rootScope, $stateParams, referManagementService, messagingService, spinner) {
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
                finalizedSplitedDate.setDate(finalizedSplitedDate.getDate() + 1);
                $scope.inwardReferral['referralDate'] = finalizedSplitedDate;
                spinner.forPromise(referManagementService.inwardReferralcreate($scope.inwardReferral).then(function (result) {
                    messagingService.showMessage("info", "SUCCESSFULLY_SAVED_REFERRAL_FORM");
                    $scope.inwardReferral = {};
                }));
            };

            $scope.saveOutwardReferral = function () {
                $scope.outwardReferral.patientUuid = $stateParams.patientUuid;
                spinner.forPromise(referManagementService.outwordReferralcreate($scope.outwardReferral).then(function (result) {
                    messagingService.showMessage("info", "SUCCESSFULLY_SAVED_REFERRAL_FORM");
                    $scope.outwardReferral = {};
                }));
            };
        }
    ]);
