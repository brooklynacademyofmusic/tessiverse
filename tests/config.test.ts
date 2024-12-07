import { PlanStepConfig, User } from "$lib/user";
import { test, expect, describe, vi } from "vitest";
import { SecretClient } from "@azure/keyvault-secrets"
import { HttpResponse } from "@azure/functions";
const TESSI_API_URL = process.env.TESSI_API_URL

describe("UserConfig", () => {
    let user = new User("me@test.com")
    user.group = "group"
    user.location = "location"
    user.userid = "me"

    test("UserConfig constructor can hold app config and returns auth info", () => {
        expect(user).toHaveProperty("apps")
        expect(user.auth).toBe(TESSI_API_URL + "|me|group|location")
    })

    test("loadFromAzure throws error if data does not exist in Azure", async () => {
        let user = new User("not_me@test.com")
        await expect(user.load()).rejects.toMatchObject({status: 404})
    })

    test("saveToAzure creates a new secret", async () => {
        user.apps.planstep = new PlanStepConfig()
        return expect(user.save()).resolves.toBe(user)
    })

    test("loadFromAzure returns a matching secret", async () => {
        let user2 = new User("me@test.com")
        return expect(user2.load()).resolves.toEqual(user)
    })

    test("loadFromAzure throws error if secret does not match identity", async () => {
        SecretClient.prototype.getSecret = vi.fn(async () => 
             {return {
                properties: {
                    tags: {identity: "bad_user@test.com"},
                    vaultUrl: "",   
                    name: ""         
                },
                name: ""
            }})
        const consoleSpy = vi.spyOn(console, 'log')
        await expect(user.load()).rejects.toMatchObject({status: 500})
        expect(consoleSpy).toHaveBeenCalledOnce()
        expect(consoleSpy.mock.calls[0].toString()).toMatch(/Hash collision/)
    })


})