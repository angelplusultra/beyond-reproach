/**
 * order controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::order.order', ({strapi}: {strapi: Strapi.Strapi}) => {
    const order = strapi.service("api::order.order")
    const subOrder = strapi.service("api::sub-order.sub-order")
    
    
    return {
        async create(ctx: API.Context<null>){
            const cartItems = {
                monday: {
                    lunch: 1,
                    lunch_qty: 2,
                    lunch_accomodate_allergies: [1, 2]
                },
                tuesday: {
                    lunch:1,
                    lunch_qty:1
                }
            }
            

            const mockCart = {
                monday: {
                    lunches: [{lunch: 1, protein: 1, accomodate_allergies: [1]}],
                    dinners: [],
                    bundles: []
                }
            }

            let mondayOrder, tuesdayOrder,wednesdayOrder,thursdayOrder,fridayOrder

            if(cartItems.monday){
                mondayOrder = await subOrder.create({
                    data: {
                        ...cartItems.monday
                    }
                })
            }

            if(cartItems.tuesday){
                tuesdayOrder =  await subOrder.create({
                    data: {
                        ...cartItems.tuesday
                    }
                })
            }

            const newOrder = await order.create({
                data: {
                    monday: mondayOrder.id,
                    tuesday: tuesdayOrder.id

                }
            })

            return {
                orders: [
                    mondayOrder,
                    tuesdayOrder
                ],
                main: newOrder
            }


            
        }
    }
});
