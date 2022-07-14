import Vue from 'vue'
import config from '@/config'
import io from 'socket.io-client'

class CCMSocket {
  static URI = config.baseUrl
  static PATH = config.basePath

  constructor () {
    this.socket = undefined
  }

  connect () {
    this.socket = io(CCMSocket.URI, { withCredentials: true, path: CCMSocket.PATH + '/socket.io' })
    this.socket.on('connect', () => {
      // console.log(`socket to ${CCMSocket.URI} connected`)
    })
    this.socket.on('message', (data) => {
      // console.log(`message`, data)
    })
    this.socket.on('disconnect', () => {
      // console.log(`socket to ${CCMSocket.URI} disconnected`)
      this.socket = undefined
    })
  }

  disconnect () {
    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }
}

Vue.use(() => {
  Vue.prototype.$ccm = new CCMSocket()
})
