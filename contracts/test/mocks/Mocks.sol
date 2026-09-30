// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IPonsV2LaunchFactory} from "../../src/interfaces/IPonsV2LaunchFactory.sol";

contract MockCoin is ERC20 {
    constructor() ERC20("Super Inu", "SUPER") {
        _mint(msg.sender, 1_000_000_000 ether);
    }
}

/// Takes 1% on every transfer — must be rejected by the vault.
contract FeeCoin is ERC20 {
    constructor() ERC20("Fee", "FEE") {
        _mint(msg.sender, 1_000_000_000 ether);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            uint256 fee = value / 100;
            super._update(from, address(0xdead), fee);
            value -= fee;
        }
        super._update(from, to, value);
    }
}

contract MockPons is IPonsV2LaunchFactory {
    mapping(address => LaunchedToken) internal _l;

    function set(address token, address deployer, address feeRecipient) external {
        LaunchedToken storage r = _l[token];
        r.token = token;
        r.deployer = deployer;
        r.creatorFeeRecipient = feeRecipient;
        r.exists = true;
    }

    function getLaunchedToken(address token) external view returns (LaunchedToken memory) {
        return _l[token];
    }
}
