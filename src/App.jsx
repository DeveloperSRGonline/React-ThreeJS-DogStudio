import { Canvas } from "@react-three/fiber";
import "./App.css";
import Dog from "./components/Dog";

const App = () => {
  return (
    <>
      <Canvas>
        <Dog />
      </Canvas>
    </>
  );
};

export default App;
