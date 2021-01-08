'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope', '$bahmniCookieStore', '$q', 'patientServiceStrategy', 'sessionService', function ($http, $rootScope, $bahmniCookieStore, $q, patientServiceStrategy, sessionService) {
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;

        var search = function (query, identifier, addressFieldName, addressFieldValue, customAttributeValue,
                               offset, customAttributeFields, programAttributeFieldName, programAttributeFieldValue, addressSearchResultsConfig,
                               patientSearchResultsConfig, filterOnAllIdentifiers) {
            var config = {
                params: {
                    q: query,
                    identifier: identifier,
                    s: "byIdOrNameOrVillage",
                    addressFieldName: addressFieldName,
                    addressFieldValue: addressFieldValue,
                    customAttribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields,
                    programAttributeFieldName: programAttributeFieldName,
                    programAttributeFieldValue: programAttributeFieldValue,
                    addressSearchResultsConfig: addressSearchResultsConfig,
                    patientSearchResultsConfig: patientSearchResultsConfig,
                    loginLocationUuid: sessionService.getLoginLocationUuid(),
                    filterOnAllIdentifiers: filterOnAllIdentifiers
                },
                withCredentials: true
            };
            return patientServiceStrategy.search(config);
        };

        var searchByIdentifier = function (query, identifier, addressFieldName, addressFieldValue, customAttributeValue,
                                           offset, customAttributeFields, programAttributeFieldName, programAttributeFieldValue, addressSearchResultsConfig,
                                           patientSearchResultsConfig, filterOnAllIdentifiers) {
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    q: query,
                    identifier: identifier,
                    s: "byIdOrNameOrVillage",
                    addressFieldName: addressFieldName,
                    addressFieldValue: addressFieldValue,
                    customAttribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields,
                    programAttributeFieldName: programAttributeFieldName,
                    programAttributeFieldValue: programAttributeFieldValue,
                    addressSearchResultsConfig: addressSearchResultsConfig,
                    patientSearchResultsConfig: patientSearchResultsConfig,
                    loginLocationUuid: sessionService.getLoginLocationUuid(),
                    filterOnAllIdentifiers: filterOnAllIdentifiers
                },
                withCredentials: true
            });
        };

        var searchByNameOrIdentifier = function (query, limit) {
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    q: query,
                    s: "byIdOrName",
                    limit: limit,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: true
            });
        };

        var findUniquePatientByUicMobile = function (uic, mobile) {
            var url = openmrsUrl + "/ws/rest/v1/check/uniquePatient" + "/" + uic + "/" + mobile;
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

        var findUniquePatientByUicMobileAndPatientUuid = function (uic, mobile, patientUuid) {
            var url = openmrsUrl + "/ws/rest/v1/check/uniquePatient" + "/" + uic + "/" + mobile + "/" + patientUuid;
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

        var get = function (uuid) {
            return patientServiceStrategy.get(uuid);
        };

        var create = function (patient, jumpAccepted) {
            return patientServiceStrategy.create(patient, jumpAccepted);
        };

        var update = function (patient, openMRSPatient) {
            return patientServiceStrategy.update(patient, openMRSPatient, $rootScope.patientConfiguration.attributeTypes);
        };

        var updateImage = function (uuid, image) {
            var url = baseOpenMRSRESTURL + "/personimage/";
            var data = {
                "person": {"uuid": uuid},
                "base64EncodedImage": image
            };
            var config = {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            };
            return $http.post(url, data, config);
        };

        var dhis = function () {
            return patientServiceStrategy.dhis();
        };

        var searchPatientFromGLobalServer = function (searchUrl) {
            var config = {
                method: "GET",
                withCredentials: true,
                params: {
                    patientInformation: searchUrl
                }
            };
            return patientServiceStrategy.globalpatientSearching(config);
        };

        var savePatientInLocalServer = function (patientUuid) {
            var config = {
                method: "GET",
                withCredentials: true,
                params: {
                    patientUuid: patientUuid,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                }
            };
            return patientServiceStrategy.saveInLocalServer(config);
        };

        var updatePatientEntryDetails = function (patientUuid) {
            var config = {
                method: "GET",
                withCredentials: true,
                params: {
                    patientUuid: patientUuid
                }
            };
            return patientServiceStrategy.updatePatientEntryDetails(config);
        };

        return {
            search: search,
            searchByIdentifier: searchByIdentifier,
            create: create,
            update: update,
            get: get,
            updateImage: updateImage,
            searchByNameOrIdentifier: searchByNameOrIdentifier,
            fakecall: dhis,
            findUniquePatientByUicMobile: findUniquePatientByUicMobile,
            searchPatientFromGLobalServer: searchPatientFromGLobalServer,
            savePatientInLocalServer: savePatientInLocalServer,
            updatePatientEntryDetails: updatePatientEntryDetails,
            findUniquePatientByUicMobileAndPatientUuid:findUniquePatientByUicMobileAndPatientUuid
        };
    }]);
