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
  describe("Add a new pet with all request fields present", function () {
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
        .catch((err) => expect.fail(err));
    });

    it("Confirm the newly added pet information", async function () {
      await request(petUrl)
        .get(newPet.id.toString())
        .expect(200)
        .then((res) => {
          expect(res.body).to.containSubset(newPet);
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Add a new pet with empty fields", function () {
    let id = 0;
    after(async function () {
      await deletePet(id.toString());
      await checkPetNotExist(id.toString());
    });

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
        .catch((err) => expect.fail(err));
    });
  });

  describe("Add a new pet when an existing pet with the same ID already exists", function () {
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
        .catch((err) => expect.fail(err));
    });

    it("Add Pet1 again expecting error code 405 to be returned", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid input");
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Request with missing json body", function () {
    it("Should receive an unsuccessful response from API ", async function () {
      await request(petUrl)
        .post("")
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Request with invalid request header", function () {
    it("Should receive an unsuccessful response from API ", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPet))
        .set("content-type", "application/xml")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Request with unexpected fields in json request body", function () {
    let id = 0;
    after(async function () {
      await deletePet(id.toString());
      await checkPetNotExist(id.toString());
    });

    it("Should receive a successful response as API should ignore the unexpected fields", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify({ test: "test" }))
        .set("content-type", "application/json")
        .expect(200)
        .then((res) => {
          expect(res.body.id).to.be.a("number");
          id = res.body.id;
        })
        .catch((err) => expect.fail(err));
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

    it("Should receive a 405 error response", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPetWithInvalidValue))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid input");
        })
        .catch((err) => expect.fail(err));
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

    it("Should receive a 405 error response", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(newPetWithOverflowedValue))
        .set("content-type", "application/json")
        .expect(405)
        .then((res) => {
          expect(res.body.message).to.be.eql("Invalid input");
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Request with invalid json format", function () {
    const invalidJson = "{Invalid json}";

    it("Should receive an unsuccessful response from API'", async function () {
      await request(petUrl)
        .post("")
        .send(JSON.stringify(invalidJson))
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => expect.fail(err));
    });
  });

  describe("Request with unexpected parameter in the URL", function () {
    it("Response should receive an unsuccessful response from API'", async function () {
      await request(petUrl)
        .post(newPet.id.toString())
        .send(newPet)
        .set("content-type", "application/json")
        .then((res) => {
          expect(res.status).to.be.at.least(400);
        })
        .catch((err) => expect.fail(err));
    });
  });
});
