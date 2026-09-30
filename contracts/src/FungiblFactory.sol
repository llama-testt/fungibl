// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FungiblCollection} from "./FungiblCollection.sol";
import {IPonsV2LaunchFactory} from "./interfaces/IPonsV2LaunchFactory.sol";

/**
 * @title FungiblFactory
 * @notice Gives a Pons V2 coin its one official collection.
 *
 * Only the coin's Pons deployer or its current creator-fee recipient may
 * create the collection, and each coin gets exactly one. The collection is
 * deployed with CREATE2 salted by the coin address, so its address is known
 * before it exists. The factory has no owner and holds no funds.
 */
contract FungiblFactory {
    IPonsV2LaunchFactory public immutable pons;

    /// @notice Hard ceilings so a typo can't create an unusable collection.
    uint256 public constant MAX_SUPPLY = 100_000;
    /// @notice At most half the coin supply can ever sit in NFT form.
    uint256 public constant MAX_BACKING_BPS = 5_000;

    mapping(address coin => address collection) public collectionOf;
    address[] public allCollections;

    event CollectionCreated(
        address indexed coin, address indexed collection, address indexed creator, uint256 maxSupply, uint256 ratio
    );

    error NotPonsLaunch();
    error NotCoinCreator();
    error AlreadyExists(address collection);
    error BadSupply();
    error BadRatio();

    constructor(IPonsV2LaunchFactory pons_) {
        pons = pons_;
    }

    function collectionsCount() external view returns (uint256) {
        return allCollections.length;
    }

    /// @notice Address the collection for `coin` will have (or has).
    function predictCollection(
        address coin,
        string calldata name,
        string calldata symbol,
        string calldata baseURI,
        uint256 ratio,
        uint256 maxSupply,
        address creator
    ) external view returns (address) {
        bytes32 initHash = keccak256(
            abi.encodePacked(
                type(FungiblCollection).creationCode,
                abi.encode(name, symbol, baseURI, IERC20(coin), ratio, maxSupply, creator)
            )
        );
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), _salt(coin), initHash)))));
    }

    /**
     * @param coin      A Pons V2 launch token.
     * @param ratio     Coins (base units) locked per NFT.
     * @param maxSupply Maximum NFTs; `ratio * maxSupply` may not exceed half the coin supply.
     */
    function createCollection(
        address coin,
        string calldata name,
        string calldata symbol,
        string calldata baseURI,
        uint256 ratio,
        uint256 maxSupply
    ) external returns (address collection) {
        IPonsV2LaunchFactory.LaunchedToken memory rec = pons.getLaunchedToken(coin);
        if (!rec.exists || rec.token != coin) revert NotPonsLaunch();
        if (msg.sender != rec.deployer && msg.sender != rec.creatorFeeRecipient) revert NotCoinCreator();
        if (collectionOf[coin] != address(0)) revert AlreadyExists(collectionOf[coin]);
        if (maxSupply == 0 || maxSupply > MAX_SUPPLY) revert BadSupply();
        uint256 supply = IERC20(coin).totalSupply();
        if (ratio == 0 || ratio * maxSupply > (supply * MAX_BACKING_BPS) / 10_000) revert BadRatio();

        collection = address(
            new FungiblCollection{salt: _salt(coin)}(name, symbol, baseURI, IERC20(coin), ratio, maxSupply, msg.sender)
        );
        collectionOf[coin] = collection;
        allCollections.push(collection);
        emit CollectionCreated(coin, collection, msg.sender, maxSupply, ratio);
    }

    function _salt(address coin) private pure returns (bytes32) {
        return bytes32(uint256(uint160(coin)));
    }
}
