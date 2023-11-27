import {
  useAccount,
  useBalance,
  useNetwork,
  useWalletClient,
  useWaitForTransaction
} from 'wagmi';

import {
  encodeFunctionData,
  formatEther,
  formatUnits,
  parseAbi,
  parseEther,
  zeroAddress
} from 'viem';

import { Contract } from 'ethers';
import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useToast } from '@chakra-ui/react';

import {
  GLOBAL_SETTLEMENT_ADDRESS,
  GEB_PROXY_REGISTRY_ADDRESS,
  GEB_SAFE_MANAGER_ADDRESS,
  GEB_SAFE_ENGINE_ADDRESS,
  COLLATERAL_JOIN_ADDRESS,
  GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ADDRESS,
  COIN_JOIN_ADDRESS,
  SYSTEM_COIN_ADDRESS,
  COLLATERAL_ADDRESS,
  blockExplorerBaseUrl
} from '../utils/contracts';

import { GET_SAFES_QUERY } from '../utils/queries';

import GLOBAL_SETTLEMENT_ABI from '../abis/GlobalSettlement.json';
import GEB_PROXY_REGISTRY_ABI from '../abis/GebProxyRegistry.json';
import GEB_SAFE_MANAGER_ABI from '../abis/GebSafeManager.json';
import GEB_SAFE_ENGINE_ABI from '../abis/GebSafeEngine.json';
import GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI from '../abis/GebProxyActionsGlobalSettlement.json';

import { useEthersProvider } from './ethersProvider';
import { TransactionAlert } from '../components/TransactionAlert';

