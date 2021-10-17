'use strict';

Bahmni.Registration.CreatePatientRequestMapper = (function () {
    function CreatePatientRequestMapper (currentDate) {
        this.currentDate = currentDate;
    }

    CreatePatientRequestMapper.prototype.mapFromPatient = function (patientAttributeTypes, patient, cookieObj) {
        var constants = Bahmni.Registration.Constants;
        var allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier);
        var identifiers = _.filter(allIdentifiers, function (identifier) {
            return !_.isEmpty(identifier.selectedIdentifierSource) || (identifier.identifier !== undefined);
        });
        identifiers = _.map(identifiers, function (identifier) {
            return {
                identifier: identifier.identifier,
                identifierSourceUuid: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.uuid : undefined,
                identifierPrefix: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.prefix : undefined,
                identifierType: identifier.identifierType.uuid,
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
        for (var i = 0; i < openMRSPatient.patient.person.attributes.length; i++) {
            debugger
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "district") {
                if(patient.birthDistrict) {
                    openMRSPatient.patient.person.attributes[i].value = patient.birthDistrict.districtName;
                    openMRSPatient.patient.person.attributes[i].voided = false;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "upazilla") {
                if(patient.birthUpazilla) {
                    openMRSPatient.patient.person.attributes[i].value = patient.birthUpazilla.upazillaName;
                    openMRSPatient.patient.person.attributes[i].voided = false;
                }
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "union") {
                if(patient.union) {
                    openMRSPatient.patient.person.attributes[i].value = patient.union.unionName;
                    openMRSPatient.patient.person.attributes[i].voided =  false;
                 }
            }

            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "clinicCode") {
                openMRSPatient.patient.person.attributes[i].value = cookieObj.clinicId;
		 openMRSPatient.patient.person.attributes[i].voided =  false;
            }
            if (openMRSPatient.patient.person.attributes[i].attributeType.name == "clinicName") {
                openMRSPatient.patient.person.attributes[i].value = cookieObj.clinicName;
		 openMRSPatient.patient.person.attributes[i].voided =  false;
            }
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

    return CreatePatientRequestMapper;
})();
