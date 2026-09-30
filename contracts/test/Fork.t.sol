// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FungiblFactory} from "../src/FungiblFactory.sol";
import {FungiblCollection} from "../src/FungiblCollection.sol";
import {IPonsV2LaunchFactory} from "../src/interfaces/IPonsV2LaunchFactory.sol";

interface IPonsLaunch {
    struct Socials {
        string twitter;
        string telegram;
        string discord;
        string website;
        string farcaster;
    }

    struct TokenParams {
        string name;
        string symbol;
        string logo;
        string description;
        Socials socials;
        address creatorFeeRecipient;
        uint16 creatorTaxBps;
        bool buybackEnabled;
        bytes32 expectedEconomics;
        bytes32 salt;
    }

    function launchFee() external view returns (uint256);
    function previewLaunchEconomics(uint256 launchConfigId, address pairToken) external view returns (bytes32);
    function launchToken(TokenParams calldata params, uint256 launchConfigId, address pairToken)
        external
        payable
        returns (address token, address curve);
}

interface ICurve {
    function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) external payable returns (uint256);
}

/// End-to-end against live Pons V2 on a Robinhood Chain fork.
/// Run: FORK_URL=https://rpc.mainnet.chain.robinhood.com forge test --mc ForkTest -vv
contract ForkTest is Test {
    address constant PONS = 0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e;

    function test_fork_launchCollectLockRedeem() public {
        string memory url = vm.envOr("FORK_URL", string(""));
        if (bytes(url).length == 0) return; // skipped offline
        vm.createSelectFork(url);

        address creator = makeAddr("creator");
        address fan = makeAddr("fan");
        vm.deal(creator, 10 ether);
        vm.deal(fan, 10 ether);

        FungiblFactory factory = new FungiblFactory(IPonsV2LaunchFactory(PONS));
        IPonsLaunch pons = IPonsLaunch(PONS);

        IPonsLaunch.TokenParams memory p = IPonsLaunch.TokenParams({
            name: "Fork Inu",
            symbol: "FINU",
            logo: "",
            description: "fork test",
            socials: IPonsLaunch.Socials("", "", "", "", ""),
            creatorFeeRecipient: creator,
            creatorTaxBps: 100,
            buybackEnabled: true,
            expectedEconomics: pons.previewLaunchEconomics(0, address(0)),
            salt: keccak256("fungibl-fork-test")
        });
        uint256 fee = pons.launchFee();
        vm.prank(creator);
        (address token, address curve) = pons.launchToken{value: fee}(p, 0, address(0));
        emit log_named_address("launched token", token);

        // A fan buys on the curve after the snipe window.
        vm.warp(block.timestamp + 120);
        vm.prank(fan);
        uint256 got = ICurve(curve).buy{value: 0.5 ether}(0.5 ether, 0, fan);
        emit log_named_uint("fan tokens (whole)", got / 1e18);

        // Stranger can't open the collection; creator can.
        vm.prank(fan);
        vm.expectRevert(FungiblFactory.NotCoinCreator.selector);
        factory.createCollection(token, "Fork Inu Originals", "FINUNFT", "https://f/", 100_000 ether, 1_000);

        vm.prank(creator);
        FungiblCollection col = FungiblCollection(
            factory.createCollection(token, "Fork Inu Originals", "FINUNFT", "https://f/", 100_000 ether, 1_000)
        );

        uint256 n = got / col.ratio();
        if (n > 3) n = 3;
        assertGt(n, 0, "fan should afford at least one NFT");
        uint256 before = IERC20(token).balanceOf(fan);
        vm.startPrank(fan);
        IERC20(token).approve(address(col), n * col.ratio());
        uint256[] memory ids = col.coinToNft(n, fan);
        assertEq(col.balanceOf(fan), n);
        assertEq(IERC20(token).balanceOf(address(col)), n * col.ratio());

        col.nftToCoin(ids, fan);
        vm.stopPrank();
        assertEq(IERC20(token).balanceOf(fan), before);
        assertEq(col.inVault(), n);
        assertEq(IERC20(token).balanceOf(address(col)), 0);
    }
}
