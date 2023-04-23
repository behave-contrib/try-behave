import './App.css';
import FeatureHolder from "./components/FeatureHolder";
import TryIt from "./components/TryIt";

function App() {
    const url = new URL(window.location.href);
    const tryit = url.searchParams.get("tryit");
    if (tryit) {
        return (
            <div className="App">
                <TryIt />
            </div>
        );
    }
    return (
        <div className="App">
            <FeatureHolder />
        </div>
    );
}

export default App;
