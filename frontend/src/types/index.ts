export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
  phone?: string
  avatar?: string
  isActive: boolean
  emailVerified: boolean
  wishlist: string[]
  cart: CartItem[]
  loyaltyPoints: number
  loyaltyHistory?: LoyaltyHistoryItem[]
  createdAt: string
  updatedAt: string
}

export interface LoyaltyHistoryItem {
  amount: number
  type: 'earned' | 'spent'
  description: string
  orderId?: string
  date: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  cost: number
  category: Category
  brand?: string
  sku: string
  barcode?: string
  images: ProductImage[]
  stock: number
  lowStockThreshold: number
  specifications: Specification[]
  features: string[]
  tags: string[]
  warranty?: string
  rating: {
    average: number
    count: number
  }
  isActive: boolean
  isFeatured: boolean
  isOnSale: boolean
  weight?: {
    value: number
    unit: string
  }
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }
  seoTitle?: string
  seoDescription?: string
  views: number
  discountPercentage?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  url: string
  alt?: string
  isMain: boolean
}

export interface Specification {
  name: string
  value: string
}

export interface CartItem {
  product: string | Product
  quantity: number
}

export interface Order {
  _id: string
  orderNumber: string
  user: string | User
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: 'card' | 'paypal' | 'cash_on_delivery'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentDetails?: {
    transactionId?: string
    paidAt?: string
  }
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  statusHistory: StatusHistory[]
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  notes?: string
  trackingNumber?: string
  deliveredAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: string | Product
  name: string
  image?: string
  price: number
  quantity: number
  subtotal: number
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  street: string
  city: string
  state?: string
  zipCode: string
  country: string
}

export interface StatusHistory {
  status: string
  date: string
  note?: string
}

export interface Review {
  _id: string
  product: string | Product
  user: string | User
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpful: string[]
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

export interface PaginationResponse<_T = unknown> {
  [key: string]: any
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}
