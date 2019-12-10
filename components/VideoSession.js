import React, { Component } from 'react'
import Video from 'twilio-video'
import axios from 'axios'
import { FixedBottom } from 'react-fixed-bottom'
import Modal from './Modal'
import ChatWidget from './ChatWidget'
const classNames = require('classnames')

export default class VideoSession extends Component {
  constructor(props) {
    super(props)

    this.state = {
      identity: null,  /* Will hold the fake name assigned to the client. The name is generated by faker on the server */
      roomName: '',    /* Will store the room name */
      roomNameErr: false,  /* Track error for room name TextField. This will    enable us to show an error message when this variable is true */
      previewTracks: null,
      localMediaAvailable: false, /* Represents the availability of a LocalAudioTrack(microphone) and a LocalVideoTrack(camera) */
      hasJoinedRoom: false,
      activeRoom: null, // Track the current active room
      participant: false,
      help: false,
      chat: false,
      remoteMessages: [],
      localDataTrack: null,
      unreads: 0
   }


   this.setupPreview = this.setupPreview.bind(this)
   this.joinRoom = this.joinRoom.bind(this)
   this.leaveRoom = this.leaveRoom.bind(this)
   this.getTracks = this.getTracks.bind(this)
   this.attachTrack = this.attachTrack.bind(this)
   this.attachTracks = this.attachTracks.bind(this)
   this.participantConnected = this.participantConnected.bind(this)
   this.detachParticipantTracks = this.detachParticipantTracks.bind(this)
   this.detachTrack = this.detachTrack.bind(this)
   this.trackUnpublished = this.trackUnpublished.bind(this)
   this.trackPublished = this.trackPublished.bind(this)
   this.toggleWidget = this.toggleWidget.bind(this)
   this.dealWithMessages = this.dealWithMessages.bind(this)
 }

  componentDidMount() {
    const { userId } = this.props
    const session = this.props.session[0]
    /*
    Make an API call to get the token and identity and update the corresponding state variables.
    */

    // check if the props id matches the ids from the session obj
    if(userId === session.artist || session.pupil ) {
      axios.post('/api/token', { identity: userId, _id: session._id })
      .then((result) => {
        const { identity, token } = result.data
        this.setState({ identity, token, roomName: session._id })
        this.setupPreview()
      })
    }
    // show an error screen if the id doens't match the session
  }

  componentWillUnmount() {
    if (this.state.previewTracks) {
      this.state.previewTracks.forEach(track => {
        track.stop()
      })
    }

    this.leaveRoom()
  }

  setupPreview() {
    Video.createLocalVideoTrack().then(track => {
      let tracks = []
      tracks.push(track)
      this.setState({
        previewTracks: tracks,
        localMediaAvailable: true
     })

     if(this.refs.localMedia) tracks.forEach(track => this.refs.localMedia.appendChild(track.attach()))
    })
  }

  joinRoom() {
    const { connect, createLocalVideoTrack } = require('twilio-video')
    const localVideoTrack = this.state.previewTracks[0]
    const localDataTrack = new Video.LocalDataTrack()
    this.setState({ localDataTrack })

    connect(this.state.token, {
      name: this.state.roomName,
      tracks: [localVideoTrack, localDataTrack]
    })
    .then((room) => {
      this.setState({
        activeRoom: room,
        localMediaAvailable: true,
        hasJoinedRoom: true  // Removes ‘Join Room’ button and shows ‘Leave Room’
      })

      let previewContainer = this.refs.localMedia
      if (!previewContainer.querySelector('video')) {
        attachTracks(getTracks(room.localParticipant), previewContainer);
      }

      // Attach the Tracks of the Room's Participants.
      let remoteMediaContainer = this.refs.remoteMedia
      room.participants.forEach((participant) => {
        console.log("Already in Room: '" + participant.identity + "'")
        this.setState({ participant: true })
        this.participantConnected(participant, remoteMediaContainer)
      })

      Video.createLocalAudioTrack().then((localTrack) => {
        room.localParticipant.publishTrack(localTrack)
      })

      // When a Participant joins the Room, log the event.
      room.on('participantConnected', participant => {
        console.log("Joining: '" + participant.identity + "'")
        this.setState({ participant: true })
        this.participantConnected(participant, remoteMediaContainer)
      })

      // When a Participant leaves the Room, detach its Tracks.
      room.on('participantDisconnected', (participant) => {
        console.log("RemoteParticipant '" + participant.identity + "' left the room")
        this.setState({ participant: false })
        this.detachParticipantTracks(participant)
      })

      room.on('trackSubscribed', (track) => {
        track.on('message', (message) => {
          message = JSON.parse(message)
          this.setState({ remoteMessages: this.state.remoteMessages.concat([message])})
          this.setState({ unreads: this.state.remoteMessages.length })
        })
      })

      // Once the LocalParticipant leaves the room, detach the Tracks
      // of all Participants, including that of the LocalParticipant.
      room.on('disconnected', () => {
        console.log('Left')
        if (this.state.previewTracks) {
          this.state.previewTracks.forEach(function(track) {
            track.stop()
          })

          this.setState({ previewTracks: null })
        }

        this.detachParticipantTracks(room.localParticipant)
        room.participants.forEach(this.detachParticipantTracks)
        this.setState({ activeRoom: null })
      })
    })
  }

