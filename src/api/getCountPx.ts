import apiClient from './apiClient';

/**
@returns {Promise<object>}
*/

export const getCountPx = async () => {
    try {
        const response = await apiClient.get(`/count/px`);
        return response.data;
    } catch (error) {
        console.error("Error saat memanggil API getCountPx:", error);

    } finally{
    };
};