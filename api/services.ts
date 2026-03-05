import Axios from './Axios';

export const listServices = async () => {
    try {
        const response = await Axios.get('/services/categories/')
        return response.data
    } catch (error) {
        console.error('Error fetching services:', error)
        throw error
    }
}

export const serviceHistory = async () => {
    try {
        const response = await Axios.get(`/services/request/`)
        return response.data
    } catch (error) {
        console.error('Error fetching service history:', error)
        throw error
    }
}

export const makeRequest = async (requestData: any) => {
    try {
        const response = await Axios.post('/services/request/', requestData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error: any) {
        console.error('❌ Error making booking request:', error.response?.data || error)
        throw error
    }
}
