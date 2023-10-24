import {
  useAccount,
  useNetwork,
  useContractRead,
  usePublicClient
} from 'wagmi';

import { ZeroAddress } from 'ethers';

import { useEffect, useState } from 'react';

import {
  // SYSTEM_COIN_ADDRESS,
  // COLLATERAL_ADDRESS,
  GLOBAL_SETTLEMENT_ADDRESS,
  GEB_PROXY_REGISTRY_ADDRESS,
  GEB_SAFE_MANAGER_ADDRESS,
  GEB_SAFE_ENGINE_ADDRESS
} from '../utils/contracts';

import GLOBAL_SETTLEMENT_ABI from '../abis/GlobalSettlement.json';
import GEB_PROXY_REGISTRY_ABI from '../abis/GebProxyRegistry.json';
import GEB_SAFE_MANAGER_ABI from '../abis/GebSafeManager.json';
import GEB_SAFE_ENGINE_ABI from '../abis/GebSafeEngine.json';

export const useGeb = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const publicClient = usePublicClient({ chainId: chain?.id });

  const [shutdownTime, setShutdownTime] = useState(0);

  const [proxyAddress, setProxyAddress] = useState(ZeroAddress);
  const [safeOwner, setSafeOwner] = useState(ZeroAddress);
  const [safeAddress, setSafeAddress] = useState(ZeroAddress);
  const [collateralType, setCollateralType] = useState('');
  const [safe, setSafe] = useState([0, 0]);

  // const systemcoinContract = SYSTEM_COIN_ADDRESS?.[chain?.id];
  // const collateralContract = COLLATERAL_ADDRESS?.[chain?.id];
  const globalSettlementContract = GLOBAL_SETTLEMENT_ADDRESS?.[chain?.id];
  const gebProxyRegistryContract = GEB_PROXY_REGISTRY_ADDRESS?.[chain?.id];
  const gebSafeManagerContract = GEB_SAFE_MANAGER_ADDRESS?.[chain?.id];
  const gebSafeEngineContract = GEB_SAFE_ENGINE_ADDRESS?.[chain?.id];

  const getSafe = async (_collateralType, _safeId) => {
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

    const data = await publicClient.readContract({
      address: gebSafeEngineContract,
      abi: GEB_SAFE_ENGINE_ABI,
      functionName: 'safes',
      args: [_collateralType, safeAddress]
    });

    setSafe(data);
  };

  // ------------------------------

  const getCollateralType = async () => {
    const data = await publicClient.readContract({
      address: gebSafeManagerContract,
      abi: GEB_SAFE_MANAGER_ABI,
      functionName: 'collateralTypes',
      args: [1]
    });

    setCollateralType(data);
  };

  const getProxyAddress = async () => {
    const data = await publicClient.readContract({
      address: gebProxyRegistryContract,
      abi: GEB_PROXY_REGISTRY_ABI,
      functionName: 'proxies',
      args: [address]
    });

    setProxyAddress(data);
  };

  const getShutdownTime = async () => {
    const data = await publicClient.readContract({
      address: globalSettlementContract,
      abi: GLOBAL_SETTLEMENT_ABI,
      functionName: 'shutdownTime'
    });

    setShutdownTime(data);
  };

  const getGlobalDebt = async () => {
    const data = await publicClient.readContract({
      address: gebSafeEngineContract,
      abi: GEB_SAFE_ENGINE_ABI,
      functionName: 'globalDebt'
    });

    setCollateralType(data);
  };

  useEffect(() => {
    if (chain?.id) {
      getShutdownTime();
      getCollateralType();
      getProxyAddress();
    }
  }, [chain]);

  // const getSystemCoinBalance = useBalance({
  //   address,
  //   enabled: systemcoinContract?.length !== 0,
  //   token: systemcoinContract,
  //   watch: true
  // });

  // const getCollateralBalance = useBalance({
  //   address,
  //   enabled: collateralContract?.length !== 0,
  //   token: collateralContract,
  //   watch: true
  // });

  // const systemCoinBalance = getSystemCoinBalance.data?.formatted || '0';
  // const collateralBalance = getCollateralBalance.data?.formatted || '0';

  return {
    getSafe,

    safeAddress,
    safeOwner,
    collateralType,
    safe,
    proxyAddress,
    shutdownTime
  };
};
