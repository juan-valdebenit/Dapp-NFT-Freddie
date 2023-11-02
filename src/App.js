import "./App.css";
import React from "react";
import Header from "./components/Header";
import { Box , TextField, Button} from "@mui/material";
import Web3 from "web3";
import { ethers } from "ethers";
import {
  RPC,
  stakingAddress,
  randomAddress,
  stakingABI,
  chainID,
  randomABI,
  ownerAddress,
} from "./components/config";
import "react-notifications/lib/notifications.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { BiFontSize } from "react-icons/bi";

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);
const randomContract = new web3.eth.Contract(randomABI, randomAddress);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      amount: 0.1,
      radioAmount: 0.1,
      key: "",
      note: "",
      withdrawAddress: "",
      linkedAccount: "",
      metamaskWeb3: [],
      copied: false,
      stakingContract: [],
      depositLoading: false,
      withdrawLoading: false,
      openModal: false,
      currentID: "",
      lastDepositArray: [],
      arrayLength: 0,
      displayArray: [],
      withdrawAllLoading: false,
      contractETHBalance: "___",
    };
    this.handleTab = this.handleTab.bind(this);
    this.handleAmount = this.handleAmount.bind(this);
    this.handleRadioAmount = this.handleRadioAmount.bind(this);
    this.handleNote = this.handleNote.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.walletConnect = this.walletConnect.bind(this);
    this.walletDisconnect = this.walletDisconnect.bind(this);
    this.handleTooltip = this.handleTooltip.bind(this);
    this.withdrawAll = this.withdrawAll.bind(this);
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
      let linkedStakingContract = new clientWeb3.eth.Contract(
        stakingABI,
        stakingAddress
      );

      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        stakingContract: linkedStakingContract,
      });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      const clientWeb3 = window.web3;
      const accounts = await clientWeb3.eth.getAccounts();
      let linkedStakingContract = new clientWeb3.eth.Contract(
        stakingABI,
        stakingAddress
      );
      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        stakingContract: linkedStakingContract,
      });
    }
    await this.CheckStatus();
  }

  async Deposit(address, amount) {
    this.setState({
      depositLoading: true,
    });
    await this.state.stakingContract.methods
      .deposit()
      .send({
        from: address,
        value: ethers.BigNumber.from(amount * Math.pow(10, 18) + ""),
      })
      .once("error", (err) => {
        this.setState({
          depositLoading: false,
        });
      })
      .once("confirmation", async () => {
        this.setState({
          depositLoading: false,
        });
        let currentID = await stakingContract.methods.depositNo().call();
        let key = await randomContract.methods
          .viewKeyNote(currentID, 100)
          .call();
        this.setState({
          key: key,
          openModal: true,
        });
        NotificationManager.success(
          "Success",
          this.state.amount + "ETH is successfully deposited!",
          2000
        );
        this.CheckStatus();
      });
  }

  async Withdraw(address, key) {
    this.setState({
      withdrawLoading: true,
    });
    if (!web3.utils.isAddress(this.state.withdrawAddress)) {
      alert("check address!");
      this.setState({
        withdrawLoading: false,
      });
    }

    console.log(address, key);
    await this.state.stakingContract.methods
      .claim(address, web3.utils.BN(key + ""))
      .send({
        from: this.state.linkedAccount,
      })
      .once("error", (err) => {
        this.setState({
          withdrawLoading: false,
        });
      })
      .once("confirmation", async () => {
        this.setState({
          withdrawLoading: false,
        });
        NotificationManager.success("successfully withdrawd", "Withdraw", 5000);
      });
  }

  async withdrawAll() {
    console.log(this.state.linkedAccount, "11111111");
    this.setState({
      withdrawAllLoading: true,
    });
    await this.state.stakingContract.methods
      .claimAll(this.state.linkedAccount)
      .send({
        from: this.state.linkedAccount,
      })
      .once("error", (err) => {
        this.setState({
          withdrawAllLoading: false,
        });
      })
      .once("confirmation", async () => {
        this.setState({
          withdrawAllLoading: false,
        });
        NotificationManager.success(
          "successfully withdrawed all",
          "Withdraw All",
          5000
        );
      });
  }

  async copyKey() {
    navigator.clipboard.writeText(this.state.key);
    NotificationManager.success(
      "successfully copied, please store it immediately",
      "Copied",
      5000
    );
  }

  async donateSet() {
    this.setState({
      withdrawAddress: ownerAddress,
    });
  }

  async CheckStatus() {
    let balance = await web3.eth.getBalance(stakingAddress);
    this.setState({
      contractETHBalance: (balance / Math.pow(10, 18)).toFixed(4) * 1,
    });
    let currentID = await stakingContract.methods.depositNo().call();
    this.setState({ currentId: currentID / 1 });
    let data = await stakingContract.getPastEvents("_Deposit", {
      filter: {},
      fromBlock: 0,
      toBlock: "latest",
    });

    let length = data.length;
    if (length !== this.state.arrayLength) {
      for (let index = this.state.arrayLength; index < length; index++) {
        let id = data[index].returnValues.id;
        let amount =
          (data[index].returnValues.amount / Math.pow(10, 18)).toFixed(4) * 1;
        let time =
          (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) / 1;
        let message;
        if (0 <= time && time < 59) {
          message = "Just deposted";
        } else if (60 <= time && time < 120) {
          message = "a minute ago";
        } else if (120 <= time && time < 3600) {
          message = (time / 60).toFixed() + " minutes ago";
        } else if (3600 <= time && time < 7200) {
          message = "a hour ago";
        } else if (7200 <= time && time < 86400) {
          message = (time / 3600).toFixed() + " hours ago";
        } else if (86400 <= time && time < 172800) {
          message = "a day ago";
        } else if (172800 <= time && time < 31536000) {
          message = (time / 86400).toFixed() + " days ago";
        } else if (31536000 <= time && time < 63072000) {
          message = "a year ago";
        } else if (31536000 <= time) {
          message = (time / 31536000).toFixed() + " years ago";
        }

        let record = {
          id: id,
          amount: amount,
          time: data[index].returnValues.tm,
          untilTime: time,
          message: message,
        };
        let records = this.state.lastDepositArray;
        records.push(record);
        this.setState({
          lastDepositArray: records,
        });
      }

      for (let index = 0; index < this.state.arrayLength; index++) {
        let time =
          (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) / 1;
        let message;
        if (0 <= time && time < 59) {
          message = "Just deposited";
        } else if (60 <= time && time < 120) {
          message = "a minute ago";
        } else if (120 <= time && time < 3600) {
          message = (time / 60).toFixed() + " minutes ago";
        } else if (3600 <= time && time < 7200) {
          message = "a hour ago";
        } else if (7200 <= time && time < 86400) {
          message = (time / 3600).toFixed() + " hours ago";
        } else if (86400 <= time && time < 172800) {
          message = "a day ago";
        } else if (172800 <= time && time < 31536000) {
          message = (time / 86400).toFixed() + " days ago";
        } else if (31536000 <= time && time < 63072000) {
          message = "a year ago";
        } else if (31536000 <= time) {
          message = (time / 31536000).toFixed() + " years ago";
        }
        let records = this.state.lastDepositArray;
        records[index].message = message;
        this.setState({
          lastDepositArray: records,
        });
      }

      this.setState({
        arrayLength: length,
      });
    } else {
      for (let index = 0; index < this.state.arrayLength; index++) {
        let time =
          (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) / 1;
        let message;
        if (0 <= time && time < 59) {
          message = "Just deposited";
        } else if (60 <= time && time < 120) {
          message = "a minute ago";
        } else if (120 <= time && time < 3600) {
          message = (time / 60).toFixed() + " minutes ago";
        } else if (3600 <= time && time < 7200) {
          message = "a hour ago";
        } else if (7200 <= time && time < 86400) {
          message = (time / 3600).toFixed() + " hours ago";
        } else if (86400 <= time && time < 172800) {
          message = "a day ago";
        } else if (172800 <= time && time < 31536000) {
          message = (time / 86400).toFixed() + " days ago";
        } else if (31536000 <= time && time < 63072000) {
          message = "a year ago";
        } else if (31536000 <= time) {
          message = (time / 31536000).toFixed() + " years ago";
        }
        let records = this.state.lastDepositArray;
        records[index].message = message;
        this.setState({
          lastDepositArray: records,
        });
      }
    }

    let temp = [];
    temp = JSON.parse(JSON.stringify(this.state.lastDepositArray));

    temp.reverse();
    this.setState({
      displayArray: temp,
    });
  }

  handleTab = (event, newValue) => {
    this.setState({
      tab: newValue,
    });
  };

  handleAmount = (event) => {
    this.setState({
      amount: event.target.value,
    });
  };

  handleRadioAmount = (event) => {
    this.setState({
      amount: event.target.value,
      radioAmount: event.target.value,
    });
  };

  handleNote = (event) => {
    this.setState({
      note: event.target.value,
    });
  };

  handleAddress = (event) => {
    this.setState({
      withdrawAddress: event.target.value,
    });
  };

  handleTooltip = (value) => {
    this.setState({
      copied: value,
    });
  };

  render() {
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
              <h6 style={{fontSize : "2.2em", color : "#ffffff", margin : "0.1em", paddingLeft : "2em", paddingRight: "2em"}}>How much is left?   xxx / 2000</h6>
              <div>
                <TextField id="filled-basic" label="Mint Amount" variant="filled" style={{backgroundColor : "#ffffff", height : "100%"}}/>
                <Button variant="contained" size="large" style={{ height : "100%" }}>Contained</Button>
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
