const { ethers } = require("ethers");
const fs = require("fs");

// Teko Mint Faucet By : AJSpro

// ========== WARNA KONSOL ========== //
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m"
};
// ========== KONFIGURASI ========== //
const RPC_URL = "https://carrot.megaeth.com/rpc";
const GAS_PRICE = ethers.parseUnits("0.1", "gwei");
const MAX_RETRY = 2;

const TOKENS = [
  {
    address: "0x176735870dc6c22b4ebfbf519de2ce758de78d94",
    name: "tkETH",
    method: "mint",
    amount: "1",
    decimals: 18,
    gasLimit: 100000
  },
  {
    address: "0xf82ff0799448630eb56ce747db840a2e02cde4d8",
    name: "tkWBTC",
    method: "mint",
    amount: "0.02",
    decimals: 8,
    gasLimit: 150000
  },
  {
    address: "0xfaf334e157175ff676911adcf0964d7f54f2c424",
    name: "tkUSDC",
    method: "mint",
    amount: "2000",
    decimals: 6,
    gasLimit: 200000
  },
  {
    address: "0xe9b6e75c243b6100ffcb1c66e8f78f96feea727f",
    name: "cUSDC",
    method: "mint",
    amount: "1000",
    decimals: 18,
    gasLimit: 150000
  }
];
// ================================ //

const ABI = {
  mint: ["function mint(address to, uint256 amount) external"],
  balanceOf: ["function balanceOf(address account) view returns (uint256)"]
};

function logWithColor(text, color) {
  console.log(`${color}%s${colors.reset}`, text);
}

async function getTokenBalances(wallet, provider) {
  const balances = {};
  
  for (const token of TOKENS) {
    try {
      const contract = new ethers.Contract(token.address, ABI.balanceOf, provider);
      const balance = await contract.balanceOf(wallet.address);
      balances[token.name] = ethers.formatUnits(balance, token.decimals);
    } catch {
      balances[token.name] = "Error";
    }
  }
  
  return balances;
}

function logBalances(wallet, balances, walletName) {
  let balanceStr = `${colors.blue}💎 ${walletName} Balance:\n`;
  for (const [token, balance] of Object.entries(balances)) {
    const formatted = Number(balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    balanceStr += `${colors.cyan}  ${token.padEnd(6)}: ${colors.green}${formatted.padStart(12)}\n`;
  }
  console.log(balanceStr + colors.reset);
}

async function prosesKlaim(wallet, token) {
  const kontrak = new ethers.Contract(token.address, ABI.mint, wallet);

  try {
    const jumlah = ethers.parseUnits(token.amount, token.decimals);
    const tx = await kontrak.mint(wallet.address, jumlah, {
      gasLimit: token.gasLimit,
      gasPrice: GAS_PRICE
    });
    await tx.wait();
    return { status: "sukses", hash: tx.hash };
  } catch (error) {
    return { 
      status: "gagal", 
      error: error.reason || error.shortMessage || "CALL_EXCEPTION"
    };
  }
}

async function prosesWallet(pk, walletIndex) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(pk, provider);
  
  const walletName = walletIndex === 0 ? 
    "Wallet Utama" : 
    `Wallet ${walletIndex}`;
  const shortAddress = `0x...${wallet.address.slice(-4)}`;

  // Cek saldo gas
  const saldoAwal = await provider.getBalance(wallet.address);
  if (saldoAwal < ethers.parseEther("0.00001")) {
    logWithColor(`[!] Saldo ${walletName} (${shortAddress}) kurang`, colors.red);
    return;
  }
  
  // Tampilkan balance awal
  console.log(`${colors.blue}══════════════════════════════════`);
  logWithColor(`🚀 Memulai: ${walletName} (${shortAddress})`, colors.yellow);
  const initialBalances = await getTokenBalances(wallet, provider);
  logBalances(wallet, initialBalances, walletName);

  const jumlahTx = Math.floor(Math.random() * 21) + 50;
  logWithColor(`🟢 Mulai ${jumlahTx} tx`, colors.cyan);

  let delayCounter = 0;
  let baseDelay = 3000;
  
  for (let i = 0; i < jumlahTx; i++) {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    let result;

    // Dynamic delay
    let delay = baseDelay + Math.random() * 1000;
    if (delayCounter >= 20) {
      delay += 15000;
      delayCounter = 0;
      
      // Update balance
      const currentBalances = await getTokenBalances(wallet, provider);
      logBalances(wallet, currentBalances, walletName);
      logWithColor(`⏳ Menambah delay 15 detik...`, colors.yellow);
    }

    // Proses transaksi
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      result = await prosesKlaim(wallet, token);
      if (result.status === "sukses") break;
      if (attempt < MAX_RETRY) await new Promise(r => setTimeout(r, 2000));
    }

    // Tampilkan hasil
    const statusEmoji = result.status === "sukses" ? "✅" : "❌";
    const statusText = result.status === "sukses" ? 
      `${colors.green}${result.hash.slice(0, 6)}...${result.hash.slice(-4)}` : 
      `${colors.red}${result.error}`;
    
    console.log(
      `[${(i + 1).toString().padStart(2)}/${jumlahTx}] ${colors.magenta}${token.name.padEnd(6)}${statusEmoji} | ` +
      `${statusText}${colors.reset}`
    );

    await new Promise(r => setTimeout(r, delay));
    delayCounter++;
  }

  // Tampilkan balance akhir
  console.log(`${colors.blue}══════════════════════════════════`);
  logWithColor(`🏁 Selesai: ${walletName} (${shortAddress})`, colors.yellow);
  const finalBalances = await getTokenBalances(wallet, provider);
  logBalances(wallet, finalBalances, walletName);
  console.log(`${colors.blue}══════════════════════════════════\n`);
}

async function main() {
  const privateKeys = fs
    .readFileSync("pk.txt", "utf-8")
    .split("\n")
    .filter(k => k.trim().match(/^(0x)?[a-fA-F0-9]{64}$/));

  while (true) {
    logWithColor(`\n🔥 [${new Date().toLocaleTimeString()}] Batch baru dimulai`, colors.yellow);

    for (const [index, pk] of privateKeys.entries()) {
      await prosesWallet(pk.trim(), index);
    }

    const cooldown = (6 + Math.random() * 2) * 3600 * 1000;
    const jam = cooldown / 3600000;
    logWithColor(`\n💤 Tidur ${jam.toFixed(1)} jam...\n`, colors.cyan);
    await new Promise(r => setTimeout(r, cooldown));
  }
}

main().catch(console.error);