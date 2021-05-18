import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Homepage } from "./pages/home/Homepage.js";
import { Classroom } from "./test-lv/Classroom-scene/Classroom.js";
import "tailwindcss/dist/tailwind.min.css";
import { Classroom2 } from "./test-lv/test-2-vanilla/test-2-vanilla";
import { Interaction } from "./test-lv/object-interaction/interaction";
import { Physics } from "./test-lv/physics-practice/physics";
import { Movement } from "./test-lv/Movement/Movement";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/Classroom" component={Classroom} />
        <Route path="/Classroom2" component={Classroom2} />
        <Route path="/Interaction" component={Interaction} />
        <Route path="/Physics" component={Physics} />
        <Route path="/Movement" component={Movement} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
