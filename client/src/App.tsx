import { Route, Routes } from 'react-router-dom';
import { Container } from './views/components/Container/Container';
import { Header } from './views/components/Header/Header';
import { Drawer } from './views/components/Drawer/Drawer';

function App() {
  return (
    <div>
      <Container>
        <Header />
        <Drawer />
        <Routes>
          <Route index element={<>Landing Page</>} />
          <Route path="about-us" element={<>About Us Page</>} />
          <Route path="how-it-works" element={<>How it Works Page</>} />
          <Route path="faq" element={<>FAQ Page</>} />
          <Route path="signup" element={<>Sign Up Page</>} />
          <Route path="login" element={<>Login Page</>} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
