export function normalizarTexto(texto = "") {

  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:]/g, "")
    .trim();

}


export function buscarRespuesta(
  mensaje,
  respuestas = []
) {

  const texto =
    normalizarTexto(mensaje);

  let mejorRespuesta = null;
  let mejorPuntaje = 0;


  respuestas.forEach((respuesta) => {

    const palabrasClave =
      Array.isArray(respuesta.palabrasClave)
        ? respuesta.palabrasClave
        : [];


    let puntaje = 0;


    palabrasClave.forEach((palabra) => {

      const palabraNormalizada =
        normalizarTexto(palabra);


      if (
        palabraNormalizada &&
        texto.includes(palabraNormalizada)
      ) {

        puntaje++;

      }

    });


    if (puntaje > mejorPuntaje) {

      mejorPuntaje = puntaje;
      mejorRespuesta = respuesta;

    }

  });



  return mejorPuntaje > 0
    ? mejorRespuesta
    : null;

}


export function buscarProducto(
  mensaje,
  productos = []
) {

  const texto =
    normalizarTexto(mensaje);

  let mejorProducto = null;
  let mejorPuntaje = 0;


  productos.forEach((producto) => {

    if (producto.activo === false) {
      return;
    }


    const palabrasClave =
      Array.isArray(producto.palabrasClave)
        ? producto.palabrasClave
        : [];


    const palabras = [
      producto.nombre,
      ...palabrasClave,
    ];


    let puntaje = 0;


    palabras.forEach((palabra) => {

      const normalizada =
        normalizarTexto(palabra);


      if (
        normalizada &&
        texto.includes(normalizada)
      ) {

        puntaje++;

      }

    });


    if (puntaje > mejorPuntaje) {

      mejorPuntaje = puntaje;
      mejorProducto = producto;

    }

  });


  console.log(
    "Producto encontrado:",
    mejorProducto
  );


  return mejorPuntaje > 0
    ? mejorProducto
    : null;

}