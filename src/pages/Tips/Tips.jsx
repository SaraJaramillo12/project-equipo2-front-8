import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTips } from "../../redux/tips/tipsSlice";
import interview from "../../assets/Job-interview.svg";
import { useNavigate } from "react-router-dom";

const Tips = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tips, status, error } = useSelector((state) => state.tips);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filterBySearch = (tip) => {
    if (!searchQuery) return true;

    const searchTerms = searchQuery.toLowerCase().split(" ").filter(Boolean);
    return searchTerms.every(
      (term) =>
        tip.titulo.toLowerCase().includes(term) ||
        tip.descripcion.toLowerCase().includes(term) ||
        tip.categoria.toLowerCase().includes(term)
    );
  };

  const filterByCategory = (tip) => {
    if (!activeCategory) return true;
    return tip.categoria === activeCategory;
  };

  const filteredTips = tips.filter(filterBySearch).filter(filterByCategory);

  const tipsToDisplay = activeCategory
    ? filteredTips
    : filteredTips.slice(0, 6);

  const categories = [
    "Crecimiento personal",
    "Crecimiento profesional",
    "Networking",
    "Habilidades técnicas",
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchTerm);
  };

  const handleTipClick = (id) => {
    console.log("ID del artículo:", id);
    navigate(`/tipsDetails/${id}`);
  };
  const handleSimulationClick = () => {
    navigate("/practica");
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTips());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-6 sm:p-10 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 font-montserrat">
          Tips para mejorar tus entrevistas
        </h1>
        <div className="flex flex-col items-center">
          <input
            type="text"
            placeholder="Comunicación en equipo ..."
            className="border border-color-1 rounded-lg p-2 w-full sm:w-96 mb-4 font-montserrat"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            onClick={handleSearchClick}
            className="border border-color-1 text-color-3 px-6 py-2 rounded-lg hover:bg-[#EBE2FF] hover:text-color-3 font-montserrat"
          >
            Buscar
          </button>
        </div>
      </header>

      <main>
        <section
          aria-labelledby="categories-heading"
          className="mt-10 text-center"
        >
          <h2
            id="categories-heading"
            className="text-2xl sm:text-3xl font-bold text-color-3 mb-6 sm:mb-12 font-montserrat"
          >
            Explora las diferentes categorías <br /> que tenemos para ti.
          </h2>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16 mb-12 sm:mb-24 ">
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`px-4 py-2 rounded-lg
                  ${
                    activeCategory === category
                      ? "bg-color-1 text-color-3"
                      : "border border-color-1 text-color-3"
                  }
                  hover:bg-[#ece1ff] hover:text-color-3 font-dosis`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tips-heading" className="mt-12 px-4 sm:px-10">
          <h2 id="tips-heading" className="sr-only font-montserrat">
            Tips de entrevistas
          </h2>
          {tipsToDisplay.length === 0 ? (
            <div className="text-center text-color-3 font-montserrat">
              <p>No se ha encontrado un tip referente a tu búsqueda.</p>
              <p>
                Asegúrate de que tu búsqueda coincida con una categoría o
                intenta con otra palabra clave.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tipsToDisplay.map((tip, index) => (
                <div
                  key={index}
                  onClick={() => handleTipClick(tip.id)}
                  className="bg-white from-[#DED7EC] via-[#f1ecfa] to-[#EAE4F2] p-6 border border-gray-200 rounded-lg cursor-pointer transform hover:scale-105 hover:rotate-1 hover:shadow-2xl shadow-md shadow-gray-200 hover:shadow-purple-400/50 transition-all duration-500 flex items-center space-x-4 h-full"
                >
                  <img
                    src={tip.img || "https://via.placeholder.com/50"}
                    alt={`Tip ${index + 1}`}
                    className="w-16 h-16 mr-4 mb-40"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-color-3 mb-2 font-montserrat">
                      {tip.titulo}
                    </h3>
                    <p className="text-color-3 font-dosis">{tip.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* {tipsToDisplay.length === 0 ? (
  <div className="text-center text-color-3 font-montserrat">
    <p>No se ha encontrado un tip referente a tu búsqueda.</p>
    <p>
      Asegúrate de que tu búsqueda coincida con una categoría o intenta con otra palabra clave.
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {tipsToDisplay.map((tip, index) => (
      <div
        key={index}
        onClick={() => handleTipClick(tip.id)}
        className="bg-white from-[#DED7EC] via-[#f1ecfa] to-[#EAE4F2] p-6 border border-gray-200 rounded-lg cursor-pointer transform hover:scale-105 hover:rotate-1 hover:shadow-2xl shadow-md shadow-gray-200 hover:shadow-purple-400/50 transition-all duration-500 flex items-center space-x-4 h-full"
      >
        <img
          src={tip.img || "https://via.placeholder.com/50"}
          alt={`Tip ${index + 1}`}
          className="w-16 h-16 "
        />
        <div>
          <h3 className="text-xl font-semibold text-color-3 mb-2 font-montserrat">
            {tip.titulo}
          </h3>
          <p className="text-color-3 font-dosis">{tip.descripcion}</p>
        </div>
      </div>
    ))}
  </div>
)} */}


        </section>

        <section
          aria-labelledby="simulator-heading"
          className="mt-16 bg-white shadow p-6 sm:p-16"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <img src={interview} alt="Simulador" className="w-16 h-16" />
              <div className="ml-4">
                <h2 className="text-2xl font-semibold text-color-3 font-montserrat">
                  Simulador de entrevistas
                </h2>
                <p className="text-color-3 font-dosis">
                  Convierte en práctica tus habilidades
                </p>
              </div>
            </div>
            <button
              className="border border-color-1 hover:bg-[#EBE2FF] rounded-md p-2 font-montserrat font-medium w-full sm:w-auto mt-2 sm:mt-0 ml-4 text-sm"
              onClick={handleSimulationClick}
            >
              Ir al simulador de entrevistas
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tips;
