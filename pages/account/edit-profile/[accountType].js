import Head from 'next/head'
import React, { Component } from 'react'
import Router from 'next/router'
import MyLayout from '../../../components/MyLayout'
import Button from '../../../components/Button'
import Heading from '../../../components/Heading'
import ImageUploader from '../../../components/ImageUploader'
import Footer from '../../../components/Footer'
import { connect } from 'react-redux'
import { updateProfile } from '../../../actions/profile'
import validateUsernameInput from '../../../validation/username'
import validateProfileSubmit from '../../../validation/profileSubmit'
import axios from 'axios'

const classnames = require('classnames')

const usernameExists = (username) => {
  return axios.post('/api/usernames', { username })
}

class EditProfile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accountType: this.props.query.accountType,
      flagErrors: false,
      errors: {},
      username: this.props.username,
      profileImageUrl: this.props.profileImageUrl,
      youtube: this.props.youtube,
      instagram: this.props.instagram,
      twitter: this.props.twitter,
      facebook: this.props.facebook,
      hourlyRate: this.props.hourlyRate,
      sessions: this.props.sessions,
      expertise: {
        hair: [ 'Styling', 'Braiding', 'Natural Hair', 'Wigs/Extensions' ],
        makeup: [ 'Eyes', 'Lips', 'Foundation/Face', 'Nails' ]
      },
      selectedExpertise: {
        makeup: this.props.expertise.makeup,
        hair: this.props.expertise.hair
      }
    }

    this.handleUsernameBlur = this.handleUsernameBlur.bind(this)
    this.handleInputBlur = this.handleInputBlur.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.updateSkill = this.updateSkill.bind(this)
    this.getImageUrl = this.getImageUrl.bind(this)
    this.onFocus = this.onFocus.bind(this)
  }

  static async getInitialProps({ query }) {
    return { query }
  }

  componentDidUpdate() {
    if(!this.props.auth.isAuthenticated) {
      Router.push('/account/login')
    } else if(this.props.query.accountType !== this.props.accountType) {
      Router.push(`/account/edit-profile/${this.props.accountType}`)
    }

    if(this.props.username !== this.state.username) {
      this.setState({ ...this.props })
    }
  }

  handleUsernameBlur(e) {
    e.persist()

    const newUsername  = e.target.value.trim()
    this.setState((prevState) => {
      const errors = validateUsernameInput(newUsername).errors

      if(errors.username) {
        return {
          errors
        }
      } else {
        return {
          flagErrors: false,
          errors: {},
          username: newUsername
        }
      }
    })

    if(newUsername !== this.props.username) {
      usernameExists(newUsername)
      .then((res) => {
        if(res.data !== '') {
          this.setState({
            errors: { username: 'Username already exists' }
          })
        }
      })
    }
  }

  getImageUrl(url) {
    this.setState({ profileImageUrl: url})
  }

  handleInputBlur(e) {
    this.setState({
      [e.target.name]: `${e.target.value}`
    })
  }

  onFocus(e) {
    this.setState({
      errors: {
        [e.target.name]: null
      }
    })
  }

  updateSkill(e, category) {
    e.persist()

    this.setState((prevState) => {

      let skill = e.target.id
      let idx = prevState.selectedExpertise[category].indexOf(skill)

      if(idx != -1) {
         prevState.selectedExpertise[category].splice(idx, 1)
         return prevState
      } else {
         prevState.selectedExpertise[category].push(skill)

         return prevState
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()

    const accountType = this.state.accountType
    const profile = {
      artist: {
        _id: this.props._id,
        username: this.state.username,
        profileImageUrl: this.state.profileImageUrl,
        youtube: this.state.youtube,
        instagram: this.state.instagram,
        twitter: this.state.twitter,
        facebook: this.state.facebook,
        hourlyRate: this.state.hourlyRate,
        expertise: this.state.selectedExpertise,
        sessions: this.state.sessions
      },

      pupil: {
        _id: this.props._id,
        username: this.state.username,
        profileImageUrl: this.state.profileImageUrl,
        youtube: this.state.youtube,
        instagram: this.state.instagram,
        twitter: this.state.twitter,
        facebook: this.state.facebook,
        sessions: this.state.sessions
      }
    }

    const validation = validateProfileSubmit(profile[accountType])
    if(this.state.username !== this.props.username) {
      if(this.state.errors.username) {
        this.setState({
          flagErrors: true
        })
      } else if(!validation.isValid) {
        this.setState({
          errors: validation.errors,
          flagErrors: true
        })
      } else {
        usernameExists(this.state.username)
        .then((res) => {
          if(res.data !== '') {
            this.setState({
              errors: { username: 'Username already taken' },
              flagErrors: true,
            })
          } else {
            updateProfile(accountType, profile[accountType])
            .then(res => {
              if(res.status === 200) alert('Profile Updated')
            })
            .catch((err) => {
              alert('Something went wrong, please try again')
              console.log('err from updateProfile', err)
            })
          }
        })
      }
    }
  }

  render() {
    const { errors, accountType, expertise } = this.state

    return (
      <React.Fragment>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <MyLayout alignment='center'>
          <Heading style={{ marginTop: '80px' }}>Edit Profile</Heading>
          <ImageUploader onUpload={(url) => { this.getImageUrl(url) }} />
          <form onSubmit={ this.handleSubmit }>
            <input
              type='text'
              name='username'
              id='username'
              placeholder='CHOOSE A USERNAME'
              onBlur={ this.handleUsernameBlur }
              onFocus={ this.onFocus }
              defaultValue={ this.state.username }
            />
            {errors.username && (<div className="invalid-feedback">{errors.username}</div>)}
            <h2>Connect Social Media</h2>
            <label>YouTube</label>
            <input
              type='text'
              name='youtube'
              id='youtube-handle'
              placeholder='ENTER HANDLE'
              onBlur={ this.handleInputBlur }
              defaultValue={ this.state.youtube }
            />
            <label>Instagram</label>
            <input
              type='text'
              name='instagram'
              id='youtube-handle'
              placeholder='ENTER HANDLE'
              onBlur={ this.handleInputBlur }
              defaultValue={ this.state.instagram }
            />
            <label>Twitter</label>
            <input
              type='text'
              name='twitter'
              id='twitter-handle'
              placeholder='ENTER HANDLE'
              onBlur={ this.handleInputBlur }
              defaultValue={ this.state.twitter }
            />
            <label>Facebook</label>
            <input
              type='text'
              name='facebook'
              id='facebook-handle'
              placeholder='ENTER HANDLE'
              onBlur={ this.handleInputBlur }
              defaultValue={ this.state.facebook }
            />
            {accountType === 'artist' && (
              <React.Fragment>
              <h2>Set Hourly Rate</h2>
              <p className='dollar-prefix'>$</p>
              <input
                type='number'
                name='hourlyRate'
                className='digit'
                onChange={ this.handleInputBlur }
                defaultValue={ this.state.hourlyRate }
              />
              <p className='dollar-prefix'>/hr</p>
              <h2>Add Expertise</h2>
              <p>Add tags to show the things you slay at. Clients will be able to search based on these things</p>
              <h3>Makeup</h3>
              <ul className="expertise-tags">
                {expertise.makeup.map((exp) => {
                  let selected = this.state.selectedExpertise.makeup.includes(exp)

                  return <li id={exp} onClick={ (e) => { this.updateSkill(e, 'makeup')} } key={exp} className={classnames({ selected })}>{exp}</li>
                })}
              </ul>
              <h3>Hair</h3>
              <ul className="expertise-tags">
                {expertise.hair.map((exp) => {
                  let selected = this.state.selectedExpertise.hair.includes(exp)

                  return <li category="hair" id={exp} onClick={ (e) => { this.updateSkill(e, 'hair')} } key={exp} className={classnames({ selected })}>{exp}</li>
                })}
              </ul>
              </React.Fragment>
            )}
            <div className="button-container">
              {this.state.flagErrors && (<div className="invalid-feedback">See errors above</div>)}
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </MyLayout>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  accountType: state.auth.user.accountType,
  errors: state.errors,
  _id: state.auth.user._id,
  username: state.profile.username,
  profileImageUrl: state.profile.profileImageUrl,
  youtube: state.profile.youtube,
  instagram: state.profile.instagram,
  twitter: state.profile.twitter,
  facebook: state.profile.facebook,
  hourlyRate: state.profile.hourlyRate,
  expertise: state.profile.expertise,
  sessions: state.profile.sessions
})

export default connect(mapStateToProps)(EditProfile)