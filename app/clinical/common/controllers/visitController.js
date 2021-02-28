'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary', '$timeout', 'printer', 'visitConfig', 'visitHistory', '$stateParams', 'age','$bahmniCookieStore',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitConfig, visitHistory, $stateParams, age, $bahmniCookieStore) {
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
            $scope.clinicName = $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicName;
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
            $scope.dateConversion = function(date) {
                return new Date(date);
            };
            $scope.$on("event:printVisitTab", function (event,args) {
                if (args.printType.label == "Discharge Certificate") {
                    printer.printFromScope(args.printType.url, $scope, function () {
                        window.location.reload();
                    });
                }
                else if (args.printType.label == "Birth Certificate") {
                    printer.printFromScope(args.printType.url, $scope, function () {
                        window.location.reload();
                    });
                }
                else {
                    printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                        window.location.reload();
                    });
                }

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

            $scope.getDischargeInformation = function () {
                if($scope.visitUuid && $scope.patientUuid) {
                     encounterService.getDischargeInfo($scope.visitUuid, $scope.patientUuid).then(function (response) {
                         $scope.dischargeDataList = response.data;
                     });
                }
            };

            $scope.getLastProviderName = function () {
                if ($scope.visitUuid && $scope.patientUuid) {
                    encounterService.getLastProviderInfo($scope.visitUuid).then(function (response) {
                        $scope.lastProviderName = response.data.lastVisitedProvider;
                    });
                }
            };

            $scope.getBirthInformation = function () {
                if ($scope.visitUuid && $scope.patientUuid) {
                    encounterService.getBirthInfo($scope.visitUuid, $scope.patientUuid).then(function (response) {
                        $scope.birhDataList = response.data;
                    });
                }
            };

            var printOnPrint = function () {
                if ($stateParams.print) {
                    printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                        window.close();
                    });
                }
            };
            $scope.address = function (address) {
                var addresLine = "";
                var stateProvince = "";
                var countyDistrict = "";
                var address3 = "";
                var cityVillage = "";
                var address2 = "";
                var address1 = "";
                if (!address.isEmpty) {
                    /* if (address.stateProvince != undelined) {
                     stateProvince = address.stateProvince;
                     addresLine += stateProvince + ", ";
                     } */
                    if (address.address1 != undefined) {
                        address1 = address.address1;
                        addresLine += address1;
                    }
                    if (address.address2 != undefined) {
                        address2 = address.address2;
                        addresLine += address2 + ", ";
                    }
                    if (address.cityVillage != undefined) {
                        cityVillage = address.cityVillage;
                        addresLine += cityVillage + ", ";
                    }
                    /* if (address.countyDistrict != undefined) {
                     countyDistrict = address.countyDistrict;
                     addresLine += countyDistrict + ",";
                     } */
                    if (address.address3 != undefined) {
                        address3 = address.address3;
                        addresLine += address3;
                    }
                    return addresLine;
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
                //$scope.addressString = $scope.address($scope.patient.address);
                $scope.currentDate = new Date();
                printOnPrint();
                $scope.getDischargeInformation();
                $scope.getBirthInformation();
                $scope.getLastProviderName();
            };
            init();
        }]);
