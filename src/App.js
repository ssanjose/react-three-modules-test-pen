import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Homepage } from "./pages/home/Homepage.js";
import { ClassroomA } from "./pages/classroom/Classroom.js";
import "tailwindcss/dist/tailwind.min.css";
import { Classroom } from "./pages/classroom/Classroom";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route path="/classroom" exact component={ClassroomA} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
