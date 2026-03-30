import {cart} from '../data/cart-class.js';
import {products} from '../data/products.js'; 
import {noOfItems} from './utils/noOfItems.js';

let productsHTML = ``;
products.forEach((product) => {
    productsHTML += `
    <div class="product-container">
          <div class="product-image-container">
            <img class="product-image"
              src="${product.image}">
          </div>

          <div class="product-name limit-text-to-2-lines">
            ${product.name}
          </div>

          <div class="product-rating-container">
            <img class="product-rating-stars"
              src="${product.getStarsUrl()}">
            <div class="product-rating-count link-primary">
              ${product.rating.count}
            </div>
          </div>

          <div class="product-price">
            ${product.getPrice()}
          </div>

          <div class="product-quantity-container">
            <select>
              <option selected value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          ${product.extraInfoHTML()}

          <div class="product-spacer"></div>

          <div class="added-to-cart">
            <img src="images/icons/checkmark.png">
            Added
          </div>

          <button class="add-to-cart-button button-primary js-add-to-cart-button" data-product-id="${product.id}">
            Add to Cart
          </button>
    </div>`;
});

document.querySelector('.js-products-grid').innerHTML = productsHTML;

console.log(cart);
function updateCartQuantity () {
  let cartQuantity = noOfItems(cart.cartItems);
  document.querySelector('.js-cart-quantity').innerText = cartQuantity;
};
updateCartQuantity();

document.querySelectorAll('.js-add-to-cart-button')
.forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    
    cart.addToCart(productId);

    updateCartQuantity();
            
    });
  });