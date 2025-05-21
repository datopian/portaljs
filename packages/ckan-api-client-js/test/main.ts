import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import CkanRequest, { CkanRequestError } from "../";

describe("CkanRequest", () => {
  describe("GET", () => {
    it("returns results for valid responses", async () => {
      const result = await CkanRequest.get("status_show");
      expect(result.success).to.be.eq(true);
    }).timeout(10000);

    it("throws CkanRequestError for Not Found errors", async () => {
      const result = CkanRequest.get("package_show?id=1");
      await expect(result).to.be.rejectedWith(CkanRequestError);

      try {
        await result;
      } catch (e) {
        console.log(e);
        expect(e.message).to.be.eq("Not found");
      }
    }).timeout(10000);

    it("throws CkanRequestError for Bad Request errors", async () => {
      const result = CkanRequest.get("inexistent_endpoint?id=1");
      await expect(result).to.be.rejectedWith(CkanRequestError);

      try {
        await result;
      } catch (e) {
        expect(e.message).to.be.eq("An unknown error happened");
      }
    }).timeout(10000);
  });

  describe("POST", () => {
    it("throws CkanRequestError for Authorization errors", async () => {
      const result = CkanRequest.post("organization_create", {
        json: { name: "test" },
      });
      await expect(result).to.be.rejectedWith(CkanRequestError);

      try {
        await result;
      } catch (e) {
        expect(e.message.startsWith("Access denied")).to.be.eq(true);
      }
    }).timeout(10000);
  });
});
