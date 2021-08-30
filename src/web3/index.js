import {
  createContext,
  useCallback,
  useReducer,
  useEffect,
  useState
} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import {
  DepositorAddress,
  ETHAddress,
  TokenABI,
  USDAddress,
  SwapABI,
  SwapAddress
} from "../constants";

import { Web3Reducer } from "./reducer";

const initialState = {
  loading: false,
  account: null,
  provider: null,
  price: null,
  eth_balance: 0,
  sim_eth_balance: 0,
  sim_usd_balance: 0
};

const providerOptions = {};

const web3Modal = new Web3Modal({
  providerOptions
});

export const Web3Context = createContext(initialState);

export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(Web3Reducer, initialState);
  const [ethForSimEth, setEthForSimEth] = useState("0");

  const setAccount = account => {
    dispatch({
      type: "SET_ACCOUNT",
      payload: account
    });
  };

  const setProvider = provider => {
    dispatch({
      type: "SET_PROVIDER",
      payload: provider
    });
  };

  const setPrice = price => {
    dispatch({
      type: "SET_PRICE",
      payload: price
    });
  };

  const setBalance = balance => {
    dispatch({
      type: "SET_ETH_BALANCE",
      payload: balance
    });
  };

  const setSimEthBalance = balance => {
    dispatch({
      type: "SET_SIM_ETH_BALANCE",
      payload: balance
    });
  };

  const setSimUSDBalance = balance => {
    dispatch({
      type: "SET_SIM_USD_BALANCE",
      payload: balance
    });
  };

  const handleEthInputChange = e => setEthForSimEth(e.target.value);

  const fetchPrice = () =>
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then(res => res.json())
      .then(res => res.ethereum.usd);

  const logout = () => {
    setAccount(null);
    setProvider(null);
    setBalance(0);
    setSimEthBalance(0);
    setSimUSDBalance(0);
    localStorage.setItem("defaultWallet", null);
  };

  const exchangeETHForSimETH = () => {
    const tx = {
      to: DepositorAddress,
      from: state.account,
      value: ethers.utils.parseEther(ethForSimEth)
    };
    const signer = window.web3.getSigner();
    signer.sendTransaction(tx).then(console.log);
  };

  const getRawPrice = async (from, to) => {
    if (window.web3.getSigner) {
      const swapContract = new ethers.Contract(
        SwapAddress,
        SwapABI,
        window.web3.getSigner()
      );
      const pairHash = ethers.utils.solidityKeccak256(
        ["address", "address"],
        [from, to]
      );
      console.log(pairHash);
      return Promise.resolve(swapContract.getRawPrice(pairHash));
    }
  };

  const swapTokens = async (from, to, amount, minAmountOut) => {
    const tokenContract = new ethers.Contract(
      from,
      TokenABI,
      window.web3.getSigner()
    );
    const swapContract = new ethers.Contract(
      SwapAddress,
      SwapABI,
      window.web3.getSigner()
    );
    const balance = await tokenContract.balanceOf(state.account);
    const allowance = await tokenContract.allowance(state.account, SwapAddress);

    if (allowance === 0) {
      await tokenContract.approve(SwapAddress, balance);
    }

    swapContract
      .swap(
        from,
        to,
        ethers.utils.parseEther(amount.toString()),
        ethers.utils.parseEther(minAmountOut.toString())
      )
      .then(console.log);
  };

  const connectWeb3 = useCallback(async () => {
    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    window.web3 = ethersProvider;

    setProvider(ethersProvider);

    const signer = ethersProvider.getSigner();
    const account = await signer.getAddress();
    const balance = await signer.getBalance();
    const simEthContract = new ethers.Contract(ETHAddress, TokenABI, signer);
    const simUSDContract = new ethers.Contract(USDAddress, TokenABI, signer);
    const simEthBalance = await simEthContract.balanceOf(account);
    const simUSDBalance = await simUSDContract.balanceOf(account);
    setAccount(account);
    setBalance(
      parseFloat((parseInt(balance.toString()) / 10 ** 18).toFixed(4))
    );
    setSimEthBalance(
      parseFloat((parseInt(simEthBalance.toString()) / 10 ** 18).toFixed(4))
    );
    setSimUSDBalance(
      parseFloat((parseInt(simUSDBalance.toString()) / 10 ** 18).toFixed(4))
    );

    provider.on("chainChanged", () => {
      window.location.reload();
    });

    provider.on("accountsChanged", () => {
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    fetchPrice().then(setPrice);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        ...state,
        connectWeb3,
        logout,
        exchangeETHForSimETH,
        handleEthInputChange,
        ethForSimEth,
        swapTokens,
        getRawPrice
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
