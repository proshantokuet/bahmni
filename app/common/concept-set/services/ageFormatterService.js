'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('ageFormatterService', ['$http', '$q', function ($http, $q) {
        var dateFormat = function (dateObject) {
            var date = new Date(dateObject),
                yr = date.getFullYear(),
                month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
                day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
                newDate = day + '/' + month + '/' + yr;
            return newDate;
        };

        var convertToDateObject = function (dateString) {
            var splitedDate = dateString.split('/');
            var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
            finalizedSplitedDate.setDate(finalizedSplitedDate.getDate());
            return finalizedSplitedDate;
        };
        return {
            dateFormat: dateFormat,
            convertToDateObject: convertToDateObject
        };
    }]);

