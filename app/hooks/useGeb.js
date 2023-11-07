import {
  useAccount,
  useBalance,
  useContractRead,
  useNetwork,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import {
  encodeFunctionData,
  formatEther,
  formatUnits,
  parseAbi,
  parseEther,
  zeroAddress
} from 'viem';

import { useState } from 'react';

import {
  // SYSTEM_COIN_ADDRESS,
  // COLLATERAL_ADDRESS,
  GLOBAL_SETTLEMENT_ADDRESS,
  GEB_PROXY_REGISTRY_ADDRESS,
  GEB_SAFE_MANAGER_ADDRESS,
  GEB_SAFE_ENGINE_ADDRESS,
  COLLATERAL_JOIN_ADDRESS,
  GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ADDRESS,
  COIN_JOIN_ADDRESS,
  SYSTEM_COIN_ADDRESS,
  COLLATERAL_ADDRESS
} from '../utils/contracts';

import GLOBAL_SETTLEMENT_ABI from '../abis/GlobalSettlement.json';
import GEB_PROXY_REGISTRY_ABI from '../abis/GebProxyRegistry.json';
import GEB_SAFE_MANAGER_ABI from '../abis/GebSafeManager.json';
import GEB_SAFE_ENGINE_ABI from '../abis/GebSafeEngine.json';
import GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI from '../abis/GebProxyActionsGlobalSettlement.json';

export const useGeb = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const publicClient = usePublicClient({ chainId: chain?.id });
  const { data: walletClient } = useWalletClient();

  const [safeOwner, setSafeOwner] = useState(zeroAddress);
  const [safeAddress, setSafeAddress] = useState(zeroAddress);

  const [selectedSafeId, setSelectedSafeId] = useState(null);

  const systemcoinContract = SYSTEM_COIN_ADDRESS?.[chain?.id];
  const collateralContract = COLLATERAL_ADDRESS?.[chain?.id];
  const globalSettlementContract = GLOBAL_SETTLEMENT_ADDRESS?.[chain?.id];
  const gebProxyRegistryContract = GEB_PROXY_REGISTRY_ADDRESS?.[chain?.id];
  const gebSafeManagerContract = GEB_SAFE_MANAGER_ADDRESS?.[chain?.id];
  const gebSafeEngineContract = GEB_SAFE_ENGINE_ADDRESS?.[chain?.id];
  const gebProxyActionsGlobalSettlementContract =
    GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ADDRESS?.[chain?.id];
  const collateralJoinAddress = COLLATERAL_JOIN_ADDRESS?.[chain?.id];
  const coinJoinAddress = COIN_JOIN_ADDRESS?.[chain?.id];

  const executeAsProxy = async (target, data) => {
    const txHash = await walletClient.writeContract({
      account: address,
      address: proxyAddress,
      abi: parseAbi([
        'function execute(address _target, bytes _data) public payable returns (bytes response)'
      ]),
      functionName: 'execute',
      args: [target, data]
    });

    return txHash;
  };

  const updateSafeId = async (_safeId) => {
    if (Number.isNaN(_safeId)) {
      return;
    }
    try {
      setSelectedSafeId(Number(_safeId));

      const safeOwner = await publicClient.readContract({
        address: gebSafeManagerContract,
        abi: GEB_SAFE_MANAGER_ABI,
        functionName: 'ownsSAFE',
        args: [_safeId]
      });
      setSafeOwner(safeOwner);

      const safeAddress = await publicClient.readContract({
        address: gebSafeManagerContract,
        abi: GEB_SAFE_MANAGER_ABI,
        functionName: 'safes',
        args: [_safeId]
      });
      setSafeAddress(safeAddress);
    } catch (err) {
      console.log('Error in updateSafeId', err);
      setSafeOwner(zeroAddress);
      setSafeAddress(zeroAddress);
      setSelectedSafeId(null);
    }
  };

  const getProxyAddress = useContractRead({
    address: gebProxyRegistryContract,
    abi: GEB_PROXY_REGISTRY_ABI,
    functionName: 'proxies',
    args: [address],
    watch: true,
    enabled: !!address
  });

  const proxyAddress = getProxyAddress.data || zeroAddress;

  const getCollateralType = useContractRead({
    address: gebSafeManagerContract,
    abi: GEB_SAFE_MANAGER_ABI,
    functionName: 'collateralTypes',
    args: [1],
    watch: true
  });

  const collateralType = getCollateralType.data || '';

  const getSafeAmounts = useContractRead({
    address: gebSafeEngineContract,
    abi: GEB_SAFE_ENGINE_ABI,
    functionName: 'safes',
    args: [collateralType, safeAddress],
    watch: true,
    enabled: !!collateralType && !!safeAddress
  });

  const [lockedCollateralAmount, generatedDebtAmount] = getSafeAmounts.data
    ? getSafeAmounts.data.map((d) => formatEther(d))
    : ['0', '0'];

  const getShutdownTime = useContractRead({
    address: globalSettlementContract,
    abi: GLOBAL_SETTLEMENT_ABI,
    functionName: 'shutdownTime',
    watch: true
  });

  const shutdownTime = BigInt(getShutdownTime.data || 0);

  const getApprovedSystemCoin = useContractRead({
    address: systemcoinContract,
    abi: parseAbi([
      'function allowance(address _owner, address _spender) public view returns (uint256)'
    ]),
    functionName: 'allowance',
    args: [address, proxyAddress],
    watch: true
  });

  const approvedSystemCoin = getApprovedSystemCoin.data
    ? formatEther(getApprovedSystemCoin.data)
    : '0';

  const getSystemCoinBalance = useBalance({
    address,
    enabled: systemcoinContract?.length !== 0,
    token: systemcoinContract,
    watch: true
  });

  const systemCoinBalance = getSystemCoinBalance.data?.formatted || '0';

  const getCollateralBalance = useBalance({
    address,
    enabled: collateralContract?.length !== 0,
    token: collateralContract,
    watch: true
  });

  const collateralBalance = getCollateralBalance.data?.formatted || '0';

  const getCoinBagBalance = useContractRead({
    address: globalSettlementContract,
    abi: GLOBAL_SETTLEMENT_ABI,
    functionName: 'coinBag',
    args: [proxyAddress],
    watch: true
  });

  const coinBagBalance = getCoinBagBalance.data
    ? formatEther(getCoinBagBalance.data)
    : '0';

  const getCoinsUsedToRedeem = useContractRead({
    address: globalSettlementContract,
    abi: GLOBAL_SETTLEMENT_ABI,
    functionName: 'coinsUsedToRedeem',
    args: [collateralType, proxyAddress],
    watch: true
  });

  const coinsUsedToRedeem = getCoinsUsedToRedeem.data
    ? formatEther(getCoinsUsedToRedeem.data)
    : '0';

  const redeemableCoinBalance = (
    Number(coinBagBalance) - Number(coinsUsedToRedeem)
  ).toString();

  const getCollateralCashPrice = useContractRead({
    address: globalSettlementContract,
    abi: GLOBAL_SETTLEMENT_ABI,
    functionName: 'collateralCashPrice',
    args: [collateralType],
    watch: true
  });

  const collateralCashPrice = formatUnits(
    getCollateralCashPrice.data ? getCollateralCashPrice.data : BigInt(0),
    27
  );

  const getOutstandingCoinSupply = useContractRead({
    address: globalSettlementContract,
    abi: GLOBAL_SETTLEMENT_ABI,
    functionName: 'outstandingCoinSupply',
    watch: true
  });

  const outstandingCoinSupply = getOutstandingCoinSupply.data
    ? formatEther(getOutstandingCoinSupply.data)
    : '0';

  const proxiedCollateralWithdraw = async () => {
    try {
      if (!selectedSafeId) {
        throw new Error('No safe selected');
      }

      const data = encodeFunctionData({
        abi: GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI,
        functionName: 'freeTokenCollateral',
        args: [
          gebSafeManagerContract,
          collateralJoinAddress,
          globalSettlementContract,
          selectedSafeId
        ]
      });

      return executeAsProxy(gebProxyActionsGlobalSettlementContract, data);
    } catch (err) {
      console.log('Error in proxiedCollateralWithdraw', err);
    }
  };

  const proxiedPrepareSystemCoins = async (amount) => {
    try {

      if (amount > systemCoinBalance) {
        throw new Error('Not enough system coins');
      }


      const amountInWei = parseEther(amount);

      const data = encodeFunctionData({
        abi: GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI,
        functionName: 'prepareCoinsForRedeeming',
        args: [coinJoinAddress, globalSettlementContract, amountInWei]
      });

      return executeAsProxy(gebProxyActionsGlobalSettlementContract, data);
    } catch (err) {
      console.log('Error in proxiedPrepareSystemCoins', err);
    }
  };

  const proxiedRedeemSystemCoins = async (amount) => {
    try {

      if (amount > redeemableCoinBalance) {
        throw new Error('Not enough redeemable coins');
      }

      const amountInWei = parseEther(amount);

      const data = encodeFunctionData({
        abi: GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI,
        functionName: 'redeemTokenCollateral',
        args: [
          collateralJoinAddress,
          globalSettlementContract,
          collateralType,
          amountInWei
        ]
      });

      return executeAsProxy(gebProxyActionsGlobalSettlementContract, data);
    } catch (err) {
      console.log('Error in proxiedRedeemSystemCoins', err);
    }
  };

  const approveSystemCoin = async (amount) => {
    try {
      const amountInWei = parseEther(amount);

      return walletClient.writeContract({
        account: address,
        address: systemcoinContract,
        abi: parseAbi([
          'function approve(address _spender, uint256 _amount) public returns (bool)'
        ]),
        functionName: 'approve',
        args: [proxyAddress, amountInWei]
      });
    } catch (err) {
      console.log('Error in proxiedApproveToken', err);
    }
  };

  return {
    updateSafeId,
    safeAddress,
    safeOwner,
    collateralType,
    lockedCollateralAmount,
    generatedDebtAmount,
    proxyAddress,
    shutdownTime,
    proxiedCollateralWithdraw,
    proxiedPrepareSystemCoins,
    proxiedRedeemSystemCoins,
    approveSystemCoin,
    systemCoinBalance,
    collateralBalance,
    redeemableCoinBalance,
    approvedSystemCoin,
    collateralCashPrice,
    outstandingCoinSupply
  };
};
