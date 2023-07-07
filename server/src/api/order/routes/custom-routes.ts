import middleware from '../middlewares/order';
export default {
  routes: [
    {
      method: 'GET',
      path: '/orders/success',
      handler: 'order.onOrderCheckoutSuccess',
      config: {
        middlewares: [middleware.validateCheckoutSession, middleware.preventMultipleOnOrderSuccess]
      }
    }
  ]
};
