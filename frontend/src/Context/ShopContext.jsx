import React, { createContext, useEffect, useState } from "react";
// import all_product from "../Components/Assets/all_product";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  // for (let index = 0; index < all_product.length + 1; index++) {
  //   cart[index] = 0;
  // }
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};
const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetch("https://ecommerce-mern-backend-rzqh.onrender.com/allproducts")
      .then((response) => response.json())
      .then((data) => setAll_Product(data));

      if(localStorage.getItem('auth-token')){
        fetch("https://ecommerce-mern-backend-rzqh.onrender.com/getcart", {
          method: 'POST',
          headers: {
            Accept:'application/form-data',
            'auth-token':`${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json',
            },
            body: ""
        })
        .then((response) => response.json())
        .then((data) => setCartItems(data))
      }
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch("https://ecommerce-mern-backend-rzqh.onrender.com/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/from-data",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
  };
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch("https://ecommerce-mern-backend-rzqh.onrender.com/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/from-data",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      })
      .then((response) => response.json())
      .then((data) => console.log(data)); 
    }
  }; 

  const getTotalCartAmount = () => {
    let totalAmount = 0;
  
    if (!all_product || all_product.length === 0) {
      console.warn("Products not loaded yet");
      return totalAmount; // Prevent errors if products haven't loaded yet
    }
  
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => Number(product.id) === Number(item) // Ensure matching data types
        );
  
        if (!itemInfo) {
          console.warn(`Product with ID ${item} not found in all_product`);
          continue; // Skip this item to prevent crashing
        }
  
        if (!itemInfo.new_price) {
          console.warn(`Product with ID ${item} is missing new_price`);
          continue;
        }
  
        totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
  
    return totalAmount;
  };
  

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
