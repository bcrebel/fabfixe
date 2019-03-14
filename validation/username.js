const axios = require('axios')
const mongoose = require('mongoose')
const Validator = require('validator')
isEmpty = require('./is-empty')


// check if its isEmpty
// check if its alphanumeric
// check if its already in the database

module.exports = function validateUsernameInput(data) {
  let errors = {}
  // return axios.post('/api/usernames', { username: data })
  //   .then((wtv) => console.log('the then'))
  //   .catch((err) => {
  //      errors.username = 'Username already taken'
  //     return errors
  //   })


  if(!Validator.isLength(data, { max: 20 })) {
    errors.username = 'Username must be less than 20 characters'
  }

  if(!isEmpty(data) && !Validator.isAlphanumeric(data)) {
    errors.username = 'Username can only contain letters and numbers'
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}