import { parseAbi } from "viem";

/** Set after deploying FungiblFactory (see /deploy). Empty = collections not live yet. */
export const FUNGIBL_FACTORY = (process.env.NEXT_PUBLIC_FUNGIBL_FACTORY || "") as `0x${string}` | "";

export const fungiblFactoryAbi = parseAbi([
  "function collectionOf(address coin) view returns (address)",
  "function collectionsCount() view returns (uint256)",
  "function createCollection(address coin, string name, string symbol, string baseURI, uint256 ratio, uint256 maxSupply) returns (address collection)",
  "event CollectionCreated(address indexed coin, address indexed collection, address indexed creator, uint256 maxSupply, uint256 ratio)",
  "error NotPonsLaunch()",
  "error NotCoinCreator()",
  "error AlreadyExists(address collection)",
  "error BadSupply()",
  "error BadRatio()",
]);

export const collectionAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function coin() view returns (address)",
  "function ratio() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function minted() view returns (uint256)",
  "function inVault() view returns (uint256)",
  "function circulating() view returns (uint256)",
  "function available() view returns (uint256)",
  "function creator() view returns (address)",
  "function baseURI() view returns (string)",
  "function metadataFrozen() view returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function idsOf(address owner, uint256 offset, uint256 limit) view returns (uint256[])",
  "function vaultIds(uint256 offset, uint256 limit) view returns (uint256[])",
  "function coinToNft(uint256 qty, address to) returns (uint256[] ids)",
  "function claim(uint256[] ids, address to)",
  "function nftToCoin(uint256[] ids, address to)",
  "function setBaseURI(string baseURI)",
  "function freezeMetadata()",
  "error ZeroAmount()",
  "error ZeroAddress()",
  "error SoldOut()",
  "error NotInVault(uint256 id)",
  "error NotCreator()",
  "error Frozen()",
  "error InexactTransfer(uint256 expected, uint256 received)",
  "error TooMany()",
  "error ERC721InsufficientApproval(address operator, uint256 tokenId)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
]);

export const erc20Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
]);
