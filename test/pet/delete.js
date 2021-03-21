/* eslint-disable mocha/no-hooks-for-single-case */
const request = require("supertest");
const chai = require("chai");
const { expect } = require("chai");
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

async function addNewPet(jsonObj) {
  let id = 0;
  await request(petUrl)
    .post("")
    .send(JSON.stringify(jsonObj))
    .set("content-type", "application/json")
    .expect(200)
    .then((res) => {
      id = res.body.id;
    });
  return id;
}

async function checkPetExist(id) {
  await request(petUrl).get(id).expect(200);
}

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

describe("DELETE::/pet/$petId", function () {
  describe("Delete with valid petId and api_key", function () {
    it("Add a new pet", async function () {
      await addNewPet(newPet);
      await checkPetExist(newPet.id.toString());
    });

    it("Send DELETE request and should receive a successful response", async function () {
      await request(petUrl)
        .delete(newPet.id.toString())
        .set("api_key", "special-key")
        .expect(200)
        .then((res) => {
          expect(res.header).to.have.property(
            "content-type",
            "application/json"
          );
        });
    });

    it("Try to GET the deleted pet data", async function () {
      await checkPetNotExist(newPet.id.toString());
    });
  });

  describe("Send DELETE request for valid petId but without api_key", function () {
    it("Add a new pet", async function () {
      await addNewPet(newPet);
      await checkPetExist(newPet.id.toString());
    });

    it("Send DELETE request and should receive a response with successful status code", async function () {
      await request(petUrl)
        .delete(newPet.id.toString())
        .expect(200)
        .catch((err) => expect.fail(err));
    });
  });

  describe("Delete petId non-existent pet data", function () {
    before(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    it("Should receive a 404 error response", async function () {
      await request(petUrl)
        .delete(newPet.id.toString())
        .set("api_key", "special-key")
        .expect(404)
        .then((res) => {
          expect(res.body.message).to.be.eql("Pet not found");
        })
        .catch((err) => expect.fail(err));
    });
  });
});
