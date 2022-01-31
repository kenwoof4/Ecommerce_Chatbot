const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
const fetch = require("node-fetch");
const base64 = require("base-64");
const e = require("express");


let username = "";
let password = "";
let token = "";
let type = "";
let context = "";


USE_LOCAL_ENDPOINT = false;
// set this flag to true if you want to use a local endpoint
// set this flag to false if you want to use the online endpoint
ENDPOINT_URL = "";
if (USE_LOCAL_ENDPOINT) {
  ENDPOINT_URL = "http://127.0.0.1:5000";
} else {
  ENDPOINT_URL = "http://cs571.cs.wisc.edu:5000";
}
//get token
async function getToken(username, password) {
  let request = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + base64.encode(username + ":" + password),
    },
  };

  const serverReturn = await fetch(ENDPOINT_URL + "/login", request);
  const serverResponse = await serverReturn.json();
  token = serverResponse.token;

  return token;
}

//post message
async function postMessage(message, isuser) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "date": Date(),
    "isUser": isuser,
    "text": message
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/messages", requestOptions);
    const result = await response.json();
    console.log(result);
  }
  catch (error) {
    console.log(error);
  }

}

//clear message
async function clearChat() {
  var myHeaders = new fetch.Headers();

  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("http://cs571.cs.wisc.edu:5000/application/messages", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

}

//Navigate to diff page
async function navigate(page, update, back) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "back": back,
    "dialogflowUpdated": update,
    "page": "/" + username + "/" + page
  });

  var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application", requestOptions)
    const result = await response.json();
  } catch (error) {
    console.log(error);
  }

}
//get tag of category
async function getTags(type) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/categories/" + type + "/tags", requestOptions);
    const result = await response.json();
    return result.tags;
  } catch (error) {
    console.log(error);
  }

}
//set label
async function setTag(label) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");


  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow'
  };
  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/tags/" + label, requestOptions);
    const result = await response.json();
    return true;
  } catch (error) {
    console.log(error);
  }
}

//clear label
async function clearTag() {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };
  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/tags", requestOptions);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.log(error);
  }

}
//get product id
async function getId(name) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/products", requestOptions);
    const result = await response.json();
    let products = result.products;

    for (const e of products) {
      if (name == e.name) {
        return e.id;
      }
    }
    console.log(result);
    return false;
  } catch (error) {
    console.log(error);
  }
}
//get all reviews
async function getReview(id) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/products/" + id + "/reviews", requestOptions);
    const result = await response.json();
    return result.reviews;
  } catch (error) {
    console.log(error);
  }
}
//get average rating
function averageReview(review) {
  let count = 0;
  let sum = 0;
  for (const e of review) {
    sum += e.stars;
    count++;
  }
  return sum / count;
}
//get product
async function getProducts(id) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/products/" + id, requestOptions)
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error)
  }
}
//add product to cart
async function addToCart(id) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/products/" + id, requestOptions)
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error)
  }
}
//clear cart
async function clearCart() {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/products", requestOptions)
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error)
  }

}
//get cart
async function getCart() {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/products", requestOptions)
    const result = await response.json();
    return result.products;
  } catch (error) {
    console.log(error)
  }

}

//delete from cart
async function deleteCart(id) {

  var myHeaders = new fetch.Headers();
  myHeaders.append("x-access-token", token);
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    const response = await fetch("http://cs571.cs.wisc.edu:5000/application/products/" + id, requestOptions)
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error)
  }
}




