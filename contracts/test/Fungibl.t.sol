// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {FungiblFactory} from "../src/FungiblFactory.sol";
import {FungiblCollection} from "../src/FungiblCollection.sol";
import {MockCoin, MockPons, FeeCoin} from "./mocks/Mocks.sol";

contract FungiblTest is Test {
    MockPons pons;
    FungiblFactory factory;
    MockCoin coin;
    FungiblCollection col;

    address creator = makeAddr("creator");
    address feeRecipient = makeAddr("feeRecipient");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant RATIO = 100_000 ether;
    uint256 constant SUPPLY = 1_000;

    function setUp() public {
        pons = new MockPons();
        factory = new FungiblFactory(pons);
        coin = new MockCoin();
        pons.set(address(coin), creator, feeRecipient);
        vm.prank(creator);
        col = FungiblCollection(factory.createCollection(address(coin), "Super Inu Originals", "SINU", "https://x/", RATIO, SUPPLY));
        coin.transfer(alice, 10_000_000 ether);
        coin.transfer(bob, 10_000_000 ether);
    }

    // ───────────── factory

    function test_factoryRecordsCollection() public view {
        assertEq(factory.collectionOf(address(coin)), address(col));
        assertEq(factory.collectionsCount(), 1);
        assertEq(col.creator(), creator);
        assertEq(col.ratio(), RATIO);
        assertEq(col.maxSupply(), SUPPLY);
        assertEq(address(col.coin()), address(coin));
    }

    function test_predictMatches() public {
        MockCoin c2 = new MockCoin();
        pons.set(address(c2), creator, creator);
        address predicted = factory.predictCollection(address(c2), "A", "A", "u", 1 ether, 10, creator);
        vm.prank(creator);
        assertEq(factory.createCollection(address(c2), "A", "A", "u", 1 ether, 10), predicted);
    }

    function test_feeRecipientMayCreate() public {
        MockCoin c2 = new MockCoin();
        pons.set(address(c2), creator, feeRecipient);
        vm.prank(feeRecipient);
        factory.createCollection(address(c2), "A", "A", "", 1 ether, 10);
    }

    function test_revert_strangerCannotCreate() public {
        MockCoin c2 = new MockCoin();
        pons.set(address(c2), creator, feeRecipient);
        vm.prank(alice);
        vm.expectRevert(FungiblFactory.NotCoinCreator.selector);
        factory.createCollection(address(c2), "A", "A", "", 1 ether, 10);
    }

    function test_revert_notPonsLaunch() public {
        MockCoin c2 = new MockCoin();
        vm.prank(creator);
        vm.expectRevert(FungiblFactory.NotPonsLaunch.selector);
        factory.createCollection(address(c2), "A", "A", "", 1 ether, 10);
    }

    function test_revert_onlyOneCollectionPerCoin() public {
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(FungiblFactory.AlreadyExists.selector, address(col)));
        factory.createCollection(address(coin), "B", "B", "", 1 ether, 10);
    }

    function test_revert_badParams() public {
        MockCoin c2 = new MockCoin();
        pons.set(address(c2), creator, creator);
        vm.startPrank(creator);
        vm.expectRevert(FungiblFactory.BadSupply.selector);
        factory.createCollection(address(c2), "A", "A", "", 1 ether, 0);
        vm.expectRevert(FungiblFactory.BadSupply.selector);
        factory.createCollection(address(c2), "A", "A", "", 1 ether, 100_001);
        vm.expectRevert(FungiblFactory.BadRatio.selector);
        factory.createCollection(address(c2), "A", "A", "", 0, 10);
        // 1000 NFTs x 600k coins = 600M > 50% of 1B
        vm.expectRevert(FungiblFactory.BadRatio.selector);
        factory.createCollection(address(c2), "A", "A", "", 600_000 ether, 1_000);
        // exactly 50% is fine
        factory.createCollection(address(c2), "A", "A", "", 500_000 ether, 1_000);
        vm.stopPrank();
    }

    // ───────────── coin → NFT → coin

    function _buy(address who, uint256 qty) internal returns (uint256[] memory ids) {
        vm.startPrank(who);
        coin.approve(address(col), qty * RATIO);
        ids = col.coinToNft(qty, who);
        vm.stopPrank();
    }

    function test_coinToNftMintsSequentially() public {
        uint256 before = coin.balanceOf(alice);
        uint256[] memory ids = _buy(alice, 3);
        assertEq(ids[0], 1);
        assertEq(ids[2], 3);
        assertEq(col.ownerOf(2), alice);
        assertEq(col.minted(), 3);
        assertEq(coin.balanceOf(alice), before - 3 * RATIO);
        assertEq(coin.balanceOf(address(col)), 3 * RATIO);
        assertEq(col.tokenURI(2), "https://x/2");
    }

    function test_idsOfListsHoldings() public {
        _buy(alice, 3);
        uint256[] memory ids = col.idsOf(alice, 0, 10);
        assertEq(ids.length, 3);
        assertEq(col.idsOf(alice, 1, 1)[0], 2);
        assertEq(col.idsOf(bob, 0, 10).length, 0);
        assertEq(col.totalSupply(), 3);
    }

    function test_nftToCoinPaysBackExactly() public {
        uint256 start = coin.balanceOf(alice);
        uint256[] memory ids = _buy(alice, 2);
        vm.prank(alice);
        col.nftToCoin(ids, alice);
        assertEq(coin.balanceOf(alice), start);
        assertEq(col.ownerOf(1), address(col));
        assertEq(col.inVault(), 2);
        assertEq(col.circulating(), 0);
        assertEq(coin.balanceOf(address(col)), 0);
    }

    function test_returnedNftsAreReissuedBeforeMinting() public {
        uint256[] memory ids = _buy(alice, 2);
        vm.prank(alice);
        col.nftToCoin(ids, alice);
        uint256[] memory got = _buy(bob, 3);
        assertEq(col.minted(), 3); // two re-issued, one new
        assertEq(col.ownerOf(got[0]), bob);
        assertEq(col.ownerOf(got[1]), bob);
        assertEq(got[2], 3);
        assertEq(col.inVault(), 0);
    }

    function test_claimSpecificId() public {
        uint256[] memory ids = _buy(alice, 3);
        vm.prank(alice);
        col.nftToCoin(ids, alice);
        uint256[] memory want = new uint256[](1);
        want[0] = 2;
        vm.startPrank(bob);
        coin.approve(address(col), RATIO);
        col.claim(want, bob);
        vm.stopPrank();
        assertEq(col.ownerOf(2), bob);
        assertFalse(col.isInVault(2));
        assertTrue(col.isInVault(1));
        assertTrue(col.isInVault(3));
    }

    function test_revert_claimNotInVault() public {
        _buy(alice, 1);
        uint256[] memory want = new uint256[](1);
        want[0] = 1;
        vm.startPrank(bob);
        coin.approve(address(col), RATIO);
        vm.expectRevert(abi.encodeWithSelector(FungiblCollection.NotInVault.selector, 1));
        col.claim(want, bob);
        vm.stopPrank();
    }

    function test_revert_claimDuplicateIds() public {
        uint256[] memory ids = _buy(alice, 1);
        vm.prank(alice);
        col.nftToCoin(ids, alice);
        uint256[] memory want = new uint256[](2);
        want[0] = 1;
        want[1] = 1;
        vm.startPrank(bob);
        coin.approve(address(col), 2 * RATIO);
        vm.expectRevert(abi.encodeWithSelector(FungiblCollection.NotInVault.selector, 1));
        col.claim(want, bob);
        vm.stopPrank();
    }

    function test_revert_cannotRedeemSomeoneElsesNft() public {
        uint256[] memory ids = _buy(alice, 1);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, bob, ids[0]));
        col.nftToCoin(ids, bob);
    }

    function test_revert_cannotRedeemVaultNftOrNonexistent() public {
        uint256[] memory ids = _buy(alice, 1);
        vm.prank(alice);
        col.nftToCoin(ids, alice);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, alice, 1));
        col.nftToCoin(ids, alice);
        uint256[] memory ghost = new uint256[](1);
        ghost[0] = 999;
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 999));
        col.nftToCoin(ghost, alice);
    }

    function test_approvedOperatorCanRedeem() public {
        uint256[] memory ids = _buy(alice, 1);
        vm.prank(alice);
        col.setApprovalForAll(bob, true);
        uint256 b = coin.balanceOf(bob);
        vm.prank(bob);
        col.nftToCoin(ids, bob);
        assertEq(coin.balanceOf(bob), b + RATIO);
    }

    function test_revert_soldOut() public {
        MockCoin c2 = new MockCoin();
        pons.set(address(c2), creator, creator);
        vm.prank(creator);
        FungiblCollection small = FungiblCollection(factory.createCollection(address(c2), "S", "S", "", 1 ether, 2));
        c2.approve(address(small), 3 ether);
        vm.expectRevert(FungiblCollection.SoldOut.selector);
        small.coinToNft(3, address(this));
        small.coinToNft(2, address(this));
        vm.expectRevert(FungiblCollection.SoldOut.selector);
        small.coinToNft(1, address(this));
    }

    function test_revert_insufficientAllowance() public {
        vm.prank(alice);
        vm.expectRevert();
        col.coinToNft(1, alice);
    }

    function test_revert_feeOnTransferCoin() public {
        FeeCoin f = new FeeCoin();
        pons.set(address(f), creator, creator);
        vm.prank(creator);
        FungiblCollection fc = FungiblCollection(factory.createCollection(address(f), "F", "F", "", 1 ether, 10));
        f.approve(address(fc), 1 ether);
        vm.expectRevert(abi.encodeWithSelector(FungiblCollection.InexactTransfer.selector, 1 ether, 0.99 ether));
        fc.coinToNft(1, address(this));
    }

    function test_syncStrayNft() public {
        uint256[] memory ids = _buy(alice, 1);
        vm.prank(alice);
        col.transferFrom(alice, address(col), ids[0]); // wrong way to return
        assertEq(col.inVault(), 0);
        col.sync(ids[0]);
        assertEq(col.inVault(), 1);
        vm.expectRevert(abi.encodeWithSelector(FungiblCollection.NotInVault.selector, ids[0]));
        col.sync(ids[0]);
        // still fully backed: 1 coin-lot locked, 0 circulating
        assertGe(coin.balanceOf(address(col)), col.ratio() * col.circulating());
    }

    function test_revert_batchLimits() public {
        vm.startPrank(alice);
        coin.approve(address(col), type(uint256).max);
        vm.expectRevert(FungiblCollection.ZeroAmount.selector);
        col.coinToNft(0, alice);
        vm.expectRevert(FungiblCollection.TooMany.selector);
        col.coinToNft(51, alice);
        vm.expectRevert(FungiblCollection.ZeroAddress.selector);
        col.coinToNft(1, address(0));
        vm.stopPrank();
    }

    // ───────────── creator controls

    function test_creatorMetadataAndFreeze() public {
        _buy(alice, 1);
        vm.prank(alice);
        vm.expectRevert(FungiblCollection.NotCreator.selector);
        col.setBaseURI("ipfs://evil/");
        vm.prank(creator);
        col.setBaseURI("ipfs://cid/");
        assertEq(col.tokenURI(1), "ipfs://cid/1");
        vm.prank(creator);
        col.freezeMetadata();
        vm.prank(creator);
        vm.expectRevert(FungiblCollection.Frozen.selector);
        col.setBaseURI("ipfs://other/");
        vm.prank(creator);
        col.transferCreator(bob);
        assertEq(col.creator(), bob);
    }

    function test_supportsInterfaces() public view {
        assertTrue(col.supportsInterface(0x80ac58cd)); // ERC721
        assertTrue(col.supportsInterface(0x5b5e139f)); // metadata
        assertTrue(col.supportsInterface(0x49064906)); // ERC4906
        assertTrue(col.supportsInterface(0x780e9d63)); // enumerable
    }

    // ───────────── fuzz

    function testFuzz_roundTripConservesCoins(uint8 a, uint8 r) public {
        uint256 qty = bound(a, 1, 50);
        uint256 back = bound(r, 1, qty);
        uint256 start = coin.balanceOf(alice);
        uint256[] memory ids = _buy(alice, qty);
        uint256[] memory ret = new uint256[](back);
        for (uint256 i; i < back; ++i) ret[i] = ids[i];
        vm.prank(alice);
        col.nftToCoin(ret, alice);
        assertEq(coin.balanceOf(alice), start - (qty - back) * RATIO);
        assertEq(coin.balanceOf(address(col)), col.circulating() * RATIO);
    }
}
