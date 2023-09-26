import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import Vehicles from "./Vehicles";
import Hideout from "./Hideout";
import Popup from "./Popup";
import "./CardGrid.css";

function Game() {
  const [timeTaken, setTimeTaken] = useState(0);
  const [token, setToken] = useState(null);
  const [planets, setPlanets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [cardData, setCardData] = useState([
    { id: 1, title: "Planet One", selectedPlanet: null, selectedVehicle: null },
    { id: 2, title: "Planet Two", selectedPlanet: null, selectedVehicle: null },
    {
      id: 3,
      title: "Planet Three",
      selectedPlanet: null,
      selectedVehicle: null
    },
    { id: 4, title: "Planet Four", selectedPlanet: null, selectedVehicle: null }
  ]);
  const [selectedPlanets, setSelectedPlanets] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({});

  useEffect(() => {
    axios
      .all([
        axios.get("https://findfalcone.geektrust.com/planets"),
        axios.get("https://findfalcone.geektrust.com/vehicles")
      ])
      .then(
        axios.spread((planetsResponse, vehiclesResponse) => {
          setPlanets(planetsResponse.data);
          setVehicles(vehiclesResponse.data);
        })
      )
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Calculate the total time taken based on selected planets and vehicles
  const calculateTimeTaken = (updatedCardData) => {
    let totalTime = 0;
    updatedCardData.forEach((card) => {
      if (card.selectedPlanet && card.selectedVehicle) {
        const selectedVehicle = vehicles.find(
          (vehicle) => vehicle.name === card.selectedVehicle
        );
        if (selectedVehicle) {
          totalTime += card.selectedPlanet.distance / selectedVehicle.speed;
        }
      }
    });
    return totalTime;
  };

  // Check if the selection is complete
  const isSelectionComplete = cardData.every(
    (card) => card.selectedPlanet && card.selectedVehicle
  );

  // Fetch the token when the selection is complete
  useEffect(() => {
    if (isSelectionComplete && !token) {
      axios
        .post("https://findfalcone.geektrust.com/token", null, {
          headers: {
            Accept: "application/json"
          }
        })
        .then((response) => {
          setToken(response.data.token);
          console.log("Token:", response.data.token);
        })
        .catch((error) => {
          console.error("Error fetching token:", error);
        });
    }
  }, [isSelectionComplete, token]);

  // Check if a vehicle is available for selection
  const isVehicleAvailable = (cardIndex, vehicleName) => {
    const selectedPlanet = cardData[cardIndex].selectedPlanet;
    if (!selectedPlanet) return false;

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.name === vehicleName
    );
    if (!selectedVehicle) return false;

    const vehicleInSelection = cardData.some(
      (card, index) =>
        index !== cardIndex &&
        card.selectedPlanet?.name === selectedPlanet.name &&
        card.selectedVehicle === vehicleName
    );

    return (
      selectedVehicle.total_no > 0 &&
      selectedVehicle.max_distance >= selectedPlanet.distance &&
      !vehicleInSelection
    );
  };

  // Handle planet selection
  const handlePlanetSelect = (cardIndex, planetName) => {
    const selectedPlanet = planets.find((planet) => planet.name === planetName);
    if (!selectedPlanet) return;

    const updatedSelectedPlanets = [...selectedPlanets];
    updatedSelectedPlanets[cardIndex] = planetName;
    setSelectedPlanets(updatedSelectedPlanets);

    const updatedCardData = [...cardData];
    updatedCardData[cardIndex].selectedPlanet = selectedPlanet;
    updatedCardData[cardIndex].selectedVehicle = null;
    setCardData(updatedCardData);

    const updatedTime = calculateTimeTaken(updatedCardData);
    setTimeTaken(updatedTime);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (cardIndex, vehicleName) => {
    const updatedSelectedVehicles = [...selectedVehicles];
    updatedSelectedVehicles[cardIndex] = vehicleName;
    setSelectedVehicles(updatedSelectedVehicles);

    const updatedCardData = [...cardData];
    updatedCardData[cardIndex].selectedVehicle = vehicleName;
    setCardData(updatedCardData);

    const updatedTime = calculateTimeTaken(updatedCardData);
    setTimeTaken(updatedTime);
  };

  // Handle finding Falcone
  const findFalcone = async () => {
    const body = {
      token: token,
      planet_names: selectedPlanets,
      vehicle_names: selectedVehicles
    };

    try {
      const response = await axios.post(
        "https://findfalcone.geektrust.com/find",
        body,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      console.log("Response:", data);

      if (data.status === "success") {
        const planetName = data.planet_name;

        setPopupData({
          timeTaken: timeTaken,
          planetName: planetName
        });

        setShowPopup(true);
      } else {
        console.log("Alas Falcone is not found");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Header />
      <div>
        <h1>Select the planets you want to search in</h1>
      </div>
      <div>
        <Vehicles />
      </div>

      <div>
        <Hideout />
      </div>
      <div>
        <h2>Time Taken: {timeTaken} </h2>
      </div>

      <div className="card-grid">
        {cardData.map((card, index) => (
          <div className="card" key={card.id}>
            <h3>{card.title}</h3>
            <select
              value={card.selectedPlanet ? card.selectedPlanet.name : ""}
              onChange={(event) =>
                handlePlanetSelect(index, event.target.value)
              }
            >
              <option value="">
                {card.selectedPlanet
                  ? `${card.selectedPlanet.name}`
                  : "Select a planet"}
              </option>
              {planets.map((planet) => (
                <option
                  key={planet.name}
                  value={planet.name}
                  disabled={
                    cardData.some(
                      (otherCard) =>
                        otherCard.selectedPlanet?.name === planet.name &&
                        otherCard !== card
                    ) || card.selectedPlanet?.name === planet.name
                  }
                >
                  {planet.name}
                </option>
              ))}
            </select>
            {card.selectedPlanet && (
              <div>
                <label>Select a Vehicle:</label>
                <div className="radio-buttons">
                  {vehicles.map((vehicle) => (
                    <label key={vehicle.name}>
                      <input
                        type="radio"
                        name={`vehicle-${index}`}
                        value={vehicle.name}
                        onChange={() =>
                          handleVehicleSelect(index, vehicle.name)
                        }
                        disabled={!isVehicleAvailable(index, vehicle.name)}
                        checked={card.selectedVehicle === vehicle.name}
                      />
                      {`${vehicle.name} (Max Distance: ${vehicle.max_distance}, Speed: ${vehicle.speed}, Quantity: ${vehicle.total_no})`}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="findfalcone" onClick={findFalcone}>
        Find Falcone
      </button>

      <Footer />

      {showPopup && (
        <div className="popup">
          <h1>
            {popupData.planetName
              ? "Success! Congratulations on finding Falcone! King Shan is Mighty Pleased!"
              : "Alas Falcone is not found"}
          </h1>
          <h1>Time Taken: {popupData.timeTaken}</h1>
          {popupData.planetName && (
            <h1>Planet found: {popupData.planetName}</h1>
          )}
        </div>
      )}
    </div>
  );
}

export default Game;
