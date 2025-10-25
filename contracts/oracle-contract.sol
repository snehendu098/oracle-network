// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface ICallbackReceiver {
    function fulfillAIRequest(
        uint256 requestId,
        string calldata result
    ) external;
}

contract AIOracle {
    struct Request {
        address requester;
        uint256 agentId;
        string prompt;
        bool fulfilled;
    }

    mapping(uint256 => Request) public requests; // Mapping the request ID to Request into an array called requests
    uint256 public requestCount;

    event OracleRequest(
        uint256 indexed requestId,
        uint256 agentId,
        string prompt
    );
    event OracleResponse(uint256 indexed requestId, string result);

    function fetchDataEvent(
        uint256 agentId,
        string calldata prompt
    ) external returns (uint256) {
        requestCount++;
        requests[requestCount] = Request(msg.sender, agentId, prompt, false);
        emit OracleRequest(requestCount, agentId, prompt);
        return requestCount;
    }

    function fullfillCompleteEvent(
        uint256 requestId,
        string calldata result
    ) external {
        Request storage r = requests[requestId];
        require(!r.fulfilled, "Already fulfilled");

        // Directly call back the requesting contract
        ICallbackReceiver receiver = ICallbackReceiver(r.requester);
        r.fulfilled = true;
        try receiver.fulfillAIRequest(requestId, result) {
            emit OracleResponse(requestId, result);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Callback failed: ", reason)));
        } catch (bytes memory) {
            revert("Callback failed: unknown error");
        }
    }
}
