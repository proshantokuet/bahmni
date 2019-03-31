'use strict';

(function () {
    var getAddress = function ($scope) {
        var patient = $scope.patient;
        var address = [];
        if ($scope.config.addressFields != undefined && $scope.config.addressFields.length != 0) {
            $scope.config.addressFields.forEach(function (addressField) {
                if (patient.address[addressField]) {
                    address.push(patient.address[addressField]);
                }
            });
        } else if (!_.includes($scope.config, "cityVillage")) {
            address.push(patient.address["cityVillage"]);
        }
        return address.join(", ");
    };
    var getPatientAttributeTypes = function ($scope) {
        var patient = $scope.patient;
        if ($scope.config.hasOwnProperty("ageLimit") && patient.age >= $scope.config.ageLimit) {
            patient.ageText = patient.age.toString() + " <span> years </span>";
        }
        var patientAttributeTypes = [patient.genderText, patient.ageText];
        if (patient.bloodGroupText) {
            patientAttributeTypes.push(patient.bloodGroupText);
        }
        return patientAttributeTypes.join(", ");
    };
    var isAdmitted = function (admissionStatus) {
        return _.get(admissionStatus, 'value') === "Admitted";
    };
    angular.module('bahmni.common.displaycontrol.patientprofile')
        .directive('patientProfile', ['patientService', 'spinner', '$sce', '$rootScope', '$stateParams', '$window', '$translate',
            'configurations', '$q', 'visitService',
            function (patientService, spinner, $sce, $rootScope, $stateParams, $window, $translate, configurations, $q, visitService) {
                var controller = function ($scope) {
                    $scope.isProviderRelationship = function (relationship) {
                        return _.includes($rootScope.relationshipTypeMap.provider, relationship.relationshipType.aIsToB);
                    };
                    $scope.openPatientDashboard = function (patientUuid) {
                        var configName = $stateParams.configName || Bahmni.Common.Constants.defaultExtensionName;
                        $window.open("../clinical/#/" + configName + "/patient/" + patientUuid + "/dashboard");
                    };
                    $scope.openEditPatient = function (patientUuid) {
                        $window.open("../registration/#/patient/" + patientUuid);
                    };
                    $scope.getDiseaseFields = function (patientAttribute) {
                        var diseasesArray = ["RiskyHabit", "Disease_status", "family_diseases_details"];
                        if (diseasesArray.includes(patientAttribute)) {
                            return true;
                        }
                        return false;
                    };
                    $scope.getBengaliName = function (patientAttributeValue) {
                        var bengaliArrayList = "";
                        var bengaliArray = [];
                        var engArray = [];
                        if (typeof patientAttributeValue !== 'undefined') {
                            engArray = patientAttributeValue.split(',');
                        }
                        var obj = [
                            {engName: "Cigarette", benName: "বিড়ি/সিগারেট"},
                            {engName: "Tobacco / White Leaf", benName: "তামাক/সাদা পাতা"},
                            {engName: "Others (Tobacco)", benName: "অন্যান্য তামাক"},
                            {engName: "Drug Addiction", benName: "মাদকাসক্ত"},
                            {engName: "Obesity", benName: "স্থুলকায়"},
                            {engName: "High Salt Intake", benName: "অতিরিক্ত লবন"},
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
                            { engName: "Others member disease", benName: "অন্যান্য অসুখ" },
                            { engName: "High Blood Pressure", benName: "উচ্চ রক্তচাপ" },
                            { engName: "Diabetes", benName: "ডায়াবেটিস" },
                            { engName: "Tuberculosis", benName: "যক্ষ্মা" },
                            { engName: "Disability", benName: "প্রতিবন্ধিতা" },
                            { engName: "Psychological Disease", benName: "মানসিক অসুখ" },
                            { engName: "Respiratory Disease", benName: "হৃদরোগ" },
                            { engName: "Others (Family Disease)", benName: "অন্যান্য" }
                        ];
                        for (var i = 0; i < obj.length; i++) {
                            if (engArray.includes(obj[i].engName) && !bengaliArray.includes(obj[i].benName)) {
                                bengaliArray.push(obj[i].benName);
                            }
                        }
                        bengaliArrayList = bengaliArray.join();
                        return bengaliArrayList;
                    };
                    var assignPatientDetails = function () {
                        var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                        return patientService.getPatient($scope.patientUuid).then(function (response) {
                            var openMrsPatient = response.data;
                            $scope.patient = patientMapper.map(openMrsPatient);
                        });
                    };
                    var assignRelationshipDetails = function () {
                        return patientService.getRelationships($scope.patientUuid).then(function (response) {
                            $scope.relationships = response.data.results;
                        });
                    };
                    var assignAdmissionDetails = function () {
                        var REP = "custom:(attributes:(value,attributeType:(display,name)))";
                        var ADMISSION_STATUS_ATTRIBUTE = "Admission Status";
                        return visitService.getVisit($scope.visitUuid, REP).then(function (response) {
                            var attributes = response.data.attributes;
                            var admissionStatus = _.find(attributes, {attributeType: {name: ADMISSION_STATUS_ATTRIBUTE}});
                            $scope.hasBeenAdmitted = isAdmitted(admissionStatus);
                        });
                    };
                    var setHasBeenAdmittedOnVisitUuidChange = function () {
                        $scope.$watch('visitUuid', function (visitUuid) {
                            if (!_.isEmpty(visitUuid)) {
                                assignAdmissionDetails();
                            }
                        });
                    };
                    var setDirectiveAsReady = function () {
                        $scope.isDirectiveReady = true;
                    };
                    var onDirectiveReady = function () {
                        $scope.addressLine = getAddress($scope);
                        $scope.patientAttributeTypes = $sce.trustAsHtml(getPatientAttributeTypes($scope));
                        $scope.showBirthDate = $scope.config.showDOB !== false;
                        $scope.showBirthDate = $scope.showBirthDate && !!$scope.patient.birthdate;
                    };
                    var initPromise = $q.all([assignPatientDetails(), assignRelationshipDetails()]);
                    initPromise.then(onDirectiveReady);
                    initPromise.then(setHasBeenAdmittedOnVisitUuidChange);
                    initPromise.then(setDirectiveAsReady);
                    $scope.initialization = initPromise;
                };

                var link = function ($scope, element) {
                    spinner.forPromise($scope.initialization, element);
                };

                return {
                    restrict: 'E',
                    controller: controller,
                    link: link,
                    scope: {
                        patientUuid: "@",
                        visitUuid: "@",
                        config: "="
                    },
                    templateUrl: "../common/displaycontrols/patientprofile/views/patientProfile.html"
                };
            }]);
})();
