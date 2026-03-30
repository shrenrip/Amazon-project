import {products} from '../../data/products.js';
import {deliveryOptions} from '../../data/deliveryOptions.js';
import {formatCurrency} from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {renderPaymentSummary} from './paymentSummary.js';
import {cart} from '../../data/cart-class.js';

export function renderOrderSummary() {
let cartItems = '';

  cart.cartItems.forEach((cartItem) => {
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
              ${matchingProduct.getPrice()}
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
        cart.removeFromCart(productId);

        const container = document.querySelector(
          `.js-cart-item-container-${productId}`
        );
        container.remove();
        renderPaymentSummary();
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
          class="save-button js-save-button">Save</button>`;

        container.querySelector('.js-save-button')
          .addEventListener('click', () => {
            newQuantity = Number(
              container.querySelector(`.js-quantity-input-${productId}`).value
            ); 
            if (newQuantity <= 0 || isNaN(newQuantity)) {
              alert('Please enter a valid quantity');
            return;
            }

            cart.cartItems.forEach((cartItem) => {
              if(cartItem.productId === productId) {
                cartItem.quantity = newQuantity;
                cart.saveToStorage();
                renderOrderSummary();
              }
            });
        cart.saveToStorage();    
        renderPaymentSummary();
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
        cart.updateDeliveryOption(productId, deliveryOptionId);
        renderOrderSummary();
      })
    });
    renderPaymentSummary();
}

export function deliveryOptionsHTML(matchingProduct, cartItem) {
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