app.get("/", (req, res) => res.send("online"));
app.post("/", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });


  function welcome() {
    agent.add("Webhook works!");

  }

  async function login() {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username;
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password;

    token = await getToken(username, password);
    if (!token) {
      agent.add("Incorrect username or password!");
    }
    else {
      clearTag();
      clearChat();
      agent.add("Login successful! Welcome to WiscShop!");
    }
  }


  async function queries() {
    await postMessage(agent.query, true);
    agent.add("There are 6 categories: bottoms, hats, leggings, plushes, sweatshirts, tees. What do you want me to show you?");
    postMessage("There are 6 categories: bottoms, hats, leggings, plushes, sweatshirts, tees. What do you want me to show you?", false);

  }


  async function filter() {
    const m = await postMessage(agent.query, true);
    type = agent.parameters.category;
    page = agent.parameters.page;
    let label;
    let context_Label = agent.context.get("current-l");
    if (context_Label) {
      label = context_Label.parameters.lab;
      console.log(label);
    } else {
      label = agent.parameters.label;
    }
    console.log(label);
    const c = await clearTag();
    if (!type && (label.length == 0) && page) {
      if (page == "back") {
        navigate("", false, true);
        postMessage("Going back!", false);
        agent.add("Going back!");
      } else if (page == "home") {
        navigate("", true, false);
        postMessage("Going home!", false);
        agent.add("Going home!");
      }
      else if (page == "cart") {
        navigate("cart", true, false);
        postMessage("Going to cart!", false);
        agent.add("Going to cart!");
      } else {
        postMessage("Unknown page!", false);
        agent.add("Unknown page!");
      }
    } else if (!type && !page) {
      agent.context.set({
        'name': 'current-l',
        'lifespan': 1,
        'parameters': {
          'lab': label
        }
      });
      postMessage("Which category?", false);
      agent.add("Which category?");
    }
    else {
      agent.context.set({
        'name': 'current-cat',
        'lifespan': 1,
        'parameters': {
          'type': type
        }
      });
      if (label.length == 0) {
        postMessage("Showing " + type + "!", false);
        agent.add("Showing " + type + "!");
        const r = await navigate(type, true, false);
      } else {
        postMessage("Showing " + label + " " + type + "!", false);
        agent.add("Showing " + label + " " + type + "!");
        const r = await navigate(type, true, false);
        var delayInMilliseconds = 1000; //1 second
        setTimeout(function () {
          for (let i = 0; i < label.length; i++) {
            setTag(label[i]);
          }
        }, delayInMilliseconds);
      }
    }
  }


  async function tag() {
    const m = await postMessage(agent.query, true);
    context = agent.context.get("current-cat");
    type = agent.parameters.category;
    var tags;
    var type2;

    if ((!type) && (!context)) {
      postMessage("Tags from which category?", false);
      agent.add("Tags from which category?")
    } else {
      if (context) {
        tags = await getTags(context.parameters.type);
        type2 = context.parameters.type;
      } else {
        tags = await getTags(type);
        type2 = type;

      }
      let st = tags.join(", ");
      agent.add("Tags for " + type2 + ": " + st);
      postMessage("Tags for " + type2 + ": " + st, false);
    }

  }

  async function productInfo() {
    const m = await postMessage(agent.query, true);
    let product;
    let info;
    let context_Product = agent.context.get("current-product");
    let context_Info = agent.context.get("current-info");
    if (context_Product) {
      product = context_Product.parameters.product;
    } else {
      product = agent.parameters.product;
    }
    if (context_Info) {
      info = context_Info.parameters.info;
    } else {
      info = agent.parameters.info;
    }
    if (product && info) {
      let id = await getId(product);
      if (!id) {
        agent.add("Unable to find product please make sure product name is correct!");
        postMessage("Unable to find product please make sure product name is correct!", false);
      } else {
        if (info == "reviews") {
          let arr = [];
          const reviews = await getReview(id);
          for (const e of reviews) {
            arr.push(e.text);
          }
          if (arr.length == 0) {
            agent.add("Item has no reviews yet!");
            postMessage("Item has no reviews yet!", false);
          } else {
            let st = arr.join(", ");
            agent.add("These are the reviews said about the product: " + st);
            postMessage("These are the reviews said about the product: " + st, false);
          }

        } else if (info == "price") {
          const product2 = await getProducts(id);
          let price = product2.price;
          agent.add(product + " has a price of " + price + "$!");
          postMessage(product + " has a price of " + price + "$!", false);

        } else if (info == "average rating") {
          const reviews = await getReview(id);
          if (!reviews) {
            agent.add("Item has no reviews yet!");
            postMessage("Item has no reviews yet!", false);
          } else {
            let average = averageReview(reviews);
            agent.add(product + " has an average rating of " + average + " Stars!");
            postMessage(product + " has an average rating of " + average + " Stars!", false);
          }
        } else {
          agent.add("Unable to get product info! Try getting reviews/average rating/price! ");
          postMessage("Unable to get product info!", false);
        }
      }
    } else if (product && !info) {
      agent.context.set({
        'name': 'current-product',
        'lifespan': 1,
        'parameters': {
          'product': product
        }
      });
      agent.add("what would you like to know about " + product + "?");
      postMessage("what would you like to know about " + product + "?", false);
    } else if (!product && info) {
      agent.context.set({
        'name': 'current-info',
        'lifespan': 1,
        'parameters': {
          'info': info
        }
      });
      agent.add("Which product " + info + " would you like to know about?");
      postMessage("Which product " + info + " would you like to know about?", false);
    }
  }
  async function cart() {
    const m = await postMessage(agent.query, true);
    let num = 1;
    let product = agent.parameters.product;
    let cart_action;
    let context_action = agent.context.get("current-cart");
    if (context_action) {
      cart_action = context_action.parameters.cart_action;
    } else {
      cart_action = agent.parameters.cart_action;
    }
    if (agent.parameters.number) {
      num = agent.parameters.number;
    }
    if (product && cart_action) {
      let id = await getId(product);
      if (cart_action == "delete") {
        for (let i = 0; i < num; i++) {
          await deleteCart(id);
        }
        agent.add(num + " " + product + " deleted from cart");
        postMessage(num + " " + product + " deleted from cart", false);
      }
      else if (cart_action == "add") {
        for (let i = 0; i < num; i++) {
          await addToCart(id);
        }
        agent.add(num + " " + product + " added to cart");
        postMessage(num + " " + product + " added to cart", false);
      } else {
        agent.add("Unknown cart function!");
        postMessage("Unknown cart function!", false);
      }

    } else if (!product && cart_action) {
      if (cart_action == "clear") {
        await clearCart();
        agent.add("Cart is cleared!");
        postMessage("Cart is cleared!", false);
      } else if (cart_action == "review") {
        navigate("cart-review", true, false);
        agent.add("Reviewing cart. Type (confirm cart) to confirm purchase.");
        postMessage("Reviewing cart. Type (confirm cart) to confirm purchase.", false);

      } else if (cart_action == "confirm") {
        navigate("cart-confirmed", true, false);
        agent.add("Purchase confirmed!");
        postMessage("Purchase confirmed!", false);

      } else if (cart_action == "price") {
        let products = await getCart();
        let sum = 0;
        for (const e of products) {
          let x = e.count * e.price;
          sum = sum + x;
        }
        agent.add("Total price of cart is " + sum + "$");
        postMessage("Total price of cart is " + sum + "$", false);

      } else if (cart_action == "items") {
        let products = await getCart();
        let sum = 0;
        for (const e of products) {
          let x = e.count;
          sum = sum + x;
        }
        agent.add("There is a total of " + sum + " items!");
        postMessage("There is a total of " + sum + " items!", false);
      } else {
        agent.add("What product do you want to " + cart_action + "?");
        postMessage("What product do you want to " + cart_action + "?", false);
        agent.context.set({
          'name': 'current-cart',
          'lifespan': 1,
          'parameters': {
            'cart_action': cart_action
          }
        });
      }
    }
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  // You will need to declare this `Login` intent in DialogFlow to make this work
  intentMap.set("Login", login);
  intentMap.set("filter", filter);
  intentMap.set("queries", queries);
  intentMap.set("tag", tag);
  intentMap.set("product", productInfo);
  intentMap.set("cart", cart);
  agent.handleRequest(intentMap);
});


app.listen(process.env.PORT || 8080);
