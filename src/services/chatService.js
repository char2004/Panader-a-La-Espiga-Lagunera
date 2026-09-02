import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase";


export async function obtenerRespuestas() {

  try {

    const snapshot = await getDocs(
      collection(db, "respuestas")
    );

    const datos = snapshot.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    return datos;

  } catch (error) {

    console.error(
      "Error al obtener respuestas:",
      error
    );

    throw error;

  }

}


export async function obtenerProductos() {

  try {

    const snapshot = await getDocs(
      collection(db, "productos")
    );

    const datos = snapshot.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      })
    );

    return datos;

  } catch (error) {

    console.error(
      "Error al obtener productos:",
      error
    );

    throw error;

  }

}