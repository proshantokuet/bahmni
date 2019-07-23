'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams',
        function ($scope, $rootScope, clinicalAppConfigService, treatmentConfig, $stateParams) {
            var init = function () {
                var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
                $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
                $scope.tabConfigName = $stateParams.tabConfigName || 'default';

                var initializeTreatments = function () {
                    $scope.consultation.newlyAddedTabTreatments = $scope.consultation.newlyAddedTabTreatments || {};
                    $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] || {treatments: [], orderSetTreatments: [], newOrderSet: {}};
                    $scope.treatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments;
                    $scope.orderSetTreatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].orderSetTreatments;
                    $scope.newOrderSet = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].newOrderSet;
                };

                $scope.$watch('consultation.newlyAddedTabTreatments', initializeTreatments);
                $scope.savingObservation = function () {
                    $rootScope.$emit("CallSaveParentMethod", {});
                };

                $scope.enrollment = $stateParams.enrollment;
                $scope.treatmentConfig = treatmentConfig;
            };
            init();
        }]);
