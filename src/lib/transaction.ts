import { API_BASE_URL } from '@/app/constants';
import axios from 'axios';

export const getTransactionDetails = async (sessionId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transaction-details`, {
            params: { session_id: sessionId }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting transaction details:', error);
        throw error;
    }
};