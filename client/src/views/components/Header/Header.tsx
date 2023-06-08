import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <div className="">
      <ul className="lg:flex md:items-center md:justify-between py-5 px-24 font-light text-beyond-primary bg-beyond-darkgreen">
        <div className="text-3xl hidden lg:block">Beyond Reproach</div>
        <div className="flex gap-10 items-center justify-end text-xl">
          <li>
            <NavLink className="hidden lg:block" to="/about-us">
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink className="hidden lg:block" to="/how-it-works">
              How It Works
            </NavLink>
          </li>
          <li>
            <NavLink className="hidden lg:block" to="/faq">
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink className="hidden lg:block" to="/gallery">
              Gallery
            </NavLink>
          </li>
          <li>
            <NavLink to="/signup">Sign Up</NavLink>
          </li>
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        </div>
      </ul>
    </div>
  );
}
