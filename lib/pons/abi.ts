import { parseAbi } from "viem";

const SOCIALS = "(string twitter,string telegram,string discord,string website,string farcaster)";
const TOKEN_PARAMS = `(string name,string symbol,string logo,string description,${SOCIALS} socials,address creatorFeeRecipient,uint16 creatorTaxBps,bool buybackEnabled,bytes32 expectedEconomics,bytes32 salt)`;

export const factoryAbi = parseAbi([
  `function launchToken(${TOKEN_PARAMS} params, uint256 launchConfigId, address pairToken) payable returns (address token, address curve)`,
  "function launchFee() view returns (uint256)",
  "function launchEnabled() view returns (bool)",
  "function canLaunch(address launcher) view returns (bool)",
  "function maxCreatorTaxBps() view returns (uint256)",
  "function launchConfigCount() view returns (uint256)",
  "function getLaunchConfig(uint256 id) view returns ((uint256 supply,uint256 curveFeeBps,uint256 phantomQuote,uint256 graduationThreshold,uint24 poolFee,int24 tickSpacing,bool enabled))",
  "function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)",
  "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
  "error NotWhitelisted()",
  "error LaunchFeeNotPaid()",
  "error CreatorTaxTooHigh()",
  "error LaunchEconomicsMismatch(bytes32 expected, bytes32 actual)",
  "error LaunchConfigDisabled()",
  "error InvalidTokenParams()",
  "error InvalidLaunchConfigId()",
  "error LaunchDeployerNotSet()",
  "error PairTokenNotApproved()",
  "event PoolGraduated(address indexed token, uint256 positionId, uint256 tokenAmount, uint256 pairTokenAmount)",
]);

export const tokenAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  `function getTokenInfo() view returns (address tokenDeployer, string tokenLogo, string tokenDescription, ${SOCIALS} tokenSocials)`,
]);

export const curveAbi = parseAbi([
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function realQuoteReserve() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
  "function graduated() view returns (bool)",
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
  "event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)",
]);
