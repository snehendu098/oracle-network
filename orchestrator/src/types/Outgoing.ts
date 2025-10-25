export interface OutgoingIO {
  timestamp: Date;
}

export type OutgoingMessage = {
  type: "JOIN_SUCCESS" | "JOIN_FAIL" | "DISCONNECT";
  data: OutgoingIO;
  success: boolean;
};
