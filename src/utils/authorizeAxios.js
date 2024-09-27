import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

let authorizedAxiosInstance = axios.create()
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

authorizedAxiosInstance.defaults.withCredentials = true
authorizedAxiosInstance.interceptors.request.use((config) => {
  interceptorLoadingElements(true)

  return config
}, (error) => {
  return Promise.reject(error)
})
let refreshTokenPromise = null

authorizedAxiosInstance.interceptors.response.use((response) => {
  interceptorLoadingElements(false)

  return response
}, (error) => {
  interceptorLoadingElements(false)
  if (error.response?.status === 401) {
    axiosReduxStore.dispatch(logoutUserAPI(false))
  }

  const originalRequest = error.config
  if (error.response?.status === 410 && originalRequest) {
    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then(data => {
          return data?.accessToken
        })
        .catch((_error) => {
          axiosReduxStore.dispatch(logoutUserAPI(false))
          return Promise.reject(_error)
        })
        .finally(() => {
          refreshTokenPromise = null
        })
    }

    return refreshTokenPromise.then(() => {
      return authorizedAxiosInstance(originalRequest)
    })

  }

  let errorMessage = error.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }
  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }

  return Promise.reject(error)
})


export default authorizedAxiosInstance
