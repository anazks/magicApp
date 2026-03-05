import Axios from './Axios';

export const userRegistration = async (data: any) => {
    try {
        const response = await Axios.post('/home/user_registration/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const generateOTP = async (data: any) => {
    try {
        const response = await Axios.post('/home/generate_otp/', data);
        return response;
    } catch (error: any) {
        throw error;
    }
}

export const otpVerificationLogin = async (data: any) => {
    try {
        const response = await Axios.post('/home/verify_otp_and_login/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const profileDetails = async () => {
    try {
        const response = await Axios.get('/home/profile/update/');
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateProfile = async (data: any) => {
  try {
    const formData = new FormData();

    if (data.first_name !== undefined) formData.append('first_name', data.first_name.trim());
    if (data.last_name !== undefined) formData.append('last_name', data.last_name.trim());
    if (data.phone_number !== undefined) formData.append('phone_number', data.phone_number.trim());
    if (data.date_of_birth !== undefined) formData.append('date_of_birth', data.date_of_birth);
    if (data.district !== undefined) formData.append('district', data.district.trim());
    if (data.state !== undefined) formData.append('state', data.state.trim());
    if (data.address !== undefined) formData.append('address', data.address.trim());
    if (data.pin_code !== undefined && data.pin_code !== null) {
      formData.append('pin_code', String(data.pin_code));
    }

    const response = await Axios.patch('/home/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const googleAuth = async (data: any) => {
    try {
        let dataObj = { token: data };
        const response = await Axios.post('/home/auth/google/', dataObj);
        return response;
    } catch (error) {
        throw error;
    }
}
