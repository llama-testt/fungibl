// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {FungiblFactory} from "../src/FungiblFactory.sol";
import {FungiblCollection} from "../src/FungiblCollection.sol";
import {MockCoin, MockPons} from "./mocks/Mocks.sol";

/// Random users buy, redeem and claim; the vault must stay fully backed.
contract Handler is Test {
    FungiblCollection public col;
    MockCoin public coin;
    address[] public users;

    constructor(FungiblCollection c, MockCoin k) {
        col = c;
        coin = k;
    }

    function init() external {
        for (uint256 i; i < 4; ++i) {
            address u = address(uint160(0x1000 + i));
            users.push(u);
            coin.transfer(u, 50_000_000 ether);
            vm.prank(u);
            coin.approve(address(col), type(uint256).max);
        }
    }

    function buy(uint256 who, uint256 qty) external {
        address u = users[who % users.length];
        qty = bound(qty, 1, 5);
        if (qty > col.available() || coin.balanceOf(u) < qty * col.ratio()) return;
        vm.prank(u);
        col.coinToNft(qty, u);
    }

    function redeem(uint256 who, uint256 idSeed) external {
        address u = users[who % users.length];
        uint256 m = col.minted();
        if (m == 0) return;
        uint256 id = bound(idSeed, 1, m);
        if (col.ownerOf(id) != u) return;
        uint256[] memory ids = new uint256[](1);
        ids[0] = id;
        vm.prank(u);
        col.nftToCoin(ids, u);
    }

    function claim(uint256 who, uint256 idx) external {
        address u = users[who % users.length];
        uint256 n = col.inVault();
        if (n == 0 || coin.balanceOf(u) < col.ratio()) return;
        uint256[] memory ids = col.vaultIds(bound(idx, 0, n - 1), 1);
        vm.prank(u);
        col.claim(ids, u);
    }
}

contract InvariantTest is Test {
    FungiblCollection col;
    MockCoin coin;
    Handler h;

    function setUp() public {
        MockPons pons = new MockPons();
        FungiblFactory f = new FungiblFactory(pons);
        coin = new MockCoin();
        pons.set(address(coin), address(this), address(this));
        col = FungiblCollection(f.createCollection(address(coin), "C", "C", "", 1_000_000 ether, 40));
        h = new Handler(col, coin);
        coin.transfer(address(h), 200_000_000 ether);
        h.init();
        targetContract(address(h));
        bytes4[] memory sel = new bytes4[](3);
        sel[0] = Handler.buy.selector;
        sel[1] = Handler.redeem.selector;
        sel[2] = Handler.claim.selector;
        targetSelector(FuzzSelector({addr: address(h), selectors: sel}));
    }

    function invariant_fullyBacked() public view {
        assertEq(coin.balanceOf(address(col)), col.ratio() * col.circulating());
    }

    function invariant_supplyCap() public view {
        assertLe(col.minted(), col.maxSupply());
        assertEq(col.available(), col.inVault() + col.maxSupply() - col.minted());
    }
}
