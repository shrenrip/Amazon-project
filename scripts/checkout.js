import {cart, removeFromCart, updateDeliveryOption} from '../data/cart.js';
import {products} from '../data/products.js';
import {formatCurrency} from './utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {deliveryOptions} from '../data/deliveryOptions.js';

function renderOrderSummary() {
let cartItems = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;

    let matchingProduct;

    products.forEach((product) => {
      if(product.id === productId)
      {
        matchingProduct = product;
      }
    });

    const deliveryOptionId = cartItem.deliveryOptionId;

    let deliveryOption;

    deliveryOptions.forEach((option) => {
      if(option.id === deliveryOptionId){
        deliveryOption = option;
      }
    });

    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays,
      'days'
    );
    const dateString = deliveryDate.format(
      'dddd, MMMM D'
    );


    cartItems += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}"> 
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link js-update-link link-primary" data-product-id="${matchingProduct.id}">
                Update
              </span>
              <span class="delete-quantity-link js-delete-link link-primary" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>
        </div>
      </div>
      `
  });

  document.querySelector('.js-order-summary').innerHTML = cartItems; 

  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        removeFromCart(productId);

        const container = document.querySelector(
          `.js-cart-item-container-${productId}`
        );
        container.remove();
        updatePriceSummary();
      }); 
    });

  document.querySelectorAll('.js-update-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      const currentQuantity = container.querySelector(`.js-quantity-label-${productId}`).innerText;
      let newQuantity = 0;
      
      container.querySelector('.product-quantity').innerHTML = ` 
        <input
          class="quantity-input js-quantity-input-${productId}"
          type="number"
          value="${currentQuantity}"
          min="1">
        <button 
          class="save button js-save-button">Save</button>`;

        container.querySelector('.js-save-button')
          .addEventListener('click', () => {
            newQuantity = Number(
              container.querySelector(`.js-quantity-input-${productId}`).value
            ); 
            if (newQuantity <= 0 || isNaN(newQuantity)) {
              alert('Please enter a valid quantity');
            return;
            }

            cart.forEach((cartItem) => {
              if(cartItem.productId === productId) {
                cartItem.quantity = newQuantity;
              }
            });
        updatePriceSummary();
        container.querySelector('.product-quantity').innerHTML = `
          <span>
            Quantity: <span class="quantity-label js-quantity-label-${productId}">${newQuantity}</span>
          </span>
          <span class="update-quantity-link js-update-link link-primary" data-product-id="${productId}">
            Update
          </span>
          <span class="delete-quantity-link js-delete-link link-primary" data-product-id="${productId}">
            Delete
          </span>
          `;
          });
      });
  });

  document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
      element.addEventListener('click', () => {
        const {productId, deliveryOptionId} = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        renderOrderSummary();
      })
    });
    updatePriceSummary();
}

function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';

  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays,
      'days'
    );
    const dateString = deliveryDate.format(
      'dddd, MMMM D'
    );

    const priceString = deliveryOption.priceCents === 0 
      ? 'FREE'
      : `$${formatCurrency(deliveryOption.priceCents)}`

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

    html += `
      <div class="delivery-option js-delivery-option"
      data-product-id="${matchingProduct.id}"
      data-delivery-option-id="${deliveryOption.id}">
        <input type="radio"
          ${isChecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
              ${priceString} - Shipping
          </div>
        </div>
      </div>
    `
  });
  return html;
}
  
renderOrderSummary();

function updatePriceSummary(){
  let cartQuantity = noOfItems(cart);
  let itemsTotal = 0;
  let shippingTotal = 0;

  cart.forEach((cartItem) => {

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

function noOfItems(cart){
  let cartQuantity = 0;
    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
  return cartQuantity;
}
