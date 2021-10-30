import axios from 'axios'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'

export const instance = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
  // crossdomain: false,
  adapter: fetchAdapter,
  timeout: 60000,
  // headers: {
  //   'X-Requested-With': 'XMLHttpRequest',
  //   'X-Client-App': 'Extension',
  // },
})

const api = {}

api.get = (endpoint, params = {}, options = {}) => {
  return instance.get(endpoint, { params, ...options }).then(({ data }) => data)
}
api.post = (endpoint, body, options) => {
  return instance.post(endpoint, body, options).then(({ data }) => data)
}
api.delete = (endpoint, data, options) =>
  instance.delete(endpoint, { data }, options)
api.put = (endpoint, data) => instance.put(endpoint, data)

export { api }
