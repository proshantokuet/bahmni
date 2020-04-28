'use strict';

angular.module('bahmni.common.conceptSet')
    .controller('ConceptSetGroupController', ['$scope', '$state', '$location', '$window', '$bahmniCookieStore', 'patientService', 'contextChangeHandler', 'spinner', 'messagingService',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig', '$q',
        'retrospectiveEntryService', 'userService', 'conceptSetUiConfigService', '$timeout', 'clinicalAppConfigService', '$stateParams', '$translate', 'ageFormatterService', 'age',
        function ($scope, $state, $location, $window, $bahmniCookieStore, patientService, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, $q, retrospectiveEntryService, userService,
                  conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate, ageFormatterService, age) {
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            $scope.timeObject = {};
            var init = function () {
                $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates);
                contextChangeHandler.add($scope.validationHandler.validate);
                $scope.makeSlipNoReadOnly = false;
                if ($scope.moneyReceiptObject) {
                    var orgUnit = $scope.patientInfo.orgUnit;
                    $scope.patientInfo = $scope.moneyReceiptObject[0];
                    var date = new Date($scope.patientInfo.moneyReceiptDate);
                    $scope.timeObject.hourValue = date.getHours();
                    $scope.timeObject.minuteValue = date.getMinutes();
                    $scope.patientInfo.orgUnit = orgUnit;
                    $scope.patientInfo.moneyReceiptDate = ageFormatterService.dateFormat($scope.patientInfo.moneyReceiptDate);
                    $scope.makeSlipNoReadOnly = true;
                }
                else {
                    //getslipNoFormoneyReceipt();
                }
            };
            $scope.toggleSideBar = function () {
                $rootScope.showLeftpanelToggle = !$rootScope.showLeftpanelToggle;
            };
            $scope.showLeftpanelToggle = function () {
                return $rootScope.showLeftpanelToggle;
            };
            $rootScope.titleHeader = "Money receipt";

            $scope.itemNames = [{name: "MED", id: 23, price: 34}, {
                name: "MEDiceine MEDiceine MEDiceine",
                id: 34,
                price: 340
            }];
            console.log($scope.patient);
            var param1 = $location.search();
            $scope.money = "";
            if ($stateParams.previousUrl != null || $stateParams.previousUrl != undefined) {
                if ($stateParams.previousUrl == "moneyreceipt") {
                    param1.createMoneyReceipt = "M";
                    if ($stateParams.moneyReceiptObject) {
                        $scope.moneyReceiptObject = $stateParams.moneyReceiptObject;
                    }
                }
            }
            if (param1.createMoneyReceipt != undefined) {
                $scope.money = true;
                $scope.observationTab = false;
            }
            else {
                $scope.observationTab = true;
                $scope.money = false;
            }
            $scope.getItem = function (index) {
                if (index == undefined) {
                    return "";
                }
                var obj = JSON.parse(index);
                return obj.price;
            };
            $scope.clinicType = "";
            $scope.servicePoints = [{name: "Static"}, {name: "Satellite"}, {name: "CSP"}];
            $scope.sessions = [{name: "EPI"}, {name: "Garments"}, {name: "Corporate"}, {name: "Goverment Events"}, {name: "Camp"}, {name: "NGO"}, {name: "Others"}, {name: "N/A"}];
            $scope.references = [{name: "Self"}, {name: "CSP"}, {name: "Satellite"}, {name: "SHCSG"}, {name: "SMC"}, {name: "External"}, {name: "Others"}];
            $scope.services = [{"discount": 0, "quantity": 1}];
            $scope.patientInfo = {
                clinicName: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicName,
                clinicCode: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId,
                orgUnit: $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).orgUnit
            };
            $scope.referenceId = function (reference, referenceId) {
                if (reference == "CSP" || reference == "External") {
                    return " ," + reference + " ID:" + referenceId;
                }
            };

            $scope.addNewChoice = function () {
                var newItemNo = $scope.services.length + 1;
                $scope.services.push({"discount": 0, "quantity": 1});
            };
            $scope.removeThis = function (index) {
                $scope.services.splice(index, 1);
            };
            $scope.removeChoice = function () {
                var lastItem = $scope.services.length - 1;
                if ($scope.services.length != 1) {
                    $scope.services.splice(lastItem);
                }
            };
            var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
            var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            $scope.inwords = function (num) {
                num = Math.floor(num);
                if ((num = num.toString()).length > 9) return 'overflow';
                var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                if (!n) return;
                var str = '';
                str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
                str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
                str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
                str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
                str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
                return str;
            };
            $scope.onChangedPateintInfo = function (servicePoint) {
                if (servicePoint == "Static" || servicePoint == "CSP") {
                    $scope.patientInfo['session'] = "";
                    $scope.patientInfo['other'] = "";
                    $scope.patientInfo['sateliteClinicId'] = "";
                    $scope.patientInfo['teamNo'] = "";
                } else if (servicePoint == "Satellite") {
                    $scope.patientInfo['cspId'] = "";
                }
                $scope.clinicType = servicePoint;
                $scope.collectors = $scope.dataCollectorList;
                $scope.dataCollectorList = $scope.dataCollectors;
            };
            $scope.htmlToPlaintext = function (text) {
                var yearsSplit = text.replace('Years', 'Y');
                var monthSplit = yearsSplit.replace('months', 'M');
                var daySplit = monthSplit.replace('days', 'D');
                return text ? String(daySplit).replace(/<[^>]+>/gm, '') : '';
            };
            $scope.ageFromBirthDate = function (dob, mod) {
                if (dob && mod) {
                    var dateOfBirth = new Date(dob);
                    var moneyreceiptDate = ageFormatterService.convertToDateObject(mod);
                    var ages = age.fromMoneyReceiptDate(dateOfBirth, moneyreceiptDate);
                    return ages.years + " Y " + ages.months + " M " + ages.days + " D";
                }
            };
            $scope.address = function (address) {
                var addresLine = "";
                var stateProvince = "";
                var countyDistrict = "";
                var address3 = "";
                var cityVillage = "";
                var address2 = "";
                var address1 = "";
                if (!address.isEmpty) {
                    /* if (address.stateProvince != undefined) {
                     stateProvince = address.stateProvince;
                     addresLine += stateProvince + ", ";
                     } */
                    if (address.address1 != undefined) {
                        address1 = address.address1;
                        addresLine += address1;
                    }
                    if (address.address2 != undefined) {
                        address2 = address.address2;
                        addresLine += address2 + ", ";
                    }
                    if (address.cityVillage != undefined) {
                        cityVillage = address.cityVillage;
                        addresLine += cityVillage + ", ";
                    }
                    /* if (address.countyDistrict != undefined) {
                     countyDistrict = address.countyDistrict;
                     addresLine += countyDistrict + ",";
                     } */
                    if (address.address3 != undefined) {
                        address3 = address.address3;
                        addresLine += address3;
                    }
                    return addresLine;
                }
            };

            $scope.title = "Money Receipt";
            $scope.onChanged = function (item, index) {
                var thisCode = item.code;
                var service = $scope.services.filter(function (service) {
                    if (service.item) {
                        return service.item.code == thisCode;
                    }
                });
                if (service.length == 1) {
                    $scope.services[index].unitCost = item.unitCost;
                    $scope.services[index].quantity = 1;
                    $scope.services[index].code = item;
                    $scope.services[index].category = item.category;
                    // $scope.services[index].provider = item.provider;
                    $scope.services[index].totalAmount = item.unitCost;
                    $scope.services[index].discount = 0;
                    $scope.services[index].netPayable = item.unitCost;
                } else {
                    $scope.services[index].item = undefined;
                    $scope.services[index].code = undefined;
                    $scope.services[index].unitCost = "";
                    $scope.services[index].quantity = 1;
                    $scope.services[index].category = "";
                    $scope.services[index].totalAmount = "";
                    $scope.services[index].discount = 0;
                    $scope.services[index].netPayable = "";
                    alert("You have selected  " + item.name + " please select another");
                }
            };
            $scope.onChangedForCode = function (item, index) {
                var thisCode = item.code;
                var service = $scope.services.filter(function (service) {
                    if (service.code) {
                        return service.code.code == thisCode;
                    }
                });
                if (service.length == 1) {
                    $scope.services[index].unitCost = item.unitCost;
                    $scope.services[index].quantity = 1;
                    $scope.services[index].item = item;
                    $scope.services[index].category = item.category;
                    // $scope.services[index].provider = item.provider;
                    $scope.services[index].totalAmount = item.unitCost;
                    $scope.services[index].discount = 0;
                    $scope.services[index].netPayable = item.unitCost;
                } else {
                    $scope.services[index].item = undefined;
                    $scope.services[index].code = undefined;
                    $scope.services[index].unitCost = "";
                    $scope.services[index].quantity = 1;
                    $scope.services[index].category = "";
                    $scope.services[index].totalAmount = "";
                    $scope.services[index].discount = 0;
                    $scope.services[index].netPayable = "";
                    alert("You have selected  " + item.name + " please select another");
                }
            };

            $scope.dateTOString = function (date) {
                return date.slice(0, 10);
            };

            $scope.dateStringToDateObj = function (date) {
                return new Date(date);
            };

            $scope.checkedBox = function (value, checkingValue) {
                if (value == checkingValue) {
                    return true;
                }
                return false;
            };
            $scope.calculateTotalAmountAndNetPayable = function (quantity, index) {
                var totalAmount = quantity * $scope.services[index].unitCost;
                $scope.services[index].totalAmount = parseFloat(totalAmount).toFixed(2);
                if ($scope.services[index].discount != undefined) {
                    $scope.services[index].netPayable = parseFloat(totalAmount) - $scope.services[index].discount.toFixed(2);
                } else {
                    $scope.services[index].netPayable = parseFloat(totalAmount).toFixed(2);
                }
            };

            $scope.calculateNetAmount = function (discount, index) {
                var totalAmount = parseFloat($scope.services[index].totalAmount);
                var disccountAmount = (discount * totalAmount) / 100;

                var netpayAmount = totalAmount - disccountAmount;
                if (discount > totalAmount) {
                    var discountLenth = (discount.toString()).length;
                    var prevousDiscount = (discount.toString()).slice(0, discountLenth - 1);
                    $scope.services[index].discount = parseInt(prevousDiscount);
                    alert("Discount amount is greater than total amount");
                } else {
                    $scope.services[index].netPayable = (totalAmount - discount).toFixed(2);
                }
            };
            $scope.calTotalAmount = function () {
                $scope.total = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.totalAmount != undefined) {
                        $scope.total = $scope.total + parseFloat(listItem.totalAmount);
                    }
                });
                return $scope.total;
            };

            $scope.calTotalDiscount = function () {
                $scope.totalDiscount = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.discount != undefined) {
                        $scope.totalDiscount = $scope.totalDiscount + listItem.discount;
                    }
                });
                return $scope.totalDiscount;
            };

            $scope.calTotalNetAmount = function () {
                $scope.net = 0;
                angular.forEach($scope.services, function (listItem) {
                    if (listItem.netPayable != undefined) {
                        $scope.net = $scope.net + parseFloat(listItem.netPayable);
                    }
                });
                var decimalPart = ($scope.net - Math.floor($scope.net));
                $scope.netAmount = "";
                if (decimalPart >= 0.5) {
                    $scope.netAmount = Math.ceil($scope.net);
                } else {
                    $scope.netAmount = Math.floor($scope.net);
                }
                return $scope.netAmount;
            };

            var saveMoneyReceipt = function (data) {
                return patientService.saveMoneyReceipt(data).then(function (response) {
                    console.log("save return");
                    console.log(response);
                });
            };

            $scope.dateStringConverter = function (date) {
                var dateObject = new Date(date);
                var dateString = dateObject.getFullYear() + "-" + (dateObject.getMonth() + 1) + "-" + dateObject.getDate();
                return dateString;
            };

            $scope.searchButtonText = "Submit";
            $scope.test = "true";

            $scope.submitMoneyReceiptData = function (patientInfo, services, patient, savingStatus) {
                if (!patientInfo.mid) {
                    $scope.checkExistingMoneyAvailable(patientInfo.slipNo, patientInfo.moneyReceiptDate).then(function (result) {
                        if (result.data == true) {
                            messagingService.showMessage("error", "Money Receipt with this slip no is already exist");
                        }
                        else if (result.data == false) {
                            $scope.forwardingMoneyReceiptSavingProcess(patientInfo, services, patient, savingStatus);
                        }
                        else {
                            messagingService.showMessage("error", "Something bad happened,Please try again later");
                        }
                    });
                }
                else {
                    $scope.forwardingMoneyReceiptSavingProcess(patientInfo, services, patient, savingStatus);
                }
            };

            $scope.forwardingMoneyReceiptSavingProcess = function (patientInfo, services, patient, savingStatus) {
                if ($window.confirm("Do you really want to proceed?")) {
                    $scope.Message = "You clicked YES.";
                    $scope.enable = "false";
                    $scope.test = "true";
                    $scope.passedServiceTest = true;

                    angular.forEach(services, function (service) {
                        if (!service.code || !service.item) {
                            $scope.passedServiceTest = false;
                        }
                    });
                    if (!$scope.passedServiceTest) {
                        messagingService.showMessage("error", "Service code and Item can not be empty");
                        return;
                    }
                    if ($stateParams.moneyReceiptObject) {
                       var dateStatus = $scope.checkValidDateWhileEdit(patientInfo.moneyReceiptDate);
                       if(dateStatus) {
                           return;
                       }
                    }
                    // if (!$stateParams.moneyReceiptObject) {
                    //     var concatenedEslipNo = $scope.generateEslipNo(patientInfo.servicePoint);
                    //     if (concatenedEslipNo.length != 16) {
                    //         messagingService.showMessage("error", "Error Generating Eslip number,E-Slip length More than 16 digit");
                    //         return;
                    //     }
                    //     else {
                    //         patientInfo.eslipNo = concatenedEslipNo;
                    //     }
                    // }
                    // else {
                    //     var concatenedEslipNo = $scope.generateEslipNoEdit(patientInfo.servicePoint);
                    //     if (concatenedEslipNo.length != 16) {
                    //         messagingService.showMessage("error", "Error Generating Eslip number,E-Slip length More than 16 digit");
                    //         return;
                    //     }
                    //     else {
                    //         patientInfo.eslipNo = concatenedEslipNo;
                    //     }
                    // }
                    $scope.searchButtonText = "Submitting";
                    var jsonData = {};
                    if ($stateParams.moneyReceiptObject) {
                        delete patientInfo.category;
                        delete patientInfo.code;
                        delete patientInfo.designation;
                        delete patientInfo.discount;
                        delete patientInfo.item;
                        delete patientInfo.netPayable;
                        delete patientInfo.quantity;
                        delete patientInfo.spid;
                        delete patientInfo.totalAmount;
                        delete patientInfo.unitCost;
                        patientInfo['mid'] = $scope.patientInfo.mid;
                    }
                    else patientInfo['mid'] = "";
                    patientInfo['patientName'] = patient.givenName + " " + patient.familyName;
                    patientInfo['patientUuid'] = patient.uuid;
                    patientInfo['uic'] = patient.UIC.value;
                    var splitedDate = patientInfo.moneyReceiptDate.split('/');
                    var finalizedSplitedDate = splitedDate[2] + "-" + splitedDate[1] + "-" + splitedDate[0];
                    patientInfo['moneyReceiptDate'] = finalizedSplitedDate;
                    $scope.changingMinuteHourValue($scope.timeObject.hourValue, $scope.timeObject.minuteValue);
                    if (patient.MobileNo != undefined) {
                        patientInfo['contact'] = patient.MobileNo.value;
                    }
                    patientInfo['gender'] = patient.gender;
                    patientInfo['dob'] = $scope.dateStringConverter(patient.birthdate);
                    if (patient.FinancialStatus != undefined) {
                        patientInfo['wealth'] = patient.FinancialStatus.value.display;
                    }
                    if (patientInfo.sateliteClinicId) {
                        patientInfo.orgUnit = patientInfo.sateliteClinicId.dhisId;
                        patientInfo.sateliteClinicId = patientInfo.sateliteClinicId.code;
                    }
                    patientInfo['isComplete'] = savingStatus;
                    patientInfo['totalAmount'] = $scope.netAmount.toString();
                    patientInfo['totalDiscount'] = $scope.totalDiscount.toString();
                    if (patient.RegistrationDate) {
                        patientInfo['patientRegisteredDate'] = $scope.dateStringConverter(patient.RegistrationDate.value);
                    }
                    jsonData["moneyReceipt"] = patientInfo;
                    jsonData["services"] = services;
                    return spinner.forPromise($q.all([saveMoneyReceipt(jsonData)]).then(function (results) {
                        $state.go("patient.dashboard.show", {
                            patientUuid: patient.uuid
                        }, {reload: true}
                        );
                    }));
                } else {
                    $scope.Message = "You clicked NO.";
                }
            };

            $scope.togglePref = function (conceptSet, conceptName) {
                $rootScope.currentUser.toggleFavoriteObsTemplate(conceptName);
                spinner.forPromise(userService.savePreferences());
            };

            $scope.checkValidDate = function (date) {
                var registrationDate = new Date($scope.patient.RegistrationDate.value);
                var dateOfBirth = new Date($scope.patient.birthdate);
                dateOfBirth.setHours(0, 0, 0, 0);
                registrationDate.setHours(0, 0, 0, 0);
                var splitedDate = date.split('/');
                var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                var comparedValueForMoneyReceipt = finalizedSplitedDate.getTime();
                var comparedValueForRegistrationDate = registrationDate.getTime();
                var comparedValueForDobDate = dateOfBirth.getTime();
                if (comparedValueForMoneyReceipt < comparedValueForRegistrationDate || comparedValueForMoneyReceipt < comparedValueForDobDate) {
                    $scope.patientInfo.moneyReceiptDate = null;
                    messagingService.showMessage("error", "Money receipt date cannot be entered  before patient registration date or birth date");
                }
            };

            $scope.checkValidDateWhileEdit = function (date) {
                var registrationDate = new Date($scope.patient.RegistrationDate.value);
                var dateOfBirth = new Date($scope.patient.birthdate);
                dateOfBirth.setHours(0, 0, 0, 0);
                registrationDate.setHours(0, 0, 0, 0);
                var splitedDate = date.split('/');
                var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                var comparedValueForMoneyReceipt = finalizedSplitedDate.getTime();
                var comparedValueForRegistrationDate = registrationDate.getTime();
                var comparedValueForDobDate = dateOfBirth.getTime();
                if (comparedValueForMoneyReceipt < comparedValueForRegistrationDate || comparedValueForMoneyReceipt < comparedValueForDobDate) {
                    messagingService.showMessage("error", "Money receipt date cannot be entered  before patient registration date or birth date");
                    return true;
                }
            };

            $scope.changingMinuteHourValue = function (hour, minute) {
                if (hour && minute) {
                    if ($scope.patientInfo.moneyReceiptDate) {
                        $scope.patientInfo.moneyReceiptDate = $scope.patientInfo.moneyReceiptDate + " " + hour + ":";
                    }
                    if ($scope.patientInfo.moneyReceiptDate) {
                        $scope.patientInfo.moneyReceiptDate = $scope.patientInfo.moneyReceiptDate + minute;
                    }
                }
                else if(hour && !minute) {
                    $scope.patientInfo.moneyReceiptDate = $scope.patientInfo.moneyReceiptDate + " " + hour + ":" + "00";
                }
                else if(!hour && minute) {
                    $scope.patientInfo.moneyReceiptDate = $scope.patientInfo.moneyReceiptDate + " " + "00" + ":" + minute;
                }
                else {
                    $scope.patientInfo.moneyReceiptDate = $scope.patientInfo.moneyReceiptDate + " " + "00:00";
                }
            };

            $scope.checkExistingMoneyAvailable = function (slipNo, date) {
                var moneyReceiptDate = ageFormatterService.convertToDateObject(date);
                var date = moneyReceiptDate.getFullYear().toString();
                return patientService.checkExistingMoneyReceipt(slipNo, date, $scope.patientInfo.clinicCode);
            };

            $scope.generateEslipNo = function (servicePoint) {
                var electronicSlipNo = "";
                if (servicePoint == 'Static') {
                    electronicSlipNo =  $scope.eslipNo.replace("-","100");
                }
                else if (servicePoint == 'Satellite') {
                    var checkSize = $scope.patientInfo.sateliteClinicId.code < 10 ? "0" + $scope.patientInfo.sateliteClinicId.code : $scope.patientInfo.sateliteClinicId.code;
                    if(checkSize.length > 2 ) checkSize = checkSize.substring(0,2);
                    var concatenedString = "2" + checkSize;
                    electronicSlipNo =  $scope.eslipNo.replace("-", concatenedString);
                }
                else if (servicePoint == 'CSP') {
                    var checkSize = $scope.patientInfo['cspId'] < 10 ? "0" + $scope.patientInfo['cspId'] : $scope.patientInfo['cspId'];
                    checkSize = checkSize.substring(0,2);
                    var concatenedString = "3" + checkSize;
                    electronicSlipNo =  $scope.eslipNo.replace("-", concatenedString);
                }
                return electronicSlipNo;
            };

            $scope.generateEslipNoEdit = function (servicePoint) {
                var electronicSlipNo = "";
                if (servicePoint == 'Static') {
                    electronicSlipNo = $scope.replaceAtEslip($scope.patientInfo.eslipNo,9,"100");
                }
                else if (servicePoint == 'Satellite') {
                    var checkSize = $scope.patientInfo.sateliteClinicId.code < 10 ? "0" + $scope.patientInfo.sateliteClinicId.code : $scope.patientInfo.sateliteClinicId.code;
                    if (checkSize.length > 2) checkSize = checkSize.substring(0, 2);
                    var concatenedString = "2" + checkSize;
                    electronicSlipNo = $scope.replaceAtEslip($scope.patientInfo.eslipNo,9,concatenedString);
                }
                else if (servicePoint == 'CSP') {
                    var checkSize = $scope.patientInfo['cspId'] < 10 ? "0" + $scope.patientInfo['cspId'] : $scope.patientInfo['cspId'];
                    checkSize = checkSize.substring(0, 2);
                    var concatenedString = "3" + checkSize;
                    electronicSlipNo = $scope.replaceAtEslip($scope.patientInfo.eslipNo,9,concatenedString);
                }
                return electronicSlipNo;
            };

            $scope.replaceAtEslip = function (string,index, replacement) {
                    return string.substr(0, index) + replacement+ string.substr(index + replacement.length);
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.showPreviousButton = function (conceptSetName) {
                return conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].showPreviousButton;
            };

            $scope.showPrevious = function (conceptSetName, event) {
                event.stopPropagation();
                $timeout(function () {
                    $scope.$broadcast('event:showPrevious' + conceptSetName);
                });
            };
            $scope.isInEditEncounterMode = function () {
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            $scope.computeField = function (conceptSet, event) {
                event.stopPropagation();
                $scope.consultation.preSaveHandler.fire();
                var defaultRetrospectiveVisitType = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(),
                    retrospectiveEntryService.getRetrospectiveEntry(), defaultRetrospectiveVisitType, $scope.isInEditEncounterMode());
                encounterData = encounterService.buildEncounter(encounterData);
                encounterData.drugOrders = [];

                var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
                var data = {
                    encounterModifierObservations: encounterData.observations,
                    drugOrders: encounterData.drugOrders,
                    conceptSetData: conceptSetData,
                    patientUuid: encounterData.patientUuid,
                    encounterDateTime: encounterData.encounterDateTime
                };

                spinner.forPromise(treatmentConfig().then(function (treatmentConfig) {
                    $scope.treatmentConfiguration = treatmentConfig;
                    return conceptSetService.getComputedValue(data);
                }).then(function (response) {
                    response = response.data;
                    copyValues($scope.consultation.observations, response.encounterModifierObservations);
                    $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [];
                    response.drugOrders.forEach(function (drugOrder) {
                        $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfiguration));
                    });
                }));
            };

            $scope.canRemove = function (index) {
                var observations = $scope.allTemplates[index].observations;
                if (observations === undefined || _.isEmpty(observations)) {
                    return true;
                }
                return observations[0].uuid === undefined;
            };

            $scope.clone = function (index) {
                var clonedObj = $scope.allTemplates[index].clone();
                $scope.allTemplates.splice(index + 1, 0, clonedObj);
                $.scrollTo('#concept-set-' + (index + 1), 200, {offset: {top: -400}});
            };

            $scope.clonePanelConceptSet = function (conceptSet) {
                var index = _.findIndex($scope.allTemplates, conceptSet);
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: $scope.allTemplates[index].label}));
                $scope.clone(index);
                $scope.showLeftPanelConceptSet($scope.allTemplates[index + 1]);
            };

            $scope.isClonedSection = function (conceptSetTemplate, allTemplates) {
                if (allTemplates) {
                    var index = allTemplates.indexOf(conceptSetTemplate);
                    return (index > 0) ? allTemplates[index].label == allTemplates[index - 1].label : false;
                }
                return false;
            };

            $scope.isLastClonedSection = function (conceptSetTemplate) {
                var index = _.findIndex($scope.allTemplates, conceptSetTemplate);
                if ($scope.allTemplates) {
                    if (index == $scope.allTemplates.length - 1 || $scope.allTemplates[index].label != $scope.allTemplates[index + 1].label) {
                        return true;
                    }
                }
                return false;
            };

            $scope.remove = function (index) {
                var label = $scope.allTemplates[index].label;
                var currentTemplate = $scope.allTemplates[index];
                var anotherTemplate = _.find($scope.allTemplates, function (template) {
                    return template.label == currentTemplate.label && template !== currentTemplate;
                });
                if (anotherTemplate) {
                    $scope.allTemplates.splice(index, 1);
                }
                else {
                    var clonedObj = $scope.allTemplates[index].clone();
                    $scope.allTemplates[index] = clonedObj;
                    $scope.allTemplates[index].isAdded = false;
                    $scope.allTemplates[index].isOpen = false;
                    $scope.allTemplates[index].klass = "";
                    $scope.allTemplates[index].isLoaded = false;
                }
                $scope.leftPanelConceptSet = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {label: label}));
            };

            $scope.openActiveForm = function (conceptSet) {
                if (conceptSet && conceptSet.klass == 'active' && conceptSet != $scope.leftPanelConceptSet) {
                    $scope.showLeftPanelConceptSet(conceptSet);
                }
                return conceptSet.klass;
            };

            var copyValues = function (existingObservations, modifiedObservations) {
                existingObservations.forEach(function (observation, index) {
                    if (observation.groupMembers && observation.groupMembers.length > 0) {
                        copyValues(observation.groupMembers, modifiedObservations[index].groupMembers);
                    } else {
                        observation.value = modifiedObservations[index].value;
                    }
                });
            };

            var collapseExistingActiveSection = function (section) {
                if (section) {
                    section.klass = "";
                    section.isOpen = false;
                    section.isLoaded = false;
                }
            };

            $scope.showLeftPanelConceptSet = function (selectedConceptSet) {
                collapseExistingActiveSection($scope.leftPanelConceptSet);
                $scope.leftPanelConceptSet = selectedConceptSet;
                $scope.leftPanelConceptSet.isOpen = true;
                $scope.leftPanelConceptSet.isLoaded = true;
                $scope.leftPanelConceptSet.klass = "active";
                $scope.leftPanelConceptSet.atLeastOneValueIsSet = selectedConceptSet.hasSomeValue();
                $scope.leftPanelConceptSet.isAdded = true;
                $scope.consultation.lastvisited = selectedConceptSet.id || selectedConceptSet.formUuid;
                $(window).scrollTop(0);
            };

            $scope.focusOnErrors = function () {
                var errorMessage = $scope.leftPanelConceptSet.errorMessage ? $scope.leftPanelConceptSet.errorMessage : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                messagingService.showMessage('error', errorMessage);
                $scope.$parent.$parent.$broadcast("event:errorsOnForm");
            };

            $scope.isFormTemplate = function (data) {
                return data.formUuid;
            };

            var services = function () {
                return patientService.getServices($scope.patient).then(function (response) {
                    var index = 0;
                    $scope.serviceList = response.data.filter(function (item) {
                        return item.voided == false;
                    });
                    if ($scope.moneyReceiptObject) {
                        for (var j = 0; j < $scope.serviceList.length; j++) {
                            for (var i = 0; i < $scope.moneyReceiptObject.length; i++) {
                                if ($scope.serviceList[j].code == $scope.moneyReceiptObject[i].code) {
                                    $scope.services[index] = {"discount": 0, "quantity": 1};
                                    $scope.services[index].code = $scope.serviceList[j];
                                    $scope.services[index].item = $scope.serviceList[j];
                                    $scope.services[index].description = $scope.moneyReceiptObject[i].description;
                                    $scope.services[index].unitCost = $scope.moneyReceiptObject[i].unitCost;
                                    $scope.services[index].quantity = $scope.moneyReceiptObject[i].quantity;
                                    $scope.services[index].totalAmount = $scope.moneyReceiptObject[i].totalAmount;
                                    $scope.services[index].discount = $scope.moneyReceiptObject[i].discount;
                                    $scope.services[index].netPayable = $scope.moneyReceiptObject[i].netPayable;
                                    $scope.services[index].spid = $scope.moneyReceiptObject[i].spid;
                                    index++;
                                    break;
                                }
                            }
                        }
                    }
                });
            };

            var getslipNoFormoneyReceipt = function () {
                return patientService.getEslipNo($scope.patientInfo.clinicCode).then(function (response) {
                    $scope.eslipNo = response.data.eslipNo;

                });
            };

            var dataCollectors = function (clinicCode) {
                return patientService.getDataCollectors(clinicCode).then(function (response) {
                    $scope.dataCollectorList = response.data;
                    $scope.dataCollectors = response.data;
                    angular.forEach($scope.dataCollectorList, function (value, key) {
                        if (value.designation == 'Counselor') {
                            $scope.patientInfo.dataCollector = value;
                        }
                        else if ($scope.patientInfo.dataCollector) {
                            if ($scope.patientInfo.dataCollector == value.username) {
                                $scope.patientInfo.dataCollector = value;
                            }
                        }
                    });
                });
            };

            var sateliteClinicId = function () {
                var clinicCode = $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).id;
                return patientService.getSateliteClinicCode(clinicCode).then(function (response) {
                    $scope.sateliteClinicCodes = response.data;
                    angular.forEach($scope.sateliteClinicCodes, function (value, key) {
                        if ($scope.patientInfo.sateliteClinicId) {
                            if ($scope.patientInfo.sateliteClinicId == value.code) {
                                $scope.patientInfo.sateliteClinicId = value;
                            }
                        }
                    });
                });
            };

            var initPromise = $q.all([services(), dataCollectors($scope.patientInfo.clinicCode)], sateliteClinicId());
            $scope.initialization = initPromise;

            init();
        }])
    .directive('conceptSetGroup', ['spinner', function (spinner) {
        var link = function ($scope, element) {
            spinner.forPromise($scope.initialization, element);
        };
        return {
            restrict: 'EA',
            link: link,
            scope: {
                conceptSetGroupExtensionId: "=?",
                observations: "=",
                allTemplates: "=",
                context: "=",
                autoScrollEnabled: "=",
                patient: "=",
                consultation: "="

            },
            controller: 'ConceptSetGroupController',
            templateUrl: '../common/concept-set/views/conceptSetGroup.html'
        };
    }]);

/* angular.module('bahmni.common.conceptSet').directive('ngConfirmClick', [
 function () {
 return {
 link: function ($scope, element, attr) {
 var msg = attr.ngConfirmClick || "Are you sure?";
 var clickAction = attr.confirmedClick;
 element.bind('click', function (event) {
 if (window.confirm(msg)) {
 scope.$eval(clickAction);
 }
 });
 }
 };
 }
 ]); */
