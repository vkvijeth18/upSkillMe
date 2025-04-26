import React from 'react'; // Normal CSS
import { InfinitySpin } from 'react-loader-spinner';
const InfinitySpinner = () => {
    return (
        <InfinitySpin
            visible={true}
            width="200"
            color="#0096FF"
            ariaLabel="infinity-spin-loading"
        />)
};

export default InfinitySpinner;
