# CougarCS API Reference
Authored by Nykolas Farhangi (nykolasfarhangi@gmail.com) for CougarCS <br>
Last updated: 5/11/21

## Base URL:
https://pxgy8jxap6.execute-api.us-east-1.amazonaws.com/dev/

## /
**GET**
* Description: Returns status of website
```
curl -XGET '{{ BASE_URL }}'
```

## /login
**POST**
* Description: Get access token
* Body: accessKeyID, secretAccessKey
* Response:
    * { "token": "<ACCESS_TOKEN>" } 
```
curl -XPOST -d '{"accessKeyID":"", "secretAccessKey":""}' '{{ BASE_URL }}/login'
```

## /contact
**GET**
* Description: Get contact information
* Authorization: Bearer Token Required
* Query Parameters:
    * psid: Optional
    * email: Optional
* Response: { "PSID": #######, ... }
```
curl -XGET -H 'Authorization: Bearer {{ ACCESS_TOKEN }}' '{{ BASE_URL }}/contact?psid=#######&email=e@mail.com'
```

**POST**
* Description: Create/update contact information
* Authorization: Bearer Token Required
* Body:
    * transaction: Required
    * psid: Required for create, cannot be updated
    * email: Required for create
    * firstName: Required for create
    * lastName: Required for create
    * phoneNumber
    * shirtSize
    * membershipStart
    * membershipEnd
* Response: { \<Contact Object\> }
```
curl -XPOST -H 'Authorization: Bearer {{ ACCESS_TOKEN }}' -d '{"transaction":"", "psid":"", "email":"", "firstName":"", "lastName":""}' '{{ BASE_URL }}/contact'
```

**DELETE**
* Description: Deletes the contact with specified PSID if they exist
* Authorization: Bearer Token Required
* Query Parameters:
    * psid: Optional
    * email: Optional
* Response: { "message": "Contact \<PSID\> was successfully deleted!"}
```
curl -XDELETE -H 'Authorization: Bearer {{ ACCESS_TOKEN }}' '{{ BASE_URL }}/contact?psid=#######&email=e@mail.com'
```

## /contact/status
**GET**
* Description: Get contact membership status
* Query Parameters:
    * psid: Optional
    * email: Optional
* Response: { "PSID": "#######", "First Name": "", "Last Name": "", "Membership Status": bool }
```
curl -XGET '{{ BASE_URL }}/contact/status?psid=#######&email=e@mail.com'
```

## /contacts
**GET**
* Description: Returns a list of all contacts
* Authorization: Bearer Token Required
* Response: { "size": int, "contacts": [ { \<Contact Object\> } ] }
```
curl -XGET -H 'Authorization: Bearer {{ ACCESS_TOKEN }}' '{{ BASE_URL }}/contacts'
```