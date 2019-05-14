/**
 * Created by proshanto on 5/14/19.
 */
'use strict';

angular.module('bahmni.registration')
    .directive('ngAutofocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $timeout(function () {
                    $element[0].focus();
                });
            }
        };
    }]);
