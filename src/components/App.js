import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Main from './Main'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'


class App extends Component {

async componentWillMount() {
  await this.loadweb3();
  await this.loadBlockChainData();
}


async loadBlockChainData() {
  const web3 = window.web3;

  const accounts = await web3.eth.getAccounts();
  this.setState({account: accounts[0]});

  const networkId = await web3.eth.net.getId();
  console.log(networkId)


  const daiTokenData = DaiToken.networks[networkId];
  if(daiTokenData) {
    const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address);
    this.setState({daiToken})
    let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call();
    this.setState({daiTokenBalance: daiTokenBalance.toString()})
  } else {
    window.alert('no dai token foudn on network')
  }


  const dappTokenData = DappToken.networks[networkId];
  if(dappTokenData) {
    const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address);
    this.setState({dappToken})
    let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call();
    this.setState({dappTokenBalance: dappTokenBalance.toString()})
    console.log(dappTokenBalance)
  } else {
    window.alert('no dapp token foudn on network')
  }

  const tokenFarmData = TokenFarm.networks[networkId];
  if(tokenFarmData) {
    const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);
    this.setState({tokenFarm})
    let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call();
    this.setState({stakingBalance: stakingBalance.toString()})
    console.log(stakingBalance)
  } else {
    window.alert('TokenFarm not found on network')
  }


}


  async loadweb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('No ethreum found')
    }

    this.setState({loading: false})
  }

  stakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })

  }


   unstakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {

    let content
    if(this.state.loading) {
     content = "Loading"
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unstakeTokens = {this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
