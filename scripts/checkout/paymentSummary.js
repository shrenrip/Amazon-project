import {cart} from '../../data/cart-class.js';
import {formatCurrency} from '../utils/money.js';
import {deliveryOptions} from '../../data/deliveryOptions.js';
import {products} from '../../data/products.js';
import {noOfItems} from '../../scripts/utils/noOfItems.js';

export function renderPaymentSummary(){
  let cartQuantity = noOfItems(cart.cartItems);
  let itemsTotal = 0;
  let shippingTotal = 0;

  cart.cartItems.forEach((cartItem) => {

    let matchingProduct;
    products.forEach((product) => {
      if(product.id === cartItem.productId) {
        matchingProduct = product;
      }
    });
    itemsTotal += matchingProduct.priceCents * cartItem.quantity;

    let matchingDelivery;
    deliveryOptions.forEach((option) => {
      if(option.id === cartItem.deliveryOptionId) {
        matchingDelivery = option;
      }
    });
    shippingTotal += matchingDelivery.priceCents; 

  });

  const totalBeforeTax = itemsTotal + shippingTotal;
  const estimatedTax = totalBeforeTax * 0.1;
  const orderTotal = totalBeforeTax + estimatedTax;
  
  document.querySelector('.js-payment-summary')
    .innerHTML = `
      <div class="payment-summary-title">
        Order Summary
      </div>

      <div class="payment-summary-row">
        <div>Items (${cartQuantity}):</div>
        <div class="payment-summary-money">$${formatCurrency(itemsTotal)}</div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money">$${formatCurrency(shippingTotal)}</div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">$${formatCurrency(totalBeforeTax)}</div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">$${formatCurrency(estimatedTax)}</div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">$${formatCurrency(orderTotal)}</div>
      </div>
    `
    document.querySelector('.js-return-to-home-link').innerText=`${cartQuantity} items`;
}