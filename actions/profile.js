import { SET_PROFILE, UPDATE_PROFILE } from './types'
import axios from 'axios'

export const updateProfile = (accountType, profile) => {
  axios.post(`/api/profile/${accountType}/`, profile)
    .then(res => console.log('updateProfile'))
    .catch((err) => {
      console.log('err from updateProfile', err)
    })
}

export const getProfile = (id) => {
   return axios.post('/api/profile/', { id })
    .then(res => res.data)
    .catch((err) => {
      console.log('err from getProfile', err)
    })
}

export const setProfile = (profile) => {
  return {
    type: SET_PROFILE,
    payload: profile
  }
}