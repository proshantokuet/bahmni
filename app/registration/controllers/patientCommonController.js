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
                { engName: "Cigarette", benName: "বিড়ি/সিগারেট", id: "id_Cigarette" },
                { engName: "Tobacco / White Leaf", benName: "তামাক/সাদা পাতা", id: "id_Tobacco" },
                { engName: "Others (Tobacco)", benName: "অন্যান্য তামাক", id: "id_Others" },
                { engName: "Drug Addiction", benName: "মাদকাসক্ত", id: "id_Drug" },
                { engName: "Obesity", benName: "স্থুলকায়", id: "id_Obesity" },
                { engName: "High Salt Intake", benName: "অতিরিক্ত লবন", id: "id_High" }
            ];

            $scope.diseaseStatus = [
                { engName: "maleria", benName: "জ্বর (ম্যালারিয়া)" },
                { engName: "Dengue", benName: "ডেঙ্গু" },
                { engName: "Leprosy", benName: "কুষ্ঠ" },
                { engName: "Tuberculosis", benName: "যক্ষ্মা" },
                { engName: "Rabies", benName: "জলাতঙ্ক" },
                { engName: "Avian Flu", benName: "এভিয়েন ইনফ্লুয়েঞ্জা" },
                { engName: "Swine Flu", benName: "সোয়াইন ফ্লু" },
                { engName: "Nipah", benName: "নিপাহ" },
                { engName: "Acute Viral Hepatitis", benName: "যকৃতের ভাইরাস জনিত প্রদাহ" },
                { engName: "Diarrhoea", benName: "ডায়ারিয়া" },
                { engName: "Worms Infection", benName: "কৃমি সংক্রামণ" },
                { engName: "Sexual Disease", benName: "যৌন রোগ" },
                { engName: "Arsenicosis", benName: "আর্সেনিকোসিস" },
                { engName: "Asthma", benName: "হাঁপানি বা এ্যাজমা" },
                { engName: "Diabetes", benName: "ডায়াবেটিস" },
                { engName: "High Blood Pressure", benName: "উচ্চ রক্তচাপ" },
                { engName: "Stroke", benName: "স্ট্রোক" },
                { engName: "Tumor or Cancer", benName: "টিউমার বা ক্যানসার" },
                { engName: "Very_severe_disease", benName: "খুব মারাত্বক রোগ" },
                { engName: "Pneumonia", benName: "নিউমোনিয়া" },
                { engName: "Pneumonia, unspec.", benName: "নিউমোনিয়া নয় সর্দি, কাশী" },
                { engName: "dieriaanddysentry", benName: "ডায়ারিয়া ও আমাশয়" },
                { engName: "Fever", benName: "জ্বর" },
                { engName: "maleria", benName: "জ্বর (ম্যালারিয়া)" },
                { engName: "Hearing loss, unspec.", benName: "কানের সমস্যা" },
                { engName: "Measles", benName: "হাম" },
                { engName: "Bellybutton_infection", benName: "নাভিতে সংক্রামন" },
                { engName: "Conjunctivitis, unspec.", benName: "চোখ উঠা" },
                { engName: "Jaundice", benName: "জন্ডিস" },
                { engName: "Malnutrition", benName: "অপুষ্টি" },
                { engName: "Anemia", benName: "রক্ত স্বল্পতা" },
                { engName: "Injury", benName: "আঘাত" },
                { engName: "Others_member_disease", benName: "অন্যান্য" },
                { engName: "Very_severe_disease", benName: "খুব মারাত্বক রোগ" },
                { engName: "Probable_Limited_Infection", benName: "সম্ভাব্য সীমিত সংক্রামণ" },
                { engName: "Jaundice", benName: "জন্ডিস" },
                { engName: "Probable_Limited_Infection", benName: "পানি স্বল্পতাহীন ডায়রিয়া" },
                { engName: "Bellybutton_infection", benName: "নাভিতে সংক্রামন" },
                { engName: "Fever", benName: "জ্বর" },
                { engName: "Pneumonia", benName: "নিউমোনিয়া" },
                { engName: "Pneumonia, unspec.", benName: "নিউমোনিয়া নয় সর্দি, কাশী" },
                { engName: "Injury", benName: "আঘাত" },
                { engName: "Others_member_disease", benName: "অন্যান্য" }
            ];

            $scope.familyDiseaseHistory = [
                { engName: "Leprosy", benName: "কুষ্ঠ" },
                { engName: "Tuberculosis", benName: "যক্ষ্মা" },
                { engName: "Sexual Disease", benName: "যৌন রোগ" },
                { engName: "Asthma", benName: "হাঁপানি বা এ্যাজমা" },
                { engName: "Diabetes", benName: "ডায়াবেটিস" },
                { engName: "High Blood Pressure", benName: "উচ্চ রক্তচাপ" },
                { engName: "Disability", benName: "প্রতিবন্ধিতা" },
                { engName: "Others (Family Disease)", benName: "অন্যান্য" },
                { engName: "None", benName: "নেই" }
            ];

            $scope.idTypes = [
                { engName: "NID", benName: "জাতীয় পরিচয় পত্র" },
                { engName: "BRID", benName: "জন্ম নিবন্ধন কার্ড" },
                { engName: "EPI", benName: "ই পি আই কার্ড" },
                { engName: "noIdentifier", benName: "আই ডি জানা নাই" }
            ];

            var dontSaveButtonClicked = false;

            var isHref = false;

            $scope.updateYesNoCheckboxChange = function (checkBoxStatus) {
                if (checkBoxStatus == "হ্যাঁ") {
                    $scope.patient.showDiseaseStatus = true;
                } else {
                    $scope.patient.showDiseaseStatus = false;
                }
            };

            $scope.updateNationalIdCheckboxChange = function (checkBoxStatus) {
                if (checkBoxStatus == true) {
                    $scope.patient.nationalIdCheckbox = true;
                    $scope.patient.noidCheckbox = false;
                } else {
                    $scope.patient.nationalIdCheckbox = false;
                }
            };

            $scope.updateBRIDCheckboxChange = function (checkBoxStatus) {
                if (checkBoxStatus == true) {
                    $scope.patient.bridCheckbox = true;
                    $scope.patient.noidCheckbox = false;
                } else {
                    $scope.patient.bridCheckbox = false;
                }
            };

            $scope.updateEPICheckboxChange = function (checkBoxStatus) {
                if (checkBoxStatus == true) {
                    $scope.patient.epiCheckbox = true;
                    $scope.patient.noidCheckbox = false;
                } else {
                    $scope.patient.epiCheckbox = false;
                }
            };

            $scope.updateNoIDCheckboxChange = function (checkBoxStatus) {
                if (checkBoxStatus == true) {
                    $scope.patient.nationalIdCheckbox = false;
                    $scope.patient.bridCheckbox = false;
                    $scope.patient.epiCheckbox = false;
                    $scope.patient.noidCheckbox = true;
                } else {
                }
            };

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
                var attributesToHide = [];
                console.log(attribute);
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
                    createDiseaseStatus(age);
                    above13YearCondition(age);
                    aboveTenYearCondition(age);
                    aboveFiveYearCondition(age);
                    aboveThreeYearCondition(age);
                    aboveTwoMonth(age);
                    var e = document.getElementById("MaritalStatus");
                    var maritalStatus = e.options[e.selectedIndex].text;
                    var gender = document.getElementById("gender").value;
                    marriedFemalelessThan55(gender, maritalStatus, age);
                }
                if (attribute == 'age') {
                    console.log("attribute age");
                    age = dateToDay(calculateBirthDate($scope.patient[attribute]));
                    console.log(age);
                    createDiseaseStatus(age);
                    above13YearCondition(age);
                    aboveTenYearCondition(age);
                    aboveFiveYearCondition(age);
                    aboveThreeYearCondition(age);
                    aboveTwoMonth(age);
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
                    console.log("attribute MaritalStatus");
                    console.log(age);
                    marriedFemalelessThan55(gender, maritalStatus, age);
                }
                if (attribute == "PregnancyStatus") {
                    var pregnancyStatus = $scope.patient[attribute];
                    console.log(pregnancyStatus);
                    showDeliveryDate(pregnancyStatus.value);
                }
                if (attribute == "disable") {
                    var disable = $scope.patient[attribute];
                    console.log(disable);
                    showDisabilityType(disable.value);
                }
                /* if (attribute == "হ্যাঁ") {
                    $scope.patient.showDiseaseStatus = true;
                } else {
                    $scope.patient.showDiseaseStatus = false;
                } */
            };

            var showDisabilityType = function (disable) {
                if (disable == "হ্যাঁ") {
                    $scope.patient.showDisability = true;
                } else {
                    $scope.patient.showDisability = false;
                }
            };

            var marriedFemalelessThan55 = function (gender, maritalStatus, age) {
                var attributes = [];
                attributes.push('id_familyplanning');
                attributes.push('id_PregnancyStatus');
                if (age <= Bahmni.Common.Constants.lessThanFiftyFive && age > Bahmni.Common.Constants.above13Year
                    && gender == Bahmni.Common.Constants.female && maritalStatus == Bahmni.Common.Constants.married) {
                    $scope.patient.showPregnancyStatus = true;
                    showAttributes(attributes);
                } else if (gender == Bahmni.Common.Constants.male && maritalStatus == Bahmni.Common.Constants.married) {
                    var attributes = [];
                    // $scope.patient.showFamilyplanning = true;
                    attributes.push('id_familyplanning');
                    showAttributes(attributes);
                    var attributes = [];
                    attributes.push('id_PregnancyStatus');
                    $scope.patient.showPregnancyStatus = false;
                    $scope.patient.showLMP = false;
                    hideAttributes(attributes);
                } else {
                    $scope.patient.showPregnancyStatus = false;
                    $scope.patient.showLMP = false;
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
                    $scope.patient.showFamilyplanning = false;
                    $scope.patient.showWifeName = false;
                    $scope.patient.showHusbandName = false;
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
                    $scope.patient.showPhoneNumber = true;
                    $scope.patient.showRiskyHabits = true;
                    showAttributes(attributes);
                } else {
                    $scope.patient.showPhoneNumber = false;
                    $scope.patient.showLMP = false;
                    hideRiskyHabits();
                    hideAttributes(attributes);
                }
            };
            var aboveThreeYearCondition = function (age) {
                var attributes = [];
                attributes.push('id_education');
                if (age > Bahmni.Common.Constants.aboveThreeYear) {
                    showAttributes(attributes);
                } else {
                    $scope.patient.showWifeName = false;
                    $scope.patient.showHusbandName = false;
                    $scope.patient.showLMP = false;
                    attributes.push('id_Husband Name_English');
                    attributes.push('id_Husband Name_Bangla');
                    attributes.push('id_Wife Name_English');
                    attributes.push('id_Wife Name_Bangla');
                    hideAttributes(attributes);
                }
            };
            var aboveTwoMonth = function (age) {
                var attributes = [];
                if (age < Bahmni.Common.Constants.twoMonth) {
                    console.log("less than 2 month");
                    $scope.patient.showChlorohexidin = true;
                    $scope.patient.showBirthWeight = true;
                } else {
                    $scope.patient.showWifeName = false;
                    $scope.patient.showHusbandName = false;
                    $scope.patient.showPregnancyStatus = false;
                    $scope.patient.showChlorohexidin = false;
                    $scope.patient.showBirthWeight = false;
                    attributes.push('id_Husband Name_English');
                    attributes.push('id_Husband Name_Bangla');
                    attributes.push('id_Wife Name_English');
                    attributes.push('id_Wife Name_Bangla');
                    hideAttributes(attributes);
                }
            };
            var aboveFiveYearCondition = function (age) {
                var attributes = [];
                attributes.push('id_occupation');
                if (age > Bahmni.Common.Constants.aboveFiveYear) {
                    $scope.patient.showRiskyHabits = true;
                    $scope.patient.showOccupation = true;
                    $scope.patient.showEducation = true;
                    showAttributes(attributes);
                } else {
                    hideRiskyHabits();
                    $scope.patient.showOccupation = false;
                    $scope.patient.showEducation = false;
                    $scope.patient.showWifeName = false;
                    $scope.patient.showHusbandName = false;
                    $scope.patient.showPregnancyStatus = false;
                    $scope.patient.showRiskyHabits = false;
                    attributes.push('id_Husband Name_English');
                    attributes.push('id_Husband Name_Bangla');
                    attributes.push('id_Wife Name_English');
                    attributes.push('id_Wife Name_Bangla');
                    hideAttributes(attributes);
                }
            };

            var createDiseaseStatus = function (age) {
                if (age > Bahmni.Common.Constants.aboveFiveYear) {
                    $scope.patient.diseaseStartIndex = 0;
                    $scope.patient.diseaseEndIndex = 17;
                    console.log("age group 1");
                } else if (age < Bahmni.Common.Constants.aboveFiveYear && age > Bahmni.Common.Constants.twoMonth) {
                    $scope.patient.diseaseStartIndex = 18;
                    $scope.patient.diseaseEndIndex = 32;
                    console.log("age group 2");
                } else if (age < Bahmni.Common.Constants.twoMonth && age > 0) {
                    $scope.patient.diseaseStartIndex = 33;
                    $scope.patient.diseaseEndIndex = $scope.diseaseStatus.length - 1;
                    console.log("age group 3");
                } else {
                    $scope.patient.diseaseStartIndex = 0;
                    $scope.patient.diseaseEndIndex = 0;
                }
            };

            var showDeliveryDate = function (pregnancyStatus) {
                /* if ($scope.diseaseStatus.length > 0 && $scope.patient.showDiseaseStatus == false) {
                    $scope.diseaseStatus.length = 0;
                } */
                if (pregnancyStatus == 'প্রসবোত্তর') {
                    $scope.patient.showDeliveryDate = true;
                    $scope.patient.showLMP = false;
                    $scope.patient.showFamilyplanning = true;
                } else if (pregnancyStatus == 'প্রসব পূর্ব') {
                    $scope.patient.showDeliveryDate = false;
                    $scope.patient.showFamilyplanning = false;
                    $scope.patient.showLMP = true;
                } else {
                    $scope.patient.showDeliveryDate = false;
                    $scope.patient.showLMP = false;
                    $scope.patient.showFamilyplanning = true;
                }
            };

            var above13YearCondition = function (age) {
                var attributes = [];
                attributes.push('id_MaritalStatus');
                if (age > Bahmni.Common.Constants.above13Year) {
                    console.log("risky");
                    $scope.patient.showRiskyHabits = true;
                    $scope.patient.showMaritalStatus = true;
                    showAttributes(attributes);
                } else {
                    hideRiskyHabits();
                    $scope.patient.showWifeName = false;
                    $scope.patient.showHusbandName = false;
                    $scope.patient.showMaritalStatus = false;
                    $scope.patient.showPregnancyStatus = false;
                    // $('#MaritalStatus option:contains("")').prop('selected', true);
                    // $('#MaritalStatus').val("");
                    attributes.push('id_familyplanning');
                    attributes.push('id_PregnancyStatus');
                    attributes.push('id_Husband Name_English');
                    attributes.push('id_Husband Name_Bangla');
                    attributes.push('id_Wife Name_English');
                    attributes.push('id_Wife Name_Bangla');
                    /* $('#id_MaritalStatus').val('string:6a13c661-1a44-4d80-99a3-f427018ced70'); */
                    /* var e = document.getElementById("MaritalStatus").selectedIndex = "0"; */
                    // var maritalStatus = e.options[e.selectedIndex] = 0;
                    hideAttributes(attributes);
                }
            };
            var marriedFemale = function () {
                var attributesToHide = [];
                $scope.patient.showHusbandName = true;
                $scope.patient.showFamilyplanning = true;
                attributesToHide.push('id_Husband Name_English');
                attributesToHide.push('id_Husband Name_Bangla');
                showAttributes(attributesToHide);
                var attributesToHide = [];
                $scope.patient.showWifeName = false;
                attributesToHide.push('id_Wife Name_English');
                attributesToHide.push('id_Wife Name_Bangla');
                hideAttributes(attributesToHide);
            };
            var marriedMale = function () {
                var attributes = [];
                $scope.patient.showWifeName = true;
                $scope.patient.showFamilyplanning = true;
                attributes.push('id_Wife Name_English');
                attributes.push('id_Wife Name_Bangla');
                showAttributes(attributes);
                var attributes = [];
                $scope.patient.showHusbandName = false;
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

            var hideRiskyHabits = function () {
                $('#id_Cigarette').attr('checked', false);
                $('#id_Tobacco').attr('checked', false);
                $('#id_Others').attr('checked', false);
                $('#id_Drug').attr('checked', false);
                $('#id_Obesity').attr('checked', false);
                $('#id_High').attr('checked', false);
                $scope.patient.showRiskyHabits = false;
            };

            var hideDiseases = function () {
                $scope.patient.showDiseaseStatus = false;
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
                $timeout(function () {
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
                }, 200);
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

            $scope.getShowValueString = function (attributeName) {
                if (attributeName == "MaritalStatus") {
                    return $scope.patient.showMaritalStatus;
                } else if (attributeName == "education") {
                    return $scope.patient.showEducation;
                } else if (attributeName == "phoneNumber") {
                    return $scope.patient.showPhoneNumber;
                } else if (attributeName == "PregnancyStatus") {
                    return $scope.patient.showPregnancyStatus;
                } else if (attributeName == "occupation") {
                    return $scope.patient.showOccupation;
                } else if (attributeName == "Husband Name_English") {
                    return $scope.patient.showHusbandName;
                } else if (attributeName == "Husband Name_Bangla") {
                    return $scope.patient.showHusbandName;
                } else if (attributeName == "Wife Name_English") {
                    return $scope.patient.showWifeName;
                } else if (attributeName == "Wife Name_Bangla") {
                    return $scope.patient.showWifeName;
                } else if (attributeName == "Used_7.1%_Chlorohexidin") {
                    return $scope.patient.showChlorohexidin;
                } else if (attributeName == "BirthWeight") {
                    return $scope.patient.showBirthWeight;
                } else if (attributeName == "LMP") {
                    return $scope.patient.showLMP;
                } else if (attributeName == "delivery_date") {
                    return $scope.patient.showDeliveryDate;
                } else if (attributeName == "familyplanning") {
                    return $scope.patient.showFamilyplanning;
                } else if (attributeName == "Disability_Type") {
                    return $scope.patient.showDisability;
                } else {
                    return true;
                }
            };
        }]);

