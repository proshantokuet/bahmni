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
                console.log($scope.openMRSPatient);

                $scope.genderValue = $scope.openMRSPatient.person.gender;
                console.log($scope.genderValue);
                var i;
                $scope.riskyHabbitArray = "";
                $scope.diseaseStatusString = "";
                $scope.familyDiseaseHistoryString = "";
                $scope.NIDString = "";
                $scope.NIDCheckbox = false;
                $scope.BRIDString = "";
                $scope.BRIDCheckbox = false;
                $scope.EPIString = "";
                $scope.EPICheckbox = false;
                $scope.showRiskyHabitsValue = false;
                $scope.showDiseaseStatusValue = false;
                $scope.showMaritalStatus = false;
                $scope.spouseValue = false;
                $scope.diseaseStartIndexValue = 0;
                $scope.diseaseEndIndexValue = 0;
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
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "nationalId") {
                        $scope.NIDString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "nationalIdCheckbox") {
                        $scope.NIDCheckbox = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "birthRegistrationID") {
                        $scope.BRIDString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "bridCheckbox") {
                        $scope.BRIDCheckbox = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "epicardnumber") {
                        $scope.EPIString = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "epiCheckbox") {
                        $scope.EPICheckbox = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "showRiskyHabits") {
                        $scope.showRiskyHabitsValue = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "showDiseaseStatus") {
                        $scope.showDiseaseStatusValue = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "diseaseStartIndex") {
                        $scope.diseaseStartIndexValue = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "diseaseEndIndex") {
                        $scope.diseaseEndIndexValue = $scope.openMRSPatient.person.attributes[i].value;
                    }
                    if ($scope.openMRSPatient.person.attributes[i].attributeType.display == "MaritalStatus") {
                        var s = $scope.openMRSPatient.person.attributes[i].value;
                        $scope.showMaritalStatus = true;
                        /* console.log(s);
                        if ($scope.openMRSPatient.person.attributes[i].value == "বিবাহিত") {
                            console.log("বিবাহিত");
                            $scope.patient.showHusbandName = true;
                        } */

                        if (s.display == "বিবাহিত") {
                            console.log(s.display);
                            $scope.spouseValue = true;
                        }
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
                    console.log(a);
                    $scope.patient.diseaseStatus[a] = true;
                }
                var familyDiseaseHistoryArray = $scope.familyDiseaseHistoryString.split(',');
                for (i = 0; i < familyDiseaseHistoryArray.length; i++) {
                    var a = familyDiseaseHistoryArray[i];
                    $scope.patient.familyDiseaseHistory[a] = true;
                }
                if ($scope.NIDCheckbox == true) {
                    $scope.patient.nationalId = $scope.NIDString;
                    $scope.patient.nationalIdCheckbox = true;
                } else if ($scope.NIDCheckbox == false) {
                    $scope.patient.nationalId = "";
                    $scope.patient.nationalIdCheckbox = false;
                }
                if ($scope.BRIDCheckbox == true) {
                    $scope.patient.brid = $scope.BRIDString;
                    $scope.patient.bridCheckbox = true;
                } else if ($scope.BRIDCheckbox == false) {
                    $scope.patient.brid = "";
                    $scope.patient.bridCheckbox = false;
                }
                if ($scope.EPICheckbox == true) {
                    $scope.patient.epi = $scope.EPIString;
                    $scope.patient.epiCheckbox = true;
                } else if ($scope.EPICheckbox == false) {
                    $scope.patient.epi = "";
                    $scope.patient.epiCheckbox = false;
                }
                $scope.patient.showRiskyHabits = $scope.showRiskyHabitsValue;
                $scope.patient.showDiseaseStatus = $scope.showDiseaseStatusValue;
                $scope.patient.showMaritalStatus = $scope.showMaritalStatus;
                $scope.patient.diseaseStartIndex = $scope.diseaseStartIndexValue;
                $scope.patient.diseaseEndIndex = $scope.diseaseEndIndexValue;
                console.log($scope.spouseValue);
                console.log($scope.genderValue);

                if ($scope.genderValue == 'F' && $scope.spouseValue) {
                    console.log("female and married");
                    $scope.patient.showHusbandName = $scope.spouseValue;
                }

                if ($scope.genderValue == 'M' && $scope.spouseValue) {
                    $scope.patient.showWifeName = $scope.spouseValue;
                }

                if ($scope.patient.showMaritalStatus) {
                    if ($scope.patient.MaritalStatus != null) {
                        if ($scope.patient["MaritalStatus"].value == Bahmni.Common.Constants.married) {
                            $scope.patient.showFamilyplanning = true;
                            if ($scope.genderValue == 'F') {
                                $scope.patient.showPregnancyStatus = true;
                                if ($scope.patient.PregnancyStatus != null) {
                                    if ($scope.patient.PregnancyStatus.value == 'প্রসবোত্তর') {
                                        $scope.patient.showDeliveryDate = true;
                                        $scope.patient.showLMP = false;
                                    }
                                    if ($scope.patient.PregnancyStatus.value == 'প্রসব পূর্ব') {
                                        $scope.patient.showDeliveryDate = false;
                                        $scope.patient.showFamilyplanning = false;
                                        $scope.patient.showLMP = true;
                                    }
                                }
                            }
                        }
                    }
                }

                if ($scope.patient.memberType == "কমিউনিটি ক্লিনিকের আওতাধীন") {
                    $scope.patient.showMemberType = true;
                    var patientAge = dateToDay(calculateBirthDate($scope.patient.age));
                    if (patientAge > Bahmni.Common.Constants.aboveFiveYear) {
                        $scope.patient.showOccupation = true;
                        $scope.patient.showEducation = true;
                    }
                    if (patientAge > Bahmni.Common.Constants.aboveTenYear) $scope.patient.showPhoneNumber = true;
                } else {
                    $scope.patient.showMemberType = false;
                    var patientAge = dateToDay(calculateBirthDate($scope.patient.age));
                    if (patientAge > Bahmni.Common.Constants.aboveTenYear) $scope.patient.showPhoneNumber = true;
                }

                if ($scope.patient.disable != null) {
                    if ($scope.patient.disable.value == "হ্যাঁ") {
                        $scope.patient.showDisability = true;
                    }
                }

                if ($scope.patient.showDiseaseStatus) {
                    $scope.patient.yesNoCheckbox = "হ্যাঁ";
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

            var dateToDay = function (dob) {
                var dob = new Date(dob);
                var today = new Date();
                var timeDiff = Math.abs(today.getTime() - dob.getTime());
                var age = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
                return age;
            };

            var calculateBirthDate = function (age) {
                var birthDate = dateUtil.now();
                birthDate = dateUtil.subtractYears(birthDate, age.years);
                birthDate = dateUtil.subtractMonths(birthDate, age.months);
                birthDate = dateUtil.subtractDays(birthDate, age.days);
                return birthDate;
            };

            $scope.isReadOnly = function (field) {
                return $scope.readOnlyFields ? ($scope.readOnlyFields[field] ? true : false) : undefined;
            };

            $scope.afterSave = function () {
                auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
                messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
                $window.open('../clinical/index.html#/default/patient/' + uuid + '/dashboard?currentTab=DASHBOARD_TAB_GENERAL_KEY', "_self");
            };
        }]);
