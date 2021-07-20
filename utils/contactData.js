const { Validation } = require('../utils/validation');

const TERMS = { Spring: 'May 13', Summer: 'August 23', Fall: 'December 16', Winter: 'January 12' }

class Contact {
    constructor(psid = '', email = '', phoneNumber = '', firstName = '', lastName = '', shirtSize = '', contactsAdded = '', transactionHistory = [], membershipStart = {}, membershipEnd = {}) {
        this.psid = psid;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.shirtSize = shirtSize;
        this.contactsAdded = contactsAdded;
        this.transactionHistory = transactionHistory;
        this.membershipStart = membershipStart;
        this.membershipEnd = membershipEnd;
        this.member = this.isMember();
    }

    isValid() { return Validation.PSID.test(this.psid) && Validation.EMAIL.test(this.email); }

    isMember() {
        if ( !this.isValid() || !this.membershipEnd ) return false;
        const today = new Date();
        const expiration = new Date( TERMS[this.membershipEnd.Term] + ', ' + this.membershipEnd.Year );
        return today <= expiration;
    }

    json() {
        return {
            'PSID': this.psid,
            'Email': this.email,
            'Phone Number': this.phoneNumber,
            'First Name': this.firstName,
            'Last Name': this.lastName,
            'Shirt Size': this.shirtSize,
            'Contact Added': this.contactsAdded,
            'Transaction History': this.transactionHistory,
            'Membership Start': this.membershipStart,
            'Membership End': this.membershipEnd,
            'Membership Status': this.isMember()
        };
    }

    getName() { return this.firstName + ' ' + this.lastName; }
}

module.exports = { Contact };