import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Homepage } from "./pages/home/Homepage.js";
import { Classroom } from "./test-lv/Classroom-scene/Classroom.js";
import "tailwindcss/dist/tailwind.min.css";
import { Interaction } from "./test-lv/object-interaction/interaction";
import { Movement } from "./test-lv/Movement/Movement";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/Classroom" component={Classroom} />
        <Route path="/Interaction" component={Interaction} />
        <Route path="/Movement" component={Movement} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
