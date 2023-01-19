import ProtoBuff from "protobufjs"
import BS58 from "bs58"
import crc32 from "crc/crc32"

function getChecksum(buffer: Buffer | Uint8Array): Buffer {
    // @ts-ignore
    const crc = crc32(buffer).toString(16).padStart(8,'0')
    return Buffer.from(crc, "hex").reverse()
}

export function parseB58(b58Message: string): Buffer {
    const unendcoded = BS58.decode(b58Message)
// @ts-ignore
    const data = unendcoded.slice(4)
// @ts-ignore
    if (Buffer.from(unendcoded.slice(0, 4)).toString() !== getChecksum(data).toString()) {
        // @ts-ignore
        throw new Error('Invalid checksum')
    }
    return Buffer.from(data)
}

// @ts-ignore
export async function getPaymentRequest(publicAddress: Buffer, amount: string | number, memo: string): Promise<string> {
    const root = await ProtoBuff.load('../proto/printable.proto')
    const PrintableWrapper = root.lookupType('printable.PrintableWrapper')
    const paymentRequestJson = {
        publicAddress: (PrintableWrapper.decode(publicAddress) as any).publicAddress,
        value: amount,
        memo: memo
    }
    const paymentRequestProto = PrintableWrapper.encode({paymentRequest: paymentRequestJson}).finish()
    const checksum = getChecksum(paymentRequestProto)
    return BS58.encode(Buffer.concat([checksum, paymentRequestProto]))
}

const b58Address = "uChUhoZ4mGSu7hvf4xdULk4ZsW5nMGSfKCH1tK97sYhgCNZrPBZnv1Sh4ohJLpvCeoJP8UtB46Mfi3tCpPiKj9HBsMr91gFvEzX6PvRK2wGohCzy3uugK3rP6kU37J4ygsvrfUhKpV4spdkFKDkAd43vWNkQ5uGKP5DW4P6mB8siHt2oLoedmPn7Byv8pAHWaDrEBqEdYPzEnrvA7YXsy6vqLn5SyeGY56QmWbjXrFXTKtzMmKx"
const expectedResult = "ifLqkWugzwqYq6FNw7qGB4p2zxMyUBGR9r9GW8imLemtV9Pu5EL9yrKbUnHa6AuzSEb8mEWwLDnfi8MnURmPE7mgFot4jX3BoCrU9fdFjN5BFNigQy8peXbJRN1Z4ApTHVjsjDyWqoB6dBi2vwFRTPQtkUNcRFuFvh6Gyst88RY1NaKpKzcxXgixicHcyL3LhPrcNtNiKR1spUcckrKg2AWLwQoVeoNqspEu1y4zg5g3UFjVYHM3jj2Mp5eVq4WkwW1x2D42z8Y1gGWjNDz1r"
const result = await getPaymentRequest(parseB58(b58Address), "99999900000000", "test invoice")
console.assert(result === expectedResult, "Test failed")

// Ruffer's Moby
// const b58Address = "uChUhoZ4mGSu7hvf4xdULk4ZsW5nMGSfKCH1tK97sYhgCNZrPBZnv1Sh4ohJLpvCeoJP8UtB46Mfi3tCpPiKj9HBsMr91gFvEzX6PvRK2wGohCzy3uugK3rP6kU37J4ygsvrfUhKpV4spdkFKDkAd43vWNkQ5uGKP5DW4P6mB8siHt2oLoedmPn7Byv8pAHWaDrEBqEdYPzEnrvA7YXsy6vqLn5SyeGY56QmWbjXrFXTKtzMmKx"// const result = await getPaymentRequest(parseB58(b58Address), "99999900000000", "test invoice")
// const result = await getPaymentRequest(parseB58(b58Address), "99999900000000", "test invoice")
// console.log(result)