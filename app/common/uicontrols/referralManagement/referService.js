'use strict';

angular.module('bahmni.common.uicontrols.referralmanagement')
    .factory('referManagementService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
        var openmrsUrl = "";
        var baseOpenMRSRESTURL = "";
        var hostUrl = Bahmni.Common.Constants.hostURL;
        var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

        var inwordReferralcreate = function (inwordReferralObject) {
            var data = inwordReferralObject;
            var url = RESTWS_V1 + "/bahmnicore/saveInwordReferral";
            return $http.post(url, data, {
                withCredentials: true,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        };

        var outwordReferralcreate = function (inwordReferralObject) {
            var data = inwordReferralObject;
            var url = baseOpenMRSRESTURL + "/bahmnicore/saveOutwardReferral";
            return $http.post(url, data, {
                withCredentials: true,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        };

        return {
            inwordReferralcreate: inwordReferralcreate,
            outwordReferralcreate: outwordReferralcreate
        };
    }]);
