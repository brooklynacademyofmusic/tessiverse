import 'dotenv/config'
import { PlanStepConfig, UserConfig } from "../src/functions/config";
import { test, expect, describe, jest } from "@jest/globals";
import { SecretClient } from "@azure/keyvault-secrets"

describe("UserConfig", () => {
    let user = new UserConfig("me@test.com")
    user.group = "group"
    user.location = "location"
    user.userid = "me"

    test("UserConfig constructor can hold app config and returns auth info", () => {
        expect(user).toHaveProperty("apps")
        expect(user.auth).toBe("|me|group|location")
    })

    test("loadFromAzure throws error if data does not exist in Azure", async () => {
        let user = new UserConfig("not_me@test.com")
        let error = await user.loadFromAzure().catch((e) => e)
        expect(error).toBeInstanceOf(Error)
        expect(error.details.error.code).toBe("SecretNotFound")
    })

    test("saveToAzure creates a new secret", async () => {
        user.apps.planstep = new PlanStepConfig()
        return expect(user.saveToAzure()).resolves.toBe(user)
    })

    test("loadFromAzure returns a matching secret", async () => {
        let user2 = new UserConfig("me@test.com")
        return expect(user2.loadFromAzure()).resolves.toEqual(user)
    })

    test("loadFromAzure throws error if secret does not match identity", async () => {
        SecretClient.prototype.getSecret = jest.fn(async () => 
             {return {
                properties: {
                    tags: {identity: "bad_user@test.com"},
                    vaultUrl: "",   
                    name: ""         
                },
                name: ""
            }})
        let error = await user.loadFromAzure().catch((e) => e)
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toMatch("Hash collision")
        return error
    })


})