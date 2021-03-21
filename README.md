# Test_March2021

This is the automated API tests repository for testing [Petstore API](https://petstore.swagger.io/) as part of the Technical Assessments.

## Requirements

You will need the following tools to run the automated tests.

- Node.js: v12.13.0
- npm: v6.12.0

After cloning this repository run the following command in the repository folder to install the required libraries.

```
$ npm install
```

## Run test

Run this command in the repository folder to perform the automated tests.

```
$ npm run test
```

## Notes for the test cases that has the FAILED status result

### DELETE::/pet/$petId

1. Delete petId non-existent pet data
   - Should receive a 404 error response </br>
     <span style="color:lightblue">--> _Received expected error status code but there was no body in the response. Failed to assert the expected message in the response body._</span>

### GET::/pet/$petId

1. Request with invalid string parameter
   - Should receive a 400 error response </br>
     <span style="color:lightblue">--> _Expected status code 400 but the actual result was 404.</br>
     Expected API to check for invalid string value in ${petId} parameter._</span>
1. Request with overflowed value
   - Should receive a 400 error response </br>
     <span style="color:lightblue">--> _Expected status code 400 but the actual result was 404.</br>
     Expected API to check invalid overflowed value of 64bit integer in `{petId}` parameter._</span>

### POST::/pet

1. Add a new pet when an existing pet with the same ID already exists
   - Adding a pet with an existing ID should result in error code 405 to be returned </br>
     <span style="color:lightblue">--> _Expected status code 405 but the actual result was 200.</br>
     Expected API to check for existing data before adding a new pet with existing petId._</span>
1. Request with invalid value in json request body
   - Should receive a 405 error response </br>
     <span style="color:lightblue">--> _Expected status code 405 but the actual result was 200.</br>
     Expected the API to perform input validation for invalid values (e.g. `{"id": -1}`) in the request body._</span>
1. Request with overflowed value in id
   - Should receive a 405 error response </br>
     <span style="color:lightblue">--> _Expected status code 405 but the actual result was 500.</br>
     Expected the API to perform validation checks for the values in the request body._</span>

### PUT::/pet

1. Update non-existent petId
   - Send PUT request and should receive a 404 error response</br>
     <span style="color:lightblue">--> _Expected status code 404 but the actual result was 200.</br>
     Expected API to not perform any updates when requested petId does not exist._</span>
1. Update pet with empty fields in the body
   - Send PUT request and should receive a 405 error response</br>
     <span style="color:lightblue">--> _Expected status code 405 but the actual result was 200.</br>
     Expected the API to perform validation for the required values (such as `id`) in request body fields._</span>
1. Invalid value in nested json fields
   - Send PUT request and should receive a 405 error response</br>
     <span style="color:lightblue">--> _Expected status code 405 but the actual result was 200.</br>
     Expected the API to perform validation for the values in the nested fields in the request body._</span>

## Possible tests that can be performed but not created due to time constraints

- Security tests such as SQL injection and token validation
- Performance tests
- Concurancy test which involves sending POST/PUT/DELETE request to the same petId at the same time
