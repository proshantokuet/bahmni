'use strict';

angular.module('bahmni.registration')
    .factory('patient', ['age', 'identifiers', function (age, identifiers) {
        var create = function () {
            var calculateAge = function () {
                if (this.birthdate) {
                    this.age = age.fromBirthDate(this.birthdate);
                    var splitedDate = this.birthdate.split('/');
                    var finalizedSplitedDate = new Date(splitedDate[1] + "/" + splitedDate[0] + "/" + splitedDate[2]);
                    this.age = age.fromBirthDate(finalizedSplitedDate);
                } else {
                    this.age = age.create(null, null, null);
                }
            };

            var calculateBirthDate = function () {
                this.birthdate = age.calculateBirthDate(this.age);
                var date = age.calculateBirthDate(this.age),
                    yr = date.getFullYear(),
                    month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
                    day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
                    newDate = day + '/' + month + '/' + yr;
                this.birthdate = newDate;
            };

            var fullNameLocal = function () {
                var givenNameLocal = this.givenNameLocal || this.givenName || "";
                var middleNameLocal = this.middleNameLocal || this.middleName || "";
                var familyNameLocal = this.familyNameLocal || this.familyName || "";
                return (givenNameLocal.trim() + " " + (middleNameLocal ? middleNameLocal + " " : "") + familyNameLocal.trim()).trim();
            };

            var getImageData = function () {
                return this.image && this.image.indexOf('data') === 0 ? this.image.replace("data:image/jpeg;base64,", "") : null;
            };

            var identifierDetails = identifiers.create();

            var patient = {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                image: '../images/blank-user.gif',
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                deletedRelationships: [],
                calculateBirthDate: calculateBirthDate,
                birthRank: "",
                uic: "____________",
                birthMothersFirstName: "",
                birthDistrict: { districtName: "ABC", uuid: ""},
                birthUpazilla: ""
            };
            return _.assign(patient, identifierDetails);
        };

        return {
            create: create
        };
    }]);
