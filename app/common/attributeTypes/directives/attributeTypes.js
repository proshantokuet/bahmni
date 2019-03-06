'use strict';

angular.module('bahmni.common.attributeTypes', []).directive('attributeTypes', [function () {
    return {
        scope: {
            targetModel: '=',
            attribute: '=',
            fieldValidation: '=',
            isAutoComplete: '&',
            getAutoCompleteList: '&',
            getDataResults: '&',
            handleUpdate: '&',
            isReadOnly: '&',
            isForm: '=?'
        },
        templateUrl: '../common/attributeTypes/views/attributeInformation.html',
        restrict: 'E',
        controller: function ($scope) {
            $scope.getAutoCompleteList = $scope.getAutoCompleteList();
            $scope.getDataResults = $scope.getDataResults();
            // to avoid watchers in one way binding
            $scope.isAutoComplete = $scope.isAutoComplete() || function () { return false; };
            $scope.isReadOnly = $scope.isReadOnly() || function () { return false; };
            $scope.handleUpdate = $scope.handleUpdate() || function () { return false; };

            $scope.appendConceptNameToModel = function (attribute) {
                var attributeValueConceptType = $scope.targetModel[attribute.name];
                var concept = _.find(attribute.answers, function (answer) {
                    return answer.conceptId === attributeValueConceptType.conceptUuid;
                });
                attributeValueConceptType.value = concept && concept.fullySpecifiedName;
            };
            $scope.restrictLMPDate = function (attributeName) {
                console.log(attributeName);
                var max = new Date();
                max.setDate(max.getDate() - 42);
                var month = max.getMonth() + 1;
                var day = max.getDate();
                var year = max.getFullYear();
                if (month < 10) {
                    month = '0' + month.toString();
                }
                if (day < 10) {
                    day = '0' + day.toString();
                }
                var maxDate = year + '-' + month + '-' + day;

                var min = new Date();
                min.setDate(min.getDate() - 280);
                var minmonth = min.getMonth() + 1;
                var minday = min.getDate();
                var minyear = min.getFullYear();
                if (minmonth < 10) {
                    minmonth = '0' + minmonth.toString();
                }
                if (minday < 10) {
                    minday = '0' + minday.toString();
                }
                var minDate = minyear + '-' + minmonth + '-' + minday;

                $('#LMP').attr('max', maxDate);
                $('#LMP').attr('min', minDate);
            };
        }
    };
}]);
