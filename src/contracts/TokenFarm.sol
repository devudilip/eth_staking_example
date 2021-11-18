pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";


contract TokenFarm {
	// all code goes here
	string public name = "Dapp Token Farm";
	DappToken public dappToken;
	DaiToken public daiToken;
	address public owner;

    address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;


	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}


	// Stake tokens

	function stakeTokens(uint _amount) public {

		require(_amount > 0, "amount cannot be 0");

		// transfer tokens to this contract for stakeing

		daiToken.transferFrom(msg.sender, address(this), _amount);

		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;

	}

	function unstakeTokens() public {
		uint balance = stakingBalance[msg.sender];

		require(balance > 0, "No balance to unstake");

		daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
		isStaking[msg.sender] = false;
	}





	function issueTokens() public {
		require(msg.sender == owner, "caller must be owner");
		for(uint i=0; i<stakers.length; i++) {
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			if(balance > 0) {
			  dappToken.transfer(recipient, balance);
			}

		}
	}





}

