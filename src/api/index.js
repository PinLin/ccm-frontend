import Vue from 'vue'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { SHA256, AES, EC } from './util'
// import Blob from 'blob'

axios.defaults.baseURL = 'https://ccm.ntut.com.tw/api'
// axios.defaults.baseURL = 'http://localhost:8787/api'
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = 'http://localhost:8080'

class API {
  // async downloadMessageFile (url) {
  //   let { data } = await axios.get(url)
  //   let file = new Blob(Buffer.from(data, 'utf8'))
  //   file.lastModifiedDate = new Date()
  //   file.name = 'avatar'
  //   return file
  // }
  // async uploadMessageFile (formData) {
  //   let url = await axios.post('/static-file', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  //   return url
  // }
  // async updateUserInfo (username, avatar, nickname) {
  //   let infoResponse = await axios.patch('/user/' + username, {
  //     avatar,
  //     nickname
  //   })
  //   let info = {
  //     ...infoResponse.data.user,
  //     privateKey: infoResponse.data.privateKey
  //   }
  //   return info
  // }
  // User Api
  async sayHelloToServer () {
    let data = (await axios.get('/session')).data
    return data
  }
  async login (username, password, code) {
    try {
      let salt = '$2b$10$' + SHA256.hash(username).slice(0, 22)
      let hash1 = await bcrypt.hash(password, salt)
      let hash2 = await bcrypt.hash(hash1, code)
      let { data } = await axios.post('/session', {
        username,
        password: hash2
      })
      let key = SHA256.hash(password).slice(0, 32)
      let iv = SHA256.hash(username).slice(0, 16)
      data.privateKey = AES.decrypt(data.privateKey, key, iv)
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 401) {
        return { error: status }
      }
    }
  }
  async logout () {
    try {
      await axios.delete('/session')
      return {}
    } catch (e) {
      let status = e.response.status
      if (status === 404) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  async register (username, secret) {
    try {
      let { data } = await axios.post('/user', {
        username,
        secret
      })
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 401) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  async getUserInfo (targetUsername) {
    try {
      let { data } = await axios.get('/user/' + targetUsername)
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 404) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  // Chat Api
  async getChatRooms () {
    try {
      let { data } = await axios.get('/chat')
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 401) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  async createChatRoom (targetUsername) {
    try {
      let { data } = await axios.post('/chat', { username: targetUsername })
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 401 || status === 403) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  async getChatRoomMessageKey (targetUsername, privateKey) {
    try {
      let { data } = await axios.get('/chat/' + targetUsername)
      data.messageKey = await EC.decrypt(privateKey, data.messageKey)
      return data
    } catch (e) {
      let status = e.response.status
      if (status === 401 || status === 404) {
        return { error: status }
      } else {
        throw e
      }
    }
  }
  // async createChatRoom (username) {
  //   let { data } = await axios.post('/chat/', { username })
  //   let room = {
  //     userInfo: data.user,
  //     messageKey: data.messageKey
  //   }
  //   return room
  // }
  // async getChatRoomMessages (username, messageKey) {
  //   let { data } = await axios.get('/chat' + username)
  //   let messages = data.messages.map((message) => {
  //     let iv = crypto.createHash('sha256').update(message.sender).digest('hex').slice(0, 16)
  //     message.content = aesDecrypt(message.content, messageKey, iv)
  //   })
  //   return messages
  // }
  // async sendMessage (senderUsername, receiverUsername, plainMessage, messageKey) {
  //   let iv = crypto.createHash('sha256').update(senderUsername).digest('hex').slice(0, 16)
  //   let encrypted = aesEncrypt(plainMessage, messageKey, iv)
  //   let { message } = await axios.post('/chat' + receiverUsername, {
  //     content: encrypted
  //   })
  //   message.content = aesDecrypt(message.content, messageKey, iv)
  //   return message
  // }
}

Vue.use(() => {
  Vue.prototype.$api = new API()
})
