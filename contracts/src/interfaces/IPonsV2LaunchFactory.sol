// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice The slice of Pons V2 (PonsV2LaunchFactory) that Fungibl reads.
/// Source: github.com/ponsdotdev/pons-labs — contractsV2/src/v2/interfaces/ILaunchpadV2.sol
interface IPonsV2LaunchFactory {
    enum GraduationPhase {
        NotGraduated,
        Swept,
        PoolCreated,
        Rescued
    }

    struct LaunchedToken {
        address token;
        address curve;
        address deployer;
        address creatorFeeRecipient;
        address pairToken;
        uint256 graduationThreshold;
        uint24 poolFee;
        int24 tickSpacing;
        uint16 creatorTaxBps;
        bool buybackEnabled;
        GraduationPhase phase;
        uint256 sweptQuote;
        uint256 sweptTokens;
        uint256 sweptAt;
        bool exists;
    }

    function getLaunchedToken(address token) external view returns (LaunchedToken memory);
}
