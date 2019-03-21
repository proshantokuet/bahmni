'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', ['patientVisitHistoryService', 'conceptSetService', 'visitService', 'spinner', '$state', '$q',
        function (patientVisitHistoryService, conceptSetService, visitService, spinner, $state, $q) {
            var controller = function ($scope) {
                var emitNoDataPresentEvent = function () {
                    $scope.$emit("no-data-present-event");
                };
                $scope.openVisit = function (visit) {
                    if ($scope.$parent.closeThisDialog) {
                        $scope.$parent.closeThisDialog("closing modal");
                    }
                    $state.go('patient.dashboard.visit', {visitUuid: visit.uuid});
                };

                $scope.hasVisits = function () {
                    return $scope.visits && $scope.visits.length > 0;
                };

                $scope.visitInfoArray = [];
                var getObservationInVisit = function (visit) {
                    return visitService.getObservations(visit.uuid)
                        .then(function (saveResponse) {
                            var i = 0;
                            var jsonArrayList = "";
                            var keys = [];
                            var formName = "";
                            for (i = 0; i < saveResponse.data.length; i++) {
                                formName = saveResponse.data[i].formFieldPath.substr(0, saveResponse.data[i].formFieldPath.indexOf('.'));
                                if (!keys.includes(formName)) {
                                    keys.push(formName);
                                }
                                console.log(saveResponse.data[i]);
                            }
                            jsonArrayList = keys.join();
                            console.log(jsonArrayList);
                            $scope.obsString = jsonArrayList;
                            $scope.visitInfoArray.push({
                                visitObj: visit,
                                formName: jsonArrayList,
                                visitStartDateTime: saveResponse.data[0].visitStartDateTime
                            });
                            console.log($scope.visitInfoArray);
                            return saveResponse.data;
                        });
                };

                $scope.params = angular.extend(
                    {
                        maximumNoOfVisits: 4,
                        title: "Visits"
                    }, $scope.params);

                $scope.noVisitsMessage = "No Visits for this patient.";

                $scope.toggle = function (visit) {
                    visit.isOpen = !visit.isOpen;
                    visit.cacheOpenedHtml = true;
                };

                $scope.filteredObservations = function (observation, observationTemplates) {
                    var observationTemplateArray = [];
                    for (var observationTemplateIndex in observationTemplates) {
                        observationTemplateArray.push(observationTemplates[observationTemplateIndex].display);
                    }

                    var obsArrayFiltered = [];
                    for (var ob in observation) {
                        if (_.includes(observationTemplateArray, observation[ob].concept.display)) {
                            obsArrayFiltered.push(observation[ob]);
                        }
                    }
                    return obsArrayFiltered;
                };

                $scope.editConsultation = function (encounter) {
                    showNotApplicablePopup();
                    if ($scope.$parent.closeThisDialog) {
                        $scope.$parent.closeThisDialog("closing modal");
                    }
                    $state.go('patient.dashboard.show.observations', {
                        conceptSetGroupName: "observations",
                        encounterUuid: encounter.uuid
                    });
                };

                $scope.getDisplayName = function (data) {
                    var concept = data.concept;
                    var displayName = data.concept.displayString;
                    if (concept.names && concept.names.length === 1 && concept.names[0].name !== "") {
                        displayName = concept.names[0].name;
                    } else if (concept.names && concept.names.length === 2) {
                        displayName = _.find(concept.names, {conceptNameType: "SHORT"}).name;
                    }
                    return displayName;
                };

                $scope.getProviderDisplayName = function (encounter) {
                    return encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].provider.display : null;
                };

                var getVisits = function () {
                    return patientVisitHistoryService.getVisitHistory($scope.patientUuid);
                };

                var init = function () {
                    return $q.all([getVisits()]).then(function (results) {
                        $scope.visits = results[0].visits;
                        var i = 0;
                        for (i = 0; i < $scope.visits.length; i++) {
                            var observations = getObservationInVisit($scope.visits[i]);
                        }
                        $scope.patient = {uuid: $scope.patientUuid};
                        if (!$scope.hasVisits()) emitNoDataPresentEvent();
                    });
                };

                $scope.initialization = init();

                $scope.params = angular.extend(
                    {
                        maximumNoOfVisits: 4,
                        title: "Visits"
                    }, $scope.params);

                $scope.noVisitsMessage = "No Visits for this patient.";
            };
            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                link: link,
                controller: controller,
                templateUrl: "displaycontrols/allvisits/views/visitsTable.html",
                scope: {
                    params: "=",
                    patientUuid: "="
                }
            };
        }]);
