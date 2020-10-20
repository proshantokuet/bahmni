'use strict';

(function () {
    var getAddress = function ($scope) {
        var patient = $scope.patient;
        var address = [];
        if ($scope.config.addressFields != undefined && $scope.config.addressFields.length != 0) {
            $scope.config.addressFields.forEach(function (addressField) {
                if (patient.address[addressField]) {
                    address.push(patient.address[addressField]);
                }
            });
        } else if (!_.includes($scope.config, "cityVillage")) {
            address.push(patient.address["cityVillage"]);
        }
        return address.join(", ");
    };
    var getPatientAttributeTypes = function ($scope) {
        var patient = $scope.patient;
        if ($scope.config.hasOwnProperty("ageLimit") && patient.age >= $scope.config.ageLimit) {
            patient.ageText = patient.age.toString() + " <span> years </span>";
        }
        var patientAttributeTypes = [patient.genderText, patient.ageText];
        if (patient.bloodGroupText) {
            patientAttributeTypes.push(patient.bloodGroupText);
        }
        return patientAttributeTypes.join(", ");
    };
    var isAdmitted = function (admissionStatus) {
        return _.get(admissionStatus, 'value') === "Admitted";
    };
    angular.module('bahmni.common.displaycontrol.patientprofile')
        .directive('patientProfile', ['patientService', 'spinner', 'ngDialog', '$sce', '$rootScope', '$stateParams', '$window', '$translate',
            'configurations', '$q', 'visitService', '$state', '$bahmniCookieStore', 'messagingService', 'age',
            function (patientService, spinner, ngDialog, $sce, $rootScope, $stateParams, $window, $translate, configurations, $q, visitService, $state, $bahmniCookieStore, messagingService, age) {
                var controller = function ($scope) {
                    $scope.isProviderRelationship = function (relationship) {
                        return _.includes($rootScope.relationshipTypeMap.provider, relationship.relationshipType.aIsToB);
                    };
                    $scope.openPatientDashboard = function (patientUuid) {
                        var configName = $stateParams.configName || Bahmni.Common.Constants.defaultExtensionName;
                        $window.open("../clinical/#/" + configName + "/patient/" + patientUuid + "/dashboard");
                    };
                    $scope.openMoneyReceipt = function (patientUuid) {
                        $window.open("../clinical/index.html#/default/patient/" + patientUuid + "/dashboard/concept-set-group/observations");
                    };
                    var assignPatientDetails = function () {
                        var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                        return patientService.getPatient($scope.patientUuid).then(function (response) {
                            var openMrsPatient = response.data;
                            $scope.patient = patientMapper.map(openMrsPatient);
                        });
                    };
                    var assignRelationshipDetails = function () {
                        return patientService.getRelationships($scope.patientUuid).then(function (response) {
                            $scope.relationships = response.data.results;
                        });
                    };
                    $scope.truncateDate = function (date) {
                        if (date != undefined) {
                            return date.slice(0, 10);
                        }
                    };
                    $scope.pmessage = "Hello ngDialog";
                    $scope.servicesBySlip = [];
                    $scope.confirmationPrompt = function (id, moneyRceiptDate) {
                        $scope.servicesBySlip = $scope.services.filter(function (service) {
                            var moneyReceiptDateOfIterator = new Date(service.moneyReceiptDate);
                            var selectedMoneyReceiptDate = new Date(moneyRceiptDate);
                            return service.mid == id;
                        });
                        $scope.Dialog = ngDialog.open({
                            templateUrl: 'dialog',
                            className: 'ngdialog-theme-default custom-width-1000',
                            showClose: false,
                            closeByDocument: true,
                            overlay: false,
                            scope: $scope
                        });
                    };
                    $scope.dateTOString = function (date) {
                        return new Date(date);
                    };

                    $scope.ageFromBirthDate = function (dob, mod) {
                        if (dob) {
                            var dateOfBirth = new Date(dob);
                            var moneyreceiptDate = new Date(mod);
                            var ages = age.fromMoneyReceiptDate(dateOfBirth, moneyreceiptDate);
                            return ages.years + " Y " + ages.months + " M " + ages.days + " D";
                        }
                    };

                    $scope.openEditPatient = function (patientUuid) {
                        $window.open("../registration/#/patient/" + patientUuid, "_self");
                    };

                    $scope.htmlToPlaintext = function (text) {
                        var yearsSplit = text.replace('Years', 'Y');
                        var monthSplit = yearsSplit.replace('months', 'M');
                        var daySplit = monthSplit.replace('days', 'D');
                        return text ? String(daySplit).replace(/<[^>]+>/gm, '') : '';
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
                    $scope.referenceId = function (reference, referenceId) {
                        if (reference == "CSP" || reference == "External") {
                            return " ," + reference + " ID:" + referenceId;
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

                    $scope.calTotalAmount = function () {
                        $scope.total = 0;
                        angular.forEach($scope.servicesBySlip, function (listItem) {
                            if (listItem.totalAmount != undefined) {
                                $scope.total = $scope.total + parseFloat(listItem.totalAmount);
                            }
                        });
                        return $scope.total;
                    };
                    $scope.calTotalDiscount = function () {
                        $scope.totalDiscount = 0;
                        angular.forEach($scope.servicesBySlip, function (listItem) {
                            if (listItem.discount != undefined) {
                                $scope.totalDiscount = $scope.totalDiscount + listItem.discount;
                            }
                        });
                        return $scope.totalDiscount;
                    };

                    $scope.calTotalNetAmount = function () {
                        $scope.net = 0;
                        angular.forEach($scope.servicesBySlip, function (listItem) {
                            if (listItem.netPayable != undefined) {
                                $scope.net = $scope.net + parseFloat(listItem.netPayable);
                            }
                        });
                        var decimalPart = ($scope.net - Math.floor($scope.net));
                        var netAmount = "";
                        if (decimalPart >= 0.5) {
                            netAmount = Math.ceil($scope.net);
                        } else {
                            netAmount = Math.floor($scope.net);
                        }
                        return netAmount;
                    };

                    $scope.checkedBox = function (value, checkingValue) {
                        if (value == checkingValue) {
                            return true;
                        }
                        return false;
                    };
                    $scope.closeDialogs = function () {
                        $scope.Dialog.close();
                    };
                    $scope.oldSlip = "";

                    $scope.test = function (slipNo, index) {
                        console.log(slipNo + " : " + $scope.oldSlip);
                        var service = $scope.services.filter(function (service) {
                            return service.slipNo == slipNo;
                        });
                        if ($scope.oldSlip == "") {
                            $scope.oldSlip = slipNo;
                        }
                        if (slipNo != $scope.oldSlip) {
                            $scope.oldSlip = slipNo;
                        }
                        if (slipNo == $scope.oldSlip && service.length == 1) {
                            return true;
                        } else if (slipNo != $scope.oldSlip) {
                            return true;
                        } else {
                            return false;
                        }
                    };

                    var moneyReceipt = function () {
                        return patientService.moneyReceipt($scope.patientUuid).then(function (response) {
                            debugger;
                            $scope.services = response.data;
                            var clinicCode = $bahmniCookieStore.get(Bahmni.Common.Constants.clinicCookieName).clinicId;
                            angular.forEach($scope.services, function (service) {
                                if (service.clinicCode != clinicCode) {
                                    service.validMoneyReceiptHolder = false;
                                }
                                else {
                                    service.validMoneyReceiptHolder = true;
                                }
                            });
                            setTimeout(function () {
                               var table = angular.element("#table_id").DataTable({
                                        language: {
                                            emptyTable: "no service available", //
                                            loadingRecords: "Please wait .. ", // default Loading...
                                            zeroRecords: "No matching service found"
                                        },
                                        bFilter: true,
                                        bInfo: false,
                                        "order": [[0, "desc"]]
                                    }
                                );
                                angular.element("#search-date").on('keyup', function () {
                                    table
                                        .column(1)
                                        .search(this.value)
                                        .draw();
                                });
                                angular.element("#search-eslip").on('keyup', function () {
                                    table
                                        .column(2)
                                        .search(this.value)
                                        .draw();
                                });
                            }, 1000);
                        });
                    };
                    $scope.editMoneyReceipt = function (mid) {
                        if (mid == undefined) {
                            $state.go('patient.dashboard.show.observations', {
                                conceptSetGroupName: 'observations',
                                previousUrl: 'moneyreceipt'
                            });
                        }
                        else {
                            var filteringServicesBySlip = $scope.services.filter(function (service) {
                                return service.mid == mid;
                            });
                            $scope.restrictInactiveServicePreview(filteringServicesBySlip);
                            // if ($scope.inactiveServiceAvailable) {
                            //     messagingService.showMessage('error', "Inactive Service exist, Money receipt can not be submitted");
                            // }
                            // else {
                            //     $state.go('patient.dashboard.show.observations', {
                            //         conceptSetGroupName: 'observations',
                            //         previousUrl: 'moneyreceipt',
                            //         moneyReceiptObject: filteringServicesBySlip
                            //     });
                            // }
                        }
                    };

                    $scope.restrictInactiveServicePreview = function (moneyReceiptObject) {
                        var status = false;
                        patientService.getServices($scope.patient).then(function (response) {
                            $scope.serviceListAll = response.data;
                            $scope.serviceList = response.data.filter(function (item) {
                                return item.voided == false;
                            });
                            if (moneyReceiptObject) {
                                for (var j = 0; j < $scope.serviceListAll.length; j++) {
                                    for (var i = 0; i < moneyReceiptObject.length; i++) {
                                        if ($scope.serviceListAll[j].code == moneyReceiptObject[i].code && $scope.serviceListAll[j].voided == true) {
                                            status = true;
                                            messagingService.showMessage('error', "Service in this money receipt does not exist any more!");
                                            status = true;
                                            break;
                                        }
                                    }
                                }
                                if (!status) {
                                    $state.go('patient.dashboard.show.observations', {
                                        conceptSetGroupName: 'observations',
                                        previousUrl: 'moneyreceipt',
                                        moneyReceiptObject: moneyReceiptObject
                                    });
                                }
                            }
                        });
                    };

                    $scope.deleteMoneyReceipt = function (moneyReceiptId) {
                        ngDialog.openConfirm({
                            scope: $scope,
                            template: '../common/displaycontrols/patientprofile/views/moneyReceiptDeleteConfirmation.html'
                        }).then(function (confirm) {
                            patientService.deleteMoneyReceipt(moneyReceiptId).then(function (response) {
                                if (response.data.isSuccessfull) {
                                    messagingService.showMessage("info", "Money Receipt Deleted Successfully");
                                    //angular.element("#table_id").DataTable().clear().destroy();
                                    $state.go("patient.dashboard.show", {
                                            patientUuid: $scope.patient.uuid
                                        }, {reload: true}
                                    );
                                }
                                else {
                                    messagingService.showMessage('error', response.data.message);
                                }

                            });
                        }, function (reject) {
                            return $q.reject();
                        });

                    };

                    var assignAdmissionDetails = function () {
                        var REP = "custom:(attributes:(value,attributeType:(display,name)))";
                        var ADMISSION_STATUS_ATTRIBUTE = "Admission Status";
                        return visitService.getVisit($scope.visitUuid, REP).then(function (response) {
                            var attributes = response.data.attributes;
                            var admissionStatus = _.find(attributes, {attributeType: {name: ADMISSION_STATUS_ATTRIBUTE}});
                            $scope.hasBeenAdmitted = isAdmitted(admissionStatus);
                        });
                    };
                    var setHasBeenAdmittedOnVisitUuidChange = function () {
                        $scope.$watch('visitUuid', function (visitUuid) {
                            if (!_.isEmpty(visitUuid)) {
                                assignAdmissionDetails();
                            }
                        });
                    };
                    var setDirectiveAsReady = function () {
                        $scope.isDirectiveReady = true;
                    };
                    var onDirectiveReady = function () {
                        $scope.addressLine = getAddress($scope);
                        $scope.patientAttributeTypes = $sce.trustAsHtml(getPatientAttributeTypes($scope));
                        $scope.showBirthDate = $scope.config.showDOB !== false;
                        $scope.showBirthDate = $scope.showBirthDate && !!$scope.patient.birthdate;
                    };
                    var initPromise = $q.all([assignPatientDetails(), assignRelationshipDetails(), moneyReceipt()]);
                    initPromise.then(onDirectiveReady);
                    initPromise.then(setHasBeenAdmittedOnVisitUuidChange);
                    initPromise.then(setDirectiveAsReady);
                    $scope.initialization = initPromise;
                };

                var link = function ($scope, element) {
                    spinner.forPromise($scope.initialization, element);
                };

                return {
                    restrict: 'E',
                    controller: controller,
                    link: link,
                    scope: {
                        patientUuid: "@",
                        visitUuid: "@",
                        config: "="
                    },
                    templateUrl: "../common/displaycontrols/patientprofile/views/patientProfile.html"
                };
            }]);
})();
