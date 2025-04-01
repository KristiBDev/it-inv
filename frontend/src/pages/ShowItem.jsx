import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';

const ShowItem = () => {
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555';
        axios
            .get(`${apiUrl}/items/${id}`)
            .then((response) => {
                setItem(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, [id]);

    return (
        <div className="p-4">
            <BackButton />
            <h1 className="text-3xl my-4">Show Item</h1>
            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col border-2 border-sky-400 rounded-xl w-fit p-4">
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Id</span>
                        <span>{item._id}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Name</span>
                        <span>{item.title}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Category</span>
                        <span>{item.category}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Status</span>
                        <span>{item.status}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Department</span>
                        <span>{item.department}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Custom ID</span>
                        <span>{item.customId}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Date Added</span>
                        <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                    </div>
                    <div className="my-4">
                        <span className="text-xl mr-4 text-gray-500">Last Update Time</span>
                        <span>{new Date(item.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowItem;