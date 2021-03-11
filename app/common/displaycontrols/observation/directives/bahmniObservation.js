'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q', 'spinner', '$rootScope', 'formHierarchyService', '$translate',
        function (observationsService, appService, $q, spinner, $rootScope, formHierarchyService, $translate) {
            var controller = function ($scope) {
                $scope.print = $rootScope.isBeingPrinted || false;
                $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;
                //$rootScope.vitalsArrayList = [];
                $scope.comparingVitalsList = [];
                var mapObservation = function (observations) {
                    // for (var ob = 0; ob < observations.length; ob++) {
                    //     var formName = observations[ob].formFieldPath;
                    //     if (formName) {
                    //         var findSpecialIndex = formName.indexOf(".");
                    //         if (findSpecialIndex != -1) {
                    //             var splitFormName = formName.split(".");
                    //             formName = splitFormName[0];
                    //         }
                    //     }
                    //     if (formName == "VITALS") {
                    //         $rootScope.vitalsArrayList.push(observations[ob]);
                    //         // if ($rootScope.vitalsArrayList.length > 0) {
                    //         //     for (var i = 0; i < $rootScope.vitalsArrayList.length; i++) {
                    //         //         for (var j = 0; j < $scope.comparingVitalsList.length; j++) {
                    //         //             if ($scope.comparingVitalsList[j].encounterDateTime > $rootScope.vitalsArrayList[i].encounterDateTime) {
                    //         //                 $rootScope.vitalsArrayList[i] = $scope.comparingVitalsList[j];
                    //         //             }
                    //         //         }
                    //         //     }
                    //         // }
                    //         // else {
                    //         //     $rootScope.vitalsArrayList.push(observations[ob]);
                    //         // }
                    //         // $rootScope.$broadcast('vitalsbroadcast');
                    //         // $scope.test = $rootScope.vitalsArrayList;
                    //     }
                    // }
                    //
                    // if (angular.isUndefined($rootScope.tooglingVisitStart)) {
                    //     if ($rootScope.vitalsArrayList.length > 0) {
                    //
                    //         var mostRecentDate = new Date(Math.max.apply(null, $rootScope.vitalsArrayList.map(function (e) {
                    //             return new Date(e.visitStartDateTime);
                    //         })));
                    //
                    //         var vitalsList = $rootScope.vitalsArrayList.filter(function (item) {
                    //             if (new Date(item.visitStartDateTime).getTime() == mostRecentDate.getTime()) {
                    //                 return item;
                    //             }
                    //         });
                    //         $rootScope.$broadcast('vitalsbroadcast', vitalsList);
                    //     }
                    //

                    var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, conceptsConfig);

                    if ($scope.config.conceptNames) {
                        observations = _.filter(observations, function (observation) {
                            return _.some($scope.config.conceptNames, function (conceptName) {
                                return _.toLower(conceptName) === _.toLower(_.get(observation, 'concept.name'));
                            });
                        });
                    }

                    if ($scope.config.persistOrderOfConcepts) {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().persistOrderOfConceptNames(observations);
                    } else {
                        $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observations);
                        for (var i = 0; i < $scope.bahmniObservations.length; i++) {
                            var string = "";
                            for (var j = 0; j < $scope.bahmniObservations[i].value.length; j++) {
                                if (j == $scope.bahmniObservations[i].value.length - 1) {
                                    if ($scope.bahmniObservations[i].value[j].formFieldPath) {
                                        var splitData = $scope.bahmniObservations[i].value[j].formFieldPath.split(".");
                                        string = string + splitData[0];
                                    }
                                    else {
                                        string = string + "";
                                    }
                                }
                                else {
                                    if ($scope.bahmniObservations[i].value[j].formFieldPath) {
                                        var splitData = $scope.bahmniObservations[i].value[j].formFieldPath.split(".");
                                        string = string + splitData[0] + ",";
                                    }
                                    else {
                                        string = string + "" + ",";
                                    }
                                }
                            }
                            var findingUniqueString = string.split(",");
                            if (findingUniqueString.length > 1) {
                                var checkingDuplicity = Array.from(new Set(findingUniqueString)).toString();
                                $scope.bahmniObservations[i].formName = checkingDuplicity;
                                // if (findingUniqueString[0] == findingUniqueString[1]) {
                                //     $scope.bahmniObservations[i].formName = findingUniqueString[0];
                                // }
                                // else {
                                //     $scope.bahmniObservations[i].formName = string;
                                // }
                            }
                            else {
                                $scope.bahmniObservations[i].formName = string;
                            }
                        }
                    }
                    // var formname = "";
                    // var clientHistoryArray = [];
                    // var generalExaminationArray = [];
                    // var obstetricArray = [];
                    // var othersArray = [];
                    // _.each($scope.bahmniObservations[0].value, function (observation) {
                    //     if (observation.formFieldPath) {
                    //         var SplittedformName = observation.formFieldPath.split('.');
                    //         formname = SplittedformName[0];
                    //     }
                    //     if (formname == "Client History") {
                    //         clientHistoryArray.push(observation);
                    //     }
                    //     else if (formname == "General Examination") {
                    //         generalExaminationArray.push(observation);
                    //     }
                    //     else if (formname == "Obstetric History") {
                    //         obstetricArray.push(observation);
                    //     }
                    //     else othersArray.push(observation);
                    // });
                    // $scope.bahmniObservations[0].value = clientHistoryArray.concat(generalExaminationArray).concat(obstetricArray).concat(othersArray);

                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = $translate.instant(Bahmni.Common.Constants.messageForNoObservation);
                        $scope.$emit("no-data-present-event");
                    } else {
                        if (!$scope.showGroupDateTime) {
                            _.forEach($scope.bahmniObservations, function (bahmniObs) {
                                bahmniObs.isOpen = true;
                            });
                        } else {
                            _.forEach($scope.bahmniObservations, function (bahmniObs) {
                                var parseDate = parseInt(bahmniObs.key);
                                var convertTodate = new Date(parseDate);
                                if ($rootScope.dateOpened) {
                                    if (convertTodate.getDate() == $rootScope.dateOpened.getDate() && convertTodate.getMonth() == $rootScope.dateOpened.getMonth()) {
                                        $scope.bahmniObservations[0].isOpen = true;
                                    }
                                }
                            });
                        }
                    }

                    var formObservations = _.filter(observations, function (obs) {
                        return obs.formFieldPath;
                    });

                    if (formObservations.length > 0) {
                        formHierarchyService.build($scope.bahmniObservations);
                    }
                    if ($scope.bahmniObservations.length > 0) {
                        var sortOrder = 5;
                        _.each($scope.bahmniObservations, function (observation) {
                            _.each(observation.value, function (obs) {
                                if (obs.concept.shortName == "Follow up") {
                                    obs.serial = 1;
                                }
                                else if (obs.concept.shortName == "Advice") {
                                    obs.serial = 2;
                                }
                                else if (obs.concept.shortName == "Client History") {
                                    obs.serial = 3;
                                }
                                else if (obs.concept.shortName == "General Examination") {
                                    obs.serial = 4;
                                }
                                else if (obs.concept.shortName == "Obstetric History") {
                                    obs.serial = 5;
                                }
                                // else if (obs.concept.shortName == "Follow up") {
                                //     var orderLength = $scope.bahmniObservations[0].value.length;
                                //     obs.formOrder = orderLength + 4;
                                // }
                                else {
                                    obs.serial = sortOrder + 1;
                                    sortOrder = sortOrder + 1;
                                }

                            });
                        });

                    }
                    $rootScope.tooglingVisitStart = undefined;
                };

                var fetchObservations = function () {
                    if ($scope.observations) {
                        mapObservation($scope.observations, $scope.config);
                        $scope.isFulfilmentDisplayControl = true;
                    } else {
                        if ($scope.config.observationUuid) {
                            $scope.initialization = observationsService.getByUuid($scope.config.observationUuid).then(function (response) {
                                mapObservation([response.data], $scope.config);
                            });
                        } else if ($scope.config.encounterUuid) {
                            var fetchForEncounter = observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames);
                            $scope.initialization = fetchForEncounter.then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        } else if ($scope.enrollment) {
                            $scope.initialization = observationsService.fetchForPatientProgram($scope.enrollment, $scope.config.conceptNames, $scope.config.scope, $scope.config.obsIgnoreList).then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        } else {
                            $scope.initialization = observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames,
                                $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid,
                                $scope.config.obsIgnoreList, null).then(function (response) {
                                    mapObservation(response.data, $scope.config);
                                });
                        }
                    }
                };

                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.expandedViewConfig &&
                        ($scope.section.expandedViewConfig.pivotTable || $scope.section.expandedViewConfig.observationGraph);
                };

                var fetchPrescriptionMetaData = function () {
                     observationsService.fetchPrescriptionMetaData().then(function (response) {
                        $rootScope.fetchedPrescribedData = response.data;
                    });
                };

                fetchObservations();
                fetchPrescriptionMetaData();

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };
            };

            var link = function ($scope, element) {
                $scope.initialization && spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/observation/views/observationDisplayControl.html",
                scope: {
                    patient: "=",
                    visitUuid: "@",
                    section: "=?",
                    config: "=",
                    title: "=sectionTitle",
                    isOnDashboard: "=?",
                    observations: "=?",
                    message: "=?",
                    enrollment: "=?"
                }
            };
        }]);
