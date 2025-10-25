export interface OutgoingIO {
  timestamp: Date;
}

export interface OracleRequestData extends OutgoingIO {
  requestId: string;
  agentId: string;
  prompt: string;
}

export type OutgoingMessage = {
  type: "JOIN_SUCCESS" | "JOIN_FAIL" | "DISCONNECT";
  data: OutgoingIO;
  success: boolean;
} | {
  type: "ORACLE_REQUEST";
  data: OracleRequestData;
  success: boolean;
};
