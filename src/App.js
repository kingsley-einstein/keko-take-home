/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import React, { useContext, useState, useEffect } from "react";
import {
  VStack,
  Container,
  Button,
  Flex,
  Spacer,
  Box,
  Heading,
  Link,
  Center,
  NumberInput,
  NumberInputField,
  IconButton,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Stat,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
import { ArrowUpDownIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { USDAddress, ETHAddress } from "./constants";
import "./index.css";
import { Web3Context } from "./web3";

function App() {
  const {
    account,
    connectWeb3,
    logout,
    price,
    exchangeETHForSimETH,
    eth_balance,
    sim_eth_balance,
    sim_usd_balance,
    handleEthInputChange,
    ethForSimEth,
    swapTokens,
    getRawPrice
  } = useContext(Web3Context);

  const [fromTokenName, setFromTokenName] = useState("SimETH");
  const [toTokenName, setToTokenName] = useState("SimUSD");
  const [inOriginalArrangement, setArrangement] = useState(true);
  const [fromTokenBalance, setFromTokenBalance] = useState(sim_eth_balance);
  const [toTokenBalance, setToTokenBalance] = useState(sim_usd_balance);
  const [fromValue, setFromValue] = useState(0);
  const [toValue, setToValue] = useState(0);
  const [fromAddress, setFromAddress] = useState(ETHAddress);
  const [toAddress, setToAddress] = useState(USDAddress);
  const [rawPrice, setRawPrice] = useState(0);
  const [exchangePrice, setExchangePrice] = useState(0);

  const switchTokens = () => {
    const fTokenName = fromTokenName;
    const tTokenName = toTokenName;

    const fTokenBalance = fromTokenBalance;
    const tTokenBalance = toTokenBalance;

    const fValue = fromValue;
    const tValue = toValue;

    const fAddress = fromAddress;
    const tAddress = toAddress;

    setFromTokenName(tTokenName);
    setToTokenName(fTokenName);
    setFromTokenBalance(tTokenBalance);
    setToTokenBalance(fTokenBalance);
    setFromValue(tValue);
    setToValue(fValue);
    setFromAddress(tAddress);
    setToAddress(fAddress);
    setArrangement(!inOriginalArrangement);
  };

  const setFromMaxValue = () => {
    setFromValue(fromTokenBalance);
  };

  const setToMaxValue = () => {
    setToValue(toTokenBalance);
  };

  const handleFromChange = e => {
    setFromValue(e.target.value);
  };

  const handleToChange = e => {
    setToValue(e.target.value);
  };

  const swap = async () => {
    await swapTokens(fromAddress, toAddress, fromValue, toValue);
  };

  useEffect(() => {
    if (inOriginalArrangement) {
      setFromTokenBalance(sim_eth_balance);
      setToTokenBalance(sim_usd_balance);
    } else {
      setToTokenBalance(sim_eth_balance);
      setFromTokenBalance(sim_usd_balance);
    }
  }, [sim_eth_balance, sim_usd_balance]);

  useEffect(() => {
    getRawPrice(fromAddress, toAddress).then(p =>
      setRawPrice((parseInt(p.toString()) / 10 ** 18))
    );
  }, [fromAddress, toAddress]);

  useEffect(() => {
    setExchangePrice(fromValue / rawPrice);
  }, [rawPrice, fromValue]);

  return (
    <div>
      <Container maxW="container.xl" bg="ghostwhite" margin="0.5" padding={3}>
        <div>
          <VStack spacing={12} align="stretch">
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <Box p="2">
                <Heading size="md">Simple Synth</Heading>
              </Box>
              <Spacer />
              <Box bg="teal" size="sm" borderRadius="lg">
                <Button colorScheme="teal" size="sm">
                  {eth_balance} ETH (${(eth_balance * (price || 0)).toFixed(2)})
                </Button>
                <Button colorScheme="transparent" opacity="0.5" size="sm">
                  {sim_eth_balance} SimETH
                </Button>
                <Button colorScheme="transparent" opacity="0.5" size="sm">
                  {sim_usd_balance} SimUSD
                </Button>
                <Button colorScheme="teal" onClick={connectWeb3} size="sm">
                  {account
                    ? account.substring(0, account.length - 36) +
                      "..." +
                      account.substring(account.length - 4)
                    : "Connect Metamask"}
                </Button>
              </Box>
              <Spacer />
              <Link href="https://faucet.rinkeby.io" colorScheme="teal">
                Request ETH
              </Link>
            </Flex>
            <Center>
              <Box
                p="10"
                maxW="sm"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="lg"
                bg="whiteAlpha.50"
              >
                <Center>
                  <InputGroup size="md">
                    <InputLeftAddon
                      children={<strong>{fromTokenName}</strong>}
                    />
                    <NumberInput
                      defaultValue={0.0}
                      max={fromTokenBalance}
                      value={fromValue}
                    >
                      <NumberInputField
                        color="teal"
                        backgroundColor="white"
                        opacity={0.5}
                        onChange={handleFromChange}
                      />
                    </NumberInput>
                    <InputRightAddon
                      children={
                        <Button onClick={setFromMaxValue} size="xs">
                          Max
                        </Button>
                      }
                    />
                  </InputGroup>
                </Center>
                <Center p="6">
                  <IconButton
                    icon={<ArrowUpDownIcon />}
                    onClick={switchTokens}
                  />
                </Center>
                <Center>
                  <InputGroup size="md">
                    <InputLeftAddon children={<strong>{toTokenName}</strong>} />
                    <NumberInput
                      defaultValue={0.0}
                      max={toTokenBalance}
                      value={toValue}
                    >
                      <NumberInputField
                        color="teal"
                        backgroundColor="white"
                        opacity={0.5}
                        onChange={handleToChange}
                      />
                    </NumberInput>
                    <InputRightAddon
                      children={
                        <Button onClick={setToMaxValue} size="xs">
                          Max
                        </Button>
                      }
                    />
                  </InputGroup>
                </Center>
                <Center p="4">
                  <Stat>
                    <StatLabel>Price ({toTokenName}/{fromTokenName}):</StatLabel>
                    <StatNumber fontSize="sm">{rawPrice}</StatNumber>
                  </Stat>
                </Center>
                <Center p="4">
                <Stat>
                    <StatLabel>You get ({toTokenName}):</StatLabel>
                    <StatNumber fontSize="sm">{exchangePrice}</StatNumber>
                  </Stat>
                </Center>
                <Center p="5">
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    colorScheme="pink"
                    size="lg"
                    color="white"
                    onClick={swap}
                  >
                    Swap
                  </Button>
                </Center>
              </Box>
            </Center>
          </VStack>
        </div>
      </Container>
    </div>
  );
}

export default App;
