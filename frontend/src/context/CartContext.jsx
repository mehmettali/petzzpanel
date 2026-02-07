import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const CART_STORAGE_KEY = 'petzzshop_cart'

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.sku === action.payload.sku
      )

      if (existingIndex > -1) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (action.payload.quantity || 1)
        }
        return { ...state, items: newItems }
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.sku !== action.payload)
      }

    case 'UPDATE_QUANTITY': {
      const { sku, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.sku !== sku)
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.sku === sku ? { ...item, quantity } : item
        )
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'LOAD_CART':
      return { ...state, items: action.payload }

    default:
      return state
  }
}

const initialState = {
  items: []
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'LOAD_CART', payload: parsed })
        }
      }
    } catch (e) {
      console.error('Cart load error:', e)
    }
  }, [])

  // Sepet değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch (e) {
      console.error('Cart save error:', e)
    }
  }, [state.items])

  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeFromCart = (sku) => {
    dispatch({ type: 'REMOVE_ITEM', payload: sku })
  }

  const updateQuantity = (sku, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { sku, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.discount_price || item.sell_price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const isInCart = (sku) => {
    return state.items.some(item => item.sku === sku)
  }

  const getItemQuantity = (sku) => {
    const item = state.items.find(item => item.sku === sku)
    return item ? item.quantity : 0
  }

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
