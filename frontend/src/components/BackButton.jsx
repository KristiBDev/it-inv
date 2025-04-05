import React from 'react'
import { Link } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'

const BackButton = ({destination = '/'}) => {
  return (
    <div className="flex">
        <Link
            to={destination}
            className="bg-opacity-10 bg-blue-600 text-accent-color px-4 py-1 rounded-lg w-fit hover:bg-opacity-20 transition"
            >
            <BsArrowLeft className="text-2xl" />
        </Link>
    </div>
  )
}

export default BackButton