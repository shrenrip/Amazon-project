export function noOfItems(cartItems){
  let cartQuantity = 0;
    cartItems.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
  return cartQuantity;
}