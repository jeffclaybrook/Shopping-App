const openCart = document.querySelector('.open-cart');
const closeCart = document.querySelector('.close-cart');
const aside = document.querySelector('aside');
const cartNav = document.querySelector('.cart');
const clearCartBtn = document.querySelector('.clear-cart');
const badge = document.querySelector('.badge');
const cartTotal = document.querySelector('.cart-total');
const cartItems = document.querySelector('.cart-items');
const productItems = document.querySelector('.product-items');

let cart = [];
let buttonsDOM = [];

class Products {
   async getProducts() {
      try {
         let result = await fetch('products.json');
         let data = await result.json();
         let products = data.items;
         products = products.map(item => {
            const { title, price } = item.fields;
            const { id } = item.sys;
            const image = item.fields.image.fields.file.url;
            return { title, price, id, image }
         })
         return products
      } catch (error) {
         console.log(error);
      }
   }
}

class UI {
   displayProducts(products) {
      let result = '';
      products.forEach(product => {
         result += `
            <div class="product-item">
               <figure>
                  <img src="${product.image}"/>
                  <button class="product-item--button" data-id=${product.id}><span class="material-icons">add_shopping_cart</span>Add to Cart</button>
               </figure>
               <div class="product-item--details">
                  <h3>${product.title}</h3>
                  <h4>$${product.price}</h4>
               </div>
            </div>
         `;
      });
      productItems.innerHTML = result;
   }

   getAddToCartButtons() {
      const buttons = [...document.querySelectorAll('.product-item--button')];
      buttonsDOM = buttons;
      buttons.forEach(button => {
         let id = button.dataset.id;
         let inCart = cart.find(item => item.id === id);
         if (inCart) {
            button.innerHTML = '<span class="material-icons">check_circle</span>In Cart';
            button.disabled = true;
         }
         button.addEventListener('click', (event) => {
            event.target.innerHTML = '<span class="material-icons">check_circle</span>In Cart';
            event.target.disabled = true;
            let cartItems = { ...Storage.getProducts(id), quantity: 1 };
            cart = [...cart, cartItems];
            Storage.saveCart(cart);
            this.setCartValues(cart);
            this.addCartItem(cartItems);
         });
      });
   }

   setCartValues(cart) {
      let tempTotal = 0;
      let itemsTotal = 0;
      cart.map(item => {
         tempTotal += item.price * item.quantity;
         itemsTotal += item.quantity;
      });
      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      badge.innerText = itemsTotal;
   }

   addCartItem(item) {
      const div = document.createElement('div');
      div.classList.add('cart-item');
      div.innerHTML = `
         <img src=${item.image} alt="Image">
         <div class="cart-item--details">
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <button class="remove-item" data-id=${item.id}>remove</button>
         </div>
         <div class="cart-item--quantity">
            <span class="material-icons plus" data-id=${item.id}>expand_less</span>
            <p class="quantity">${item.quantity}</p>
            <span class="material-icons minus" data-id=${item.id}>expand_more</span>
         </div>
      `;
      cartItems.appendChild(div);
   }

   setupAPP() {
      cart = Storage.getCart();
      this.setCartValues(cart);
      this.populateCart(cart);
   }

   populateCart(cart) {
      cart.forEach(item => this.addCartItem(item));
   }

   cartLogic() {
      clearCartBtn.addEventListener('click', () => {
         this.clearCart(cart);
      });
      cartItems.addEventListener('click', event => {
         if (event.target.classList.contains('remove-item')) {
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cartItems.removeChild(removeItem.parentElement.parentElement);
            this.removeItem(id);
         } else if (event.target.classList.contains('plus')) {
            let addQuantity = event.target;
            let id = addQuantity.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.quantity = tempItem.quantity + 1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            addQuantity.nextElementSibling.innerText = tempItem.quantity;
         } else if (event.target.classList.contains('minus')) {
            let lowerQuantity = event.target;
            let id = lowerQuantity.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.quantity = tempItem.quantity - 1;
            if (tempItem.quantity > 0) {
               Storage.saveCart(cart);
               this.setCartValues(cart);
               lowerQuantity.previousElementSibling.innerText = tempItem.quantity;
            } else {
               cartItems.removeChild(lowerQuantity.parentElement.parentElement);
               this.removeItem(id);
            }
         }
      })
   }

   clearCart() {
      let cartItems = cart.map(item => item.id);
      cartItems.forEach(id => this.removeItem(id));
      console.log(cartItems.children);
   }

   removeItem(id) {
      cart = cart.filter(item => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = '<span class="material-icons">add_shopping_cart</span>Add to Cart';
   }

   getSingleButton(id) {
      return buttonsDOM.find(button => button.dataset.id === id);
   }
}

class Storage {
   static saveProducts(products) {
      localStorage.setItem('products', JSON.stringify(products));
   }

   static getProducts(id) {
      let products = JSON.parse(localStorage.getItem('products'));
      return products.find(product => product.id === id)
   }

   static saveCart(cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
   }

   static getCart() {
      return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
   }
}

document.addEventListener('DOMContentLoaded', () => {
   const ui = new UI();
   const products = new Products();
   ui.setupAPP();
   products.getProducts().then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
   }).then(() => {
      ui.getAddToCartButtons();
      ui.cartLogic();
   });
});

openCart.addEventListener('click', () => {
   aside.classList.toggle('overlay');
   cartNav.classList.toggle('expanded');
})

closeCart.addEventListener('click', () => {
   aside.classList.toggle('overlay');
   cartNav.classList.toggle('expanded');
})