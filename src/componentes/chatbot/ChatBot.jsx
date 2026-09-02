import {
  useEffect,
  useRef,
  useState
} from "react";

import "./ChatBot.css";

import {
  obtenerProductos,
  obtenerRespuestas
} from "../../services/chatService";

import {
  buscarProducto,
  buscarRespuesta,
  normalizarTexto
} from "../../utils/chatUtils";


const respuestasRapidas = [
  "Horarios",
  "Ubicación",
  "Pasteles",
  "Servicio a domicilio",
  "Formas de pago",
];


function obtenerHora() {
  return new Date().toLocaleTimeString(
    "es-MX",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function ChatBot() {

  const [respuestas, setRespuestas] =
    useState([]);

  const [productos, setProductos] =
    useState([]);

  const [cargandoDatos, setCargandoDatos] =
    useState(true);

  const [mensaje, setMensaje] =
    useState("");

  const [mensajes, setMensajes] =
    useState(() => [
      {
        id: crypto.randomUUID(),
        tipo: "bot",
        texto:
          "¡Hola! 👋 Soy el asistente virtual de Panadería La Espiga Lagunera. ¿En qué puedo ayudarte?",
        hora: obtenerHora(),
      },
    ]);

  const mensajesRef = useRef(null);

  // SCROLL AUTOMÁTICO
  useEffect(() => {

    if (mensajesRef.current) {

      mensajesRef.current.scrollTop =
        mensajesRef.current.scrollHeight;

    }

  }, [mensajes]);


  // CARGAR DATOS DE FIRESTORE
  useEffect(() => {

    const cargarDatos = async () => {

      try {

        const [
          respuestasFirestore,
          productosFirestore,
        ] = await Promise.all([
          obtenerRespuestas(),
          obtenerProductos(),
        ]);


        setRespuestas(
          respuestasFirestore
        );


        setProductos(
          productosFirestore
        );


        console.log(
          "Respuestas cargadas:",
          respuestasFirestore
        );


        console.log(
          "Productos cargados:",
          productosFirestore
        );

      } catch (error) {

        console.error(
          "No se pudieron cargar los datos:",
          error
        );

      } finally {

        setCargandoDatos(false);

      }

    };


    cargarDatos();

  }, []);

  // CONSTRUIR RESPUESTA DE PRODUCTO
  const construirRespuestaProducto = (
  producto
) => {

  let respuesta =
    `🍰 ${producto.nombre}`;


  if (producto.descripcion) {
    respuesta +=
      `\n${producto.descripcion}`;
  }


  if (
    producto.precio !== undefined &&
    producto.precio !== null
  ) {
    respuesta +=
      `\nPrecio: $${producto.precio}`;
  }


  if (
    producto.disponibles !== undefined &&
    producto.disponibles !== null
  ) {

    if (producto.disponibles > 0) {

      respuesta +=
        `\nDisponibles: ${producto.disponibles}`;

    } else {

      respuesta +=
        "\nDisponibilidad: Agotado";

    }

  }


  return respuesta;
};


  // OBTENER RESPUESTA DEL BOT
  const obtenerRespuestaBot = (
    textoUsuario
  ) => {

    const texto =
      normalizarTexto(textoUsuario);

    // SALUDOS
    if (
      texto.includes("hola") ||
      texto.includes("buenos dias") ||
      texto.includes("buenas tardes") ||
      texto.includes("buenas noches")
    ) {

      return (
        "¡Hola! 😊 Bienvenido a " +
        "Panadería La Espiga Lagunera. " +
        "¿En qué puedo ayudarte?"
      );

    }

    // BUSCAR PRODUCTO
    const producto =
      buscarProducto(
        textoUsuario,
        productos
      );


    if (producto) {

      const preguntaPrecio =
        texto.includes("precio") ||
        texto.includes("cuesta") ||
        texto.includes("cuanto") ||
        texto.includes("vale");


      const preguntaStock =
        texto.includes("disponible") ||
        texto.includes("disponibles") ||
        texto.includes("cantidad") ||
        texto.includes("cuantos") ||
        texto.includes("quedan") ||
        texto.includes("existencia");


      // PRECIO
      if (preguntaPrecio) {

        if (
            producto.precio === undefined ||
            producto.precio === null
        ) {
            return (
            `Por el momento no tengo registrado el precio de ` +
            `${producto.nombre}.`
            );
        }

        return (
            `💛 ${producto.nombre} tiene un precio de ` +
            `$${producto.precio}.`
        );
        }


        if (preguntaStock) {

        if (
            producto.disponibles === undefined ||
            producto.disponibles === null
        ) {
            return (
            `Por el momento no tengo registrada la disponibilidad de ` +
            `${producto.nombre}.`
            );
        }

        if (producto.disponibles <= 0) {
            return (
            `😔 ${producto.nombre} se encuentra agotado por el momento.`
            );
        }

        return (
            `📦 Actualmente tenemos ` +
            `${producto.disponibles} unidades disponibles de ` +
            `${producto.nombre}.`
        );
    }


      // INFORMACIÓN GENERAL
      return construirRespuestaProducto(
        producto
      );

    }

    // BUSCAR RESPUESTA GENERAL
    const respuesta =
      buscarRespuesta(
        textoUsuario,
        respuestas
      );


    if (respuesta) {

      return respuesta.respuesta;

    }

    // NO ENTENDIÓ
    return (
      "Lo siento 😅, no logré identificar tu pregunta. " +
      "Puedes consultarme sobre productos, precios, disponibilidad, " +
      "horarios, ubicación, envíos o formas de pago."
    );

  };


  // ENVIAR MENSAJE
  const enviarMensaje = (
    textoOpcional = null
  ) => {

    const texto =
      textoOpcional ?? mensaje;


    if (!texto.trim()) {
      return;
    }

    if (cargandoDatos) {

      const mensajeCargando = {
        id: crypto.randomUUID(),
        tipo: "bot",
        texto:
          "Espera un momento 😊. Estoy cargando la información de la panadería.",
        hora: obtenerHora(),
      };


      setMensajes((anteriores) => [
        ...anteriores,
        mensajeCargando,
      ]);

      return;

    }


    // MENSAJE DEL USUARIO
    const mensajeUsuario = {
      id: crypto.randomUUID(),
      tipo: "usuario",
      texto: texto.trim(),
      hora: obtenerHora(),
    };


    setMensajes((anteriores) => [
      ...anteriores,
      mensajeUsuario,
    ]);


    setMensaje("");


    // RESPUESTA DEL BOT
    setTimeout(() => {

      const respuesta =
        obtenerRespuestaBot(texto);


      const mensajeBot = {
        id: crypto.randomUUID(),
        tipo: "bot",
        texto: respuesta,
        hora: obtenerHora(),
      };


      setMensajes((anteriores) => [
        ...anteriores,
        mensajeBot,
      ]);

    }, 450);

  };

  // ENTER PARA ENVIAR
  const manejarTecla = (
    event
  ) => {

    if (event.key === "Enter") {

      event.preventDefault();

      enviarMensaje();

    }

  };


  return (

    <main className="chat-page">

      <div
        className="chat-background-decoration decoration-one"
      />

      <div
        className="chat-background-decoration decoration-two"
      />


      <section className="chat-container">

        {/* HEADER */}

        <header className="chat-header">

          <div className="chat-header-left">

            <div className="chat-logo">
              <span>LE</span>
            </div>


            <div className="chat-business-info">

              <h1>
                La Espiga Lagunera
              </h1>


              <div className="chat-status">

                <span
                  className="status-dot"
                />

                <span>
                  {
                    cargandoDatos
                      ? "Cargando información..."
                      : "Asistente virtual"
                  }
                </span>

              </div>

            </div>

          </div>


          <div className="header-badge">
            Panadería
          </div>

        </header>


        {/* LISTA DE MENSAJES */}

        <div
          className="chat-messages"
          ref={mensajesRef}
        >

          <div className="chat-day">
            Hoy
          </div>


          {mensajes.map((item) => (

            <div
              key={item.id}
              className={
                `message-row ${item.tipo}`
              }
            >

              {
                item.tipo === "bot" && (

                  <div className="bot-avatar">
                    LE
                  </div>

                )
              }


              <div
                className={
                  `message-content ${item.tipo}`
                }
              >

                <p>
                  {item.texto}
                </p>


                <span className="message-time">
                  {item.hora}
                </span>

              </div>

            </div>

          ))}

        </div>


        {/* SUGERENCIAS */}

        <div className="quick-options">

          {
            respuestasRapidas.map(
              (opcion) => (

                <button
                  key={opcion}
                  type="button"
                  onClick={() =>
                    enviarMensaje(opcion)
                  }
                  disabled={cargandoDatos}
                >
                  {opcion}
                </button>

              )
            )
          }

        </div>


        {/* PREGUNTAS CLIENTE */}

        <div className="chat-input-container">

          <div className="chat-input-wrapper">

            <input
              type="text"
              placeholder={
                cargandoDatos
                  ? "Cargando información..."
                  : "Escribe tu pregunta..."
              }
              value={mensaje}
              onChange={(event) =>
                setMensaje(
                  event.target.value
                )
              }
              onKeyDown={manejarTecla}
              disabled={cargandoDatos}
            />


            <button
              type="button"
              className="send-button"
              onClick={() =>
                enviarMensaje()
              }
              disabled={
                !mensaje.trim() ||
                cargandoDatos
              }
              aria-label="Enviar mensaje"
            >

              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <path d="M22 2 11 13" />

                <path d="m22 2-7 20-4-9-9-4Z" />

              </svg>

            </button>

          </div>


          <p className="chat-footer-text">

            Panadería La Espiga Lagunera

            <span>
              •
            </span>

            Torreón, Coahuila

          </p>

        </div>

      </section>

    </main>

  );

}


export default ChatBot;