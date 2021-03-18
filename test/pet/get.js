const expect = require("chai").expect;
const request = require("supertest");
const petUrl = "https://petstore.swagger.io/v2/pet/";

describe("GET::/pet/$petId", function () {
  describe("Get request for non-existing petId", function () {
    it("Delete pet data in case when it already exists", function (done) {
      request(petUrl)
        .delete("100")
        .then((res) => {
          expect(res.status).to.be.oneOf([200, 404]);
          done();
        });
    });

    it("Send request and should receive a response with Pet not found", function (done) {
      request(petUrl)
        .get("100")
        .expect(404)
        .then((res) => {
          expect(res.body.message).to.be.eql("Pet not found");
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("Request with empty parameter", function () {
    it("Should receive a validation error response", function (done) {
      request(petUrl)
        .get("")
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid ID supplied");
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("Request with invalid string parameter", function () {
    it("Should receive a validation error response", function (done) {
      request(petUrl)
        .get("ABC")
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid ID supplied");
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("Request with overflowed value", function () {
    it("Should receive a validation error response", function (done) {
      request(petUrl)
        .get("9223372036854775808")
        .expect(400)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid ID supplied");
          done();
        })
        .catch((err) => done(err));
    });
  });
});

describe("GET::/pet/findByStatus", function () {
  describe("Filtering with valid status:'available'", function () {
    it("Should receive a succsessful response", function (done) {
      request(petUrl)
        .get("findByStatus?status=available")
        .expect(200)
        .then((res) => {
          expect(res.body)
            .to.be.an.instanceof(Array)
            .and.to.have.property(0)
            .that.includes.all.keys([
              "id",
              "category",
              "name",
              "photoUrls",
              "tags",
              "status",
            ]);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("Filtering with non-existing status", function () {
    it("Should receive a succsessful response", function (done) {
      request(petUrl)
        .get("findByStatus?status=" + Math.random().toString(16).substr(2, 8))
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.an.instanceof(Array).to.have.lengthOf(0);
          done();
        })
        .catch((err) => done(err));
    });
  });
});
