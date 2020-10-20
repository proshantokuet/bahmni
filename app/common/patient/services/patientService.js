'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$http', '$bahmniCookieStore', 'sessionService', function ($http, $bahmniCookieStore, sessionService) {
        this.getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
            return patient;
        };

        this.getRelationships = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/relationship", {
                method: "GET",
                params: {person: patientUuid, v: "full"},
                withCredentials: true
            });
        };

        this.moneyReceipt = function (uuid) {
            // console.log("Data:");
            // console.log($bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName));
            return $http.get(Bahmni.Common.Constants.moneyReceiptURL + "/" + uuid, {
                method: "GET",
                withCredentials: true
            });
        };
        this.getServices = function (patient) {
            var days = Math.round((new Date() - new Date(patient.birthdate)) / (1000 * 60 * 60 * 24));
            console.log(days);
            return $http.get(Bahmni.Common.Constants.serviceUrl + "/" + $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).id + "/" + days + "/" + patient.gender, {
                method: "GET",
                withCredentials: true
            });
        };

        this.getDataCollectors = function (clinicCode) {
            return $http.get(Bahmni.Common.Constants.dataColelctorUrl + "/" + clinicCode, {
                method: "GET",
                withCredentials: true
            });
        };

        this.getSateliteClinicCode = function (clinicCode) {
            return $http.get(Bahmni.Common.Constants.satClinicIdUrl + "/" + clinicCode, {
                method: "GET",
                withCredentials: true
            });
        };

        this.saveMoneyReceipt = function (data) {
            var url = Bahmni.Common.Constants.serviceSaveUrl;
            return $http.post(url, data, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };
        this.findPatients = function (params) {
            return $http.get(Bahmni.Common.Constants.sqlUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        this.checkExistingMoneyReceipt = function (slipNo, date, clinicCode) {
            return $http.get(Bahmni.Common.Constants.checkExistingMoneyReceipt + "/" + slipNo + "/" + date + "/" + clinicCode, {
                method: "GET",
                withCredentials: true
            });
        };

        this.getEslipNo = function (clinicCode) {
            return $http.get(Bahmni.Common.Constants.getEslipNo + "/" + clinicCode, {
                method: "GET",
                withCredentials: true
            });
        };

        this.getMoneyReceiptByid = function (moneyReciptId) {
            return $http.get(Bahmni.Common.Constants.getMoneyReceiptById + "/" + moneyReciptId, {
                method: "GET",
                withCredentials: true
            });
        };

        this.deleteMoneyReceipt = function (moneyreceiptId) {
            return $http.delete(Bahmni.Common.Constants.deleteMoneyReceipt + "/" + moneyreceiptId, {
                method: "DELETE",
                withCredentials: true
            });
        };

        this.search = function (query, offset, identifier) {
            offset = offset || 0;
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    q: query,
                    startIndex: offset,
                    identifier: identifier,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: true
            });
        };

        this.getPatientContext = function (patientUuid, programUuid, personAttributes, programAttributes, patientIdentifiers) {
            return $http.get('/openmrs/ws/rest/v1/bahmnicore/patientcontext', {
                params: {
                    patientUuid: patientUuid,
                    programUuid: programUuid,
                    personAttributes: personAttributes,
                    programAttributes: programAttributes,
                    patientIdentifiers: patientIdentifiers
                },
                withCredentials: true
            });
        };
    }]);
