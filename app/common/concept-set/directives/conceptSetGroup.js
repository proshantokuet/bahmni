'use strict';

angular.module('bahmni.common.conceptSet')
    .controller('ConceptSetGroupController', ['$scope', '$state', '$location', '$window', '$bahmniCookieStore', 'patientService', 'contextChangeHandler', 'spinner', 'messagingService',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig', '$q',
        'retrospectiveEntryService', 'userService', 'conceptSetUiConfigService', '$timeout', 'clinicalAppConfigService', '$stateParams', '$translate',
        function ($scope, $state, $location, $window, $bahmniCookieStore, patientService, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, $q, retrospectiveEntryService, userService,
                  conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate) {
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var init = function () {
                $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates);
                contextChangeHandler.add($scope.validationHandler.validate);
            };
            $scope.toggleSideBar = function () {
                $rootScope.showLeftpanelToggle = !$rootScope.showLeftpanelToggle;
            };
            $scope.showLeftpanelToggle = function () {
                return $rootScope.showLeftpanelToggle;
            };

            $scope.itemNames = [{name: "MED", id: 23, price: 34}, {name: "MEDiceine MEDiceine MEDiceine", id: 34, price: 340}];
            $scope.getItem = function (index) {
                if (index == undefined) {
                    return "";
                }
                var obj = JSON.parse(index);
                console.log(obj);
                return obj.price;
            };
            $scope.servicePoints = [{name: "Clinic"}, {name: "Satellite"}, {name: "EPI"}, {name: "Garments"}, {name: "Coporate"}, {name: "Goverment Events"}, {name: "Camp"}, {name: "NGO"}, {name: "Others"}, {name: "CSP"}, {name: "N/A"}];
            $scope.references = [{name: "Self"}, {name: "CSO"}, {name: "Satellite"}, {name: "SHCSG"}, {name: "SMC"}, {name: "External"}, {name: "Others"}];
            $scope.services = [{"discount": 0}];
            $scope.patientInfo = {clinicName: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicName, clinicCode: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId, orgUnit: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).orgUnit};
            $scope.addNewChoice = function () {
                var newItemNo = $scope.services.length + 1;
                $scope.services.push({"discount": 0});
            };
            $scope.removeChoice = function () {
                var lastItem = $scope.services.length - 1;
                console.log($scope.services.length);
                if ($scope.services.length != 1) {
                    $scope.services.splice(lastItem);
                }
            };
            $scope.onChanged = function (item, index) {
                $scope.services[index].unitCost = item.unitCost;
                $scope.services[index].quantity = "";
                $scope.services[index].totalAmount = 0;
                $scope.services[index].discount = 0;
                $scope.services[index].netPayable = 0;
            };
            $scope.calculateTotalAmountAndNetPayable = function (quantity, index) {
                var totalAmount = quantity * $scope.services[index].unitCost;
                $scope.services[index].totalAmount = parseFloat(totalAmount).toFixed(2);
                if ($scope.services[index].discount != undefined) {
                    $scope.services[index].netPayable = parseFloat(totalAmount) - $scope.services[index].discount.toFixed(2);
                } else {
                    $scope.services[index].netPayable = parseFloat(totalAmount).toFixed(2);
                }
            };

            $scope.calculateNetAmount = function (discount, index) {
                var totalAmount = parseFloat($scope.services[index].totalAmount);
                var disccountAmount = (discount * totalAmount) / 100;
                var netpayAmount = totalAmount - disccountAmount;
                $scope.services[index].netPayable = (totalAmount - discount).toFixed(2);
            };
            $scope.calTotalAmount = function () {
                $scope.total = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.totalAmount != undefined) {
                        $scope.total = $scope.total + parseFloat(listItem.totalAmount);
                    }
                });
                return $scope.total;
            };

            $scope.calTotalDiscount = function () {
                $scope.totalDiscount = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.discount != undefined) {
                        $scope.totalDiscount = $scope.totalDiscount + listItem.discount;
                    }
                });
                return $scope.totalDiscount;
            };

            $scope.calTotalNetAmount = function () {
                $scope.net = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.netPayable != undefined) {
                        $scope.net = $scope.net + parseFloat(listItem.netPayable);
                    }
                });
                return $scope.net;
            };

            var saveMoneyReceipt = function (data) {
                return patientService.saveMoneyReceipt(data).then(function (response) {
                    console.log("save return");
                    console.log(response);
                });
            };
            $scope.searchButtonText = "Submit";
            $scope.test = "true";
            $scope.submitMoneyReceiptData = function (patientInfo, services, patient) {
                $scope.enable = "false";
                $scope.test = "true";
                $scope.searchButtonText = "Submitting";
                console.log("submit receipt");
                console.log(services);
                console.log(patient);
                var jsonData = {};
                patientInfo['mid'] = "";
                patientInfo['patientName'] = patient.givenName + " " + patient.familyName;
                patientInfo['patientUuid'] = patient.uuid;
                patientInfo['uic'] = patient.UIC.value;
                if (patient.MobileNo != undefined) {
                    patientInfo['contact'] = patient.MobileNo.value;
                }
                patientInfo['gender'] = patient.gender;
                patientInfo['dob'] = patient.birthdate;
                if (patient.FinancialStatus != undefined) {
                    patientInfo['wealth'] = patient.FinancialStatus.value.display;
                }
                jsonData["moneyReceipt"] = patientInfo;
                jsonData["services"] = services;

                return spinner.forPromise($q.all([saveMoneyReceipt(jsonData)]).then(function (results) {
                    console.log("after premise");
                    console.log(results);
                    $state.go("patient.dashboard.show", {
                        patientUuid: patient.uuid
                    }, {reload: true}
                    );
                    // return $window.open("/bahmni/clinical/index.html#/default/patient/" + patient.uuid + "/dashboard?currentTab=DASHBOARD_TAB_GENERAL_KEY", "_self");
                }));

               /* var moneyReceiptObj = {};
                moneyReceiptObj['mid'] = "";
                moneyReceiptObj['patientName'] = data.givenName;
                moneyReceiptObj['patientUuid'] = data.uuid;
                moneyReceiptObj['uic'] = data.uic;
                moneyReceiptObj['contact'] = "01923445667";
                moneyReceiptObj['dob'] = "2019-02-23";
                moneyReceiptObj['address'] = data.address;
                moneyReceiptObj['clinicName'] = data.clinicName;
                moneyReceiptObj['clinicCode'] = data.clinicCode;
                moneyReceiptObj['sateliteClinicId'] = data.sateliteClinicId;
                moneyReceiptObj['teamNo'] = data.teamNo;
                moneyReceiptObj['moneyReceiptDate'] = data.moneyReceiptDate;
                moneyReceiptObj['reference'] = data.reference;
                moneyReceiptObj['referenceId'] = data.referenceId;
                moneyReceiptObj['shift'] = "Day";
                moneyReceiptObj['wealth'] = "Poor";
                moneyReceiptObj['servicePoint'] = data.servicePoint;
                moneyReceiptObj['gender'] = data.gender;
                moneyReceiptObj['slipNo'] = data.slipNo;
                moneyReceiptObj['clinicType'] = "BmoC";

                var servicesObj = {};
                servicesObj['item'] = data.item;
                servicesObj['description'] = data.description;
                servicesObj['unitCost'] = data.unitCost;
                servicesObj['quantity'] = data.quantity;
                servicesObj['totalAmount'] = data.totalAmount;
                servicesObj['discount'] = data.discount;
                servicesObj['netPayable'] = data.netPayable;
                servicesObj['moneyReceiptDate'] = data.moneyReceiptDate;

                jsonData["moneyReceipt"] = moneyReceiptObj;
                jsonData["services"] = [];

                var jsonArrayObject = {};
                jsonArrayObject["spid"] = servicesObj;

                jsonData["services"].push(jsonArrayObject);
                console.log(jsonData); */
            };
            $scope.togglePref = function (conceptSet, conceptName) {
                $rootScope.currentUser.toggleFavoriteObsTemplate(conceptName);
                spinner.forPromise(userService.savePreferences());
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.showPreviousButton = function (conceptSetName) {
                return conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].showPreviousButton;
            };

            $scope.showPrevious = function (conceptSetName, event) {
                event.stopPropagation();
                $timeout(function () {
                    $scope.$broadcast('event:showPrevious' + conceptSetName);
                });
            };
            $scope.isInEditEncounterMode = function () {
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            $scope.computeField = function (conceptSet, event) {
                event.stopPropagation();
                $scope.consultation.preSaveHandler.fire();
                var defaultRetrospectiveVisitType = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(),
                    retrospectiveEntryService.getRetrospectiveEntry(), defaultRetrospectiveVisitType, $scope.isInEditEncounterMode());
                encounterData = encounterService.buildEncounter(encounterData);
                encounterData.drugOrders = [];

                var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
                var data = {
                    encounterModifierObservations: encounterData.observations,
                    drugOrders: encounterData.drugOrders,
                    conceptSetData: conceptSetData,
                    patientUuid: encounterData.patientUuid,
                    encounterDateTime: encounterData.encounterDateTime
                };

                spinner.forPromise(treatmentConfig().then(function (treatmentConfig) {
                    $scope.treatmentConfiguration = treatmentConfig;
                    return conceptSetService.getComputedValue(data);
                }).then(function (response) {
                    response = response.data;
                    copyValues($scope.consultation.observations, response.encounterModifierObservations);
                    $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [];
                    response.drugOrders.forEach(function (drugOrder) {
                        $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfiguration));
                    });
                }));
            };

            $scope.canRemove = function (index) {
                var observations = $scope.allTemplates[index].observations;
                if (observations === undefined || _.isEmpty(observations)) {
                    return true;
                }
                return observations[0].uuid === undefined;
            };

            $scope.clone = function (index) {
                var clonedObj = $scope.allTemplates[index].clone();
                $scope.allTemplates.splice(index + 1, 0, clonedObj);
                $.scrollTo('#concept-set-' + (index + 1), 200, {offset: {top: -400}});
            };

            $scope.clonePanelConceptSet = function (conceptSet) {
                var index = _.findIndex($scope.allTemplates, conceptSet);
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: $scope.allTemplates[index].label}));
                $scope.clone(index);
                $scope.showLeftPanelConceptSet($scope.allTemplates[index + 1]);
            };

            $scope.isClonedSection = function (conceptSetTemplate, allTemplates) {
                if (allTemplates) {
                    var index = allTemplates.indexOf(conceptSetTemplate);
                    return (index > 0) ? allTemplates[index].label == allTemplates[index - 1].label : false;
                }
                return false;
            };

            $scope.isLastClonedSection = function (conceptSetTemplate) {
                var index = _.findIndex($scope.allTemplates, conceptSetTemplate);
                if ($scope.allTemplates) {
                    if (index == $scope.allTemplates.length - 1 || $scope.allTemplates[index].label != $scope.allTemplates[index + 1].label) {
                        return true;
                    }
                }
                return false;
            };

            $scope.remove = function (index) {
                var label = $scope.allTemplates[index].label;
                var currentTemplate = $scope.allTemplates[index];
                var anotherTemplate = _.find($scope.allTemplates, function (template) {
                    return template.label == currentTemplate.label && template !== currentTemplate;
                });
                if (anotherTemplate) {
                    $scope.allTemplates.splice(index, 1);
                }
                else {
                    var clonedObj = $scope.allTemplates[index].clone();
                    $scope.allTemplates[index] = clonedObj;
                    $scope.allTemplates[index].isAdded = false;
                    $scope.allTemplates[index].isOpen = false;
                    $scope.allTemplates[index].klass = "";
                    $scope.allTemplates[index].isLoaded = false;
                }
                $scope.leftPanelConceptSet = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {label: label}));
            };

            $scope.openActiveForm = function (conceptSet) {
                if (conceptSet && conceptSet.klass == 'active' && conceptSet != $scope.leftPanelConceptSet) {
                    $scope.showLeftPanelConceptSet(conceptSet);
                }
                return conceptSet.klass;
            };

            var copyValues = function (existingObservations, modifiedObservations) {
                existingObservations.forEach(function (observation, index) {
                    if (observation.groupMembers && observation.groupMembers.length > 0) {
                        copyValues(observation.groupMembers, modifiedObservations[index].groupMembers);
                    } else {
                        observation.value = modifiedObservations[index].value;
                    }
                });
            };

            var collapseExistingActiveSection = function (section) {
                if (section) {
                    section.klass = "";
                    section.isOpen = false;
                    section.isLoaded = false;
                }
            };

            $scope.showLeftPanelConceptSet = function (selectedConceptSet) {
                collapseExistingActiveSection($scope.leftPanelConceptSet);
                $scope.leftPanelConceptSet = selectedConceptSet;
                $scope.leftPanelConceptSet.isOpen = true;
                $scope.leftPanelConceptSet.isLoaded = true;
                $scope.leftPanelConceptSet.klass = "active";
                $scope.leftPanelConceptSet.atLeastOneValueIsSet = selectedConceptSet.hasSomeValue();
                $scope.leftPanelConceptSet.isAdded = true;
                $scope.consultation.lastvisited = selectedConceptSet.id || selectedConceptSet.formUuid;
                $(window).scrollTop(0);
            };

            $scope.focusOnErrors = function () {
                var errorMessage = $scope.leftPanelConceptSet.errorMessage ? $scope.leftPanelConceptSet.errorMessage : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                messagingService.showMessage('error', errorMessage);
                $scope.$parent.$parent.$broadcast("event:errorsOnForm");
            };

            $scope.isFormTemplate = function (data) {
                return data.formUuid;
            };
            var services = function () {
                return patientService.getServices().then(function (response) {
                    $scope.serviceList = response.data;
                });
            };
            var initPromise = $q.all([services()]);
            $scope.initialization = initPromise;

            init();
        }])
    .directive('conceptSetGroup', ['spinner', function (spinner) {
        var link = function ($scope, element) {
            spinner.forPromise($scope.initialization, element);
        };
        return {
            restrict: 'EA',
            link: link,
            scope: {
                conceptSetGroupExtensionId: "=?",
                observations: "=",
                allTemplates: "=",
                context: "=",
                autoScrollEnabled: "=",
                patient: "=",
                consultation: "="

            },
            controller: 'ConceptSetGroupController',
            templateUrl: '../common/concept-set/views/conceptSetGroup.html'
        };
    }]);
