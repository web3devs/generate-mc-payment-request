# What we are doing

Generating a QR code on the fly to receive a payment through the Moby wallet.

1. Vendor grabs the public address from their wallet. *I'm not sure how to do this in the Moby app*
2. Vender enters the amount of the invoice and the invoice number.
3. A QR code is presented that can be scanned by the buyer's Moby wallet.
4. The buyer approves the transaction in their Moby wallet and the vendor gets paid.

TODO Get the private view key from the vendor's wallet so that we can monitor the blockchain for payment.