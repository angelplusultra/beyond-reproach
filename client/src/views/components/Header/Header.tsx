import { NavLink } from 'react-router-dom';
import { useDrawer } from '../../../state/drawer/drawer';
import Hamburger from 'hamburger-react';

export function Header() {
  const { toggleDrawer, drawer } = useDrawer();
  return (
    <div className="">
      <ul className="transition-all ease-linear duration-300 flex items-center justify-between py-3 lg:py-5 px-24  text-beyond-primary bg-beyond-brown">
        <div className=" font-light">
          <div className="lg:hidden">
            <Hamburger onToggle={toggleDrawer} toggled={drawer.isOpen} size={30} />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-italiana text-4xl">Beyond Reproach</h1>
          </div>
        </div>
        <div className="flex gap-10 items-center justify-center ">
          <li className="hidden lg:block">
            <NavLink to="/how-it-works" className="group transition duration-300">
              Menu
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beyond-primary"></span>
            </NavLink>
          </li>
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
