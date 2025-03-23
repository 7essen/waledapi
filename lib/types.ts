export type VpsAccount = {
  id?: string
  userId?: string
  type: "SSH" | "VLESS" | "TROJAN"
  ip_address: string
  username: string
  password: string
  expiry_date: string
  status: "active" | "inactive"
  createdAt: number
  updatedAt: number
}

