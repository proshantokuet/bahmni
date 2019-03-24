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

            var successCallBack = function (openmrsPatient) {
                $scope.openMRSPatient = openmrsPatient["patient"];

                var i;
                $scope.riskyHabbitArray = "";
                $scope.diseaseStatusString = "";
                $scope.familyDiseaseHistoryString = "";
                for (i = 0; i < $scope.openMRSPatient.person.attributes.length; i++) {
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "RiskyHabit") {
                        $scope.riskyHabbitArray = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "Disease_status") {
                        $scope.diseaseStatusString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "family_diseases_details") {
                        $scope.familyDiseaseHistoryString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                }

                $scope.patient = openmrsPatientMapper.map(openmrsPatient);

                var riskyArray = $scope.riskyHabbitArray.split(',');
                for (i = 0; i < riskyArray.length; i++) {
                    var a = riskyArray[i];
                    $scope.patient.riskyHabit[a] = true;
                }
                var diseaseStatusArray = $scope.diseaseStatusString.split(',');
                for (i = 0; i < diseaseStatusArray.length; i++) {
                    var a = diseaseStatusArray[i];
                    $scope.patient.diseaseStatus[a] = true;
                }
                var familyDiseaseHistoryArray = $scope.familyDiseaseHistoryString.split(',');
                for (i = 0; i < familyDiseaseHistoryArray.length; i++) {
                    var a = familyDiseaseHistoryArray[i];
                    $scope.patient.familyDiseaseHistory[a] = true;
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

            $scope.update = function () {
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
                var relationshipType = {};
                var relationObject = {};
                var relationArray = [];
                if ($scope.patient.newlyAddedRelationships[0].personB != undefined) {
                    var personB = $scope.patient.newlyAddedRelationships[0].personB;
                    console.log(personB);
                    relationshipType['uuid'] = "03ed3084-4c7a-11e5-9192-080027b662ec";
                    relationObject["relationshipType"] = relationshipType;
                    relationObject["personB"] = personB;
                    relationArray.push(relationObject);
                }
                $scope.patient.relationships = _.concat(relationArray, $scope.patient.deletedRelationships);
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? ($scope.readOnlyFields[field] ? true : false) : undefined;
            };

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
            };
        }]);
