'use strict';

angular.module('bahmni.registration')
    .service('patientServiceStrategy', ['$http', '$bahmniCookieStore', '$q', '$rootScope', function ($http, $bahmniCookieStore, $q, $rootScope) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;

        var search = function (config) {
            var defer = $q.defer();
            var patientSearchUrl = Bahmni.Common.Constants.bahmniSearchUrl + "/patient";
            if (config && config.params.identifier) {
                patientSearchUrl = Bahmni.Common.Constants.bahmniSearchUrl + "/patient/lucene";
            }
            var onResults = function (result) {
                defer.resolve(result);
            };
            $http.get(patientSearchUrl, config).success(onResults)
                .error(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        var getByUuid = function (uuid) {
            var url = openmrsUrl + "/ws/rest/v1/patientprofile/" + uuid;
            var config = {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            };

            var defer = $q.defer();
            $http.get(url, config).success(function (result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var create = function (patient, jumpAccepted) {
            var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient, $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName));
            var url = baseOpenMRSRESTURL + "/bahmnicore/patientprofile";
            return healthId().then(function (response) {
                var memberHealthId = response.sequenceId;
                var clinicId = ($bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId).slice(0, 3);
                var d = new Date();
                var fullYear = d.getFullYear();
                var month = ("0" + (d.getMonth() + 1)).slice(-2);
                var day = (d.getDate() < 10 ? '0' : '') + d.getDate();
                data.patient.identifiers[0].identifier = memberHealthId;
                return $http.post(url, data, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json", "Jump-Accepted": jumpAccepted}
                });
            });
        };

        var createUUID = function () {
            var dt = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };

        /* var create = function (patient, jumpAccepted) {
            var data = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.attributeTypes, patient);
            var url = baseOpenMRSRESTURL + "/bahmnicore/patientprofile";
            return healthId().then(function (response) {
                var memberHealthId = response.identifiers;
                data.patient.identifiers[0].identifier = memberHealthId;
                return $http.post(url, data, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json", "Jump-Accepted": jumpAccepted}
                });
            });
        }; */

        var update = function (patient, openMRSPatient, attributeTypes) {
            var deferred = $q.defer();
            var data = new Bahmni.Registration.UpdatePatientRequestMapper(moment()).mapFromPatient(attributeTypes, openMRSPatient, patient);
            var url = baseOpenMRSRESTURL + "/bahmnicore/patientprofile/" + openMRSPatient.uuid;
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            $http.post(url, data, config).then(function (result) {
                deferred.resolve(result);
            }, function (reason) {
                deferred.resolve(reason);
            });
            return deferred.promise;
        };

        var generateIdentifier = function (patient) {
            var data = {"identifierSourceName": patient.identifierPrefix ? patient.identifierPrefix.prefix : ""};

            var randomIdentifier = createUUID();
            console.log(":generated random identifier two: " + randomIdentifier);
            data.patient.identifiers[0].identifier = randomIdentifier;

            var url = openmrsUrl + "/ws/rest/v1/idgen";
            var config = {
                withCredentials: true,
                headers: {"Accept": "text/plain", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };
        var healthId = function () {
            var url = openmrsUrl + "/ws/rest/v1/generate/uniqueid/" + ($bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId);
            var config = {
                method: "GET",
                withCredentials: false
            };
            var defer = $q.defer();
            $http.get(url, config).success(function (result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var fakecall = function () {
            var url = openmrsUrl + "/ws/rest/v1/dhis/fakecall";
            var config = {
                method: "GET",
                withCredentials: true
            };
            var defer = $q.defer();
            $http.get(url, config).success(function (result) {
                defer.resolve(result);
            });
            return defer.promise;
        };

        var globalpatientSearching = function (config) {
            var defer = $q.defer();
            var url = baseOpenMRSRESTURL + "/save-Patient/search/fromGlobalServer";
            var onResults = function (result) {
                defer.resolve(result);
            };
            $http.get(url, config).success(onResults)
                .error(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        var saveInLocalServer = function (config) {
            var defer = $q.defer();
            var url = baseOpenMRSRESTURL + "/save-Patient/patient/toLocalServer";
            var onResults = function (result) {
                defer.resolve(result);
            };
            $http.get(url, config).success(onResults)
                .error(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        return {
            search: search,
            get: getByUuid,
            create: create,
            update: update,
            generateIdentifier: generateIdentifier,
            dhis: fakecall,
            globalpatientSearching: globalpatientSearching,
            saveInLocalServer: saveInLocalServer
        };
    }]);
