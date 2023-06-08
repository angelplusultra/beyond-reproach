import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <div className="">
      <ul className="lg:flex md:items-center md:justify-between py-5 px-24 font-extralight text-beyond-primary bg-beyond-brown">
        <div className="text-3xl font-light hidden lg:block">Beyond Reproach</div>
        <div className="flex gap-10 items-center justify-center text-lg">
          <li className="hidden lg:block">
            <NavLink to="/how-it-works" className="group transition duration-300">
              How It Works
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
          <li className="hidden lg:block">
            <NavLink to="/faq" className="group transition duration-300">
              FAQ
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
          <li className="hidden lg:block">
            <NavLink to="/about-us" className="group transition duration-300">
              About Us
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
          <li className="hidden lg:block">
            <NavLink to="/gallery" className="group transition duration-300">
              Gallery
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/signup" className="group transition duration-300">
              Sign Up
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/login" className="group transition duration-300">
              Login
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
        </div>
      </ul>
    </div>
  );
}
