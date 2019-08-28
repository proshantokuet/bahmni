'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q', 'spinner', '$rootScope', 'formHierarchyService', '$translate',
        function (observationsService, appService, $q, spinner, $rootScope, formHierarchyService, $translate) {
            var controller = function ($scope) {
                $scope.print = $rootScope.isBeingPrinted || false;
                $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;
                $rootScope.vitalsArrayList = [];
                $scope.comparingVitalsList = [];
                var mapObservation = function (observations) {
                    for (var ob = 0; ob < observations.length; ob++) {
                        if (observations[ob].conceptNameToDisplay == "Vitals") {
                            $scope.comparingVitalsList.push(observations[ob]);
                            if ($rootScope.vitalsArrayList.length > 0) {
                                for (var i = 0; i < $rootScope.vitalsArrayList.length; i++) {
                                    for (var j = 0; j < $scope.comparingVitalsList.length; j++) {
                                        if ($scope.comparingVitalsList[j].encounterDateTime > $rootScope.vitalsArrayList[i].encounterDateTime) {
                                            $rootScope.vitalsArrayList[i] = $scope.comparingVitalsList[j];
                                        }
                                    }
                                }
                            }
                            else {
                                $rootScope.vitalsArrayList.push(observations[ob]);
                            }
                            $rootScope.$broadcast('vitalsbroadcast');
                        }
                    }
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
                                        string = string + "Vitals";
                                    }
                                }
                                else {
                                    if ($scope.bahmniObservations[i].value[j].formFieldPath) {
                                        var splitData = $scope.bahmniObservations[i].value[j].formFieldPath.split(".");
                                        string = string + splitData[0] + ",";
                                    }
                                    else {
                                        string = string + "Vitals" + ",";
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

                fetchObservations();

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
