import ProtoBuff from "protobufjs";
import BS58 from "bs58";
import crc32 from "crc/crc32";
function getChecksum(buffer) {
    // @ts-ignore
    const crc = crc32(buffer).toString(16);
    return Buffer.from(crc, "hex").reverse();
}
export function parseB58(b58Message) {
    const unendcoded = BS58.decode(b58Message);
    // @ts-ignore
    const data = unendcoded.slice(4);
    // @ts-ignore
    if (Buffer.from(unendcoded.slice(0, 4)).toString() !== getChecksum(data).toString()) {
        // @ts-ignore
        throw new Error('Invalid checksum');
    }
    return Buffer.from(data);
}
export async function getPaymentRequest(publicAddress, amount, memo) {
    const root = await ProtoBuff.load('../proto/printable.proto');
    const PrintableWrapper = root.lookupType('printable.PrintableWrapper');
    const paymentRequestJson = {
        publicAddress: PrintableWrapper.decode(publicAddress).publicAddress,
        value: amount,
        memo: memo
    };
    const paymentRequestProto = PrintableWrapper.encode({ paymentRequest: paymentRequestJson }).finish();
    const checksum = getChecksum(paymentRequestProto);
    return BS58.encode(Buffer.concat([checksum, paymentRequestProto]));
}
const b58Address = "sHYSrc4kc4m3NUo9f99UkAendEz9cKx22kTL5divPiqzpGhmfJq8Hhj2QgEW6wBfD3PPTHFGNKFFRum2CGYepmWJZyFRtJdt6uQs7XrtBBAf3N61AyDwAwHvr8Vj7YNVYY5NsKg1vbUbMoX74qzFQfa9hQuBccRYC8Hos1JYe6AzaipGVL5TKU6t8qPLTnTzGFvwrQthF5LVQnTHvEBLZnSazRbiKvmw9irVfEZf8DNnZUQzFkP";
console.log(await getPaymentRequest(parseB58(b58Address), "99999900000000", "test invoice"));
//# sourceMappingURL=index.js.map