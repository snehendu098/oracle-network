export interface IncomingIO {
  timestamp: Date;
}

export interface OracleResponseData extends IncomingIO {
  requestId: string;
  agentId: string;
  response: string;
  nodePublicKey: string;
}

export type IncomingData = {
  type: "ACCEPT_CONN";
} | {
  type: "ORACLE_RESPONSE";
  data: OracleResponseData;
};
