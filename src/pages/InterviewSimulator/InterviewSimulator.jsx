import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useEffect, useRef, useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Player } from "@lottiefiles/react-lottie-player";
import { SlArrowLeft } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import imgModal from "../../assets/felicidades.svg";
import {
  fetchQuestions,
  nextQuestion,
  setTimeLeft,
  setTimerActive,
  addChatMessage,
  setShowModal,
  setHasStarted,
  resetInterview,
  resetInterviewState,
  createChatHistory,
  updateChatHistory,
} from "../../redux/InterviewSimulator/InterviewSimulatorSlice";
import { useNavigate } from "react-router-dom";
import InterviewProgress from "../../components/InterviewProgress/InterviewProgress";
import Timer from "../../components/Timer/Timer";
import ChatHistory from "./../../components/ChatHistory/ChatHistory";

const feedbackRecomendaciones = [
  "Ser más específico en tus respuestas.",
  "Evitar respuestas demasiado cortas o largas.",
  "Mantener un lenguaje corporal positivo.",
  "Hacer más preguntas sobre la empresa al final de la entrevista.",
];

const InterviewSimulator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    selectedCategory,
    questions,
    currentQuestionIndex,
    chatHistory,
    timeLeft,
    timerActive,
    showModal,
    hasStarted,
    messages,
  } = useSelector((state) => state.interview);

  const timerId = useRef(null);

  const handleBackToCategories = () => {
    dispatch(resetInterview());
    navigate("/practica");
  };

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchQuestions(selectedCategory));
    }
  }, [dispatch, selectedCategory]);

  const handleFeedback = (id) => {
    console.log("intentoId", id);
    navigate(`/retroalimentacion/${id}`);
  };

  const [showRetryModal, setShowRetryModal] = useState(false);

  // Temporizador
  useEffect(() => {
    if (timeLeft > 0 && timerActive) {
      timerId.current = setInterval(() => {
        dispatch(setTimeLeft(timeLeft - 1));
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerId.current);
      setShowRetryModal(true);
    }
    return () => clearInterval(timerId.current);
  }, [timeLeft, timerActive, dispatch]);

  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema: timerActive
      ? Yup.object({
          message: Yup.string().required("Este campo es obligatorio"),
          // .matches(
          //   /^[a-zA-Z\s]+$/,
          //   "Por favor ingresa solo letras y espacios"
          // )
          // .min(10, "La respuesta debe tener al menos 10 caracteres")
          // .test(
          //   "words-count",
          //   "La respuesta debe tener al menos 3 palabras",
          //   (value) => value && value.trim().split(/\s+/).length >= 3
          // ),
        })
      : null,
    validateOnBlur: timerActive,
    validateOnChange: timerActive,
    onSubmit: (values, { resetForm }) => {
      dispatch(addChatMessage({ type: "user", message: values.message }));

      const nextQuestionIndex = currentQuestionIndex + 1;

      if (Number(nextQuestionIndex) === 1) {
        dispatch(
          createChatHistory({
            question: questions[currentQuestionIndex].pregunta,
            category: questions[currentQuestionIndex].categoria,
            response: values.message,
          })
        );
      }
      if (Number(nextQuestionIndex) > 1) {
        dispatch(
          updateChatHistory({
            idIntento: messages?.id || "",
            question: questions[currentQuestionIndex].pregunta,
            category: questions[currentQuestionIndex].categoria,
            response: values.message,
          })
        );
      }

      if (nextQuestionIndex < questions.length) {
        setAnsweredQuestions((prevCount) => prevCount + 1);
        dispatch(nextQuestion());
        dispatch(setTimeLeft(60));

        dispatch(
          addChatMessage({
            type: "bot",
            message: questions[nextQuestionIndex].pregunta,
          })
        );
      } else {
        setAnsweredQuestions((prevCount) => prevCount + 1);
        dispatch(setShowModal(true));
        dispatch(setTimerActive(false));
      }

      resetForm();
    },
  });

  const startInterview = async () => {
    let loadedQuestions = questions;

    if (loadedQuestions.length === 0) {
      const response = dispatch(fetchQuestions(selectedCategory));

      if (response && response.payload && response.payload.length > 0) {
        loadedQuestions = response.payload;
      } else {
        alert("No hay preguntas disponibles para esta entrevista.");
        return;
      }
    }

    dispatch(setHasStarted(true));
    dispatch(setTimerActive(true));

    dispatch(
      addChatMessage({ type: "bot", message: loadedQuestions[0].pregunta })
    );
  };

  const feedbacks = useSelector((state) => state.interview.feedbacks);

  // Calcular la calificación general
  // const totalFeedbackScore = useMemo(() => {
  //   if (!feedbacks || !feedbacks.feedback) return 0;

  //   let totalScore = 0;
  //   feedbacks.feedback.forEach((fb) => {
  //     totalScore +=
  //       (fb.claridad || 0) + (fb.formalidad || 0) + (fb.relevancia || 0);
  //   });

  //   // Total máximo sería 300 (3 parámetros x 10 preguntas x 10 puntos máximo)
  //   const maxScore = feedbacks.feedback.length * 30; // 30 es 3 parámetros x 10 puntos máx
  //   return (totalScore / maxScore) * 5; // Escalar a 5 estrellas
  // }, [feedbacks]);

  // const renderStars = (score) => {
  //   // Asegurar que el score esté entre 0 y 5
  //   const validScore = Math.max(Math.min(score, 5), 0);

  //   // Redondeamos el score a medias estrellas
  //   const totalStars = Math.round(validScore * 2) / 2;

  //   const fullStars = Math.floor(totalStars); // Estrellas llenas
  //   const halfStar = totalStars % 1 !== 0 ? 1 : 0; // Si hay media estrella
  //   const emptyStars = 5 - fullStars - halfStar; // Estrellas vacías

  //   // Asegurarse de que todas las longitudes de los arrays sean válidas (>= 0)
  //   return (
  //     <div className="flex">
  //       {/* Estrellas llenas */}
  //       {Array.from({ length: fullStars }, (_, index) => (
  //         <FaStar key={`full-${index}`} className="text-yellow-500" />
  //       ))}

  //       {/* Media estrella */}
  //       {halfStar === 1 && <FaStarHalfAlt className="text-yellow-500" />}

  //       {/* Estrellas vacías */}
  //       {Array.from({ length: emptyStars }, (_, index) => (
  //         <FaRegStar key={`empty-${index}`} className="text-yellow-500" />
  //       ))}
  //     </div>
  //   );
  // };

  // Calcular la calificación general
  const totalFeedbackScore = useMemo(() => {
    if (!feedbacks || !feedbacks.feedback || feedbacks.feedback.length === 0) {
      return null; // Devuelve null mientras se cargan los datos
    }
  
    let totalQuestionScore = 0;
  
    feedbacks.feedback.forEach((fb, index) => {
      const claridad = parseFloat(fb.claridad) || 0;
      const formalidad = parseFloat(fb.formalidad) || 0;
      const relevancia = parseFloat(fb.relevancia) || 0;
  
      // Mostrar puntajes individuales de cada parámetro
      console.log(
        `Pregunta ${index + 1} - Claridad: ${claridad}, Formalidad: ${formalidad}, Relevancia: ${relevancia}`
      );
  
      const totalScoreForQuestion = claridad + formalidad + relevancia;
  
      // Mostrar el puntaje total de cada pregunta
      console.log(`Pregunta ${index + 1}: Puntaje total = ${totalScoreForQuestion}/30`);
  
      totalQuestionScore += totalScoreForQuestion;
    });
  
    const averageTotalScore = totalQuestionScore / feedbacks.feedback.length;
  
    // Mostrar el puntaje general (promedio)
    console.log(`Puntaje general (promedio): ${averageTotalScore}`);
  
    return (averageTotalScore / 30) * 5; // Convertimos de una escala de 30 a una de 5
  }, [feedbacks]);

  // Nuevo estado para controlar si está calculando
  const [isCalculating, setIsCalculating] = useState(true);

  // Actualizamos el estado después de calcular el totalFeedbackScore
  useEffect(() => {
    if (totalFeedbackScore !== null) {
      // Aumentamos el tiempo de espera para que sea más notorio
      const timeout = setTimeout(() => setIsCalculating(false), 1500);
      return () => clearTimeout(timeout); // Limpiamos el timeout para evitar efectos secundarios
    }
  }, [totalFeedbackScore]);

  // Función para redondear el puntaje y convertirlo en estrellas
  const calculateStarsFromScore = (score) => {
    const stars = Math.round(score);
    // Validar que la cantidad de estrellas esté entre 1 y 5
    return Math.max(1, Math.min(stars, 5));
  };

  // Animación de carga
  const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center">
        {/* Puedes usar una animación CSS con Tailwind */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  };

  // Renderizar estrellas
  const renderStars = (score) => {
    if (isCalculating || score === null) {
      // Si aún está calculando, mostrar el spinner de carga
      return <LoadingSpinner />;
    }

    const totalStars = calculateStarsFromScore(score);
    const emptyStars = 5 - totalStars;

    return (
      <div className="flex items-center">
        {Array(totalStars)
          .fill()
          .map((_, index) => (
            <FaStar key={`full-${index}`} className="text-yellow-500" />
          ))}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <FaRegStar key={`empty-${index}`} className="text-yellow-500" />
          ))}
        <span className="ml-2 text-lg">({(score * 6).toFixed(2)} / 30)</span>
      </div>
    );
  };



  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
      <div className="absolute top-20 left-0">
        <SlArrowLeft
          onClick={() => {
            dispatch(resetInterview());
            navigate("/practica");
          }}
          className="h-8 text-color-1 md:ml-3 md:mt-4 mt-3 ml-2 cursor-pointer md:text-5xl text-2xl"
        />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-16 max-w-4xl w-full">
        {/* H1 dentro del contenedor */}
        {selectedCategory && (
          <h1 className="text-2xl font-bold text-center mb-12">
            Entrevista {selectedCategory}
          </h1>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 bg-purple-300 rounded-full flex items-center justify-center">
              <Player
                autoplay
                loop
                src="https://lottie.host/afd8fdfd-8370-44aa-bd62-7be2f8909e42/tUDF2f2WZz.json"
                style={{ height: "300px", width: "300px" }}
              />
            </div>

            {hasStarted && (
              <button
                className="px-6 py-2 rounded-lg mt-16 mb-4 border border-color-1 text-color-3 hover:bg-[#ece1ff] hover:text-color-3 transition font-dosis"
                onClick={handleBackToCategories}
              >
                Cambiar entrevista
              </button>
            )}

            {hasStarted && <Timer timeLeft={timeLeft} />}
          </div>

          <div className="bg-purple-200 p-4 rounded-lg">
            {/* Historial del chat */}
            <ChatHistory
              chatHistory={chatHistory}
              hasStarted={hasStarted}
              startInterview={startInterview}
            />

            {/* Formulario para respuestas */}
            {hasStarted && currentQuestionIndex < questions.length && (
              <form onSubmit={formik.handleSubmit} className="mt-4">
                <div className="flex items-center">
                  <input
                    id="message"
                    name="message"
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.message}
                    className="w-full p-2 rounded-l-lg border-2 border-purple-300"
                  />
                  <button
                    type="submit"
                    className="bg-purple-500 text-white p-2 rounded-r-lg hover:bg-purple-600 transition"
                  >
                    ➤
                  </button>
                </div>
                {formik.touched.message && formik.errors.message ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.message}
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </div>

        {hasStarted && (
          <div>
            <InterviewProgress
              answeredQuestions={answeredQuestions}
              questionsLength={questions.length}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full relative">
            {/* Botón de cerrar */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                dispatch(resetInterviewState());
                dispatch(fetchQuestions(selectedCategory));
                setAnsweredQuestions(0);
                setShowModal(false);
                navigate("/practica");
              }}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              ¡Felicitaciones! Haz terminado tu entrevista.
            </h2>
            <img
              src={imgModal}
              alt="Celebración"
              className="w-full max-h-16 object-contain mb-4"
            />
            <div className="text-center mb-4">
              <p className="text-xl font-semibold">Calificación</p>
              {/* <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">
                    ★
                  </span>
                ))}
              </div> */}
              {/* Mostrar la calificación general */}
              <section className="flex justify-center mb-10">
                <h2 className="text-2xl flex items-center">
                  {renderStars(totalFeedbackScore)}{" "}
                </h2>
              </section>

              <div className="mt-2">
                {feedbackRecomendaciones.map((recomendacion, index) => (
                  <p key={index} className="mt-1">
                    • {recomendacion}
                  </p>
                ))}
              </div>
            </div>
            <div className="text-center">
              <button
                className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition"
                onClick={() => {
                  dispatch(resetInterviewState());
                  dispatch(fetchQuestions(selectedCategory));
                  setAnsweredQuestions(0);
                  setShowModal(false);
                }}
              >
                Reintentar
              </button>
              <button onClick={() => handleFeedback(messages.id)}>
                Ver el feedback de la entrevista
              </button>
            </div>
          </div>
        </div>
      )}

      {showRetryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full relative">
            <h2 className="text-2xl font-bold mb-4 text-center">
              El tiempo para responder ha terminado.
            </h2>
            <div className="text-center mb-4">
              <p>
                ¿Deseas reintentar la pregunta o continuar con la siguiente?
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                  onClick={() => {
                    setShowRetryModal(false);
                    dispatch(setTimeLeft(60));
                  }}
                >
                  Reintentar
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                  onClick={() => {
                    setShowRetryModal(false);
                    setAnsweredQuestions((prevCount) => prevCount + 1);
                    dispatch(nextQuestion());
                    dispatch(setTimeLeft(60));
                    dispatch(
                      addChatMessage({
                        type: "bot",
                        message: questions[currentQuestionIndex + 1].pregunta,
                      })
                    );
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulator;
