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

describe("PUT::/pet", function () {
  describe("Update existing pet with all request fields", function () {
    after(async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    it("Add a new pet for test", async function () {
      await addNewPet(newPet);
      await checkPetExist(newPet.id.toString());
    });

    let updatedPet;
    it("The pet data should be successfully updated", async function () {
      updatedPet = cloneDeep(newPet);
      updatedPet.category.id = 1;
      updatedPet.category.name = "Dog";
      updatedPet.name = "Bulldog";
      updatedPet.tags.id = 1;
      updatedPet.tags.name = "my_dog_tag";
      updatedPet.status = "sold";

      await request(petUrl)
        .put("")
        .send(JSON.stringify(updatedPet))
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(updatedPet);
          expect(res.header).to.have.property(
            "content-type",
            "application/json"
          );
        })
        .catch((err) => assert.fail(err));
    });

    it("Confirm the updated pet data", async function () {
      await request(petUrl)
        .get(newPet.id.toString())
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(updatedPet);
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Update non-existing petId", function () {
    it("Delete pet data in case when it already exists", async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });

    it("Send request and should receive a response with Pet not found", async function () {
      await request(petUrl)
        .put("")
        .send(newPet)
        .set("content-type", "application/json")
        .expect(404)
        .then((res) => {
          expect(res.body.message).to.be.eql("Pet not found");
        })
        .catch((err) => assert.fail(err));
    });
  });

  describe("Update pet with empty fields", function () {
    it("Add a new pet for test", async function () {
      await addNewPet(newPet);
      await checkPetExist(newPet.id.toString());
    });

    it("Send request and should receive a validation error response", async function () {
      await request(petUrl)
        .put("")
        .send(JSON.stringify({}))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Validation exception");
        })
        .catch((err) => assert.fail(err));
    });

    it("Delete the added pet for test", async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });
  });

  describe("Invalid value in netsted json fields", function () {
    it("Add a new pet for test", async function () {
      await addNewPet(newPet);
      await checkPetExist(newPet.id.toString());
    });

    it("Send request and sould receive a validation error response", async function () {
      let updatedPet = cloneDeep(newPet);
      updatedPet.tags.id = "ABC";

      await request(petUrl)
        .put("")
        .send(updatedPet)
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Validation exception");
        })
        .catch((err) => assert.fail(err));
    });

    it("Delete the added pet for test", async function () {
      await deletePet(newPet.id.toString());
      await checkPetNotExist(newPet.id.toString());
    });
  });
});
