import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomeworkComponent from './pages/Homework';
import Fees from './pages/Fees';
import ClassworkComponent from './pages/Classwork';
// ...existing code...

const Routes = () => (
  <Router>
    <Switch>
      // ...existing code...
      <Route path="/homework" component={HomeworkComponent} />
      <Route path="/fees" component={Fees} />
      <Route path="/classwork" component={ClassworkComponent} />
      // ...existing code...
    </Switch>
  </Router>
);

export default Routes;
