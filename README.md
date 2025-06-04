🚰 Teko Mint Faucet - MegaETH Testnet Bot

A simple and automated bot to mint testnet tokens from faucet contracts on the **MegaETH** network.  
Perfect for filling multiple wallets with test tokens — hands-free!

---

## ✨ Features

- 🔁 **Multi-Wallet Support** – Reads private keys from `pk.txt`, processes them one by one  
- 🎯 **Auto Minting** – Randomly selects tokens to mint: `tkETH`, `tkWBTC`, `tkUSDC`, `cUSDC`  
- 🎲 **Randomized Transactions** – Sends **50–70** mint transactions per wallet  
- 🔄 **Retry Mechanism** – Retries up to **2 times** if a transaction fails  
- ⏳ **Dynamic Delay** – Waits **3–4 seconds** per tx, adds **extra 15s every 20 tx**  
- 📊 **Balance Checker** – Displays token balances **before and after**  
- 😴 **Auto Cooldown** – Sleeps for **6–8 hours** after all wallets are processed  

---

## 📦 How to Use (Termux / Linux / macOS)

1. **Install Node.js:**
   ```bash
   pkg install nodejs

2. Prepare your private keys in pk.txt

One private key per line (do not include 0x if already inside)



3. Install dependencies (specific version required):

npm install ethers@5.7.2


4. Run the script:

node script.js



> ⚠️ This script uses Ethers.js v5.x
Using Ethers v6+ may require changes to the syntax.




---

📝 Example pk.txt

0xabc123...
0xdef456...
0x789abc...


---

🏃‍♂️ Fire-and-Forget Automation

Leave it running in Termux, VPS, or desktop.
It'll mint tokens nonstop on MegaETH using all your wallets.

☕ Wanna Buy Me a Coffee?

If you'd like to support this little project, feel free to drop a coffee donation:

EVM Wallet: 0xa7C078f4174C0f8cfa8444e5141f8217F60CEe18

Solana Wallet: H2k5pM1xq6N7YjSfTEyhpdezcN5UX8y4mnB9yn9nDFAG


Thank you! ❤️