/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import React, { useContext, useState, useEffect, useRef } from "react";
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
  StatNumber,
  AlertDialog,
  AlertDialogBody,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogFooter,
  Spinner
} from "@chakra-ui/react";
import { ArrowUpDownIcon, ArrowForwardIcon, CloseIcon } from "@chakra-ui/icons";
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
    getRawPrice,
    web3_connected,
    mintSimUSD
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
  const [eth2SimEth, setEth2SimEth] = useState(ethForSimEth);
  const [mintLoading, setMintLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [alertColorScheme, setAlertColorScheme] = useState("green");
  const [dialogShown, setDialogShown] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const cancelRef = useRef();

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

  const setMaxETHToSimETH = () => {
    setEth2SimEth(eth_balance);
  };

  const handleFromChange = e => {
    setFromValue(e.target.value);
  };

  const handleToChange = e => {
    setToValue(e.target.value);
  };

  const swap = async () => {
    try {
      setSwapLoading(true);
      await swapTokens(fromAddress, toAddress, fromValue, toValue);
      setSwapLoading(false);
      setDialogMessage("Successfully swapped");
      setAlertColorScheme("green");
      setDialogShown(true);
    } catch (error) {
      setSwapLoading(false);
      setDialogMessage(error.message);
      setAlertColorScheme("red");
      setDialogShown(true);
    }
  };

  const getSimUSD = async () => {
    try {
      setMintLoading(true);
      await mintSimUSD();
      setDialogMessage("Successfully minted some SimUSD");
      setAlertColorScheme("green");
      setDialogShown(true);
      setMintLoading(false);
    } catch (error) {
      setDialogMessage(error.message);
      setAlertColorScheme("red");
      setDialogShown(true);
      setMintLoading(false);
    }
  };

  const getSimETHFromETH = async () => {
    try {
      setConvertLoading(true);
      await exchangeETHForSimETH();
      setDialogMessage("Successfully exchanged ETH for SimETH");
      setAlertColorScheme("green");
      setDialogShown(true);
      setConvertLoading(false);
    } catch (error) {
      setDialogMessage(error.message);
      setAlertColorScheme("red");
      setDialogShown(true);
      setConvertLoading(false);
    }
  };

  const closeAlertIfOpen = () => {
    setDialogShown(false);
    setAlertColorScheme("green");
    setDialogMessage("");
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
    setTimeout(() => {
      if (web3_connected) {
        getRawPrice(ETHAddress, USDAddress).then(p =>
          setRawPrice(parseInt(p.toString()) / 10 ** 8)
        );
      }
    }, 500);
  }, [web3_connected]);

  useEffect(() => {
    setEth2SimEth(ethForSimEth);
  }, [ethForSimEth]);

  return (
    <div>
      <Container maxW="container.xl" bg="ghostwhite" margin="0.5" padding={3}>
        <div>
          <AlertDialog
            isOpen={dialogShown}
            onClose={closeAlertIfOpen}
            leastDestructiveRef={cancelRef}
            colorScheme={alertColorScheme}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogBody>{dialogMessage}</AlertDialogBody>
                <AlertDialogFooter>
                  <IconButton
                    ref={cancelRef}
                    onClick={closeAlertIfOpen}
                    colorScheme="teal"
                    children={<CloseIcon />}
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
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
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    if (!account) connectWeb3();
                    else logout();
                  }}
                  size="sm"
                >
                  {account
                    ? account.substring(0, account.length - 36) +
                      "..." +
                      account.substring(account.length - 4)
                    : "Connect Metamask"}
                </Button>
              </Box>
              <Spacer />
              <Button
                colorScheme="teal"
                size="sm"
                variant="ghost"
                isLoading={mintLoading}
                onClick={getSimUSD}
              >
                Get SimUSD
              </Button>
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
                <Center p="7">
                  <Stat>
                    <StatLabel>Price (SimUSD/SimETH):</StatLabel>
                    <StatNumber fontSize="sm">{rawPrice}</StatNumber>
                  </Stat>
                </Center>
                {swapLoading && (
                  <Center p="2">
                    <Spinner color="blue" />
                  </Center>
                )}
                <Center p="5">
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    colorScheme="pink"
                    size="lg"
                    color="white"
                    onClick={swap}
                    disabled={fromValue > fromTokenBalance}
                  >
                    Swap
                  </Button>
                </Center>
              </Box>
            </Center>
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
                <Heading as="h5" size="sm" p="6">
                  Convert ETH to SimETH
                </Heading>
                <Center>
                  <InputGroup size="md">
                    <NumberInput
                      defaultValue={0.0}
                      max={eth_balance}
                      value={eth2SimEth}
                    >
                      <NumberInputField
                        color="teal"
                        backgroundColor="white"
                        opacity={0.5}
                        onChange={handleEthInputChange}
                      />
                    </NumberInput>
                    <InputRightAddon
                      children={
                        <Button size="xs" onClick={setMaxETHToSimETH}>
                          Max
                        </Button>
                      }
                    />
                  </InputGroup>
                </Center>
                {convertLoading && (
                  <Center p="2">
                    <Spinner color="blue" />
                  </Center>
                )}
                <Center p="3">
                  <Button
                    rightIcon={<ArrowForwardIcon />}
                    colorScheme="pink"
                    size="lg"
                    color="white"
                    onClick={getSimETHFromETH}
                    disabled={eth2SimEth > eth_balance}
                  >
                    Convert
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
