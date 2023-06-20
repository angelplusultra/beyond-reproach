import middleware from '../middlewares/order';
export default {
  routes: [
    {
      method: 'GET',
      path: '/orders/success',
      handler: 'order.onOrderCheckoutSuccess',
      config: {
        auth: false,
        middlewares: [middleware.validateCheckoutSession]
      }
    }
  ]
};
