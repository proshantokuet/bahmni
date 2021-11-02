'use strict';

angular.module('bahmni.clinical')
    .controller('healthCommoditiesController', ['$scope', '$rootScope', 'spinner',
        'messagingService', 'appService','visitService', 'visitHistory','$state','$bahmniCookieStore',
        function ($scope,$rootScope,  spinner, messagingService, appService, visitService, visitHistory, $state,$bahmniCookieStore) {
            $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
            $scope.visitHistory = visitHistory;
            $scope.healthCommodities = {"distributeId" : 0};
            $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto = [{"distributeDetailsId":0,"quantity":1,"currentStock":0}];
            $scope.clinicInfo = {
                 clinicName: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicName,
                 clinicPrimaryId: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).id,
                 clinicCode:$bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId
             };
            debugger;
            $scope.test = $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName);
            console.log($scope.test);
            var init = function () {
                visitService.getMedicineList("Commodities",$scope.clinicInfo.clinicPrimaryId).then(function (response) {
                    $scope.medicine = response.data;
                });
            };
            $scope.addNewChoice = function () {
                var newItemNo = $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto.length + 1;
                $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto.push({"distributeDetailsId":0,"quantity":1});
            };
            $scope.removeThis = function (index) {
                $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto.splice(index, 1);
            };

            $scope.onChanged = function (item, index) {
                debugger;
                var thisCode = item.name;
                var service = $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto.filter(function (service) {
                    if (service.commoditiesItem) {
                        return service.commoditiesItem.name == thisCode;
                    }
                });
                if (service.length == 1) {
                    console.log(item.medicineId);
                    getCurrentStock(item.medicineId,index);
                }
                else {
                    $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].distributeDetailsId = 0;
                    $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].quantity = 1;
                    $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].commoditiesItem = undefined;
                    alert( item.name + " already exists in the list.");
                }
            };

            $scope.saveHealthCommodities = function () {
                $scope.healthCommodities.patientUuid = $scope.patient.uuid;
                $scope.healthCommodities.patientName = $scope.patient.name;
                $scope.healthCommodities.gender = $scope.patient.genderText.replace(/<\/?[^>]+(>|$)/g, "");
                $scope.healthCommodities.patientAge = $scope.patient.ageText.replace(/<\/?[^>]+(>|$)/g, "");
                var date = Bahmni.Common.Util.DateUtil.getDateWithoutTime($scope.healthCommodities.distributeDateModel);
                $scope.healthCommodities.distributeDate = date;
                $scope.healthCommodities.providerName = $rootScope.currentUser.fullName;
                console.log("clinicId ");
                $scope.healthCommodities.clinicId = $scope.clinicInfo.clinicPrimaryId;
                $scope.healthCommodities.clinicCode = $scope.clinicInfo.clinicCode;
                angular.forEach($scope.healthCommodities.ubsCommoditiesDistributeDetailsDto, function (listItem) {
                    if (listItem.commoditiesItem != undefined) {
                       listItem.commoditiesId = listItem.commoditiesItem.medicineId;
                       listItem.commoditiesName = listItem.commoditiesItem.name;
                    }
                });
                var jsonData = angular.copy($scope.healthCommodities);
                delete jsonData.distributeDateModel;
                angular.forEach(jsonData.ubsCommoditiesDistributeDetailsDto, function (listItem) {
                    if (listItem.commoditiesItem != undefined) {
                        delete listItem.commoditiesItem;
                    }
                });
                spinner.forPromise(visitService.saveHealthDistribution(jsonData).then(function (response) {
                    if(response.data) {
                        var stockoutFlag = response.data.stockOutflag;
                        if(!stockoutFlag) {
                            messagingService.showMessage("info", response.data.message);
                            $state.go("patient.dashboard.show", {
                                    patientUuid: $scope.patient.uuid
                                }, {reload: true}
                            );
                        }
                        else {
                            messagingService.showMessage('error', "Medicine out of stock "+response.data.message);
                        }
                    }
                }));
            };

            init();
            var getCurrentStock = function (productId,index){
                console.log("product stock retrieved" +productId);
                    visitService.getProductStock(productId,$scope.clinicInfo.clinicPrimaryId).then(function (response) {
                    var stock = response.data;
                    $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].currentStock=parseInt(stock.stock);
                });
            };

            $scope.checkStock = function (quantity, index) {
                debugger;
                   var stock = $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].currentStock;
                   console.log("entered quantity ");
                    if (quantity > stock) {
                        messagingService.showMessage('error', "Medicine out of stock");
                        quantity = stock;
                        $scope.healthCommodities.ubsCommoditiesDistributeDetailsDto[index].quantity = quantity;
                    }

             };


        }
    ])
;
