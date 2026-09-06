export enum MaterialCategory {
  PCB = "PCB",
  BATTERY = "BATTERY",
  CABLE = "CABLE",
  CRT_LCD = "CRT_LCD",
  MOTOR_MAGNET = "MOTOR_MAGNET",
  MIXED_PLASTIC = "MIXED_PLASTIC",
}

export enum AuthorizationStatus {
  AUTHORIZED = "AUTHORIZED",
  PENDING = "PENDING",
  REVOKED = "REVOKED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export enum TransactionStatus {
  QUOTED = "QUOTED",
  MATCHED = "MATCHED",
  HANDED_OVER = "HANDED_OVER",
  VERIFIED = "VERIFIED",
  COMPLETED = "COMPLETED",
}

export enum PreferredLanguage {
  EN = "EN",
  HI = "HI",
}

export interface SessionPayload {
  role: "COLLECTOR" | "RECYCLER" | "ADMIN";
  userId: string;
  phone?: string;
  email?: string;
  name?: string;
}
