import React, { useEffect, useState } from 'react';
import useRequest from "../hooks/useRequest";
const PostAndRedirectButton = () => {

    const { request } = useRequest();
    const [data, setData] = useState({})

    useEffect(() => {

        request({
            url: `http://localhost:8900/api/payment-link`,
            method: "GET",
            onSuccess: (res) => {
                const { data, area } = res;
                console.log(data, "Payment Info");
                setData(data);
            },
        });

    }, [])

    const handleClick = async () => {
        try {

            const queryString = Object.entries(data)
            .filter(([_, v]) => v)
            .map(
              ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
            )
            .join("&");
            // Specify the URL to send the POST request to
            const url = `https://testsecureacceptance.cybersource.com/pay${queryString ? `?${queryString}` : ""}`;
             console.log(url,"url");
            window.open(url, '_blank');

            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form action="https://testsecureacceptance.cybersource.com/pay" method="post">
        {Object.entries(data).map(([key, value]) => (
          <input
            key={key}
            type="hidden"
            id={key}
            name={key}
            value={value}

          />
        ))}
        <input type="submit" value="Submit" />
      </form>
    );
};

export default PostAndRedirectButton;
