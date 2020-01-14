'use strict';

angular.module('bahmni.common.uiHelper')
 .directive('bmBackLinks', function () {
     return {
         template: '<ul>' +
                        '<li ng-repeat="backLink in backLinks">' +
                            '<a class="back-btn" ng-if="backLink.action" accesskey="{{backLink.accessKey}}" ng-click="closeAllDialogs();backLink.action()" id="{{backLink.id}}"> <span ng-bind-html="backLink.label"></span> </a>' +
                            '<a class="back-btn" style="margin-top: 15px;padding: 4px 10px 5px;height: 28px; border: none;background: none;" ng-class="{\'dashboard-link\':backLink.image}" ng-if="backLink.url" accesskey="{{backLink.accessKey}}" ng-href="{{backLink.url}}" ng-click="closeAllDialogs()" id="{{backLink.id}}"  title="{{backLink.title}}"> ' +
                                '<img ng-if="backLink.image" ng-src="{{backLink.image}}" onerror="this.onerror=null; this.src=\'../images/blank-user.gif\'"/>' +
                                '<i style="line-height:1; font-size: 25px; margin-right:5px; font-weight: 700;" ng-if="backLink.icon && !backLink.image" class="fa {{backLink.icon}}"></i>' +
                                '{{backLink.label}}' +
                            '</a>' +
                            '<a class="back-btn" style="margin-top: 15px;padding: 4px 10px 5px;height: 28px; border: none;background: none;" ng-if="backLink.state && !backLink.text" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" ng-click="closeAllDialogs()" id="{{backLink.id}}">' +
                                '<i style="line-height:1; font-size: 25px; margin-right:5px; font-weight: 700;" ng-if="backLink.icon" class="fa {{backLink.icon}}"></i>' +
                                '{{backLink.label}}' +
                            '</a>' +
         '<a ng-if="backLink.text && backLink.requiredPrivilege" show-if-privilege="{{backLink.requiredPrivilege}}" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" id="{{backLink.id}}" class="back-btn-noIcon" ui-sref-active="active">' +
         '<span>{{backLink.text | translate}}</span>' +
         '        </a>' +
                '<a ng-if="backLink.text && !backLink.requiredPrivilege" accesskey="{{backLink.accessKey}}" ui-sref="{{backLink.state}}" id="{{backLink.id}}" class="back-btn-noIcon" ui-sref-active="active">' +
                 '<span>{{backLink.text | translate}}</span>' +
        '        </a>' +
                        '</li>' +
                    '</ul>',
         controller: function ($scope, backlinkService) {
             $scope.backLinks = backlinkService.getAllUrls();
             $scope.$on('$stateChangeSuccess', function (event, state) {
                 if (state.data && state.data.backLinks) {
                     backlinkService.setUrls(state.data.backLinks);
                     debugger;
                     $scope.backLinks = backlinkService.getAllUrls();
                     angular.forEach($scope.backLinks, function (data) {
                         if (data.id == 'homeBackLink') {
                             data.title = "Bahmni Home";
                         }
                         if (data.id == 'adtHomeBackLink') {
                             data.title = "ADT Home";
                         }
                     });
                 }
             });

             $scope.$on("$destroy", function () {
                 window.onbeforeunload = undefined;
             });
         },
         restrict: 'E'
     };
 });
