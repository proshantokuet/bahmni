'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary', '$timeout', 'printer', 'visitConfig', 'visitHistory', '$stateParams', 'age',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitConfig, visitHistory, $stateParams, age) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });
            $scope.currentVisitUrl = $state.current.views['dashboard-content'].templateUrl ||
                $state.current.views['print-content'].templateUrl;
            //$scope.currentVisitUrl = "common/views/prescriptionPrintVisit.html";
            $scope.visitHistory = visitHistory; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.visitTabConfig = visitConfig;
            $scope.showTrends = true;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.visitUuid = $stateParams.visitUuid;
            var tab = $stateParams.tab;

            $scope.isNumeric = function (value) {
                return $.isNumeric(value);
            };

            $scope.toggle = function (item) {
                item.show = !item.show;
            };
            $scope.isEmpty = function (notes) {
                if (notes) {
                    return notes.trim().length < 2;
                }
                return true;
            };

            $scope.testResultClass = function (line) {
                var style = {};
                if ($scope.pendingResults(line)) {
                    style["pending-result"] = true;
                }
                if (line.isSummary) {
                    style["header"] = true;
                }
                return style;
            };

            $scope.pendingResults = function (line) {
                return line.isSummary && !line.hasResults && line.name !== "";
            };

            $scope.displayDate = function (date) {
                return moment(date).format("DD-MMM-YY");
            };

            $scope.$on("event:printVisitTab", function () {
                printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                    window.location.reload();
                });
            });

            $scope.$on("event:clearVisitBoard", function () {
                $scope.clearBoard = true;
                $timeout(function () {
                    $scope.clearBoard = false;
                });
            });

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.dashboard.visit', {visitUuid: visitUuid});
            };

            var printOnPrint = function () {
                if ($stateParams.print) {
                    printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                        window.close();
                    });
                }
            };
            $scope.obj = {
                    "type": "order",
                    "displayOrder": 3,
                    "config": {
                        "translationKey": "DASHBOARD_TITLE_LAB_ORDERS_NEW_FOR_PRINT",
                        "name": "ordersControl",
                        "orderType": "Lab Order",
                        "conceptNames": [
                            "Systolic",
                            "Diastolic",
                            "Posture",
                            "Temperature"
                        ],
                        "showDetailsButton": true
                    }
            };

            var getTab = function () {
                if (tab) {
                    for (var tabIndex in $scope.visitTabConfig.tabs) {
                        if ($scope.visitTabConfig.tabs[tabIndex].title === tab) {
                            return $scope.visitTabConfig.tabs[tabIndex];
                        }
                    }
                }
                return $scope.visitTabConfig.getFirstTab();
            };

            var init = function () {
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToTheSections([$scope.visitUuid], $scope.patientUuid);
                var tabToOpen = getTab();
                $scope.visitTabConfig.switchTab(tabToOpen);
                if ($scope.patient.birthdate) {
                    var ages = age.fromBirthDate($scope.patient.birthdate);
                    $scope.ageCalculate =  ages.years + " Y " + ages.months + " M " + ages.days + " D";
                }
                $scope.currentDate = new Date();
                printOnPrint();
            };
            init();
        }]);
