'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper',
        '$window', '$q', 'spinner', 'appService', 'messagingService', '$rootScope', 'auditLogService',
        function ($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner,
                  appService, messagingService, $rootScope, auditLogService) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};
            $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy");
            $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture");

            $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());

            var setReadOnlyFields = function () {
                $scope.readOnlyFields = {};
                var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
                angular.forEach(readOnlyFields, function (readOnlyField) {
                    if ($scope.patient[readOnlyField]) {
                        $scope.readOnlyFields[readOnlyField] = true;
                    }
                });
            };
            var dateFormat = function (dateObject) {
                var date = new Date(dateObject),
                    yr = date.getFullYear(),
                    month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
                    day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
                    newDate = day + '/' + month + '/' + yr;
                return newDate;
            };

            var successCallBack = function (openmrsPatient) {
                $scope.openMRSPatient = openmrsPatient["patient"];
                /* $scope.genderValue = $scope.openMRSPatient.person.gender;
                console.log($scope.genderValue); */
                var i;
                $scope.UICString = "";
                $scope.birthDistrictString = "";
                for (i = 0; i < $scope.openMRSPatient.person.attributes.length; i++) {
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "UIC") {
                        console.log("in edit page");
                        $scope.UICString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                }
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                if ($scope.patient.birthdate) {
                    $scope.patient.birthdate = dateFormat($scope.patient.birthdate);
                }
                if ($scope.patient.RegistrationDate) {
                    $scope.patient.RegistrationDate = dateFormat($scope.patient.RegistrationDate);
                }
                $rootScope.zillaBinding = {birthDistrictName: $scope.patient.birthDistrict, birthupazillaName: $scope.patient.birthUpazilla };
                $scope.patient.uic = $scope.UICString;
                if ($scope.patient.FinancialStatus) {
                    if ($scope.patient.FinancialStatus.value == "PoP") {
                        $scope.patient.showGovCardType = true;
                        $scope.patient.showCardNo = true;
                    }
                }
                console.log($scope.patient);
                setReadOnlyFields();
                expandDataFilledSections();
                $scope.patientLoaded = true;
            };

            var expandDataFilledSections = function () {
                angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function (section) {
                    var notNullAttribute = _.find(section && section.attributes, function (attribute) {
                        return $scope.patient[attribute.name] !== undefined;
                    });
                    section.expand = section.expanded || (notNullAttribute ? true : false);
                });
            };

            (function () {
                var getPatientPromise = patientService.get(uuid).then(successCallBack);

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.then(function (data) {
                    var encountersWithObservations = data.data.results.filter(function (encounter) {
                        return encounter.obs.length > 0;
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();
            var convertToDateObject = function (dateString) {
                var splitedDate = dateString.split('/');
                var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                finalizedSplitedDate.setDate(finalizedSplitedDate.getDate());
                return finalizedSplitedDate;
            };
            $scope.update = function () {
                if ($scope.patient.birthdate) {
                    $scope.patient.birthdate = convertToDateObject($scope.patient.birthdate);
                }
                if ($scope.patient.RegistrationDate) {
                    var splitedDate = $scope.patient.RegistrationDate.split('/');
                    var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                    finalizedSplitedDate.setDate(finalizedSplitedDate.getDate());
                    $scope.patient.RegistrationDate = finalizedSplitedDate;
                }
                // $scope.patient.UIC = $scope.patient.uic;
                addNewRelationships();
                var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
                if (errorMessages.length > 0) {
                    errorMessages.forEach(function (errorMessage) {
                        messagingService.showMessage('error', errorMessage);
                    });
                    return $q.when({});
                }

                return spinner.forPromise(patientService.update($scope.patient, $scope.openMRSPatient).then(function (result) {
                    var patientProfileData = result.data;
                    if (!patientProfileData.error) {
                        successCallBack(patientProfileData);
                        $scope.actions.followUpAction(patientProfileData);
                    }
                }));
            };

            var addNewRelationships = function () {
                var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function (relationship) {
                    return relationship.relationshipType && relationship.relationshipType.uuid;
                });
                newRelationships = _.each(newRelationships, function (relationship) {
                    delete relationship.patientIdentifier;
                    delete relationship.content;
                    delete relationship.providerName;
                });
                $scope.patient.relationships = _.concat(newRelationships, $scope.patient.deletedRelationships);
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? ($scope.readOnlyFields[field] ? true : false) : undefined;
            };

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                // patientService.fakecall().then(function (response) {
                //     console.log($scope.patient);
                // });
                //$window.open('../clinical/index.html#/default/patient/' + $scope.patient.uuid + '/dashboard?currentTab=DASHBOARD_TAB_GENERAL_KEY', "_self");
                patientService.updatePatientEntryDetails($scope.patient.uuid).then(function (result) {
                    if(result.patientUuid) {
                        $window.open('../clinical/index.html#/default/patient/' + $scope.patient.uuid + '/dashboard?currentTab=DASHBOARD_TAB_GENERAL_KEY', "_self");
                    }
                });
            };
        }]);
