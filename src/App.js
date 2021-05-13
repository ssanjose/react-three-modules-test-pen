import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Homepage } from "./pages/home/Homepage.js";
import { ClassroomA } from "./pages/classroom/Classroom.js";
import { Test } from "./pages/classroom/Test.js";
import "tailwindcss/dist/tailwind.min.css";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/classroom" exact component={ClassroomA} />
        <Route path="/test" exact component={Test} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
