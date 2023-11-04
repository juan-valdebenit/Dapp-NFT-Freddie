import "./App.css";
import React from "react";
import Header from "./components/Header";
import { Box , Button, Slider} from "@mui/material";
import Web3 from "web3";
import { ethers } from "ethers";
import {
  RPC,
  nftABI,
  nftAddress,
  chainID,
} from "./components/config";
import "react-notifications/lib/notifications.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";


const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const nftContract = new web3.eth.Contract(nftABI, nftAddress);





class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      linkedAccount : '',
      metamaskWeb3: [],
      nftContract: [],
      mintedAmount : 0,
      mintAmount : 0
    };
    this.handleAmount = this.handleAmount.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.walletConnect = this.walletConnect.bind(this);
    this.walletDisconnect = this.walletDisconnect.bind(this);
  }

  async componentWillMount() {
    this.CheckStatus();
    setInterval(() => {
      this.CheckStatus();
    }, 30000);
  }

  async walletConnect() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainID) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: web3.utils.toHex(chainID),
                chainName: "goerli",
                rpcUrls: [RPC],
                nativeCurrency: {
                  name: "GerliEth",
                  symbol: "Geth", // 2-6 characters long
                  decimals: 18,
                },
                blockExplorerUrls: "https://goerli.etherscan.io/",
              },
            ],
          });

          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainID) }],
          });
        } catch (addError) {}
      }
    }

    window.ethereum.on("accountsChanged", async () => {
      this.caputureWallet();
    });

    window.ethereum.on("accountsChanged", async () => {
      this.caputureWallet();
    });

    window.ethereum.on("disconnect", async () => {
      this.setState({
        linkedAccount: "",
      });
    });

    window.ethereum.on("chainChanged", async () => {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(chainID) }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: web3.utils.toHex(chainID),
                  chainName: "goerli",
                  rpcUrls: [RPC],
                  nativeCurrency: {
                    name: "GerliEth",
                    symbol: "Geth", // 2-6 characters long
                    decimals: 18,
                  },
                  blockExplorerUrls: "https://goerli.etherscan.io/",
                },
              ],
            });

            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: web3.utils.toHex(chainID) }],
            });
          } catch (addError) {}
        }
      }
    });
    this.caputureWallet();
  }

  async walletDisconnect() {
    this.setState({ linkedAccount: "" });
  }

  async caputureWallet() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const clientWeb3 = window.web3;
      const accounts = await clientWeb3.eth.getAccounts();
      let linkedNFTContract = new clientWeb3.eth.Contract(
        nftABI,
        nftAddress
      );

      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        nftContract: linkedNFTContract,
      });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      const clientWeb3 = window.web3;
      const accounts = await clientWeb3.eth.getAccounts();
      let linkedNFTContract = new clientWeb3.eth.Contract(
        nftABI,
        nftAddress
      );
      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        nftContract: linkedNFTContract,
      });
    }
    await this.CheckStatus();
  }

  async CheckStatus() {
    let supply = await nftContract.methods.totalSupply().call()
    this.setState({
      mintedAmount : supply / 1
    })
  }

  async mint(){

    if (this.state.linkedAccount == ""){
      alert("please connect wallet!")
      return
    }

    let price = await nftContract.methods.PRICE().call()


    await this.state.nftContract.methods.Mint(this.state.mintAmount)
    .send({
      from : this.state.linkedAccount,
      value : ethers.BigNumber.from((this.state.mintAmount * price/1) + '')
    })
    .once('confirmation', () => {
      alert("Mint Successfully")
  })

  }



  handleAmount = (event) => {
    this.setState({
      amount: event.target.value,
    });
  };

  handleAddress = (event) => {
    this.setState({
      withdrawAddress: event.target.value,
    });
  };


  render() {
    const handleMintNumber = (event) => {
      this.setState({
        mintAmount: event.target.value
      });
    };

    return (
      <div className="App">
        <Header
          className="Header"
          walletConnect={this.walletConnect}
          walletDisconnect={this.walletDisconnect}
          linkedAccount={this.state.linkedAccount}
          withdrawAllLoading={this.state.withdrawAllLoading}
          withdrawAll={this.withdrawAll}
        />
        <Box id="header-background">
          <Box
            component="img"
            src="/back.png"
            sx={{ width: "100%", height: "auto" }}
          />
        </Box>
        <Box id="body">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ width: "3%" }}></div>
            <div style={{ width: "30%" }}>
                <Box
                  component="img"
                  src="/left.png"
                  sx={{ width: "100%", height: "auto", marginBottom : "0px", marginTop : "100px"}}
                />
                <div style={{backgroundColor : "#000000"}}>
                  <h6 style={{fontSize : "2em", color : "#ffffff", margin : "0.1em"}}>Supply : 2000</h6>
                  <h6 style={{fontSize : "2em", color : "#ffffff", margin : "0.1em"}}>Price : 0.04 ETH</h6>
                </div>
            </div>

            <div style={{ width: "56%", paddingTop : "7em" }}>

              <h6 style={{fontSize : "2.8em", color : "#ffffff", margin : "0.1em"}}>Freddie’s Crew Mint</h6> <br/>
              <h6 style={{fontSize : "1.6em", color : "#ffffff", margin : "0.1em", paddingLeft : "2em", paddingRight: "2em"}}>When you own a Freddie's Crew NFT, you are holding an identity proving your membership in the Crew. Being part of the Crew will keep give you exclusive access to The Basement.</h6>
              <br/>
              <h6 style={{fontSize : "1.6em", color : "#ffffff", margin : "0.1em", paddingLeft : "2em", paddingRight: "2em"}}>Each member of Freddie's Crew is programmed and generated from around 70 traits through different layers. While each member of the Crew is unique, some traits are programmed to be rarer than others</h6>
              <br/>
              <h6 style={{fontSize : "2.2em", color : "#ffffff", margin : "0.1em", paddingLeft : "2em", paddingRight: "2em"}}>{this.state.mintedAmount} / 2000 Minted</h6>
              <div>
              <Slider
                aria-label="Small steps"
                defaultValue={1}
                step={1}
                marks
                min={1}
                max={4}
                valueLabelDisplay="aonuto"
                style={{width : "50%"}}
                onChange={handleMintNumber}
              /><br/>
                <Button variant="contained" size="large" style={{ height : "100%" }} onClick={()=>this.mint()}>Mint</Button>
              </div>
              
            </div>
            <div style={{ width: "12%" }}>
              <Box
                component="img"
                src="/right.png"
                sx={{ width: "100%", height: "auto" ,marginTop : "100px"}}
              />
            </div>
            <div style={{ width: "3%" }}></div>
          </div>
        </Box>
      </div>
    );
  }
}

export default App;
