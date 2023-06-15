//@ts-ignore
import logo from './extensions/logo.png';
export default {
  config: {
    // Replace the Strapi logo in auth (login) views

    // Replace the favicon

    // Add a new locale, other than 'en'
    // Replace the Strapi logo in the main navigation
    head: {
      favicon: logo
    },
    auth: {
      logo: logo
    },
    menu: {
      logo: logo
    },
    // Override or extend the theme
    theme: {
      // overwrite light theme properties

      // overwrite dark theme properties
      dark: {
        // ...
      }
    },
    // Extend the translations
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome Beyond Reproach',
        'Auth.form.welcome.subtitle': 'Login to your dashboard',
        'app.components.LeftMenu.navbrand.title': 'Beyond Reproach',
        'app.components.LeftMenu.navbrand.workplace': 'Content Dashboard '
      }
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false }
  }
};
