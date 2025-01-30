import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Twilio from './pages/Twilio';

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <Route path="/twilio" component={Twilio} />
        {/* ...existing code... */}
      </Switch>
    </Router>
  );
};

export default Routes;
