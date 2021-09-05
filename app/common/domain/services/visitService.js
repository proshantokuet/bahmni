'use strict';

angular.module('bahmni.common.domain')
    .service('visitService', ['$http', function ($http) {
        this.getVisit = function (uuid, params) {
            var parameters = params ? params : "custom:(uuid,visitId,visitType,patient,encounters:(uuid,encounterType,voided,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))";
            return $http.get(Bahmni.Common.Constants.visitUrl + '/' + uuid,
                {
                    params: {
                        v: parameters
                    }
                }
            );
        };

        this.endVisit = function (visitUuid) {
            return $http.post(Bahmni.Common.Constants.endVisitUrl + '?visitUuid=' + visitUuid, {
                withCredentials: true
            });
        };

        this.endVisitAndCreateEncounter = function (visitUuid, bahmniEncounterTransaction) {
            return $http.post(Bahmni.Common.Constants.endVisitAndCreateEncounterUrl + '?visitUuid=' + visitUuid, bahmniEncounterTransaction, {
                withCredentials: true
            });
        };

        this.updateVisit = function (visitUuid, attributes) {
            return $http.post(Bahmni.Common.Constants.visitUrl + '/' + visitUuid, attributes, {
                withCredentials: true
            });
        };

        this.createVisit = function (visitDetails) {
            return $http.post(Bahmni.Common.Constants.visitUrl, visitDetails, {
                withCredentials: true
            });
        };

        this.getVisitSummary = function (visitUuid) {
            return $http.get(Bahmni.Common.Constants.visitSummaryUrl,
                {
                    params: {
                        visitUuid: visitUuid
                    },
                    withCredentials: true
                }
            );
        };

        this.search = function (parameters) {
            return $http.get(Bahmni.Common.Constants.visitUrl, {
                params: parameters,
                withCredentials: true
            });
        };

        this.loadProviders = function () {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                cache: false
            });
        };

        this.getVisitType = function () {
            return $http.get(Bahmni.Common.Constants.visitTypeUrl, {
                withCredentials: true
            });
        };

        this.getMedicineList = function (typeName) {
            return $http.get(Bahmni.Common.Constants.medicineGetUrl, {
                params: {
                        type: typeName
                    },
                withCredentials: true
            });
        };

        this.savePrescriptionData = function (prescriptData) {
            return $http.post(Bahmni.Common.Constants.prescriptionSaveUrl, prescriptData, {
                withCredentials: true,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
        };

        this.saveAndDownloadPdf = function (data) {
            var url = Bahmni.Common.Constants.prescriptionAndDownloadPdfUrl;
            return $http.post(url, data,
                {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"},
                    responseType: 'arraybuffer'
                })
        };

        this.downloadPdf = function (visitUuid) {
            var url = Bahmni.Common.Constants.prescriptionDownloadUrl;
            return $http.get(url,
                {
                    params: {
                        visituuid: visitUuid
                    },
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"},
                    responseType: 'arraybuffer'
                })
        };

        this.saveHealthDistribution = function (data) {
            var url = Bahmni.Common.Constants.healtCommoditiesSaveUrl;
            return $http.post(url, data,
                {
                    withCredentials: true,
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                })
        };

        this.getVisitHistory = function (patientUuid, currentVisitLocation) {
            return this.search({
                patient: patientUuid,
                v: 'custom:(uuid,visitType,startDatetime,stopDatetime,location,encounters:(uuid))',
                includeInactive: true
            })
                .then(function (data) {
                    var visits = _.map(data.data.results, function (visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData);
                    });
                    var activeVisit = visits.filter(function (visit) {
                        return visit.isActive() && visit.isFromCurrentLocation(currentVisitLocation);
                    })[0];

                    return {"visits": visits, "activeVisit": activeVisit};
                });
        };




    }]);
