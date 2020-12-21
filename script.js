import regeneratorRuntime from 'regenerator-runtime'
import bcrypt from 'bcrypt-nodejs'


class devicesAware {
    constructor() {
        this.devices = []

        this.GOOD_SERIAL = '$2a$10$qhs.81riukufPFc9oytCNeVwe0kBAJrVXn0bbQdSRJT20jowsMkHu'

        this.initialization()
        this.listenersActivation()
    }

    listenersActivation() {
        navigator.usb.onconnect = ({ device }) => {
            // console.log('connected', device.serialNumber)
            this.serialChecker(device)
        }
        // navigator.usb.ondisconnect = ({ device }) => console.log('disconnected', device.serialNumber)
    }

    async initialization() {
        const devices = await navigator.usb.getDevices()
        return this.devicesListing(devices)
    }

    async devicesListing(devices) {
        if (!devices.length) {
            const newDevice = await navigator.usb.requestDevice({ filters: [] })
            return this.serialChecker(newDevice)
        } else {
            for (let i = 0; i < devices.length; i++) {
                this.deviceHandling(devices[i])
            }
        }
    }

    deviceHandling(currentDevice) {
        this.serialChecker(currentDevice)

        if (!this.devices.includes(currentDevice))
            this.devices.push(currentDevice)
    }

    serialChecker({ productId = 0, serialNumber, vendorId = 0 }) {
        const
            UID = productId + serialNumber + vendorId, // fresh new UID
            cryptedUID = bcrypt.hashSync(UID) // UID to send in database

        console.info('checking : ' + `%c ${cryptedUID}`, bcrypt.compareSync(UID, this.GOOD_SERIAL) ? 'color: green' : 'color: red')
        document.getElementById('logs').innerHTML += `
        <p>
            <i>checking :</i>
            <span class="${bcrypt.compareSync(UID, this.GOOD_SERIAL) ? 'authorized' : 'unauthorized'}">
                ${cryptedUID}
            </span/>
        </p>`
    }
}

new devicesAware()
