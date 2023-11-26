
const container = document.querySelector(".container");
const cards = document.querySelector(".cards");
const cardTemplate = document.getElementById("category-card-template");

let array = [{
  category: "Shirt",
  image: "./imgs/IMG_3194.jpg"
},
{
  category: "Bags",
  image: "./imgs/IMG_3195.jpg"
},
{
  category: "Gifts",
  image: "./imgs/IMG_3196.jpg"
},
{
  category: "Shirt",
  image: "./imgs/IMG_3194.jpg"
},
{
  category: "Bags",
  image: "./imgs/IMG_3195.jpg"
},
{
  category: "Gifts",
  image: "./imgs/IMG_3196.jpg"
},
{
  category: "Shirt",
  image: "./imgs/IMG_3194.jpg"
},
];

function loadCategories()
{
  array.forEach(i =>
  {
    let item = cardTemplate.content.cloneNode(true)
    item.querySelector(".card_text").textContent = i.category;
    item.getElementById("category-image").src = i.image;
    cards.append(item);
  })

  // Horizontal scroll
  /* keep track of user's mouse down and up */
  let isPressedDown = false;
  /* x horizontal space of cursor from inner container */
  let cursorXSpace;

  container.addEventListener("mousedown", (e) =>
  {
    isPressedDown = true;
    cursorXSpace = e.offsetX - cards.offsetLeft;
    container.style.cursor = "grabbing";
  });

  container.addEventListener("mouseup", () =>
  {
    container.style.cursor = "grab";
  });

  window.addEventListener("mouseup", () =>
  {
    isPressedDown = false;
  });

  container.addEventListener("mousemove", (e) =>
  {
    if (!isPressedDown) return;
    e.preventDefault();
    cards.style.left = `${e.offsetX - cursorXSpace}px`;
    boundCards();
  });
}

function boundCards()
{
  const container_rect = container.getBoundingClientRect();
  const cards_rect = cards.getBoundingClientRect();

  if (parseInt(cards.style.left) > 0)
  {
    cards.style.left = 0;
  } else if (cards_rect.right < container_rect.right)
  {
    cards.style.left = `-${cards_rect.width - container_rect.width}px`;
  }
}

// Music recommendations
// https://developer.spotify.com/documentation/web-api

// Product data
// https://fakestoreapi.com/docs
const productCards = document.querySelector(".products");
const productCardTemplate = document.getElementById("product-card-template");

function getStats()
{
  fetch("https://fakestoreapi.com/products?limit=5")
    .then(res=>res.json())
    .then(json=>renderResult(json));
}

function renderResult(result)
{
  result.forEach(i =>
  {
    let item = productCardTemplate.content.cloneNode(true)
    item.querySelector(".product_title").textContent = i.title;
    item.querySelector(".product_price").textContent = ("$" + i.price.toFixed(2));
    item.querySelector(".product_desc").textContent = i.description;
    item.getElementById("product-image").src = i.image;

    const button = item.getElementById("select_button");
    button.addEventListener('click', function() {
      goProductPage(i);
    });
    
    productCards.append(item);
  })
}

// Navigate Pages
function goProductsPage()
{
  window.location = "./products.html";
}

function goProductPage(item)
{
  selectedItem = item;
  window.location = "./item.html?id=" + item.id;
  console.log(item.id);
}

function getItemInfo()
{
  const params = new URLSearchParams(window.location.search);
  const itemID = parseInt(params.get("id"));
  fetch("https://fakestoreapi.com/products/" + itemID)
    .then(res=>res.json())
    .then(json=>renderItem(json));
}
let currentItem;
function renderItem(item)
{
  document.getElementById("product-image").src = item.image;
  document.getElementById("product-name").textContent = item.title;
  document.getElementById("product-price").textContent = ("$" + item.price.toFixed(2));
  const button = document.getElementById("action-button");
  button.addEventListener('click', function() {
    addToBasket(item);
  });
  currentItem = item;
}

// Product recommendations display
const gridItems = document.getElementById("grid-item-container");
const gridItemTemplate = document.getElementById("grid-item-template");

function renderProducts(result) {
  for (let i = 0; i < 3; i++) {
    let item = gridItemTemplate.content.cloneNode(true)
    item.getElementById("grid-image-1").src = result[i*3].image;
    item.getElementById("grid-image-2").src = result[i*3 + 1].image;
    item.getElementById("grid-image-3").src = result[i*3 + 2].image;
    gridItems.append(item);
  } 
}
function loadhomeProducts() {
  fetch("https://fakestoreapi.com/products?limit=9").then(res=>res.json())
  .then(json=>renderProducts(json));
}

function loadHomeElements() {
  loadCategories();
  loadhomeProducts();
}

// Basket
function goBasketPage() {
  window.location = "./basket.html";
}
function addToBasket() {
  if (currentItem != null) {
    let basket = JSON.parse(sessionStorage.getItem('cart_items'));
    if (basket == null) {
      basket = [];
    }
    basket.push(currentItem);
    sessionStorage.setItem('cart_items', JSON.stringify(basket));
  }
}

function loadBasket() {
  let basket = JSON.parse(sessionStorage.getItem('cart_items'));
  if (basket != null) {
    const itemCardTemplate = document.getElementById("item-card-template");
    const itemCards = document.getElementById("item-card-container");
    console.log(basket.length);
    basket.forEach(i =>
    {
      let item = itemCardTemplate.content.cloneNode(true)
      item.getElementById("item-image").src = i.image;
      item.getElementById("item-desc").textContent = i.title;
      item.getElementById("item-price").textContent = ("$" + i.price.toFixed(2));;
      itemCards.append(item);
    })
  }
}