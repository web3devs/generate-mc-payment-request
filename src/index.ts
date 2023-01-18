import ProtoBuff from "protobufjs"
import BS58 from "bs58"
import crc32 from "crc/crc32"

function getChecksum(buffer: Buffer | Uint8Array): Buffer {
    // @ts-ignore
    const crc = crc32(buffer).toString(16)
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

const b58Address = "sHYSrc4kc4m3NUo9f99UkAendEz9cKx22kTL5divPiqzpGhmfJq8Hhj2QgEW6wBfD3PPTHFGNKFFRum2CGYepmWJZyFRtJdt6uQs7XrtBBAf3N61AyDwAwHvr8Vj7YNVYY5NsKg1vbUbMoX74qzFQfa9hQuBccRYC8Hos1JYe6AzaipGVL5TKU6t8qPLTnTzGFvwrQthF5LVQnTHvEBLZnSazRbiKvmw9irVfEZf8DNnZUQzFkP"
const expectedResult = "BM2dvA9xZPP63fkfGpcttmuoZtgqXKpSmzQ9c2vj3S2d8k84YXKipt3WpaAhdkmUXFFNQp1ydh18FmYuqUf5q41ED7VAdPJfH6J1qfx4ni6HvCJJDSDQvCYjHP3mohUGDp92Ye7oKS1DxJkfRdMouMQqgkFkMbEgYYQ3sx35ogviEWSXRz4yBtzVacvgQ4L2fGwjtP4Aq2WBjHd8MxMhPnBgCBbncjhzFrkQnxV8tsXeoYgyaEyA5XwdnpKyffsannAjZ5g172PAcYk75pvdr"
const result = await getPaymentRequest(parseB58(b58Address), "99999900000000", "test invoice")
console.assert(result === expectedResult, "Test failed")
