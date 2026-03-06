import axios from "axios";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_BASE_URL = "https://api.etherscan.io/api";

interface EtherscanTxResponse {
  status: string;
  message: string;
  result: {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    confirmations: string;
    isError: string;
  }[];
}

interface TxStatus {
  hash: string;
  status: "success" | "failed" | "pending";
  confirmations: number;
  blockNumber: string;
  from: string;
  to: string;
  valueEth: string;
  timestamp: number;
}

/**
 * Get transaction status from Etherscan
 */
export async function getTxStatus(txHash: string): Promise<TxStatus | null> {
  try {
    const response = await axios.get<EtherscanTxResponse>(ETHERSCAN_BASE_URL, {
      params: {
        module: "transaction",
        action: "gettxreceiptstatus",
        txhash: txHash,
        apikey: ETHERSCAN_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data.status !== "1") return null;

    // Also get full tx details
    const txResponse = await axios.get(ETHERSCAN_BASE_URL, {
      params: {
        module: "proxy",
        action: "eth_getTransactionByHash",
        txhash: txHash,
        apikey: ETHERSCAN_API_KEY,
      },
      timeout: 10000,
    });

    const tx = txResponse.data.result;
    if (!tx) return null;

    const receiptStatus = response.data.result as unknown as { status: string };

    return {
      hash: txHash,
      status: receiptStatus.status === "1" ? "success" : receiptStatus.status === "0" ? "failed" : "pending",
      confirmations: 0,
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16).toString() : "pending",
      from: tx.from,
      to: tx.to,
      valueEth: tx.value ? (parseInt(tx.value, 16) / 1e18).toFixed(6) : "0",
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error("[Etherscan] getTxStatus error:", err);
    return null;
  }
}

/**
 * Get ETH balance for a wallet address
 */
export async function getWalletBalance(address: string): Promise<string> {
  try {
    const response = await axios.get(ETHERSCAN_BASE_URL, {
      params: {
        module: "account",
        action: "balance",
        address,
        tag: "latest",
        apikey: ETHERSCAN_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data.status !== "1") return "0";
    const balanceWei = BigInt(response.data.result);
    const balanceEth = Number(balanceWei) / 1e18;
    return balanceEth.toFixed(6);
  } catch (err) {
    console.error("[Etherscan] getWalletBalance error:", err);
    return "0";
  }
}

/**
 * Get recent transactions for a wallet address
 */
export async function getWalletTransactions(address: string, limit = 10) {
  try {
    const response = await axios.get<EtherscanTxResponse>(ETHERSCAN_BASE_URL, {
      params: {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: "desc",
        apikey: ETHERSCAN_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data.status !== "1") return [];

    return response.data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      valueEth: (parseInt(tx.value) / 1e18).toFixed(6),
      timestamp: parseInt(tx.timeStamp) * 1000,
      status: tx.isError === "0" ? "success" : "failed",
      confirmations: parseInt(tx.confirmations),
    }));
  } catch (err) {
    console.error("[Etherscan] getWalletTransactions error:", err);
    return [];
  }
}

/**
 * Build Etherscan URL for a transaction or address
 */
export function etherscanUrl(type: "tx" | "address" | "token", value: string, network: "mainnet" | "sepolia" = "mainnet"): string {
  const base = network === "sepolia" ? "https://sepolia.etherscan.io" : "https://etherscan.io";
  return `${base}/${type}/${value}`;
}
