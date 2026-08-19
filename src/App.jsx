import { useState, useEffect } from "react";

const weatherCodes = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Foggy", icon: "🌫️" },
  61: { text: "Light rain", icon: "🌦️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  71: { text: "Snow", icon: "🌨️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
};

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherCity, setWeatherCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCities, setRecentCities] = useLocalStorage("recentCities", []);

  async function fetchWeather(cityName) {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try another name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather(weatherData.current_weather);
      setWeatherCity(name);

      setRecentCities((prev) => {
        const withoutDupes = prev.filter(
          (c) => c.toLowerCase() !== name.toLowerCase()
        );
        return [name, ...withoutDupes].slice(0, 5);
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const condition = weather
    ? weatherCodes[weather.weathercode] || {
        text: "Unknown",
        icon: "❓",
      }
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
        padding: "60px 20px",
        boxSizing: "border-box",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 35,
          }}
        >
          <div
            style={{
              fontSize: 55,
              marginBottom: 10,
            }}
          >
            🌤️
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            Weather Dashboard
          </h1>

          <p
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.65)",
              fontSize: 15,
            }}
          >
            Check the current weather anywhere in the world
          </p>
        </div>

        {/* Search Box */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 18,
            padding: 10,
            display: "flex",
            gap: 10,
            boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
          }}
        >
          <input
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
            style={{
              flex: 1,
              padding: "14px 16px",
              border: "none",
              outline: "none",
              borderRadius: 12,
              background: "rgba(255,255,255,0.95)",
              color: "#1e293b",
              fontSize: 15,
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={() => fetchWeather(city)}
            style={{
              padding: "0 22px",
              border: "none",
              borderRadius: 12,
              background: "#3b82f6",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
              boxShadow: "0 5px 15px rgba(59,130,246,0.35)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#2563eb";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Search
          </button>
        </div>

        {/* Recent Cities */}
        {recentCities.length > 0 && (
          <div
            style={{
              marginTop: 25,
              marginBottom: 25,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600,
              }}
            >
              Recent searches
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {recentCities.map((c) => (
                <button
                  key={c}
                  onClick={() => fetchWeather(c)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 30,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    fontSize: 13,
                    transition: "0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.16)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)";
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 30,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <div
              style={{
                fontSize: 30,
                marginBottom: 10,
              }}
            >
              🌤️
            </div>

            <p style={{ margin: 0 }}>Loading weather...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 20,
              padding: "14px 18px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fecaca",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Weather Card */}
        {weather && condition && (
          <div
            style={{
              marginTop: 25,
              background:
                "linear-gradient(145deg, rgba(59,130,246,0.95), rgba(37,99,235,0.85))",
              color: "white",
              borderRadius: 24,
              padding: "35px 30px",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                top: -80,
                right: -60,
              }}
            />

            <div
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                bottom: -60,
                left: -40,
              }}
            />

            <div style={{ position: "relative" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  opacity: 0.7,
                }}
              >
                Current Weather
              </p>

              <h2
                style={{
                  margin: "8px 0 20px",
                  fontSize: 28,
                  fontWeight: 600,
                }}
              >
                {weatherCity}
              </h2>

              <div
                style={{
                  fontSize: 80,
                  lineHeight: 1,
                  marginBottom: 15,
                }}
              >
                {condition.icon}
              </div>

              <p
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  margin: "5px 0",
                  letterSpacing: "-2px",
                }}
              >
                {weather.temperature}°C
              </p>

              <p
                style={{
                  margin: "5px 0 25px",
                  fontSize: 17,
                  opacity: 0.85,
                }}
              >
                {condition.text}
              </p>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  paddingTop: 20,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    opacity: 0.9,
                  }}
                >
                  <span style={{ fontSize: 20 }}>💨</span>
                  <span>Wind</span>
                  <strong>{weather.windspeed} km/h</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: 35,
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
          }}
        >
          Weather data powered by Open-Meteo
        </p>
      </div>
    </div>
  );
}

export default App;