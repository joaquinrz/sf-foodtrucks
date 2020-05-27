import axios from 'axios';

/**
 * @desc Function that makes a REST API call to the San Francisco Database of Approved Food Trucks
 * @return a response containing the data or throws an error on failure
 */
export const getFoodTruckData = () => {
    return axios
        .get(
            'https://data.sfgov.org/resource/rqzj-sfat.json?$select=applicant,address,latitude,longitude%20where%20status%20=%20%27APPROVED%27',
            {},
        )
        .then((response) => response.data)
        .catch((error) => {
            throw error;
        });
};
