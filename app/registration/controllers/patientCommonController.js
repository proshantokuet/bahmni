'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', '$timeout', 'patientAttributeService', 'appService', 'spinner', '$location', 'ngDialog', '$window', '$state',
        function ($scope, $rootScope, $http, $timeout, patientAttributeService, appService, spinner, $location, ngDialog, $window, $state) {
            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            var personAttributes = [];
            var caste;
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.showLastName = appService.getAppDescriptor().getConfigValue("showLastName");
            $scope.isLastNameMandatory = $scope.showLastName && appService.getAppDescriptor().getConfigValue("isLastNameMandatory");
            $scope.showBirthTime = appService.getAppDescriptor().getConfigValue("showBirthTime") != null
                ? appService.getAppDescriptor().getConfigValue("showBirthTime") : true;  // show birth time by default
            $scope.genderCodes = Object.keys($rootScope.genderMap);
            $scope.dobMandatory = appService.getAppDescriptor().getConfigValue("dobMandatory") || false;
            $scope.readOnlyExtraIdentifiers = appService.getAppDescriptor().getConfigValue("readOnlyExtraIdentifiers");
            $scope.showSaveConfirmDialogConfig = appService.getAppDescriptor().getConfigValue("showSaveConfirmDialog");
            $scope.showSaveAndContinueButton = false;
            var dateUtil = Bahmni.Common.Util.DateUtil;

            $scope.riskyHabits = [
                { engName: "Cigarette", benName: "বিড়ি/সিগারেট" },
                { engName: "Tobacco / White Leaf", benName: "তামাক/সাদা পাতা" },
                { engName: "Others (Tobacco)", benName: "অন্যান্য তামাক" },
                { engName: "Drug Addiction", benName: "মাদকাসক্ত" },
                { engName: "Obesity", benName: "স্থুলকায়" },
                { engName: "High Salt Intake", benName: "অতিরিক্ত লবন" }
            ];

            $scope.diseaseStatus = [
                { engName: "High Blood Pressure", benName: "উচ্চ রক্তচাপ" },
                { engName: "Diabetes", benName: "ডায়াবেটিস" },
                { engName: "Very severe disease", benName: "খুব মারাত্মক রোগ" },
                { engName: "Pneumonia", benName: "নিউমোনিয়া" },
                { engName: "Pneumonia unspec", benName: "কাশি/সর্দি" },
                { engName: "dieria and dysentry", benName: "ডায়ারিয়া ও আমাশয়" },
                { engName: "Fever", benName: "জ্বর" },
                { engName: "Measles", benName: "হাম" },
                { engName: "Bellybutton Infection", benName: "নাভিতে সংক্রামন" },
                { engName: "Conjunctivitis unspec", benName: "চোখ উঠা" },
                { engName: "Injury", benName: "আঘাত" },
                { engName: "Hearing loss unspec", benName: "কানের সমস্যা" },
                { engName: "maleria", benName: "জ্বর (ম্যালারিয়া)" },
                { engName: "Tuberculosis", benName: "যক্ষ্মা" },
                { engName: "Jaundice", benName: "জন্ডিস" },
                { engName: "Probable Limited Infection", benName: "সম্ভাব্য সীমিত সংক্রমণ" },
                { engName: "Diarrhoea No Dehydration", benName: "পানি স্বল্পতাহীন ডায়রিয়া" },
                { engName: "Malnutrition", benName: "অপুষ্টি" },
                { engName: "Anemia", benName: "রক্ত স্বল্পতা" },
                { engName: "Others member disease", benName: "অন্যান্য অসুখ" }
            ];

            $scope.familyDiseaseHistory = [
                { engName: "High Blood Pressure", benName: "উচ্চ রক্তচাপ" },
                { engName: "Diabetes", benName: "ডায়াবেটিস" },
                { engName: "Tuberculosis", benName: "যক্ষ্মা" },
                { engName: "Disability", benName: "প্রতিবন্ধিতা" },
                { engName: "Psychological Disease", benName: "মানসিক অসুখ" },
                { engName: "Respiratory Disease", benName: "হৃদরোগ" },
                { engName: "Others (Family Disease)", benName: "অন্যান্য" }
            ];

            var dontSaveButtonClicked = false;

            var isHref = false;

            $scope.updateRiskyHabitCheckboxChange = function (risky, isChecked) {
                $scope.patient.riskyHabit[risky] = isChecked;
            };

            $scope.updateDiseaseStatusCheckboxChange = function (disease, isChecked) {
                $scope.patient.diseaseStatus[disease] = isChecked;
            };

            $scope.updatefamilyDiseaseHistoryCheckboxChange = function (disease, isChecked) {
                $scope.patient.familyDiseaseHistory[disease] = isChecked;
            };

            $scope.getGendersToDisplay = function () {
                var array = [];
                var i;
                for (i = 0; i < $scope.genderCodes.length; i++) {
                    if ($scope.genderCodes[i] != "H") {
                        array.push($scope.genderCodes[i]);
                    }
                }
                return array;
            };

            $rootScope.onHomeNavigate = function (event) {
                if ($scope.showSaveConfirmDialogConfig && $state.current.name != "patient.visit") {
                    event.preventDefault();
                    $scope.targetUrl = event.currentTarget.getAttribute('href');
                    isHref = true;
                    $scope.confirmationPrompt(event);
                }
            };

            var stateChangeListener = $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {
                if ($scope.showSaveConfirmDialogConfig && (toState.url == "/search" || toState.url == "/patient/new")) {
                    $scope.targetUrl = toState.name;
                    isHref = false;
                    $scope.confirmationPrompt(event, toState, toParams);
                }
            });

            $scope.confirmationPrompt = function (event, toState) {
                if (dontSaveButtonClicked === false) {
                    if (event) {
                        event.preventDefault();
                    }
                    ngDialog.openConfirm({template: "../common/ui-helper/views/saveConfirmation.html", scope: $scope});
                }
            };

            $scope.continueWithoutSaving = function () {
                ngDialog.close();
                dontSaveButtonClicked = true;
                if (isHref === true) {
                    $window.open($scope.targetUrl, '_self');
                } else {
                    $state.go($scope.targetUrl);
                }
            };

            $scope.cancelTransition = function () {
                ngDialog.close();
                delete $scope.targetUrl;
            };

            $scope.$on("$destroy", function () {
                stateChangeListener();
            });

            $scope.getDeathConcepts = function () {
                return $http({
                    url: Bahmni.Common.Constants.globalPropertyUrl,
                    method: 'GET',
                    params: {
                        property: 'concept.reasonForDeath'
                    },
                    withCredentials: true,
                    transformResponse: [function (deathConcept) {
                        if (_.isEmpty(deathConcept)) {
                            $scope.deathConceptExists = false;
                        } else {
                            $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                                params: {
                                    name: deathConcept,
                                    v: "custom:(uuid,name,set,setMembers:(uuid,display,name:(uuid,name),retired))"
                                },
                                withCredentials: true
                            }).then(function (results) {
                                $scope.deathConceptExists = !!results.data.results.length;
                                $scope.deathConcepts = results.data.results[0] ? results.data.results[0].setMembers : [];
                                $scope.deathConcepts = filterRetireDeathConcepts($scope.deathConcepts);
                            });
                        }
                    }]
                });
            };
            spinner.forPromise($scope.getDeathConcepts());
            var filterRetireDeathConcepts = function (deathConcepts) {
                return _.filter(deathConcepts, function (concept) {
                    return !concept.retired;
                });
            };

            $scope.isAutoComplete = function (fieldName) {
                return !_.isEmpty(autoCompleteFields) ? autoCompleteFields.indexOf(fieldName) > -1 : false;
            };

            $scope.showCasteSameAsLastName = function () {
                personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function (attribute) {
                    return attribute.name.toLowerCase();
                });
                var personAttributeHasCaste = personAttributes.indexOf("caste") !== -1;
                caste = personAttributeHasCaste ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("caste")].name : undefined;
                return showCasteSameAsLastNameCheckbox && personAttributeHasCaste;
            };

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            };

            var showSections = function (sectionsToShow, allSections) {
                _.each(sectionsToShow, function (sectionName) {
                    allSections[sectionName].canShow = true;
                    allSections[sectionName].expand = true;
                });
            };

            var hideSections = function (sectionsToHide, allSections) {
                _.each(sectionsToHide, function (sectionName) {
                    allSections[sectionName].canShow = false;
                });
            };

            var executeRule = function (ruleFunction) {
                var attributesShowOrHideMap = ruleFunction($scope.patient);
                var patientAttributesSections = $rootScope.patientConfiguration.getPatientAttributesSections();
                showSections(attributesShowOrHideMap.show, patientAttributesSections);
                hideSections(attributesShowOrHideMap.hide, patientAttributesSections);
            };

            $scope.handleUpdate = function (attribute) {
                var age = "";
                var ruleFunction = Bahmni.Registration.AttributesConditions.rules && Bahmni.Registration.AttributesConditions.rules[attribute];
                if (ruleFunction) {
                    executeRule(ruleFunction);
                }
                /* var attributesToHide = [];
                if (attribute == 'gender') {
                    var e = document.getElementById("MaritalStatus");
                    var maritalStatus = e.options[e.selectedIndex].text;
                    var gender = $scope.patient[attribute];
                    maritalStatusAndGenderCondition(gender, maritalStatus);
                    age = dateToDay(document.getElementById("birthdate").value);
                    marriedFemalelessThan55(gender, maritalStatus, age);
                }
                if (attribute == 'birthdate') {
                    age = dateToDay($scope.patient[attribute]);
                    above13YearCondition(age);
                    aboveTenYearCondition(age);
                    aboveThreeYearCondition(age);
                    aboveFiveYearCondition(age);
                    var e = document.getElementById("MaritalStatus");
                    var maritalStatus = e.options[e.selectedIndex].text;
                    var gender = document.getElementById("gender").value;
                    marriedFemalelessThan55(gender, maritalStatus, age);
                }
                if (attribute == 'age') {
                    age = dateToDay(calculateBirthDate($scope.patient[attribute]));
                    above13YearCondition(age);
                    aboveTenYearCondition(age);
                    aboveThreeYearCondition(age);
                    aboveFiveYearCondition(age);
                    marriedFemalelessThan55(age);
                    var e = document.getElementById("MaritalStatus");
                    var maritalStatus = e.options[e.selectedIndex].text;
                    var gender = document.getElementById("gender").value;
                    marriedFemalelessThan55(gender, maritalStatus, age);
                }
                if (attribute == 'MaritalStatus') {
                    var gender = document.getElementById("gender").value;
                    var maritalStatus = $scope.patient[attribute].value;
                    maritalStatusAndGenderCondition(gender, maritalStatus);
                    age = dateToDay(document.getElementById("birthdate").value);
                    console.log(age);
                    marriedFemalelessThan55(gender, maritalStatus, age);
                } */
            };
            var marriedFemalelessThan55 = function (gender, maritalStatus, age) {
                var attributes = [];
                attributes.push('id_familyplanning');
                attributes.push('id_PregnancyStatus');
                console.log(maritalStatus);
                if (age <= Bahmni.Common.Constants.lessThanFiftyFive && gender == Bahmni.Common.Constants.female && maritalStatus == Bahmni.Common.Constants.married) {
                    showAttributes(attributes);
                } else if (gender == Bahmni.Common.Constants.male && maritalStatus == Bahmni.Common.Constants.married) {
                    var attributes = [];
                    attributes.push('id_familyplanning');
                    showAttributes(attributes);
                    var attributes = [];
                    attributes.push('id_PregnancyStatus');
                    hideAttributes(attributes);
                } else {
                    hideAttributes(attributes);
                }
            };
            var maritalStatusAndGenderCondition = function (gender, maritalStatus) {
                if (gender == Bahmni.Common.Constants.male && maritalStatus == Bahmni.Common.Constants.married) {
                    marriedMale();
                } else if (gender == Bahmni.Common.Constants.female && maritalStatus == Bahmni.Common.Constants.married) {
                    marriedFemale();
                } else {
                    var attributes = [];
                    attributes.push('id_Husband Name_English');
                    attributes.push('id_Husband Name_Bangla');
                    attributes.push('id_Wife Name_English');
                    attributes.push('id_Wife Name_Bangla');
                    hideAttributes(attributes);
                }
            };
            var aboveTenYearCondition = function (age) {
                var attributes = [];
                attributes.push('id_phoneNumber');
                if (age > Bahmni.Common.Constants.aboveTenYear) {
                    showAttributes(attributes);
                } else {
                    hideAttributes(attributes);
                }
            };
            var aboveThreeYearCondition = function (age) {
                var attributes = [];
                attributes.push('id_education');
                if (age > Bahmni.Common.Constants.aboveThreeYear) {
                    showAttributes(attributes);
                } else {
                    hideAttributes(attributes);
                }
            };
            var aboveFiveYearCondition = function (age) {
                var attributes = [];
                console.log(":age" + age);
                attributes.push('id_occupation');
                if (age > Bahmni.Common.Constants.aboveFiveYear) {
                    showAttributes(attributes);
                } else {
                    hideAttributes(attributes);
                }
            };
            var above13YearCondition = function (age) {
                var attributes = [];
                attributes.push('id_MaritalStatus');
                if (age > Bahmni.Common.Constants.above13Year) {
                    showAttributes(attributes);
                } else {
                    attributes.push('id_familyplanning');
                    attributes.push('id_PregnancyStatus');
                    var e = document.getElementById("MaritalStatus").selectedIndex = "0";
                    // var maritalStatus = e.options[e.selectedIndex] = 0;
                    hideAttributes(attributes);
                }
            };
            var marriedFemale = function () {
                var attributesToHide = [];
                attributesToHide.push('id_Husband Name_English');
                attributesToHide.push('id_Husband Name_Bangla');
                showAttributes(attributesToHide);
                var attributesToHide = [];
                attributesToHide.push('id_Wife Name_English');
                attributesToHide.push('id_Wife Name_Bangla');
                hideAttributes(attributesToHide);
            };
            var marriedMale = function () {
                var attributes = [];
                attributes.push('id_Wife Name_English');
                attributes.push('id_Wife Name_Bangla');
                showAttributes(attributes);
                var attributes = [];
                attributes.push('id_Husband Name_English');
                attributes.push('id_Husband Name_Bangla');
                hideAttributes(attributes);
            };

            var calculateBirthDate = function (age) {
                var birthDate = dateUtil.now();
                birthDate = dateUtil.subtractYears(birthDate, age.years);
                birthDate = dateUtil.subtractMonths(birthDate, age.months);
                birthDate = dateUtil.subtractDays(birthDate, age.days);
                return birthDate;
            };
            var dateToDay = function (dob) {
                var dob = new Date(dob);
                var today = new Date();
                var timeDiff = Math.abs(today.getTime() - dob.getTime());
                var age = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
                return age;
            };

            var hideAttributes = function (attributesToHide) {
                _.each(attributesToHide, function (attribute) {
                    var x = document.getElementById(attribute);
                    if (x != null) {
                        x.style.display = "none";
                    }
                });
            };
            var showAttributes = function (attributesToHide) {
                _.each(attributesToHide, function (attribute) {
                    var x = document.getElementById(attribute);
                    if (x != null) {
                        x.style.display = "block";
                    }
                });
            };

            var executeShowOrHideRules = function () {
                _.each(Bahmni.Registration.AttributesConditions.rules, function (rule) {
                    executeRule(rule);
                });
            };

            $scope.$watch('patientLoaded', function () {
                if ($scope.patientLoaded) {
                    executeShowOrHideRules();
                }
                /* $timeout(function () {
                    var attributesToHide = [];
                    attributesToHide.push('id_Used_7.1%_Chlorohexidin');
                    attributesToHide.push('id_BirthWeight');
                    attributesToHide.push('id_phoneNumber');
                    attributesToHide.push('id_education');
                    attributesToHide.push('id_occupation');
                    attributesToHide.push('id_PregnancyStatus');
                    attributesToHide.push('id_LMP');
                    attributesToHide.push('id_DeliveryDate');
                    attributesToHide.push('id_familyplanning');
                    attributesToHide.push('id_RiskyHabits');
                    attributesToHide.push('id_MaritalStatus');
                    attributesToHide.push('id_Husband Name_English');
                    attributesToHide.push('id_Husband Name_Bangla');
                    attributesToHide.push('id_Wife Name_English');
                    attributesToHide.push('id_Wife Name_Bangla');
                    hideAttributes(attributesToHide);
                }, 200); */
            });

            $scope.getAutoCompleteList = function (attributeName, query, type) {
                return patientAttributeService.search(attributeName, query, type);
            };

            $scope.getDataResults = function (data) {
                return data.results;
            };

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient[caste] = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName !== $scope.patient[caste])) {
                    $scope.patient.sameAsLastName = false;
                }
            });

            $scope.selectIsDead = function () {
                if ($scope.patient.causeOfDeath || $scope.patient.deathDate) {
                    $scope.patient.dead = true;
                }
            };

            $scope.disableIsDead = function () {
                return ($scope.patient.causeOfDeath || $scope.patient.deathDate) && $scope.patient.dead;
            };

            $scope.getRiskyHabitArray = function (data) {
                return data.results;
            };
        }]);

