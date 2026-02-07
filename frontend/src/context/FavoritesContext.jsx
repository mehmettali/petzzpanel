import { createContext, useContext, useReducer, useEffect } from 'react'

const FavoritesContext = createContext()

const FAVORITES_STORAGE_KEY = 'petzzshop_favorites'

const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FAVORITE':
      if (state.items.some(item => item.sku === action.payload.sku)) {
        return state
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        items: state.items.filter(item => item.sku !== action.payload)
      }

    case 'TOGGLE_FAVORITE': {
      const exists = state.items.some(item => item.sku === action.payload.sku)
      if (exists) {
        return {
          ...state,
          items: state.items.filter(item => item.sku !== action.payload.sku)
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    }

    case 'CLEAR_FAVORITES':
      return { ...state, items: [] }

    case 'LOAD_FAVORITES':
      return { ...state, items: action.payload }

    default:
      return state
  }
}

const initialState = {
  items: []
}

export function FavoritesProvider({ children }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState)

  // LocalStorage'dan favorileri yükle
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'LOAD_FAVORITES', payload: parsed })
        }
      }
    } catch (e) {
      console.error('Favorites load error:', e)
    }
  }, [])

  // Favoriler değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.items))
    } catch (e) {
      console.error('Favorites save error:', e)
    }
  }, [state.items])

  const addToFavorites = (product) => {
    dispatch({ type: 'ADD_FAVORITE', payload: product })
  }

  const removeFromFavorites = (sku) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: sku })
  }

  const toggleFavorite = (product) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: product })
  }

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' })
  }

  const isFavorite = (sku) => {
    return state.items.some(item => item.sku === sku)
  }

  const getFavoritesCount = () => {
    return state.items.length
  }

  const value = {
    items: state.items,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    isFavorite,
    getFavoritesCount
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export default FavoritesContext
