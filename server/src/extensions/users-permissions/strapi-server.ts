// src/extensions/users-permissions/strapi-server.js
import user from './content-types/user'


export default (plugin) => {

    plugin.contentTypes.user = user


    return plugin

}