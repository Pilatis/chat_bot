import { BrowserRouter } from 'react-router-dom';
import { BaseProvider } from './providers';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <BaseProvider>
        <AppRoutes />
      </BaseProvider>
    </BrowserRouter>
  );
}

export default App;
