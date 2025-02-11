import React from 'react'
import './NewsLetter.css'
export const Newsletter = () => {
  return (
      <div className="newsletter">
        <h1>Get Exclusive Offers On Your Email</h1>
        <p>Subscibe to our newsltter and stay update</p>
        <div>
          <input type="email" placeholder='Your Email id' />
          <button>Subscribe</button>
        </div>
      </div>
  )
}

export default Newsletter
