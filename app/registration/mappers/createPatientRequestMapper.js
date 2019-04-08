'use strict';

Bahmni.Registration.CreatePatientRequestMapper = (function () {
    function CreatePatientRequestMapper (currentDate) {
        this.currentDate = currentDate;
    }

    CreatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, patient) {
        var constants = Bahmni.Registration.Constants;
        var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
        var identifiers = _.filter(allIdentifiers, function (identifier) {
            return !_.isEmpty(identifier.selectedIdentifierSource) || (identifier.identifier !== undefined);
        });
        identifiers = _.map(identifiers, function (identifier) {
            return {
                identifier: identifier,
                identifierSourceUuid: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.uuid : undefined,
                identifierPrefix: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.prefix : undefined,
                identifierType: identifier.identifierType,
                preferred: identifier.preferred,
                voided: identifier.voided
            };
        });
        var openMRSPatient = {
            patient: {
                person: {
                    names: [
                        {
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            display: patient.givenName + (patient.familyName ? " " + patient.familyName : ""),
                            "preferred": false
                        }
                    ],
                    addresses: [_.pick(patient.address, constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated,
                    gender: patient.gender,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    personDateCreated: patient.registrationDate,
                    attributes: new Bahmni.Common.Domain.AttributeFormatter().getMrsAttributes(patient, patientAttributeTypes),
                    dead: patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : '',
                    uuid: patient.uuid
                },
                identifiers: [{"identifier": "", "identifierType": "Patient_Identifier", "preferred": true, "voided": false }],
                uuid: patient.uuid
            }
        };

        console.log(":attribute" + openMRSPatient.patient.person.attributes);
        var i = 0;
        for (i = 0; i < openMRSPatient.patient.person.attributes.length; i++) {
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "RiskyHabit") {
                if (this.getStringFromJsonArray(patient.riskyHabit)) {
                    openMRSPatient.patient.person.attributes[i].value = this.getStringFromJsonArray(patient.riskyHabit);
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "Disease_status") {
                if (this.getStringFromJsonArray(patient.diseaseStatus) && patient.showDiseaseStatus == true) {
                    var d = this.getStringFromJsonArray(patient.diseaseStatus);
                    console.log(d);
                    console.log(patient.showDiseaseStatus);
                    openMRSPatient.patient.person.attributes[i].value = this.getStringFromJsonArray(patient.diseaseStatus);
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "family_diseases_details") {
                if (this.getStringFromJsonArray(patient.familyDiseaseHistory)) {
                    openMRSPatient.patient.person.attributes[i].value = this.getStringFromJsonArray(patient.familyDiseaseHistory);
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "nationalId") {
                if (patient.nationalIdCheckbox == true && patient.noidCheckbox == false) {
                    openMRSPatient.patient.person.attributes[i].value = patient.nationalId;
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "nationalIdCheckbox") {
                openMRSPatient.patient.person.attributes[i].value = patient.nationalIdCheckbox;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "birthRegistrationID") {
                if (patient.nationalIdCheckbox == true && patient.noidCheckbox == false) {
                    openMRSPatient.patient.person.attributes[i].value = patient.brid;
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "bridCheckbox") {
                openMRSPatient.patient.person.attributes[i].value = patient.bridCheckbox;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "epicardnumber") {
                if (patient.nationalIdCheckbox == true && patient.noidCheckbox == false) {
                    openMRSPatient.patient.person.attributes[i].value = patient.epi;
                } else {
                    openMRSPatient.patient.person.attributes[i].voided = true;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "epiCheckbox") {
                openMRSPatient.patient.person.attributes[i].value = patient.epiCheckbox;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "showRiskyHabits") {
                openMRSPatient.patient.person.attributes[i].value = patient.showRiskyHabits;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "noidCheckbox") {
            }
/*            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "diseaseStartIndex") {
                openMRSPatient.patient.person.attributes[i].value = patient.diseaseStartIndex;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "diseaseEndIndex") {
                openMRSPatient.patient.person.attributes[i].value = patient.diseaseEndIndex;
            } */
        }
        console.log(openMRSPatient);

        this.setImage(patient, openMRSPatient);
        openMRSPatient.relationships = patient.relationships;
        return openMRSPatient;
    };

    CreatePatientRequestMapper.prototype.setImage = function (patient, openMRSPatient) {
        if (patient.getImageData()) {
            openMRSPatient.image = patient.getImageData();
        }
    };

    CreatePatientRequestMapper.prototype.getBirthdate = function (birthdate, age) {
        var mnt;
        if (birthdate) {
            mnt = moment(birthdate);
        } else if (age !== undefined) {
            mnt = moment(this.currentDate).subtract('days', age.days).subtract('months', age.months).subtract('years', age.years);
        }
        return mnt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    };

    CreatePatientRequestMapper.prototype.getStringFromJsonArray = function (jsonArray) {
        var jsonArrayList = "";
        var keys = [];
        for (var k in jsonArray) {
            if (jsonArray[k] == true) {
                keys.push(k);
            }
        }
        jsonArrayList = keys.join();
        return jsonArrayList;
    };

    return CreatePatientRequestMapper;
})();
