import regeneratorRuntime from 'regenerator-runtime'
import bcrypt from 'bcrypt-nodejs'


class DevicesAware {
  constructor () {
    this.devices = []
    this.LOGS = document.getElementById('logs')
    this.GOOD_SERIAL = '$2a$10$qhs.81riukufPFc9oytCNeVwe0kBAJrVXn0bbQdSRJT20jowsMkHu'
  }

  start () {
    this.initialization()
    this.listenersActivation()
  }

  listenersActivation () {
    navigator.usb.onconnect = ({ device }) => {
      this.LOGS.innerHTML += `<p>Connected : ${device.serialNumber}</p>`
      this.serialChecker(device)
    }
    navigator.usb.ondisconnect = ({ device }) => this.LOGS.innerHTML += `<p>Disconnected : ${device.serialNumber}</p>`
  }

  async initialization () {
    const devices = await navigator.usb.getDevices()
    this.devicesListing(devices)
  }

  devicesListing (devices) {
    console.log(devices)
    if (devices.length) {
      for (let i = 0; i < devices.length; i++) {
        this.deviceHandling(devices[i])
      }
    } else {
      const btn = document.createElement('button')
      btn.onclick = this.addNewDevice.bind(this)
      btn.textContent = 'Click here to add a new device'
      document.body.append(btn)
    }
  }

  async addNewDevice () {
    const device = await navigator.usb.requestDevice({ filters: [] })
    console.log(device)
    this.LOGS.innerHTML += `<p>New Device linked : ${device.serialNumber}</p>`
    this.serialChecker(device)
  }

  deviceHandling (currentDevice) {
    this.serialChecker(currentDevice)

    if (!this.devices.includes(currentDevice))
      this.devices.push(currentDevice)
  }

  serialChecker ({ productId = 0, serialNumber, vendorId = 0 }) {
    const
      UID = productId + serialNumber + vendorId, // fresh new UID
      cryptedUID = bcrypt.hashSync(UID) // UID to send in database

    this.LOGS.innerHTML += `
        <p>
            <i>checking :</i>
            <span class="${bcrypt.compareSync(UID, this.GOOD_SERIAL) ? 'authorized' : 'unauthorized'}">
                ${cryptedUID}
            </span/>
        </p>`
  }
}

const devicesAware = new DevicesAware()
devicesAware.start()