  leaveRoom() {
    if (this.state.activeRoom) {
      this.state.activeRoom.disconnect()
      this.setState({ hasJoinedRoom: false, localMediaAvailable: false })
      this.setupPreview()
    }
  }

  // Get the Participant's Tracks.
  getTracks(participant) {
    return Array.from(participant.tracks.values()).filter(function(publication) {
      return publication.track
    }).map(function(publication) {
      return publication.track
    })
  }

  attachTrack(track, container) {
    if(track.kind !== "data") container.appendChild(track.attach())
  }

  // Attach array of Tracks to the DOM.
  attachTracks(tracks, container) {
    if(track.kind === "data") return
    tracks.forEach(function(track) {
      attachTrack(track, container)
    })
  }

  detachTrack(track) {
    if(track.kind === "data") return
    track.detach().forEach((element) => {
      element.remove()
    })
  }

  // Detach the Participant's Tracks from the DOM.
  detachParticipantTracks(participant) {
    let tracks = this.getTracks(participant)
    tracks.forEach(this.detachTrack)
  }

  // A new RemoteTrack was published to the Room.
  trackPublished(publication, container) {
    if (publication.isSubscribed) {
      this.attachTrack(publication.track, container)
    }

    publication.on('subscribed', (track) => {
      console.log('Subscribed to ' + publication.kind + ' track')
      this.attachTrack(track, container)
    })

    publication.on('unsubscribed', this.detachTrack)
  }

  trackUnpublished(publication) {
    console.log(publication.kind + ' track was unpublished.')
  }

  // A new RemoteParticipant joined the Room
  participantConnected(participant, container) {
    participant.tracks.forEach((publication) => {
      this.trackPublished(publication, container)
    })

    participant.on('trackPublished', (publication) => {
      this.trackPublished(publication, container)
    })

    participant.on('trackUnpublished', this.trackUnpublished)
  }

  toggleWidget(type) {
    this.setState({ [type]: !this.state[type] })
    if(type === 'chat') this.setState({ unreads: 0})
  }

  dealWithMessages(message) {
    this.state.localDataTrack.send(JSON.stringify(message))
  }

  render() {
    /*
    Controls showing of ‘Join Room’ or ‘Leave Room’ button.
    Hide 'Join Room' button if user has already joined a room otherwise
    show `Leave Room` button.
    */
    const joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
        <FixedBottom offset={20}>
          <button label="Leave Room"
          secondary={'true'}
          onClick={this.leaveRoom}>
            Leave Session
          </button>
        </FixedBottom>
      ) : (
        <button
          label="Join Room"
          primary={'true'}
          onClick={this.joinRoom}>
          Join Session
        </button>
      )

  const status = () => {
    if(this.state.activeRoom && !this.state.participant) return "single-session"
    if(!this.state.hasJoinedRoom) return "preview"
    if(this.state.participant) return "double-session"
  }

  const displayJoin = !this.state.hasJoinedRoom && this.state.localMediaAvailable && this.state.token
  const session = this.props.session[0]

  return (
     <div id="session-container" className={status()}>
      <div id="session-widgets">
        <div id="help" onClick={() => this.toggleWidget('help')}><p>Help</p></div>
        {this.state.help && <Modal closeModal={() => this.toggleWidget('help')}>
          <div id="session-help-modal">
            <p>Having trouble with your session?</p>
            <p>Contact us at support@fabfixe.com</p>
          </div>
        </Modal>}
        {this.state.hasJoinedRoom && this.state.participant && <div id="chat"
          className={classNames({'unread': this.state.unreads > 0})} onClick={() => this.toggleWidget('chat')}><p>Chat</p></div>}
      </div>
      {this.state.chat && <ChatWidget
        closeDrawer={() => this.toggleWidget('chat')}
        onMessageCreation={this.dealWithMessages}
        remoteMessages={this.state.remoteMessages}
      { ...this.props }/>}
      <div className="session-content">
        <div className="video-container">
          <div ref="remoteMedia" id="remote-media" />
          <div ref="localMedia" id="local-media" />
        </div>
        {displayJoin && <p>Looking good! Click “JOIN” to start your session</p>}
        {this.state.localMediaAvailable && joinOrLeaveRoomButton}
      </div>
     </div>
   )
 }
}
