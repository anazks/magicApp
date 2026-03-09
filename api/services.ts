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
export const updateServiceRequest = async (id: number | string, data: FormData) => {
    try {
        const response = await Axios.patch(`/services/request/${id}/edit/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating service request:', error.response?.data || error);
        throw error;
    }
}

export const deleteServiceMedia = async (mediaId: number | string) => {
    try {
        const response = await Axios.delete(`/services/request/media/${mediaId}/delete/`);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting service media:', error.response?.data || error);
        throw error;
    }
}

export const cancelServiceRequest = async (id: number | string) => {
    try {
        const response = await Axios.post(`/services/request/${id}/cancel/`);
        return response.data;
    } catch (error: any) {
        console.error('Error cancelling service request:', error.response?.data || error);
        throw error;
    }
}
