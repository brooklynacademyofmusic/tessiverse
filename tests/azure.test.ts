import { User } from "$lib/user";
import { test, expect, describe, vi } from "vitest";
import { SecretClient } from "@azure/keyvault-secrets"
import { Azure } from "$lib/azure";

describe("Azure", () => {
    let user = new User({identity: "me@test.com"})


    test("loadFromAzure throws error if data does not exist in Azure", async () => {
        let azure = new Azure()
        let user = azure.load({identity:"not_me@test.com"})
        await expect(user).rejects.toMatchObject({status: 404})
    })

    test("saveToAzure creates a new secret", async () => {
        let azure = new Azure()
        await expect(azure.save({identity: user.identity}, user)).resolves.not.toThrowError()
    })

    test("loadFromAzure returns a matching secret", async () => {
        let user2 = new User({identity: "me@test.com"})
        let azure = new Azure()
        await expect(azure.load({identity: user2.identity})).resolves.toEqual(JSON.parse(JSON.stringify(user)))
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
        let azure = new Azure()
        const consoleSpy = vi.spyOn(console, 'log')
        await expect(azure.load({identity: user.identity})).rejects.toMatchObject({status: 500, body: {message: "Hash collision PANIC!"}})
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0].toString()).toMatch(/Hash collision/)
    })


})