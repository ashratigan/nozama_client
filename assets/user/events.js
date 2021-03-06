const store = require('../scripts/store')
const api = require('./api')
const ui = require('./ui')
const ordersUI = require('../scripts/orders/ui')
const ordersAPI = require('../scripts/orders/api')
const config = require('../scripts/config')

const addToCart = function (event) {
    const cart = store.userData.cart
    const cartItems = cart.items
    let orderTotal = 0
    let target = $(event.target).parents('ul').attr('data-id')
    let itemPrice = $(event.target).parents('ul').attr('data-price')
    let item, newOrder, data, items = []

    item = {
            item_id: target,
            quantity: 1
        }

    // Is the cart empty?
    !cart.hasOwnProperty('owner') ? (() => {
        // Make a new order obj to send
        orderTotal += parseInt(itemPrice)

        items.push(item)
        newOrder = {
            owner: store.user._id,
            items: items,
            total: orderTotal,
            submitted: false
        }
        data = {
            order: newOrder
        }
        ordersAPI.createOrder(data)
            .then(ui.createOrderSuccess)
            .catch(console.error())
    })() : (() => {
        // Else: update the existing order (cart)
        orderTotal += parseInt(cart.total)
        orderTotal += parseInt(itemPrice)

        cartItems.push(item)
        cart.total = orderTotal
        data = {
            order: cart
        }
        ordersAPI.updateOrder(data, store.userData.order_id)
            .then(ui.updateOrderSucces)
    })()
}

const deleteItem = function (event) {
    // console.log('clicked delete')
    const orderId = $(event.target).attr('data-id')
    // console.log(orderId)
    ordersAPI.deleteOrder(orderId)
        .then(ordersUI.clearCart)
        .then(ordersUI.showCart)
        .catch(ordersUI.failure)
}

const userHandlers = () => {
    $('.content').on('click', "button[id^='addToCart']", addToCart)
    $('#stripe-input').val('Bearer ' + store.user.token)
    $('.stripe-button').attr('data-amount', store.userData.cart.total)
    $('.stripe-button').attr('data-description', `Nozama ${store.userData.cart._id}`)
    // $('#stripe-form').attr('action', config.apiUrls)
    $('.content').on('click', "button[id^='remove-item']", deleteItem)
}

module.exports = {
    userHandlers
}