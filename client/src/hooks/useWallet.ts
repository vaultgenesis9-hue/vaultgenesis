import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi";
import { mainnet, bsc, polygon } from "wagmi/chains";

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const formattedBalance = balance
    ? `${(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} ${balance.symbol}`
    : null;

  const supportedChains = [mainnet, bsc, polygon];

  return {
    address,
    shortAddress,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    connector,
    balance,
    formattedBalance,
    chainId,
    supportedChains,
    connect,
    connectors,
    disconnect,
    switchChain,
  };
}
