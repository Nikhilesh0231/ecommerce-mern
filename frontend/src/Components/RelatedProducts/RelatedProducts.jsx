import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
// import data_product from '../Assets/data'
import Item from '../Item/Item'
 const RelatedProducts = () => {
const[data_product,setData_Product]=useState([]);
  useEffect(()=>{
    fetch('https://ecommerce-mern-backend-rzqh.onrender.com/relatedproducts')
    .then((response)=>response.json())
    .then((data)=>setData_Product(data));
  },[])

  return (
    <div className='relatedproducts'>
          <h1>Related Products</h1>
          <hr />
          <div className="relatedproducts-item">
            {data_product.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
          </div>
    </div>
  )
}

export default RelatedProducts;
