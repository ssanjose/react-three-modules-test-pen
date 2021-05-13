import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Homepage } from "./pages/home/Homepage.js";
import { Classroom } from "./test-lv/Classroom-scene/Classroom.js";
import "tailwindcss/dist/tailwind.min.css";
import { Classroom2 } from "./test-lv/test-2-vanilla/test-2-vanilla";
import Interaction from "./test-lv/object-interaction/interaction";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/Classroom" component={Classroom} />
        <Route path="/Classroom2" component={Classroom2} />
        <Route path="/Interaction" component={Interaction} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
