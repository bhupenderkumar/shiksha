import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Homework from '@/pages/Homework';
import Fees from '@/pages/Fees';
import { useAuth } from '@/lib/auth';
// ...existing code...

function App() {
  const { profile } = useAuth();

  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/students" component={Students} />
          <Route path="/homework" component={Homework} />
          <Route path="/fees" component={Fees} />
          <Redirect from="/" to="/dashboard" />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
