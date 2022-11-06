const axios = require('axios').default;
const setSpeakerAddress = async (data) => {
    let url = `${process.env.ADMIN_SERVER_URL}/${data.chainId}/setSpeaker`
    return axios.post(url, {
        id: data.id,
        handle: data.handle,
        address: data.address
    }, {
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    });
}

const setSchedule = async (data) => {
    let url = `${process.env.ADMIN_SERVER_URL}/${data.chainId}/setSchedule`
    return axios.post(url, {
        id: data.id,
        timestamp: data.timestamp
    }, {
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    });
}

const terminateDiscourse = async (data) => {
    let url = `${process.env.ADMIN_SERVER_URL}/${data.chainId}/terminateProposal`
    return axios.post(url, {
        id: data.id
    }, {
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    });
}

const isDisputed = async (data) => {
    let url = `${process.env.ADMIN_SERVER_URL}/${data.chainId}/isDisputed/${data.propId}`
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    });
}

module.exports = {
    setSpeakerAddress,
    setSchedule,
    terminateDiscourse,
    isDisputed
}