import { _mock } from './_mock'

// ----------------------------------------------------------------------

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
]

const ITEMS = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  sku: `16H9UR${index}`,
  quantity: index + 1,
  name: _mock.productName(index),
  coverUrl: _mock.image.product(index),
  price: _mock.number.price(index)
}))

export const _orders = [...Array(20)].map((_, index) => {
  const shipping = 10

  const discount = 10

  const taxes = 10

  const items =
    (index % 2 && ITEMS.slice(0, 1)) ||
    (index % 3 && ITEMS.slice(1, 3)) ||
    ITEMS

  const totalQuantity = items.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0
  )

  const subTotal = items.reduce(
    (accumulator, item) => accumulator + item.price * item.quantity,
    0
  )

  const totalAmount = subTotal - shipping - discount + taxes

  const customer = {
    id: _mock.id(index),
    name: _mock.fullName(index),
    email: _mock.email(index),
    avatarUrl: _mock.image.avatar(index),
    ipAddress: '192.158.1.38'
  }

  const delivery = {
    shipBy: 'DHL',
    speedy: 'Standard',
    trackingNumber: 'SPX037739199373'
  }

  const history = {
    orderTime: _mock.time(1),
    paymentTime: _mock.time(2),
    deliveryTime: _mock.time(3),
    completionTime: _mock.time(4),
    timeline: [
      { title: 'Delivery successful', time: _mock.time(1) },
      { title: 'Transporting to [2]', time: _mock.time(2) },
      { title: 'Transporting to [1]', time: _mock.time(3) },
      {
        title: 'The shipping unit has picked up the goods',
        time: _mock.time(4)
      },
      { title: 'Order has been created', time: _mock.time(5) }
    ]
  }

  return {
    id: _mock.id(index),
    orderNumber: `#601${index}`,
    createdAt: _mock.time(index),
    taxes,
    items,
    history,
    subTotal,
    shipping,
    discount,
    customer,
    delivery,
    totalAmount,
    totalQuantity,
    shippingAddress: {
      fullAddress: '19034 Verna Unions Apt. 164 - Honolulu, RI / 87535',
      phoneNumber: '365-374-4961'
    },
    payment: {
      cardType: 'mastercard',
      cardNumber: '**** **** **** 5678'
    },
    status:
      (index % 2 && 'completed') ||
      (index % 3 && 'pending') ||
      (index % 4 && 'cancelled') ||
      'refunded'
  }
})

// Thêm mock case bệnh án
_orders.push({
  id: '6653d86b2c1fc7e5a3a777aa',
  orderNumber: 'AP283745',
  createdAt: new Date('2025-05-13T08:12:00.000Z'),
  taxes: 0,
  shipping: 0,
  discount: 0,
  subTotal: 170000,
  totalAmount: 170000,
  totalQuantity: 1,
  status: 'completed',
  customer: {
    id: '6653d8102c1fc7e5a3a777a0',
    name: 'Nguyễn Văn A',
    email: 'user@example.com',
    avatarUrl: '',
    ipAddress: ''
  },
  delivery: {
    shipBy: '',
    speedy: '',
    trackingNumber: ''
  },
  items: [
    {
      id: 'med-1',
      sku: 'PanadolExtra500',
      name: 'Panadol Extra',
      price: 170000,
      coverUrl: '',
      quantity: 1
    }
  ],
  history: {
    orderTime: new Date('2025-05-13T08:12:00.000Z'),
    paymentTime: new Date('2025-05-15T08:30:00.000Z'),
    deliveryTime: new Date('2025-05-15T09:15:00.000Z'),
    completionTime: new Date('2025-05-15T10:02:00.000Z'),
    timeline: [
      { title: 'Tạo bệnh án', time: new Date('2025-05-13T08:12:00.000Z') },
      {
        title: 'Xác nhận lịch hẹn',
        time: new Date('2025-05-15T08:30:00.000Z')
      },
      { title: 'Bác sĩ kê đơn', time: new Date('2025-05-15T09:15:00.000Z') },
      { title: 'Hoàn thành', time: new Date('2025-05-15T10:02:00.000Z') }
    ]
  },
  shippingAddress: {
    fullAddress: 'Không xác định',
    phoneNumber: ''
  },
  payment: {
    cardType: 'VNPAY',
    cardNumber: '**** **** **** 0000'
  }
})
