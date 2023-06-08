import ReactDrawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { useDrawer } from '../../../state/drawer/drawer';

export function Drawer() {
  const { drawer, toggleDrawer } = useDrawer();
  return (
    <ReactDrawer direction="left" onClose={toggleDrawer} open={drawer.isOpen}>
      <div>Hello World</div>
    </ReactDrawer>
  );
}
