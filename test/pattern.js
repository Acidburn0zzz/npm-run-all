/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert")
const nodeApi = require("../lib")
const BufferStream = require("./lib/buffer-stream")
const util = require("./lib/util")
const result = util.result

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[pattern] it should run matched tasks if glob like patterns are given.", () => {
    util.moveToWorkspace()

    beforeEach(util.removeResult)

    describe("\"test-task:append:*\" to \"test-task:append:a\" and \"test-task:append:b\"", () => {
        it("Node API", async () => {
            await nodeApi("test-task:append:*")
            assert(result() === "aabb")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:append:*"])
            assert(result() === "aabb")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:append:*"])
            assert(result() === "aabb")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:append:*"])
            assert(
                result() === "abab" ||
                result() === "abba" ||
                result() === "baba" ||
                result() === "baab"
            )
        })
    })

    describe("\"test-task:append:**:*\" to \"test-task:append:a\", \"test-task:append:a:c\", \"test-task:append:a:d\", and \"test-task:append:b\"", () => {
        it("Node API", async () => {
            await nodeApi("test-task:append:**:*")
            assert(result() === "aaacacadadbb")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:append:**:*"])
            assert(result() === "aaacacadadbb")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:append:**:*"])
            assert(result() === "aaacacadadbb")
        })
    })

    describe("(should ignore duplications) \"test-task:append:b\" \"test-task:append:*\" to \"test-task:append:b\", \"test-task:append:a\"", () => {
        it("Node API", async () => {
            await nodeApi(["test-task:append:b", "test-task:append:*"])
            assert(result() === "bbaa")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:append:b", "test-task:append:*"])
            assert(result() === "bbaa")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:append:b", "test-task:append:*"])
            assert(result() === "bbaa")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:append:b", "test-task:append:*"])
            assert(
                result() === "baba" ||
                result() === "baab" ||
                result() === "abab" ||
                result() === "abba"
            )
        })
    })

    describe("\"a\" should not match to \"test-task:append:a\"", () => {
        it("Node API", async () => {
            try {
                await nodeApi("a")
                assert(false, "should not match")
            }
            catch (err) {
                assert((/not found/i).test(err.message))
            }
        })

        it("npm-run-all command", async () => {
            const stderr = new BufferStream()
            try {
                await util.runAll(["a"], null, stderr)
                assert(false, "should not match")
            }
            catch (_err) {
                assert((/not found/i).test(stderr.value))
            }
        })

        it("run-s command", async () => {
            const stderr = new BufferStream()
            try {
                await util.runSeq(["a"], null, stderr)
                assert(false, "should not match")
            }
            catch (_err) {
                assert((/not found/i).test(stderr.value))
            }
        })

        it("run-p command", async () => {
            const stderr = new BufferStream()
            try {
                await util.runPar(["a"], null, stderr)
                assert(false, "should not match")
            }
            catch (_err) {
                assert((/not found/i).test(stderr.value))
            }
        })
    })
})
