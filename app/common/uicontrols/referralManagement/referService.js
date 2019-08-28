'use strict';

angular.module('bahmni.common.uicontrols.referralmanagement')
    .factory('referManagementService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
        var openmrsUrl = "";
        var baseOpenMRSRESTURL = "";
        var hostUrl = Bahmni.Common.Constants.hostURL;
        var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

        var inwardReferralcreate = function (inwardReferralObject) {
            var data = inwardReferralObject;
            var url = RESTWS_V1 + "/inward-referral/add-or-update";
            return $http.post(url, data, {
                withCredentials: true,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        };

        var getInwardReferralInformationByReferralNo = function (id) {
            return $http.get(RESTWS_V1 + "/inward-referral/get-by-referral-no" + "/" + id, {
                method: "GET",
                withCredentials: true
            });
        };

        var outwordReferralcreate = function (outWardReferralObject) {
            var data = outWardReferralObject;
            var url = RESTWS_V1 + "/outward-referral/add-or-update";
            return $http.post(url, data, {
                withCredentials: true,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        };

        var getOutwardReferralInformationByPatientUuid = function (id) {
            return $http.get(RESTWS_V1 + "/outward-referral/get-by-patient-uuid" + "/" + id, {
                method: "GET",
                withCredentials: true
            });
        };

        return {
            inwardReferralcreate: inwardReferralcreate,
            outwordReferralcreate: outwordReferralcreate,
            getInwardReferralInformationByReferralNo: getInwardReferralInformationByReferralNo,
            getOutwardReferralInformationByPatientUuid: getOutwardReferralInformationByPatientUuid
        };
    }]);
