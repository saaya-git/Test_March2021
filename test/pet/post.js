const cloneDeep = require("lodash.clonedeep");
const request = require("supertest");
const chai = require("chai");
const { assert, expect } = require("chai");
const chaiSubset = require("chai-subset");

chai.use(chaiSubset);
const petUrl = "https://petstore.swagger.io/v2/pet/";

const newPet = {
  id: 100,
  category: {
    id: 0,
    name: "Cat",
  },
  name: "Pet",
  photoUrls: ["url"],
  tags: [
    {
      id: 0,
      name: "my_tag",
    },
  ],
  status: "available",
};

async function deletePet(id) {
  await request(petUrl)
    .delete(id)
    .then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
}

async function checkPetNotExist(id) {
  await request(petUrl)
    .get(id)
    .expect(404)
    .then((res) => {
      expect(res.body.message).to.be.eql("Pet not found");
    });
}

describe("POST::/pet", function () {
  describe("Add a new pet with all request fields", function () {
    before(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    after(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    it("New pet should be added successfully", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet))
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(newPet);
          expect(res.header).to.have.property(
            "content-type",
            "application/json"
          );
        })
        .catch((err) => assert.fail(err));
    });

    it("Comfirm the added pet information", async function () {
      await request(petUrl)
        .get(newPet.id.toString())
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(newPet);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Add a new pet with empty fields", function () {
    let id = 0;
    it("New pet should be added successfully", async function () {
      await request(petUrl)
        .post("")
        .send({})
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body.id).to.be.a("number");
          id = res.body.id;
        })
        .catch((err) => assert.fail(err));
    });

    it("Delete the added pet for test", async function () {
      await deletePet(id.toString());
      await checkPetNotExist(id.toString());
    });
  });

  describe("POST request fields have duplicated data with existing data", function () {
    before(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    after(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    it("Pet1 should be added successfully", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet))
        .set("content-type", "application/json")
        .expect(200)
        .catch((err) => assert.fail(err));
    });

    it("Add pet data with same id and it should be added successfully", async function () {
      let newPet2 = cloneDeep(newPet);
      newPet2.name = "Pet2";

      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet2))
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(newPet2);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with missing json body", function () {
    it("Should not receive a response with successful status code", async function () {
      await request(petUrl)
        .post("")
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with invalid request header", function () {
    it("Should not receive a response with successful status code", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet))
        .set("content-type", "application/xml")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with unexpected fields in json request body", function () {
    let id = 0;
    it("Should receive a succsessful response", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify({ test: "test" }))
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body.id).to.be.a("number");
          id = res.body.id;
        })
        .catch((err) => assert.fail(err));
    });

    it("Delete added pet", async function () {
      await deletePet(id.toString());
      await checkPetNotExist(id.toString());
    });
  });

  describe("Request with invalid value in json request body", function () {
    const newPetWithInvalidValue = {
      id: -1, //invalid value
      category: {
        id: 0,
        name: "Cat",
      },
      name: "Pet1",
      photoUrls: ["url"],
      tags: [
        {
          id: 0,
          name: "my_tag",
        },
      ],
      status: "available",
    };

    it("Should receive a validation error response", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPetWithInvalidValue))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid input");
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with overflowed value in id", function () {
    const newPetWithOverflowedValue = {
      id: 9223372036854775808, //overflowed value
      category: {
        id: 0,
        name: "Cat",
      },
      name: "Pet",
      photoUrls: ["url"],
      tags: [
        {
          id: 0,
          name: "my_tag",
        },
      ],
      status: "available",
    };

    it("Should receive an validation error response", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPetWithOverflowedValue))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid input");
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with invalid json format", function () {
    const invalidJson = "{Invalid json}";

    it("Should not receive a response with successful status code'", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(invalidJson))
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Request with unexpected parameter", function () {
    it("Response should not have successful status code'", async function () {
      await request(petUrl)
        .post(newPet.id.toString())
        .send(newPet)
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => assert.fail(err));
    });
  });
});
