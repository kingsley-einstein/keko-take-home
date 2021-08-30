export const Web3Reducer = (state, action) => {
  switch (action.type) {
    case "SET_ACCOUNT":
      return {
        ...state,
        account: action.payload
      };
    case "SET_PROVIDER":
      return {
        ...state,
        provider: action.payload
      };
    case "SET_PRICE":
      return {
        ...state,
        price: action.payload
      };
    case "SET_ETH_BALANCE":
      return {
        ...state,
        eth_balance: action.payload
      };
    case "SET_SIM_ETH_BALANCE":
      return {
        ...state,
        sim_eth_balance: action.payload
      };
    case "SET_SIM_USD_BALANCE":
      return {
        ...state,
        sim_usd_balance: action.payload
      };
    default:
      return state;
  }
};
