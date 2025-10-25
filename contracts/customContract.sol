// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IAIOracle {
    function fetchDataEvent(
        uint256 agentId,
        string calldata prompt
    ) external returns (uint256);
}

contract CustomContract {
    address public oracleAddress;

    struct AIResponse {
        uint256 requestId;
        string result;
        bool received;
    }

    mapping(uint256 => AIResponse) public responses;
    mapping(address => uint256[]) public userRequests;

    event DataRequested(address indexed user, uint256 requestId, uint256 agentId, string prompt);
    event DataReceived(uint256 indexed requestId, string result);

    constructor(address _oracleAddress) {
        oracleAddress = _oracleAddress;
    }

    // User calls this function to request AI data
    function fetchData(
        uint256 agentId,
        string calldata prompt
    ) external returns (uint256) {
        IAIOracle oracle = IAIOracle(oracleAddress);
        uint256 requestId = oracle.fetchDataEvent(agentId, prompt);

        userRequests[msg.sender].push(requestId);
        responses[requestId] = AIResponse(requestId, "", false);

        emit DataRequested(msg.sender, requestId, agentId, prompt);
        return requestId;
    }

    // Oracle calls this function to fulfill the request
    function fulfillAIRequest(
        uint256 requestId,
        string calldata result
    ) external {
        require(msg.sender == oracleAddress, "Only oracle can fulfill");
        require(!responses[requestId].received, "Already fulfilled");

        responses[requestId].result = result;
        responses[requestId].received = true;

        emit DataReceived(requestId, result);
    }

    // User can retrieve their response
    function getResponse(uint256 requestId) external view returns (string memory) {
        require(responses[requestId].received, "Response not yet received");
        return responses[requestId].result;
    }

    // Get all request IDs for a user
    function getUserRequests(address user) external view returns (uint256[] memory) {
        return userRequests[user];
    }
}
