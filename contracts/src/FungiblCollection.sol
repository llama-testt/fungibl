// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FungiblCollection
 * @notice The non-fungible half of a Fungibl coin. One collection per coin,
 * and the collection is its own vault:
 *
 *   - `coinToNft`  locks exactly `ratio` coins per NFT and hands out NFTs,
 *                  first from the vault's stock of returned pieces, then by
 *                  minting new ids until `maxSupply` is reached.
 *   - `claim`      same, but for specific ids the vault currently holds.
 *   - `nftToCoin`  returns NFTs to the vault and pays out `ratio` coins each.
 *
 * Every NFT outside the vault is backed 1:1 by `ratio` locked coins, so the
 * contract's coin balance is always at least `ratio * circulating()`. The
 * ratio, supply cap and coin are immutable; there is no owner, no fee and no
 * way to withdraw locked coins except by returning an NFT.
 *
 * The creator may only change the metadata base URI, until they freeze it.
 */
contract FungiblCollection is ERC721Enumerable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    IERC20 public immutable coin;
    /// @notice Coins (in the coin's base units) locked per NFT.
    uint256 public immutable ratio;
    uint256 public immutable maxSupply;
    address public immutable factory;

    address public creator;
    string private _base;
    bool public metadataFrozen;

    /// @notice Ids ever minted; ids run 1..minted.
    uint256 public minted;

    // Returned NFTs held by the vault, available to re-issue.
    uint256[] private _stock;
    mapping(uint256 id => uint256 indexPlusOne) private _stockIndex;

    event CoinToNft(address indexed account, address indexed to, uint256[] ids, uint256 coinsLocked);
    event NftToCoin(address indexed account, address indexed to, uint256[] ids, uint256 coinsReleased);
    event BaseURIUpdated(string baseURI);
    event MetadataFrozen();
    event CreatorTransferred(address indexed previousCreator, address indexed newCreator);

    error ZeroAmount();
    error ZeroAddress();
    error SoldOut();
    error NotInVault(uint256 id);
    error NotCreator();
    error Frozen();
    error InexactTransfer(uint256 expected, uint256 received);
    error TooMany();

    uint256 public constant MAX_BATCH = 50;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        IERC20 coin_,
        uint256 ratio_,
        uint256 maxSupply_,
        address creator_
    ) ERC721(name_, symbol_) {
        if (address(coin_) == address(0) || creator_ == address(0)) revert ZeroAddress();
        if (ratio_ == 0 || maxSupply_ == 0) revert ZeroAmount();
        coin = coin_;
        ratio = ratio_;
        maxSupply = maxSupply_;
        factory = msg.sender;
        creator = creator_;
        _base = baseURI_;
    }

    // ───────────────────────────── views

    /// @notice NFTs currently held by the vault and ready to re-issue.
    function inVault() public view returns (uint256) {
        return _stock.length;
    }

    /// @notice NFTs outside the vault. Each is backed by `ratio` coins.
    function circulating() public view returns (uint256) {
        return minted - _stock.length;
    }

    /// @notice NFTs a `coinToNft` call can still hand out.
    function available() public view returns (uint256) {
        return _stock.length + (maxSupply - minted);
    }

    /// @notice A page of the ids the vault holds, for `claim`.
    function vaultIds(uint256 offset, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 n = _stock.length;
        if (offset >= n) return new uint256[](0);
        uint256 end = offset + limit > n ? n : offset + limit;
        ids = new uint256[](end - offset);
        for (uint256 i = offset; i < end; ++i) ids[i - offset] = _stock[i];
    }

    function isInVault(uint256 id) external view returns (bool) {
        return _stockIndex[id] != 0;
    }

    function baseURI() external view returns (string memory) {
        return _base;
    }

    function tokenURI(uint256 id) public view override(ERC721) returns (string memory) {
        _requireOwned(id);
        return string.concat(_base, id.toString());
    }

    // ───────────────────────────── coin → NFT

    /**
     * @notice Lock `qty * ratio` coins and receive `qty` NFTs. Requires a
     * prior `approve(collection, qty * ratio)` on the coin.
     */
    function coinToNft(uint256 qty, address to) external nonReentrant returns (uint256[] memory ids) {
        if (qty == 0) revert ZeroAmount();
        if (qty > MAX_BATCH) revert TooMany();
        if (to == address(0)) revert ZeroAddress();
        if (qty > available()) revert SoldOut();

        uint256 amount = qty * ratio;
        _pull(amount);

        ids = new uint256[](qty);
        for (uint256 i = 0; i < qty; ++i) {
            uint256 id;
            uint256 n = _stock.length;
            if (n > 0) {
                id = _stock[n - 1];
                _removeFromStock(id);
                _transfer(address(this), to, id);
            } else {
                id = ++minted;
                _mint(to, id);
            }
            ids[i] = id;
        }
        emit CoinToNft(msg.sender, to, ids, amount);
    }

    /// @notice Lock coins for specific NFTs the vault currently holds.
    function claim(uint256[] calldata ids, address to) external nonReentrant {
        uint256 qty = ids.length;
        if (qty == 0) revert ZeroAmount();
        if (qty > MAX_BATCH) revert TooMany();
        if (to == address(0)) revert ZeroAddress();

        uint256 amount = qty * ratio;
        _pull(amount);

        for (uint256 i = 0; i < qty; ++i) {
            uint256 id = ids[i];
            if (_stockIndex[id] == 0) revert NotInVault(id);
            _removeFromStock(id);
            _transfer(address(this), to, id);
        }
        emit CoinToNft(msg.sender, to, ids, amount);
    }

    // ───────────────────────────── NFT → coin

    /**
     * @notice Return NFTs to the vault and receive `ratio` coins for each.
     * Caller must own each id or be approved for it.
     */
    function nftToCoin(uint256[] calldata ids, address to) external nonReentrant {
        uint256 qty = ids.length;
        if (qty == 0) revert ZeroAmount();
        if (qty > MAX_BATCH) revert TooMany();
        if (to == address(0)) revert ZeroAddress();

        for (uint256 i = 0; i < qty; ++i) {
            uint256 id = ids[i];
            // Moves the NFT into the vault; reverts unless msg.sender is the
            // owner or approved for it (and if the id does not exist).
            address prev = _update(address(this), id, msg.sender);
            if (prev == address(0) || prev == address(this)) revert NotInVault(id);
            _stock.push(id);
            _stockIndex[id] = _stock.length;
        }

        uint256 amount = qty * ratio;
        coin.safeTransfer(to, amount);
        emit NftToCoin(msg.sender, to, ids, amount);
    }

    // ───────────────────────────── creator

    /**
     * @notice Adds an NFT that was sent to this contract with a plain
     * transferFrom (instead of `nftToCoin`) back into the vault's stock, so it
     * can be re-issued. Its sender receives nothing; the coins that backed it
     * stay locked, so the collection only becomes more over-collateralised.
     */
    function sync(uint256 id) external {
        if (_ownerOf(id) != address(this) || _stockIndex[id] != 0) revert NotInVault(id);
        _stock.push(id);
        _stockIndex[id] = _stock.length;
    }

    function setBaseURI(string calldata baseURI_) external {
        if (msg.sender != creator) revert NotCreator();
        if (metadataFrozen) revert Frozen();
        _base = baseURI_;
        emit BaseURIUpdated(baseURI_);
        // ERC-4906: all metadata may have changed
        if (minted > 0) emit BatchMetadataUpdate(1, minted);
    }

    function freezeMetadata() external {
        if (msg.sender != creator) revert NotCreator();
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    function transferCreator(address newCreator) external {
        if (msg.sender != creator) revert NotCreator();
        if (newCreator == address(0)) revert ZeroAddress();
        emit CreatorTransferred(creator, newCreator);
        creator = newCreator;
    }

    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable) returns (bool) {
        return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
    }

    /// @notice Ids held by `owner`, for wallets and the Fungibl UI.
    function idsOf(address owner, uint256 offset, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 n = balanceOf(owner);
        if (offset >= n) return new uint256[](0);
        uint256 end = offset + limit > n ? n : offset + limit;
        ids = new uint256[](end - offset);
        for (uint256 i = offset; i < end; ++i) ids[i - offset] = tokenOfOwnerByIndex(owner, i);
    }

    // ───────────────────────────── internals

    /// @dev Pull exactly `amount` coins; rejects fee-on-transfer behaviour.
    function _pull(uint256 amount) private {
        uint256 before = coin.balanceOf(address(this));
        coin.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = coin.balanceOf(address(this)) - before;
        if (received != amount) revert InexactTransfer(amount, received);
    }

    function _removeFromStock(uint256 id) private {
        uint256 idx = _stockIndex[id] - 1;
        uint256 last = _stock.length - 1;
        if (idx != last) {
            uint256 moved = _stock[last];
            _stock[idx] = moved;
            _stockIndex[moved] = idx + 1;
        }
        _stock.pop();
        delete _stockIndex[id];
    }
}
