import {
BrowserRouter,
Routes,
Route,
Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateDelivery from "./pages/CreateDelivery";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import DispatcherDeliveryDetail from "./pages/DispatcherDeliveryDetail";
function App() {
return ( <BrowserRouter> <Routes>


            <Route
                path="/"
                element={<Navigate to="/login" />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            <Route
                path="/deliveries/create"
                element={<CreateDelivery />}
            />
           <Route
    path="/rider/dashboard"
    element={<RiderDashboard />}
/>
           <Route
    path="/dispatcher/dashboard"
    element={<DispatcherDashboard />}
/>
            <Route
        path="/dispatcher/deliveries/:id"
        element={<DispatcherDeliveryDetail />}
    />
        </Routes>
    </BrowserRouter>
);


}

export default App;
