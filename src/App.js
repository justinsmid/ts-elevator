import './App.scss';
import {ElevatorShaft} from './components/ElevatorShaft';

const NR_OF_FLOORS = 6;

function App() {
  return (
    <div className="app">
      <header>
        <h1>Elevator</h1>
      </header>
      <main>
        <ElevatorShaft amountOfFloors={NR_OF_FLOORS} />
      </main>
    </div>
  );
}

export default App;
