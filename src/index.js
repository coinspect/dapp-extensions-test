import MetaMaskOnboarding from '@metamask/onboarding';

// eslint-disable-next-line camelcase
import {
  recoverTypedSignature_v4 as recoverTypedSignatureV4,
} from 'eth-sig-util';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';


let ethersProvider;
const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;


// Dapp Status Section
const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResults = document.getElementById('getAccountsResult');


const signTypedDataV4 = document.getElementById('signTypedDataV4');
const signTypedDataV4Result = document.getElementById('signTypedDataV4Result');

function convertUtf8ToHex(myString){
  return Buffer.from(myString).toString('hex')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const initialize = async () => {
  
  // We must specify the network as 'any' for ethers to allow network changes
  ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');

  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  let accounts;
  let accountButtonsInitialized = true;

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickConnect = async () => {
    console.log("Connecting...")
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      handleNewAccounts(newAccounts);
    } catch (error) {
      console.error(error);
    }
  };


  const updateButtons = () => {
    signTypedDataV4.disabled = false;
    onboardButton.innerText = 'Connect';
    onboardButton.onclick = onClickConnect;
    onboardButton.disabled = false;   

  };


  const initializeAccountButtons = () => {
    if (accountButtonsInitialized) {
      return;
    }
    accountButtonsInitialized = true;
  };

  getAccountsButton.onclick = async () => {
    try {
      // console.log("requesting accounts")
      onboardButton.disabled = false;
      signTypedDataV4.disabled = false;
      
      // console.error("requesting accounts")
      const _accounts = await ethereum.request({
        method: 'eth_accounts',
      });
      getAccountsResults.innerHTML =
        _accounts[0] || 'Not able to get accounts';
    } catch (err) {
      console.error("DAPP: ", err);
      getAccountsResults.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data V4
   */
  signTypedDataV4.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10);
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId;
    const address = accountsDiv.innerHTML

    const jsonStr = `{
      "types": {
          "EIP712Domain": [
              {
                  "name": "name",
                  "type": "string"
              },
              {
                  "name": "version",
                  "type": "string"
              },
              {
                  "name": "verifyingContract",
                  "type": "address"
              },
              {
                  "name": "chainId",
                  "type": "uint256"
              }
          ],
          "RelayRequest": [
              {
                  "name": "target",
                  "type": "address"
              },
              {
                  "name": "message",
                  "type": "string"
              }
          ]
      },
      "domain": {
          "name": "EIP-712 Test - Relayed Transaction",
          "version": "1",
          "chainId": 1,
          "verifyingContract": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      },
      "primaryType": "RelayRequest",
      "message": {
      }
    }`

    const msgParams = JSON.parse(jsonStr);
    
    // ************ INSERT CODE SNIPPET HERE *************
    
    // ************ INSERT CODE SNIPPET HERE *************
    
    msgParams["message"]["target"] = '0x0101010101010101010101010101010101010101'
    msgParams["message"]["message"] = 'Howdy'


    let request = {
      id: 1,
      jsonrpc: "2.0",
      method: "eth_signTypedData_v4",
      params: [
        address,
        JSON.stringify(msgParams)

      ],
    };

    try {
      const result = await ethereum.request({
        method: request.method,
        params: request.params,
      });
      console.log(request.method, " result: ",result);
      signTypedDataV4Result.innerHTML = result
    } catch(err) {
      console.log(request.method, " error: ", err);
      signTypedDataV4Result.innerHTML = `Error: ${err.message}`;
    }
    
  };

  function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    accountsDiv.innerHTML = accounts;
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    updateButtons();
  }

  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId;

    if (chainId === '0x1') {
      warningDiv.classList.remove('warning-invisible');
    } else {
      warningDiv.classList.add('warning-invisible');
    }
  }


  function handleNewNetwork(networkId) {
    networkDiv.innerHTML = networkId;
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      });
      handleNewChain(chainId);
      console.log("DAPP chainId: ", chainId)

      const networkId = await ethereum.request({
        method: 'net_version',
      });
      handleNewNetwork(networkId);
      console.log("DAPP chainId: ", chainId)

      const block = await ethereum.request({
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      });

    } catch (err) {
      console.error("DAPP: ", err);
    }
  }

  updateButtons();

  ethereum.autoRefreshOnNetworkChange = false;
  getNetworkAndChainId();

  ethereum.autoRefreshOnNetworkChange = false;
  getNetworkAndChainId();

  ethereum.on('chainChanged', (chain) => {
    handleNewChain(chain);

  });
  ethereum.on('chainChanged', handleNewNetwork);
  ethereum.on('accountsChanged', (newAccounts) => {
    handleNewAccounts(newAccounts);
    console.log("DAPP: Account changed", newAccounts)
  });

  try {
    const newAccounts = await ethereum.request({
      method: 'eth_accounts',
    });
    handleNewAccounts(newAccounts);
  } catch (err) {
    console.error('Error on init when getting accounts', err);
  }
};

window.addEventListener('load', initialize);