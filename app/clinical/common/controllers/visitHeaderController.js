'use strict';

angular.module('bahmni.clinical')
    .controller('VisitHeaderController', ['$rootScope', '$scope', '$state', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'visitConfig', 'contextChangeHandler', '$location', '$stateParams', 'urlHelper', 'visitService',
        function ($rootScope, $scope, $state, clinicalAppConfigService, patientContext, visitHistory, visitConfig, contextChangeHandler, $location, $stateParams, urlHelper,visitService) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.visitTabConfig = visitConfig;

            $scope.switchTab = function (tab) {
                $scope.visitTabConfig.switchTab(tab);
                $rootScope.$broadcast('event:clearVisitBoard', tab);
            };

            $scope.gotoPatientDashboard = function () {
                if (contextChangeHandler.execute()["allow"]) {
                    $location.path($stateParams.configName + "/patient/" + patientContext.patient.uuid + "/dashboard");
                }
            };

            $scope.openConsultation = function () {
                var board = clinicalAppConfigService.getAllConsultationBoards()[0];
                var urlPrefix = urlHelper.getPatientUrl();
                $scope.collapseControlPanel();
                $rootScope.hasVisitedConsultation = true;
                var url = "/" + $stateParams.configName + (board.url ? urlPrefix + "/" + board.url : urlPrefix);
                var extensionParams = board.extensionParams;
                var queryParams = [];
                if ($stateParams.programUuid) {
                    var programParams = {
                        "programUuid": $stateParams.programUuid,
                        "enrollment": $stateParams.enrollment
                    };
                    extensionParams = _.merge(programParams, extensionParams);
                }
                angular.forEach(extensionParams, function (extensionParamValue, extensionParamKey) {
                    queryParams.push(extensionParamKey + "=" + extensionParamValue);
                });
                if (!_.isEmpty(queryParams)) {
                    url = url + "?" + queryParams.join("&");
                }

                $location.url(url);
            };

            $scope.closeTab = function (tab) {
                $scope.visitTabConfig.closeTab(tab);
                $rootScope.$broadcast("event:clearVisitBoard", tab);
            };

            $scope.print = function () {
                debugger;

                visitService.downloadPdf($stateParams.visitUuid).then(function (response) {
                    debugger;
                    var dllink = document.createElement("a");
                    var file = new Blob([response.data], {type: 'application/pdf'});
                    var fileURL = URL.createObjectURL(file);
                    window.open(fileURL);
                });
            };

            $scope.showPrint = function () {
                return $scope.visitTabConfig.showPrint();
            };
        }]);
