import ReactDrawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { useDrawer } from '../../../state/drawer/drawer';
import { AiOutlineClose } from 'react-icons/ai';
import { NavLink } from 'react-router-dom';
const beyondGreen = '#A1B09B';
const beyondDarkGreen = '#79867B';
const drawerStyles = {
  backgroundColor: beyondDarkGreen
};

export function Drawer() {
  const { drawer, toggleDrawer } = useDrawer();
  return (
    <ReactDrawer size="100vw" style={drawerStyles} direction="left" onClose={toggleDrawer} open={drawer.isOpen}>
      <div className="p-4 font-light">
        <div onClick={toggleDrawer} className="flex justify-end hover:cursor-pointer">
          <AiOutlineClose size={30} />
        </div>
        <div className="p-10 flex justify-center items-center">
          <div>
            <img
              width={100}
              src="https://www.beyondreproachmeals.com/uploads/b/b4905c5476a52fe51de939fd97e3bc0e9bf10dd044aaccb3fac4a473ecbd9178/Beyond%20Reproach_logo_compact_1684603509.png?width=2400&optimize=medium"
            />
          </div>
        </div>
        <div>
          <ul className=" text-beyond-primary divide-beyond-primary text-2xl divide-y">
            <li className="p-4" onClick={toggleDrawer}>
              <NavLink to="/about-us">About Us</NavLink>
            </li>
            <li onClick={toggleDrawer} className="p-4">
              <NavLink to="/how-it-works">How It Works</NavLink>
            </li>
            <li onClick={toggleDrawer} className="p-4">
              <NavLink to="/faq">FAQ</NavLink>
            </li>
            <li onClick={toggleDrawer} className="p-4">
              <NavLink to="/gallery">Gallery</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </ReactDrawer>
  );
}