export const useGeb = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const toast = useToast();
  const provider = useEthersProvider({ chainId: chain?.id });

  const [getSafesId, { loading: safesQueryLoading, data: safesQueryResult }] =
    useLazyQuery(GET_SAFES_QUERY);

  const [safeOwner, setSafeOwner] = useState(zeroAddress);
  const [safeAddress, setSafeAddress] = useState(zeroAddress);

  const [txReceiptPending, setTxReceiptPending] = useState(false);
  const [txReceipt, setTxReceipt] = useState('');

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

  let [proxyAddress, setProxyAddress] = useState(zeroAddress);
  let [collateralType, setCollateralType] = useState('');
  let [approvedSystemCoin, setApprovedSystemCoin] = useState('0');
  let [coinBagBalance, setCoinBagBalance] = useState('0');
  let [coinsUsedToRedeem, setCoinsUsedToRedeem] = useState('0');
  let [collateralCashPrice, setCollateralCashPrice] = useState(
    formatUnits(BigInt(0), 27)
  );
  let [outstandingCoinSupply, setOutstandingCoinSupply] = useState('0');
  let [shutdownTime, setShutdownTime] = useState(BigInt(0));
  let [systemCoinBalance, setSystemCoinBalance] = useState('0');
  let [collateralBalance, setCollateralBalance] = useState('0');

  let [lockedCollateralAmount, generatedDebtAmount] = ['0', '0'];
  let redeemableCoinBalance = (
    Number(coinBagBalance) - Number(coinsUsedToRedeem)
  ).toString();

  const fetchProxyAddress = async () => {
    try {
      const contract = new Contract(
        gebProxyRegistryContract,
        GEB_PROXY_REGISTRY_ABI,
        provider
      );

      let res = await contract.proxies(address);

      getSafesId({ variables: { address: res.toLowerCase() } });
      setProxyAddress(res);
    } catch (err) {
      console.log(err);
      setProxyAddress(zeroAddress);
    }
  };

  const fetchShutdownTime = async () => {
    try {
      const contract = new Contract(
        globalSettlementContract,
        GLOBAL_SETTLEMENT_ABI,
        provider
      );

      let res = await contract.shutdownTime();
      setShutdownTime(BigInt(res || 0));
    } catch (err) {
      console.log(err);
      setShutdownTime(BigInt(0));
    }
  };

  const fetchCollateralType = async () => {
    try {
      const contract = new Contract(
        gebSafeManagerContract,
        GEB_SAFE_MANAGER_ABI,
        provider
      );

      let res = await contract.collateralTypes(1);
      setCollateralType(res);
    } catch (err) {
      console.log(err);
      setCollateralType('');
    }
  };

  const fetchOutstandingCoinSupply = async () => {
    try {
      const contract = new Contract(
        globalSettlementContract,
        GLOBAL_SETTLEMENT_ABI,
        provider
      );

      let res = await contract.outstandingCoinSupply();
      setOutstandingCoinSupply(res ? formatEther(res) : '0');
    } catch (err) {
      console.log(err);
      setOutstandingCoinSupply('0');
    }
  };

  useEffect(() => {
    if (address) {
      fetchShutdownTime();
      fetchCollateralType();
      fetchOutstandingCoinSupply();
      fetchProxyAddress();
    }
  }, [address]);

  const fetchApprovedSystemCoin = async () => {
    try {
      const contract = new Contract(
        systemcoinContract,
        parseAbi([
          'function allowance(address _owner, address _spender) public view returns (uint256)'
        ]),
        provider
      );

      let res = await contract.allowance(address, proxyAddress);
      setApprovedSystemCoin(res ? formatEther(res) : '0');
    } catch (err) {
      console.log(err);
      setApprovedSystemCoin('0');
    }
  };

  const fetchCoinBagBalance = async () => {
    try {
      const contract = new Contract(
        globalSettlementContract,
        GLOBAL_SETTLEMENT_ABI,
        provider
      );

      let res = await contract.coinBag(proxyAddress);
      setCoinBagBalance(res ? formatEther(res) : '0');
    } catch (err) {
      console.log(err);
      setCoinBagBalance('0');
    }
  };

  const fetchCoinsUsedToRedeem = async () => {
    try {
      const contract = new Contract(
        globalSettlementContract,
        GLOBAL_SETTLEMENT_ABI,
        provider
      );

      let res = await contract.coinsUsedToRedeem(collateralType, proxyAddress);
      setCoinsUsedToRedeem(res ? formatEther(res) : '0');
    } catch (err) {
      console.log(err);
      setCoinsUsedToRedeem('0');
    }
  };

  const fetchCollateralCashPrice = async () => {
    try {
      const contract = new Contract(
        globalSettlementContract,
        GLOBAL_SETTLEMENT_ABI,
        provider
      );

      let res = await contract.collateralCashPrice(collateralType);
      setCollateralCashPrice(formatUnits(res ? res : BigInt(0), 27));
    } catch (err) {
      console.log(err);
      setCollateralCashPrice(formatUnits(BigInt(0), 27));
    }
  };

  useEffect(() => {
    if (address && proxyAddress) {
      fetchApprovedSystemCoin();
      fetchCoinBagBalance();
      fetchCoinsUsedToRedeem();
      fetchCollateralCashPrice();
    }
  }, [proxyAddress]);

  const fetchSafeOwner = async (_safeId) => {
    try {
      const contract = new Contract(
        gebSafeManagerContract,
        GEB_SAFE_MANAGER_ABI,
        provider
      );

      let res = await contract.ownsSAFE(_safeId);
      setSafeOwner(res);
    } catch (err) {
      console.log(err);
      setSafeOwner(zeroAddress);
    }
  };

  const fetchSafeAddress = async (_safeId) => {
    try {
      const contract = new Contract(
        gebSafeManagerContract,
        GEB_SAFE_MANAGER_ABI,
        provider
      );

      let res = await contract.safes(_safeId);
      setSafeAddress(res);
    } catch (err) {
      console.log(err);
      setSafeAddress(zeroAddress);
    }
  };

  const fetchSafeAmounts = async () => {
    try {
      const contract = new Contract(
        gebSafeEngineContract,
        GEB_SAFE_ENGINE_ABI,
        provider
      );

      let res = await contract.safes(collateralType, safeAddress);
      [lockedCollateralAmount, generatedDebtAmount] = res
        ? res.map((d) => formatEther(d))
        : ['0', '0'];
    } catch (err) {
      console.log(err);
      [lockedCollateralAmount, generatedDebtAmount] = ['0', '0'];
    }
  };

  useEffect(() => {
    if (collateralType && safeAddress) {
      fetchSafeAmounts();
    }
  }, [collateralType, safeAddress]);

  // WAGMI BALANCES

  const getSystemCoinBalance = useBalance({
    address,
    enabled: systemcoinContract?.length !== 0,
    token: systemcoinContract,
    watch: true,
    onSuccess(data) {
      setSystemCoinBalance(data?.formatted || '0');
    }
  });

  const getCollateralBalance = useBalance({
    address,
    enabled: collateralContract?.length !== 0,
    token: collateralContract,
    watch: true,
    onSuccess(data) {
      setCollateralBalance(data?.formatted || '0');
    }
  });

  const {} = useWaitForTransaction({
    hash: txReceipt,
    enabled: txReceipt !== '' ? true : false,
    confirmations: 2,
    onSuccess() {
      setTxReceipt('');
      setTxReceiptPending(false);
      toast({
        position: 'bottom-left',
        render: () => (
          <TransactionAlert status='success' title='Transaction Mined' />
        )
      });

      fetchApprovedSystemCoin();
      fetchCoinBagBalance();
      fetchCoinsUsedToRedeem();
      fetchSafeAmounts();
    }
  });

  const executeAsProxy = async (target, data) => {
    setTxReceiptPending(true);
    try {
      const txHash = await walletClient.writeContract({
        account: address,
        address: proxyAddress,
        abi: parseAbi([
          'function execute(address _target, bytes _data) public payable returns (bytes response)'
        ]),
        functionName: 'execute',
        args: [target, data]
      });

      toast({
        position: 'bottom-left',
        render: () => (
          <TransactionAlert
            status='info'
            title='Transaction sent'
            href={`${blockExplorerBaseUrl[chain?.id]}/tx/${txHash}`}
          />
        )
      });

      setTxReceipt(txHash);
      return txHash;
    } catch (err) {
      console.log(err);
      setTxReceiptPending(false);
      setTxReceipt('');
    }
  };

  const proxiedCollateralWithdraw = async (_safeId) => {
    try {
      if (!_safeId) {
        throw new Error('No safe selected');
      }

      const data = encodeFunctionData({
        abi: GEB_PROXY_ACTIONS_GLOBAL_SETTLEMENT_ABI,
        functionName: 'freeTokenCollateral',
        args: [
          gebSafeManagerContract,
          collateralJoinAddress,
          globalSettlementContract,
          _safeId
        ]
      });

      return executeAsProxy(gebProxyActionsGlobalSettlementContract, data);
    } catch (err) {
      console.log('Error in proxiedCollateralWithdraw', err);
    }
  };

  const proxiedPrepareSystemCoins = async (amount) => {
    try {
      if (Number(amount) > Number(systemCoinBalance)) {
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
      toast({
        position: 'bottom-left',
        render: () => (
          <TransactionAlert status='error' title='Not enough system coins' />
        )
      });
    }
  };

  const proxiedRedeemSystemCoins = async (amount) => {
    try {
      if (Number(amount) > Number(redeemableCoinBalance)) {
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
      toast({
        position: 'bottom-left',
        render: () => (
          <TransactionAlert
            status='error'
            title='Not enough redeemable coins'
          />
        )
      });
    }
  };

  const approveSystemCoin = async (amount) => {
    setTxReceiptPending(true);
    try {
      const amountInWei = parseEther(amount);

      const txHash = await walletClient.writeContract({
        account: address,
        address: systemcoinContract,
        abi: parseAbi([
          'function approve(address _spender, uint256 _amount) public returns (bool)'
        ]),
        functionName: 'approve',
        args: [proxyAddress, amountInWei]
      });

      toast({
        position: 'bottom-left',
        render: () => (
          <TransactionAlert
            status='info'
            title='Transaction sent'
            href={`${blockExplorerBaseUrl[chain?.id]}/tx/${txHash}`}
          />
        )
      });

      setTxReceipt(txHash);

      return txHash;
    } catch (err) {
      console.log('Error in proxiedApproveToken', err);
      setTxReceiptPending(false);
      setTxReceipt('');
    }
  };

  return {
    safesQueryResult,
    safesQueryLoading,
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
    outstandingCoinSupply,
    txReceiptPending,
    fetchSafeAddress,
    fetchSafeOwner
  };
};
